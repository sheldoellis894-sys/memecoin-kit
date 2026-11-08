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

fs.writeFileSync(path.join(out, '.env.example'), [
  `PROJECT=${project}`,
  'PORT=3000',
  'HOST=127.0.0.1',
  ...(functions.length ? [
    '# where the site keeps its small data files (the street of houses): a folder the server may write to',
    'STORE=file',
    'DATA_DIR=./data',
    '# any long random string; visitor ids are stored only as hashes made with it. Never change it after launch',
    'STREET_SALT=',
    '# optional: words not allowed in names on the street, comma separated',
    'STREET_BLOCK=',
    '# the visitor address comes from X-Forwarded-For only when the request comes from a proxy on this machine or in the',
    '# private network (nginx, Docker). 1 = always trust it (a proxy on another public address), 0 = never',
    'TRUST_PROXY=',
  ] : []),
  ...(functions.includes('admin') ? [
    '# the moderator page /admin: one password, at least 16 characters (without it the page is off). Keep it secret',
    'ADMIN_PASSWORD=',
  ] : []),
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

const domain = (config.url || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'example.com';
fs.writeFileSync(path.join(out, 'README.md'), `# ${config.name} ($${config.ticker}) - website

A built website that runs on any Linux server with Node.js 20 or newer. No build step is needed on the server.

## What is inside

- \`dist/\` - the pages, scripts and pictures
- \`server/serve.mjs\` - a small web server: serves \`dist/\` and runs the functions in \`api/\`
${functions.length ? `- \`api/\` - server functions: ${functions.map((f) => `\`/api/${f}\``).join(', ')}\n` : ''}- \`.env.example\` - settings; copy it to \`.env\` and fill it in

## Run it

\`\`\`
npm install --omit=dev
cp .env.example .env        # then edit .env
chmod 600 .env              # the salt is a secret: only the user that runs the site may read it
node server/serve.mjs       # listens on 127.0.0.1:3000
\`\`\`
${functions.length ? `
The data folder (\`DATA_DIR\`) must be writable by the user that runs the server and must be kept between updates and backed up.
Set \`STREET_SALT\` to a long random string once and never change it.
Leave \`TRUST_PROXY\` empty when nginx (below) or Docker sits in front: the visitor's address is then read from X-Forwarded-For. Set it to 1 only if the proxy runs on another public address.
` : ''}${functions.includes('admin') ? `
The moderator page is \`https://${domain}/admin\`. It works only when \`ADMIN_PASSWORD\` (16 characters or more) is set; there the moderator removes houses from the street or bans their browser.
` : ''}
## Keep it running (systemd)

\`\`\`
# /etc/systemd/system/${project}.service
[Unit]
Description=${config.name} website
After=network.target

[Service]
WorkingDirectory=/srv/${project}
ExecStart=/usr/bin/node server/serve.mjs
Restart=always
User=www-data
# the site may write only to its data folder; the rest of the system is read-only for it
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=-/srv/${project}/data -/var/lib/${project}

[Install]
WantedBy=multi-user.target
\`\`\`

\`systemctl enable --now ${project}\`

## HTTPS in front (nginx)

\`\`\`
server {
  server_name ${domain};
  server_tokens off;
  client_max_body_size 64k;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  listen 443 ssl;   # certificate from Let's Encrypt: certbot --nginx -d ${domain}
}
\`\`\`

Keep the port on 127.0.0.1 (as above): the server trusts X-Forwarded-For only from this machine or the private network.

Or with Docker: \`docker build -t ${project} . && docker run -d -p 127.0.0.1:3000:3000 -v ${project}-data:/data --env-file .env ${project}\`.

## Update

Replace \`dist/\` (and \`api/\`, \`server/\`, \`src/\` if they changed) with the new release and restart the service. Do not touch the data folder.
`);

console.log(`Packed ${project} → ${path.relative(here, out)}`);
console.log(`  functions: ${functions.join(', ') || 'none'}; packages: ${[...packages].join(', ') || 'none'}`);
