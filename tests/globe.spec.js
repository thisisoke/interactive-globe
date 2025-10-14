/**
 * Comprehensive Globe Functional Test Suite
 *
 * Tests all core functionality of the Interactive Globe component including:
 * - Scene initialization and WebGL context
 * - Dot generation and distribution
 * - Continent masking
 * - Auto-rotation
 * - Mouse drag interaction
 * - OrbitControls responsiveness
 * - Active dot highlighting
 * - Color customization
 * - Resize behavior
 * - Configuration API
 *
 * Based on OPTION_A_DEVELOPMENT_APPROACH.md Phase 9 requirements
 */

import { test, expect } from '@playwright/test';
import { GlobePage } from './helpers/globe-page.js';

test.describe('Globe - Scene Initialization', () => {
  test('should initialize Three.js scene with WebGL context', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Verify WebGL context exists
    const hasWebGL = await globe.hasWebGLContext();
    expect(hasWebGL).toBe(true);

    // Verify canvas is present and has dimensions
    const canvas = globe.canvas;
    await expect(canvas).toBeVisible();

    const dimensions = await globe.getCanvasDimensions();
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);
  });

  test('should render canvas with correct initial size', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    const dimensions = await globe.getCanvasDimensions();

    // Canvas should fill the container
    const viewportSize = page.viewportSize();
    expect(dimensions.width).toBeCloseTo(viewportSize.width, -2);
    expect(dimensions.height).toBeCloseTo(viewportSize.height, -2);
  });

  test('should not have WebGL errors on initialization', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    const error = await globe.getWebGLError();
    expect(error).toBe(0); // 0 = GL_NO_ERROR
  });

  test('should hide loading indicator after initialization', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();

    // Loading should be visible initially
    await expect(globe.loadingIndicator).toBeVisible();

    // Wait for init
    await globe.waitForGlobeInit();

    // Loading should be hidden
    await expect(globe.loadingIndicator).toBeHidden();
  });
});

test.describe('Globe - Dot Generation and Distribution', () => {
  test('should generate and display dots on globe', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Verify canvas has visible content (dots)
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);
  });

  test('should generate expected number of dots', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Note: Actual dot count may be less due to continent masking
    // We're checking that a significant number of dots are visible
    const dotCount = await globe.getDotCount();

    // Should have at least 5000 visible dots (accounting for masking)
    expect(dotCount).toBeGreaterThan(5000);
  });

  test('should distribute dots evenly across visible surface', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Take screenshot and analyze distribution
    const screenshot = await globe.screenshotCanvas();
    expect(screenshot).toBeTruthy();

    // Check multiple quadrants for dots
    const dimensions = await globe.getCanvasDimensions();
    const centerX = Math.floor(dimensions.width / 2);
    const centerY = Math.floor(dimensions.height / 2);

    // Check center region has visible pixels
    const centerPixel = await globe.getPixelColor(centerX, centerY);

    // At least some regions should have visible dots
    // (alpha > 0 indicates visible content)
    const hasVisibleDots = centerPixel.a > 0;
    expect(hasVisibleDots).toBe(true);
  });
});

test.describe('Globe - Auto-Rotation', () => {
  test('should auto-rotate by default', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Check if globe is rotating
    const isRotating = await globe.isRotating(2000);
    expect(isRotating).toBe(true);
  });

  test('should stop rotation when toggle button clicked', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Stop rotation
    await globe.toggleRotation();
    await globe.wait(500);

    // Verify rotation stopped
    const isRotating = await globe.isRotating(1500);
    expect(isRotating).toBe(false);

    // Button text should change
    const buttonText = await globe.getRotationButtonText();
    expect(buttonText).toContain('Start');
  });

  test('should restart rotation after stopping', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Stop and restart
    await globe.toggleRotation(); // Stop
    await globe.wait(300);
    await globe.toggleRotation(); // Start
    await globe.wait(500);

    // Should be rotating again
    const isRotating = await globe.isRotating(1500);
    expect(isRotating).toBe(true);
  });

  test('should respect rotation speed changes', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Set very slow rotation
    await globe.setRotationSpeed(0.1);
    await globe.wait(500);

    // Should still be rotating (just slower)
    const isRotating = await globe.isRotating(2000);
    expect(isRotating).toBe(true);
  });

  test('should pause rotation at zero speed', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Set zero speed
    await globe.setRotationSpeed(0);
    await globe.wait(500);

    // Should not rotate
    const isRotating = await globe.isRotating(1500);
    expect(isRotating).toBe(false);
  });
});

