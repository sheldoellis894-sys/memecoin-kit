// Packs one built project into a folder that runs on its own, for moving a site to the client's hosting.
//
//   set PROJECT=ullu&& npm run build && node scripts/pack-site.mjs      (Windows)
//   PROJECT=ullu npm run build && node scripts/pack-site.mjs             (macOS, Linux)
//
// Result: templates/landing/release/<project>/ with
//   dist/            the built pages and pictures
//   api/, src/lib/   only the server functions this project uses (config "server.functions") and the files they import
//   server/          the small Node server (server/serve.mjs) that serves dist/ and runs api/
//   package.json     only the packages those files need
//   .env.example, Dockerfile, README.md
// Nothing of the other projects goes in.
import fs from 'node:fs';
import path from 'node:path';

const project = process.env.PROJECT;
if (!project) { console.error('Set PROJECT, e.g. PROJECT=ullu'); process.exit(1); }
const here = process.cwd();
const config = JSON.parse(fs.readFileSync(path.resolve('../../projects', project, 'project.config.json'), 'utf8'));
if (!fs.existsSync('dist/index.html')) { console.error('No dist/: run "npm run build" with the same PROJECT first'); process.exit(1); }
const built = fs.readFileSync('dist/index.html', 'utf8');
if (!built.includes(config.name)) { console.error(`dist/ looks like another project (no "${config.name}" in it): build again with PROJECT=${project}`); process.exit(1); }

const out = path.resolve('release', project);
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync('dist', path.join(out, 'dist'), { recursive: true });

