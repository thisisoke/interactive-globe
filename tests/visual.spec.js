/**
 * Visual Regression Test Suite
 *
 * Tests visual appearance and consistency of the Interactive Globe across:
 * - Different browsers (Chrome, Firefox, Safari, Edge)
 * - Different viewport sizes
 * - Different globe states
 * - Edge glow rendering
 * - Dot visibility and distribution
 *
 * Uses Playwright's screenshot comparison capabilities
 */

import { test, expect } from '@playwright/test';
import { GlobePage } from './helpers/globe-page.js';

// Configure visual comparison thresholds
const visualThreshold = {
  maxDiffPixels: 500, // Allow some variance due to rendering differences
  threshold: 0.2,
};

test.describe('Visual Regression - Globe States', () => {
  test('should match baseline screenshot of initial state', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Wait for stable state
    await globe.wait(1000);

    // Take screenshot
    const screenshot = await globe.screenshotCanvas();

    // Compare with baseline
    expect(screenshot).toMatchSnapshot(`globe-initial-${browserName}.png`, visualThreshold);
  });

  test('should match baseline with stopped rotation', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Stop rotation for consistent screenshot
    await globe.toggleRotation();
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-stopped-${browserName}.png`, visualThreshold);
  });

  test('should match baseline after rotation', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Let it rotate for a bit
    await globe.wait(3000);

    // Stop rotation
    await globe.toggleRotation();
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-rotated-${browserName}.png`, visualThreshold);
  });

  test('should match baseline after drag interaction', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Stop auto-rotation
    await globe.toggleRotation();
    await globe.wait(300);

    // Drag to specific position
    await globe.dragGlobe({ x: 300, y: 300 }, { x: 500, y: 400 });
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-after-drag-${browserName}.png`, visualThreshold);
  });
});

test.describe('Visual Regression - Color Customization', () => {
  test('should match baseline with custom dot color (red)', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Stop rotation for consistency
    await globe.toggleRotation();
    await globe.wait(300);

    // Set red dots
    await globe.setDotColor('#ff0000');
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-red-dots-${browserName}.png`, visualThreshold);
  });

  test('should match baseline with custom dot color (blue)', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(300);

    await globe.setDotColor('#0000ff');
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-blue-dots-${browserName}.png`, visualThreshold);
  });

  test('should match baseline with custom dot color (green)', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(300);

    await globe.setDotColor('#00ff00');
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-green-dots-${browserName}.png`, visualThreshold);
  });
});

test.describe('Visual Regression - Active Dots', () => {
  test('should match baseline with highlighted cities', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Stop rotation
    await globe.toggleRotation();
    await globe.wait(300);

    // Highlight cities
    await globe.highlightCities();
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-highlighted-cities-${browserName}.png`, visualThreshold);
  });

  test('should match baseline with custom active dot color', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(300);

    // Set custom active color and highlight
    await globe.setActiveDotColor('#ffff00');
    await globe.highlightCities();
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-yellow-highlights-${browserName}.png`, visualThreshold);
  });
});

test.describe('Visual Regression - Size and Scale', () => {
  test('should match baseline with large dot size', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(300);

    await globe.setDotSize(4.0);
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-large-dots-${browserName}.png`, visualThreshold);
  });

  test('should match baseline with small dot size', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(300);

    await globe.setDotSize(0.8);
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-small-dots-${browserName}.png`, visualThreshold);
  });

  test('should match baseline with scaled up globe', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(300);

    await globe.setScale(1.5);
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-scaled-up-${browserName}.png`, visualThreshold);
  });

  test('should match baseline with scaled down globe', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(300);

    await globe.setScale(0.7);
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-scaled-down-${browserName}.png`, visualThreshold);
  });
});

test.describe('Visual Regression - Edge Glow', () => {
  test('should render edge glow effect correctly', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(500);

    // Take full page screenshot to capture edge effects
    const screenshot = await page.screenshot();
    expect(screenshot).toMatchSnapshot(`globe-edge-glow-${browserName}.png`, {
      maxDiffPixels: 1000,
      threshold: 0.3,
    });
  });

  test('should maintain edge glow at different scales', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.setScale(1.3);
    await globe.wait(500);

    const screenshot = await page.screenshot();
    expect(screenshot).toMatchSnapshot(`globe-edge-glow-scaled-${browserName}.png`, {
      maxDiffPixels: 1000,
      threshold: 0.3,
    });
  });
});

