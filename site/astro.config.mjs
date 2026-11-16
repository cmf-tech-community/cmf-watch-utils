// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import legacyDocumentationUrls from './integrations/legacy-urls.mjs';

export default defineConfig({
  site: 'https://cmf.arnv.dev',
  base: '',
  integrations: [
    starlight({
      title: 'CMF Watch Utils',
      description:
        'Firmware tools, Bluetooth utilities and emulation for CMF watches.',
      logo: {
        src: './public/logo.svg',
        alt: 'CMF Watch Utils logo',
      },
      customCss: ['/src/styles/custom.css'],
      favicon: '/favicon.svg',
      social: [
        { icon: 'discord', label: 'FMC Community on Discord', href: 'https://discord.gg/KnAFruMabJ' },
        { icon: 'external', label: 'r/CMFWatchMods on Reddit', href: 'https://www.reddit.com/r/CMFWatchMods/' },
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/fmctools/cmf-watch-utils',
        },
        {
          icon: 'external',
          label: 'arnav.dev',
          href: 'https://arnv.dev',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/fmctools/cmf-watch-utils/edit/main/site/',
      },
      components: {
        SocialIcons: './src/components/SocialIcons.astro',
        Head: './src/components/Head.astro',
      },
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Requirements', slug: 'getting-started/requirements' },
            { label: 'Setup', slug: 'getting-started/setup' },
            { label: 'Quick start', slug: 'getting-started/quickstart' },
            { label: 'Troubleshooting', slug: 'getting-started/troubleshooting' },
          ],
        },
        {
          label: 'Emulator',
          items: [
            { label: 'Overview', slug: 'emulator' },
            { label: 'Browser walkthrough', slug: 'emulator/browser-guide' },
            { label: 'Installation', slug: 'emulator/installation' },
            { label: 'First boot', slug: 'emulator/first-boot' },
            { label: 'OTA and recovery', slug: 'emulator/ota-recovery' },
          ],
        },
        {
          label: 'CMF Watch Pro 2',
          items: [
            {
              label: 'Overview',
              items: [
                { label: 'Device profile', slug: 'devices/cmf-watch-pro-2' },
                { label: 'Verified status', slug: 'devices/cmf-watch-pro-2/status' },
                { label: 'Limitations & risks', slug: 'devices/cmf-watch-pro-2/limitations' },
              ],
            },
            {
              label: 'Guides',
              items: [
                { label: 'Firmware OTA flash', slug: 'devices/cmf-watch-pro-2/guides/ota-flash' },
                { label: 'Dial editing & upload', slug: 'devices/cmf-watch-pro-2/guides/dial-editing' },
                { label: 'Bad Apple case study', slug: 'devices/cmf-watch-pro-2/guides/bad-apple' },
                { label: 'Application analysis', slug: 'devices/cmf-watch-pro-2/guides/ghidra' },
              ],
            },
            {
              label: 'Protocol',
              items: [
                { label: 'BLE protocol', slug: 'devices/cmf-watch-pro-2/protocol/ble' },
                { label: 'AOTA OTA flow', slug: 'devices/cmf-watch-pro-2/protocol/ota' },
                { label: 'Shell / AT channel', slug: 'devices/cmf-watch-pro-2/protocol/shell' },
              ],
            },
            {
              label: 'Formats',
              items: [
                { label: 'AOTA container', slug: 'devices/cmf-watch-pro-2/formats/aota' },
                { label: 'SDFS filesystem', slug: 'devices/cmf-watch-pro-2/formats/sdfs' },
                { label: 'Watch faces & WFDL', slug: 'devices/cmf-watch-pro-2/formats/watchface' },
                { label: 'UI style bundles', slug: 'devices/cmf-watch-pro-2/formats/style' },
                { label: 'Picture codecs', slug: 'devices/cmf-watch-pro-2/formats/pictures' },
                { label: 'AJS animations', slug: 'devices/cmf-watch-pro-2/formats/ajs' },
              ],
            },
            {
              label: 'Internals',
              items: [
                { label: 'Hardware', slug: 'devices/cmf-watch-pro-2/internals/hardware' },
                { label: 'app.bin internals', slug: 'devices/cmf-watch-pro-2/internals/appbin' },
                { label: 'Recovery & boot modes', slug: 'devices/cmf-watch-pro-2/internals/recovery' },
              ],
            },
          ],
        },
        {
          label: 'CMF Watch 3 Pro',
          items: [
            { label: 'Overview', items: [
              { label: 'Device profile', slug: 'devices/cmf-watch-pro-3' },
              { label: 'Support and verification', slug: 'devices/cmf-watch-pro-3/status' },
            ] },
            { label: 'Guides', items: [
              { label: 'Testing stock firmware', slug: 'devices/cmf-watch-pro-3/testing' },
              { label: 'Watch faces', slug: 'devices/cmf-watch-pro-3/watch-faces' },
            ] },
            { label: 'Reference', items: [
              { label: 'Firmware format', slug: 'devices/cmf-watch-pro-3/formats' },
              { label: 'Hardware and emulation', slug: 'devices/cmf-watch-pro-3/hardware' },
            ] },
          ],
        },
        {
          label: 'Tool reference',
          items: [
            { label: 'fwkit CLI', slug: 'tooling/fwkit' },
            { label: 'BLE tools', slug: 'tooling/ble-tools' },
            { label: 'Actions SDK OTA', slug: 'tooling/actions-ota' },
          ],
        },
        {
          label: 'Contributing',
          items: [
            { label: 'Development setup', slug: 'getting-started/contributing' },
            { label: 'Firmware analysis', slug: 'contributing/firmware-analysis' },
            { label: 'Research methodology', slug: 'about/methodology' },
            { label: 'Agent context', slug: 'ai/context' },
            { label: 'Documentation guidelines', slug: 'ai/documentation' },
            { label: 'Agent task examples', slug: 'ai/prompts' },
          ],
        },
        {
          label: 'Project information',
          items: [
            { label: 'Device support', slug: 'about/roadmap' },
            { label: 'Community', slug: 'about/community' },
            { label: 'Data index', slug: 'dumps' },
            { label: 'Legal and attribution', slug: 'about/legal' },
          ],
        },
      ],
    }),
    legacyDocumentationUrls(),
  ],
});