// server functions and everything they import (relative imports are followed, packages are collected)
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packages = new Set();
const copied = new Set();
function take(rel) {
  const norm = path.normalize(rel);
  if (copied.has(norm)) return;
  copied.add(norm);
  const src = path.resolve(here, norm);
  const text = fs.readFileSync(src, 'utf8');
  fs.mkdirSync(path.dirname(path.join(out, norm)), { recursive: true });
  fs.writeFileSync(path.join(out, norm), text);
  for (const m of text.matchAll(/(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g)) {
    const spec = m[1];
    if (spec.startsWith('.')) take(path.join(path.dirname(norm), spec));
    else if (!spec.startsWith('node:')) packages.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
  }
}
const functions = config.server?.functions || [];
for (const name of functions) {
  if (!fs.existsSync(`api/${name}.js`)) { console.error(`api/${name}.js not found`); process.exit(1); }
  take(`api/${name}.js`);
}
take('server/serve.mjs');

const deps = {};
for (const p of packages) deps[p] = pkg.dependencies?.[p] || pkg.devDependencies?.[p] || '*';
fs.writeFileSync(path.join(out, 'package.json'), JSON.stringify({
  name: `${project}-site`, private: true, type: 'module', engines: { node: '>=20' },
  scripts: { start: 'node server/serve.mjs' }, dependencies: deps,
}, null, 2) + '\n');

const street = functions.includes('street');
fs.writeFileSync(path.join(out, '.env.example'), [
  `PROJECT=${project}`,
  'PORT=3000',
  'HOST=127.0.0.1',
  ...(functions.length ? [
    '# where the site keeps its small data files (the street of houses): a folder the server may write to',
    'STORE=file',
    'DATA_DIR=./data',
    ...(street ? [
      '# any long random string; visitor ids are stored only as hashes made with it. Never change it after launch',
      'STREET_SALT=',
      '# optional: words not allowed in names on the street, comma separated',
      'STREET_BLOCK=',
    ] : []),
    '# the visitor address comes from X-Forwarded-For only when the request comes from a proxy on this machine or in the',
    '# private network (nginx, Docker). 1 = always trust it (a proxy on another public address), 0 = never',
    'TRUST_PROXY=',
  ] : []),
  ...(functions.includes('admin') ? [
    '# the moderator page /admin: one password, at least 16 characters (without it the page is off). Keep it secret',
    'ADMIN_PASSWORD=',
  ] : []),
  // settings of this project's own functions: config "server.env": [{ "key": "NAME", "note": "what it is" }]
  ...(config.server?.env || []).flatMap((e) => [`# ${e.note || ''}`.trimEnd(), `${e.key}=`]),
  '',
].join('\n'));

// what never goes into a Docker image: the settings with the salt, the data of the street, installed packages
fs.writeFileSync(path.join(out, '.dockerignore'), ['.env', 'data', 'node_modules', '*.log', ''].join('\n'));

fs.writeFileSync(path.join(out, 'Dockerfile'), [
  'FROM node:22-alpine',
  'WORKDIR /app',
  'COPY package.json ./',
  'RUN npm install --omit=dev',
  'COPY . .',
  'ENV HOST=0.0.0.0 PORT=3000 STORE=file DATA_DIR=/data',
  'VOLUME /data',
  'EXPOSE 3000',
  'CMD ["node", "server/serve.mjs"]',
  '',
].join('\n'));

const siteUrl = (config.url || '').replace(/\/+$/, '');
const domain = siteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'example.com';

// the site address is written into the pages (link previews in X and Telegram, share texts);
// set-domain.mjs swaps it for another domain without a new build
fs.writeFileSync(path.join(out, 'site-url.txt'), siteUrl + '\n');
fs.writeFileSync(path.join(out, 'set-domain.mjs'), `// Puts the site on another domain without a new build: node set-domain.mjs https://your-domain.com
// It replaces the old address (site-url.txt) in every page and script in dist/, then remembers the new one.
import fs from 'node:fs';
import path from 'node:path';
const arg = (process.argv[2] || '').trim().replace(/\\/+$/, '');
if (!/^https:\\/\\/[a-z0-9.-]+\\.[a-z]{2,}$/i.test(arg)) { console.error('Usage: node set-domain.mjs https://your-domain.com'); process.exit(1); }
const old = fs.readFileSync('site-url.txt', 'utf8').trim();
if (!old) { console.error('site-url.txt is empty'); process.exit(1); }
let files = 0, hits = 0;
const walk = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
  const f = path.join(dir, e.name);
  if (e.isDirectory()) walk(f);
  else if (/\\.(html|js|css|json|xml|txt|webmanifest)$/i.test(e.name)) {
    const t = fs.readFileSync(f, 'utf8'); const n = t.split(old).length - 1;
    if (n) { fs.writeFileSync(f, t.split(old).join(arg)); files++; hits += n; }
  }
} };
walk('dist');
fs.writeFileSync('site-url.txt', arg + '\\n');
console.log(\`\${old} -> \${arg}: \${hits} places in \${files} files\`);
`);

fs.writeFileSync(path.join(out, 'README.md'), `# ${config.name} ($${config.ticker}) - website

A built website that runs on any Linux server with Node.js 20 or newer (or Docker). No build step is needed on the server.

## What is inside

- \`dist/\` - the pages, scripts and pictures
- \`server/serve.mjs\` - a small web server: serves \`dist/\` and runs the functions in \`api/\`
${functions.length ? `- \`api/\` - server functions: ${functions.map((f) => `\`/api/${f}\``).join(', ')}\n` : ''}- \`.env.example\` - settings; copy it to \`.env\` and fill it in
- \`set-domain.mjs\` - puts the site on your domain (step 2 below)

## 1. Server

Any Linux VPS (Ubuntu 22.04 or 24.04): 1 CPU, 1 GB RAM, 10 GB disk is plenty. Install Node.js 20 or newer, nginx and certbot.
Point your domain (DNS record A) to the server's IP.

## 2. Install

\`\`\`
sudo mkdir -p /srv/${project} && sudo cp -r ./* ./.env.example /srv/${project}/ && cd /srv/${project}
sudo node set-domain.mjs https://your-domain.com   # the pages are built for ${siteUrl || 'another address'}; this swaps it for yours
sudo npm install --omit=dev
sudo cp .env.example .env && sudo chmod 600 .env   # then fill in .env (below): sudo nano .env
sudo mkdir -p data && sudo chown www-data:www-data data
\`\`\`
${functions.length ? `
Fill in \`.env\`:

${street ? `- \`STREET_SALT\` - a long random string (for example \`openssl rand -hex 32\`). Set it once and never change it: every house on the street is tied to it
` : ''}${(config.server?.env || []).map((e) => `- \`${e.key}\` - ${e.note || ''}\n`).join('')}- ${functions.includes('admin') ? `\`ADMIN_PASSWORD\` - the password of the moderator page, 16 characters or more (for example \`openssl rand -base64 24\`)
- ` : ''}\`DATA_DIR=./data\` - the folder with the site's data${street ? ' (the street: houses, bans, the moderation log)' : ''}. Back it up; never delete it on updates
- \`TRUST_PROXY\` - leave empty when nginx runs on the same server (as below)
` : ''}${functions.includes('admin') ? `
The moderator page is \`https://your-domain.com/admin\` (password = \`ADMIN_PASSWORD\`): remove a house from the street, ban a browser, lift a ban (the house comes back), the log of actions. Without \`ADMIN_PASSWORD\` the page is off.
` : ''}
## 3. Keep it running (systemd)

