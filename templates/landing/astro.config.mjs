import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

// A project may ask for a strict Content Security Policy: project.config.json "security": { "csp": true }.
// Then every page carries a <meta http-equiv="content-security-policy">: scripts only from the site itself and the
// inline scripts Astro made (each by its hash), pictures, fonts and requests only to the site itself (plus data:/blob:
// pictures the page draws), no plugins, no <base>, forms only to the site. Styles may stay inline (the drawn houses
// and the moderator page set style attributes). Projects without the flag build exactly as before.
let project = {};
try {
  project = JSON.parse(fs.readFileSync(path.resolve('../../projects', process.env.PROJECT || 'molty', 'project.config.json'), 'utf8'));
} catch { /* sync-assets reports a missing project */ }

const csp = project.security?.csp
  ? {
      csp: {
        algorithm: 'SHA-256',
        directives: [
          "default-src 'self'",
          "img-src 'self' data: blob:",
          "font-src 'self'",
          "connect-src 'self'",
          "media-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "manifest-src 'self'",
          "worker-src 'self' blob:",
        ],
        scriptDirective: { resources: ["'self'"] },
        styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
      },
    }
  : {};

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  ...(project.security?.csp ? { security: csp } : {}),
});
