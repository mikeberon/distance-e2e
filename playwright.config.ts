import { PlaywrightTestConfig } from '@playwright/test';

export const baseUrl = 'http://localhost:3000'; // Your base URL

const config: PlaywrightTestConfig = {
  testDir: 'src/web/tests',
  use: {
    baseURL: baseUrl,
    headless: true,
    viewport: { width: 1280, height: 720 }, 
  },
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        launchOptions: {
          slowMo: 500,
        },
      },
    },
    {
      name: 'firefox',
      use: { 
        browserName: 'firefox',
        launchOptions: {
          slowMo: 500,
        },
      },
    },
    {
      name: 'webkit',
      use: { 
        browserName: 'webkit',
        launchOptions: {
          slowMo: 500,
        },
      },
    },
  ],
};

export default config;