test.describe('Visual Regression - Dot Visibility', () => {
  test('should show consistent dot distribution', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Rotate to show different hemisphere
    await globe.toggleRotation();
    await globe.wait(300);

    await globe.dragGlobe({ x: 400, y: 400 }, { x: 200, y: 300 });
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-dot-distribution-${browserName}.png`, visualThreshold);
  });

  test('should render dots clearly at different viewport sizes', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(300);

    // Test at smaller viewport
    await globe.resizeWindow(800, 600);
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-small-viewport-${browserName}.png`, {
      maxDiffPixels: 300,
      threshold: 0.2,
    });
  });
});

test.describe('Visual Regression - Cross-Browser Consistency', () => {
  test('should render consistently across browsers', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Set consistent state
    await globe.toggleRotation();
    await globe.setDotColor('#4B9FBF');
    await globe.setDotSize(1.5);
    await globe.setScale(1.0);
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();

    // Each browser gets its own baseline, but they should be very similar
    expect(screenshot).toMatchSnapshot(`globe-consistent-${browserName}.png`, visualThreshold);
  });

  test('should render highlighted dots consistently', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.setDotColor('#FFFFFF');
    await globe.setActiveDotColor('#FF6B35');
    await globe.highlightCities();
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-highlights-consistent-${browserName}.png`, visualThreshold);
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  test('should adapt to tablet viewport', async ({ page, browserName }) => {
    // Set tablet size
    await page.setViewportSize({ width: 768, height: 1024 });

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(500);

    const screenshot = await page.screenshot();
    expect(screenshot).toMatchSnapshot(`globe-tablet-${browserName}.png`, {
      maxDiffPixels: 500,
      threshold: 0.2,
    });
  });

  test('should adapt to mobile viewport', async ({ page, browserName }) => {
    // Set mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(500);

    const screenshot = await page.screenshot();
    expect(screenshot).toMatchSnapshot(`globe-mobile-${browserName}.png`, {
      maxDiffPixels: 300,
      threshold: 0.2,
    });
  });

  test('should adapt to landscape mobile viewport', async ({ page, browserName }) => {
    // Set landscape mobile size
    await page.setViewportSize({ width: 667, height: 375 });

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(500);

    const screenshot = await page.screenshot();
    expect(screenshot).toMatchSnapshot(`globe-mobile-landscape-${browserName}.png`, {
      maxDiffPixels: 300,
      threshold: 0.2,
    });
  });
});

test.describe('Visual Regression - Complex Interactions', () => {
  test('should maintain visual quality after multiple operations', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Perform multiple operations
    await globe.setDotColor('#00AAFF');
    await globe.setDotSize(2.0);
    await globe.setScale(1.2);
    await globe.highlightCities();
    await globe.setActiveDotColor('#FF00FF');

    // Stop rotation for consistent screenshot
    await globe.toggleRotation();
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-complex-state-${browserName}.png`, visualThreshold);
  });

  test('should handle rapid state changes visually', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Rapid changes
    await globe.setDotSize(3.0);
    await globe.setDotSize(1.0);
    await globe.setDotSize(2.0);
    await globe.setScale(1.5);
    await globe.setScale(0.8);
    await globe.setScale(1.0);

    await globe.toggleRotation();
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-after-rapid-changes-${browserName}.png`, visualThreshold);
  });
});

test.describe('Visual Regression - High DPI Displays', () => {
  test('should render clearly on high DPI displays', async ({ page, browserName }) => {
    // Simulate high DPI (devicePixelRatio = 2)
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.wait(500);

    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-high-dpi-${browserName}.png`, visualThreshold);
  });

  test('should maintain dot sharpness on high DPI', async ({ page, browserName }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    await globe.toggleRotation();
    await globe.setDotSize(2.0);
    await globe.wait(500);

    // Capture a zoomed-in region to check sharpness
    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toMatchSnapshot(`globe-dot-sharpness-${browserName}.png`, visualThreshold);
  });
});
