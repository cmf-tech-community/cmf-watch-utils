import { copyFile, mkdir } from 'node:fs/promises';

export const legacyUrls = {
  '/tooling/emulator/': '/emulator/',
  '/tooling/emulator/installation/': '/emulator/installation/',
  '/tooling/emulator/first-boot/': '/emulator/first-boot/',
  '/tooling/emulator-ota/': '/emulator/ota-recovery/',
};

export default function legacyDocumentationUrls() {
  return {
    name: 'legacy-documentation-urls',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((request, _response, next) => {
          const url = new URL(request.url ?? '/', 'http://localhost');
          const target = legacyUrls[`${url.pathname.replace(/\/$/, '')}/`];
          if (target) request.url = target + url.search;
          next();
        });
      },
      'astro:build:done': async ({ dir }) => {
        for (const [previous, current] of Object.entries(legacyUrls)) {
          const destination = new URL(`.${previous}`, dir);
          await mkdir(destination, { recursive: true });
          await copyFile(new URL(`.${current}index.html`, dir), new URL('index.html', destination));
        }
      },
    },
  };
}
