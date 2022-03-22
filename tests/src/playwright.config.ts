import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: '.',
  timeout: 60 * 1000,
  expect: {
    timeout: 60 * 1000,
  },
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
  },
};

export default config;