\`\`\`
# /etc/systemd/system/${project}.service
[Unit]
Description=${config.name} website
After=network.target

[Service]
WorkingDirectory=/srv/${project}
EnvironmentFile=/srv/${project}/.env
ExecStart=/usr/bin/node server/serve.mjs
Restart=always
User=www-data
# the site may write only to its data folder; the rest of the system is read-only for it
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/${project}/data

[Install]
WantedBy=multi-user.target
\`\`\`

If Node is not in \`/usr/bin/node\`, put the path from \`which node\` into \`ExecStart\`.
\`sudo systemctl daemon-reload && sudo systemctl enable --now ${project}\`, then \`curl -I http://127.0.0.1:3000\` answers 200.
systemd reads \`.env\` itself (\`EnvironmentFile\`), so the file stays readable by root only.

## 4. HTTPS in front (nginx)

\`\`\`
# /etc/nginx/sites-available/${project}  (link it into sites-enabled)
server {
  listen 80;
  server_name your-domain.com;
  server_tokens off;
  client_max_body_size 64k;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
\`\`\`

\`sudo nginx -t && sudo systemctl reload nginx && sudo certbot --nginx -d your-domain.com\` - certbot adds HTTPS and the redirect from http.
Keep the site's port on 127.0.0.1 (as above): the server trusts X-Forwarded-For only from this machine or the private network.
${functions.includes('geo') ? `
Optional, the visitor's city${street ? ' on the house card' : ''}: nginx with the GeoIP2 module and a free city database (MaxMind GeoLite2 City or DB-IP Lite), passing \`X-Geo-Country\` and \`X-Geo-City\` to the site:

\`\`\`
geoip2 /usr/share/GeoIP/GeoLite2-City.mmdb { $geo_country country iso_code; $geo_city city names en; }   # in http { }
proxy_set_header X-Geo-Country $geo_country;   # in location / { }
proxy_set_header X-Geo-City $geo_city;
\`\`\`

Behind Cloudflare the country comes by itself (the city too with "Add visitor location headers" on). Without any of this everything works${street ? '; the card just has no city' : ', just without the city'}.
` : ''}
## Or with Docker

\`\`\`
docker build -t ${project} .
docker run -d --restart unless-stopped -p 127.0.0.1:3000:3000 -v ${project}-data:/data --env-file .env -e HOST=0.0.0.0 -e DATA_DIR=/data ${project}
\`\`\`

(\`-e HOST\` and \`-e DATA_DIR\` win over the same lines in \`.env\`: the site listens inside the container and keeps its data in the volume.) nginx in front as in step 4.

## Check after launch

- \`https://your-domain.com\` opens${street ? '; the street loads; a house can be put on the street' : ''}
${functions.includes('admin') ? '- `https://your-domain.com/admin` opens with the password\n' : ''}- a link to the site pasted into X or Telegram shows the preview picture

## Update

Replace \`dist/\` (and \`api/\`, \`server/\`, \`src/\` if they changed) with the new release, run \`set-domain.mjs\` again if the new release was built for another address, and restart the service. Never touch \`data/\` or \`.env\`.
`);

console.log(`Packed ${project} → ${path.relative(here, out)}`);
console.log(`  functions: ${functions.join(', ') || 'none'}; packages: ${[...packages].join(', ') || 'none'}`);