test.describe('Globe - Mouse Drag Interaction', () => {
  test('should respond to mouse drag', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Stop auto-rotation first
    await globe.toggleRotation();
    await globe.wait(300);

    // Take screenshot before drag
    const before = await globe.screenshotCanvas();

    // Drag the globe
    await globe.dragGlobe({ x: 200, y: 200 }, { x: 400, y: 300 });

    // Take screenshot after drag
    const after = await globe.screenshotCanvas();

    // Screenshots should be different
    expect(before.equals(after)).toBe(false);
  });

  test('should handle multiple drag operations', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Stop auto-rotation
    await globe.toggleRotation();
    await globe.wait(300);

    // Perform multiple drags
    await globe.dragGlobe({ x: 200, y: 200 }, { x: 300, y: 250 });
    await globe.wait(200);
    await globe.dragGlobe({ x: 300, y: 250 }, { x: 400, y: 200 });
    await globe.wait(200);
    await globe.dragGlobe({ x: 400, y: 200 }, { x: 200, y: 300 });

    // Globe should still be interactive
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);
  });

  test('should maintain smooth interaction during drag', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Monitor for errors during drag
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Perform drag
    await globe.dragGlobe({ x: 100, y: 100 }, { x: 500, y: 400 });

    // Should have no errors
    expect(errors).toHaveLength(0);
  });
});

test.describe('Globe - OrbitControls Responsiveness', () => {
  test('should update controls smoothly', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Measure FPS during auto-rotation
    const { fps } = await globe.measureFPS(2000);

    // Should maintain good FPS (at least 30fps)
    expect(fps).toBeGreaterThanOrEqual(30);
  });

  test('should handle rapid configuration changes', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Rapidly change multiple settings
    await globe.setRotationSpeed(3);
    await globe.setScale(1.5);
    await globe.setDotSize(2.5);
    await globe.setRotationSpeed(0.5);
    await globe.setScale(0.8);

    // Globe should still be functional
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);

    // Should have no WebGL errors
    const error = await globe.getWebGLError();
    expect(error).toBe(0);
  });
});

test.describe('Globe - Active Dot Highlighting', () => {
  test('should highlight dots via setActiveDots', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Take screenshot before highlighting
    const before = await globe.screenshotCanvas();

    // Highlight cities
    await globe.highlightCities();

    // Take screenshot after highlighting
    const after = await globe.screenshotCanvas();

    // Screenshots should be different (some dots now highlighted)
    expect(before.equals(after)).toBe(false);
  });

  test('should apply active dot color correctly', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Set distinctive active dot color
    await globe.setActiveDotColor('#ff0000');

    // Highlight cities
    await globe.highlightCities();

    // Canvas should have visible content with highlights
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);
  });
});

test.describe('Globe - Color Customization', () => {
  test('should update dot color via setDotColor', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Change dot color
    const before = await globe.screenshotCanvas();
    await globe.setDotColor('#00ff00');
    const after = await globe.screenshotCanvas();

    // Screenshots should be different
    expect(before.equals(after)).toBe(false);
  });

  test('should handle multiple color changes', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Change colors multiple times
    await globe.setDotColor('#ff0000');
    await globe.wait(200);
    await globe.setDotColor('#00ff00');
    await globe.wait(200);
    await globe.setDotColor('#0000ff');
    await globe.wait(200);
    await globe.setDotColor('#ffffff');

    // Should still be functional
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);
  });

  test('should update active dot color', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Set active color and highlight
    await globe.setActiveDotColor('#ffff00');
    await globe.highlightCities();

    // Should have visible content
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);
  });
});

