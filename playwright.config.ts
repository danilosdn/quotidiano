import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  // The complete Casa morning flow drives real 1.0-1.7s in-game timers, several
  // click-to-move walks and screenshot captures; it reliably exceeds the 30s
  // default, so allow headroom for the full gate.
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
