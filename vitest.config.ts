import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      // Tests unitarios de logica pura (sin DOM ni navegador). Proyecto separado del de
      // Storybook A PROPOSITO: aquel corre en chromium headless via playwright, y arrastrar
      // un navegador para probar una funcion de crypto haria que `npm test` dependa de tener
      // los binarios de Playwright instalados. Por eso el script `test` apunta a este solo.
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['lib/**/*.test.ts'],
        },
        resolve: {
          // Necesario y no heredable: el proyecto de Storybook resuelve `@/` por su propio
          // plugin, este no. tsconfig.json mapea "@/*" -> "./*" y aca se replica, porque
          // vitest no lee los paths de tsconfig por su cuenta. Sin esto, cualquier test que
          // importe `@/lib/...` falla al resolver el modulo.
          alias: { '@': dirname },
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