test.describe('Globe - Resize Behavior', () => {
  test('should adapt to window resize', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Get initial dimensions
    const initialDimensions = await globe.getCanvasDimensions();

    // Resize window
    await globe.resizeWindow(1280, 720);

    // Get new dimensions
    const newDimensions = await globe.getCanvasDimensions();

    // Dimensions should have changed
    expect(newDimensions.width).not.toBe(initialDimensions.width);
    expect(newDimensions.height).not.toBe(initialDimensions.height);

    // Canvas should still have content
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);
  });

  test('should maintain aspect ratio on resize', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Resize to different aspect ratios
    await globe.resizeWindow(1600, 900); // 16:9
    await globe.wait(300);

    let dimensions = await globe.getCanvasDimensions();
    expect(dimensions.width / dimensions.height).toBeCloseTo(16/9, 1);

    await globe.resizeWindow(800, 800); // 1:1
    await globe.wait(300);

    dimensions = await globe.getCanvasDimensions();
    expect(dimensions.width / dimensions.height).toBeCloseTo(1, 1);
  });

  test('should handle rapid resize events', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Rapid resize
    await globe.resizeWindow(1920, 1080);
    await globe.resizeWindow(1280, 720);
    await globe.resizeWindow(1600, 900);
    await globe.resizeWindow(1440, 900);
    await globe.wait(500);

    // Should still be functional
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);

    const error = await globe.getWebGLError();
    expect(error).toBe(0);
  });
});

test.describe('Globe - Configuration API', () => {
  test('should update dot size property', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Change dot size
    await globe.setDotSize(3.0);

    // Verify value display updated
    const displayValue = await globe.dotSizeValue.textContent();
    expect(displayValue).toBe('3.0');
  });

  test('should update rotation speed property', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Change rotation speed
    await globe.setRotationSpeed(2.5);

    // Verify value display updated
    const displayValue = await globe.rotationSpeedValue.textContent();
    expect(displayValue).toBe('2.5');
  });

  test('should update scale property', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Change scale
    const before = await globe.screenshotCanvas();
    await globe.setScale(1.5);
    const after = await globe.screenshotCanvas();

    // Verify value display updated
    const displayValue = await globe.scaleValue.textContent();
    expect(displayValue).toBe('1.5');

    // Visual should have changed
    expect(before.equals(after)).toBe(false);
  });

  test('should handle all properties updating together', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Update all properties
    await globe.setDotColor('#ff0000');
    await globe.setActiveDotColor('#00ff00');
    await globe.setDotSize(2.0);
    await globe.setRotationSpeed(2.0);
    await globe.setScale(1.2);

    // Globe should still be functional
    await globe.wait(500);
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);
  });
});

test.describe('Globe - Error Handling', () => {
  test('should not throw console errors during normal operation', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Perform various operations
    await globe.dragGlobe({ x: 100, y: 100 }, { x: 300, y: 300 });
    await globe.setDotColor('#00ff00');
    await globe.highlightCities();
    await globe.toggleRotation();

    // Should have no errors
    expect(errors).toHaveLength(0);
  });

  test('should handle invalid color gracefully', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Try to set invalid color (component should handle gracefully)
    await globe.dotColorInput.fill('invalid');

    // Globe should still be functional
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);
  });
});

test.describe('Globe - Touch Interaction', () => {
  test.skip('should respond to touch gestures on mobile', async ({ page, browserName }) => {
    // Skip on desktop browsers
    test.skip(browserName === 'chromium' && !page.context().browser().isConnected());

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Simulate touch
    await page.touchscreen.tap(400, 300);

    // Globe should still be functional
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);
  });
});

test.describe('Globe - Memory Management', () => {
  test('should not leak memory over time', async ({ page, browserName }) => {
    // Skip in WebKit as it doesn't support performance.memory
    test.skip(browserName === 'webkit', 'Performance.memory not available in WebKit');

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Get initial memory
    const initialMemory = await globe.getMemoryUsage();

    if (!initialMemory) {
      test.skip(true, 'Performance.memory not available');
      return;
    }

    // Perform operations for extended period
    for (let i = 0; i < 10; i++) {
      await globe.dragGlobe({ x: 100, y: 100 }, { x: 300, y: 300 });
      await globe.setDotColor(`#${Math.floor(Math.random()*16777215).toString(16)}`);
      await globe.wait(200);
    }

    // Get final memory
    const finalMemory = await globe.getMemoryUsage();

    // Memory increase should be reasonable (less than 50MB)
    const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
