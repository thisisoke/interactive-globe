/**
 * Playwright Test Configuration
 *
 * Comprehensive test configuration for the Interactive Globe project.
 * Includes multi-browser testing, viewport configurations, and performance settings.
 *
 * @see https://playwright.dev/docs/test-configuration
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests',

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:5173',

    // Capture trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: 'retain-on-failure',

    // Action timeout
    actionTimeout: 15 * 1000,

    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for major browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      },
    },

    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      },
    },

    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      },
    },

    // Edge browser
    {
      name: 'edge-desktop',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      },
    },

    // Tablet viewports
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
      },
    },

    {
      name: 'tablet-landscape',
      use: {
        ...devices['iPad Pro landscape'],
        viewport: { width: 1366, height: 1024 },
      },
    },

    // Mobile viewports
    {
      name: 'mobile-iphone',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },

    {
      name: 'mobile-pixel',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
        isMobile: true,
        hasTouch: true,
      },
    },

    // High DPI displays
    {
      name: 'high-dpi',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
      },
    },
  ],

  // Web server configuration for local development
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Expect configuration
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 10 * 1000,

    // Visual comparison threshold
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },

    toMatchSnapshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  // Output directory for test artifacts
  outputDir: 'test-results',

  // Preserve output between runs
  preserveOutput: 'always',
});
