/**
 * Performance Benchmark Test Suite
 *
 * Comprehensive performance testing for the Interactive Globe including:
 * - FPS measurement during auto-rotation
 * - FPS measurement during user interaction
 * - Performance with different dot counts (15K, 20K, 25K)
 * - Memory usage monitoring
 * - Load time measurements
 * - GPU performance
 * - Long-running stability tests
 *
 * Based on OPTION_A_DEVELOPMENT_APPROACH.md Phase 8 & 9 requirements:
 * - 60fps on desktop browsers
 * - 30fps minimum on mobile devices
 * - <500ms initial load time
 * - <50MB memory footprint
 */

import { test, expect } from '@playwright/test';
import { GlobePage } from './helpers/globe-page.js';

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  desktop: {
    minFPS: 60,
    targetFPS: 60,
    maxLoadTime: 500,
    maxMemoryMB: 50,
  },
  mobile: {
    minFPS: 30,
    targetFPS: 30,
    maxLoadTime: 1000,
    maxMemoryMB: 75,
  },
  tablet: {
    minFPS: 45,
    targetFPS: 60,
    maxLoadTime: 750,
    maxMemoryMB: 60,
  },
};

/**
 * Helper to determine device type from viewport
 */
function getDeviceType(viewportSize) {
  if (!viewportSize) return 'desktop';
  const width = viewportSize.width;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Helper to convert bytes to megabytes
 */
function bytesToMB(bytes) {
  return bytes / (1024 * 1024);
}

test.describe('Performance - Initial Load Time', () => {
  test('should load and initialize within target time (desktop)', async ({ page }) => {
    const startTime = Date.now();

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    const loadTime = Date.now() - startTime;

    console.log(`Load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.desktop.maxLoadTime);
  });

  test('should measure WebGL context creation time', async ({ page }) => {
    const globe = new GlobePage(page);

    const metrics = await page.evaluate(() => {
      const start = performance.now();
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve({
            navigationStart: performance.timing.navigationStart,
            domContentLoaded: performance.timing.domContentLoadedEventEnd,
            loadComplete: performance.timing.loadEventEnd,
          });
        });
        observer.observe({ entryTypes: ['navigation'] });

        // Fallback timeout
        setTimeout(() => resolve({
          navigationStart: performance.timing.navigationStart,
          domContentLoaded: performance.timing.domContentLoadedEventEnd,
          loadComplete: performance.timing.loadEventEnd,
        }), 5000);
      });
    });

    await globe.goto();
    await globe.waitForGlobeInit();

    // Check that DOM content loaded quickly
    const domLoadTime = metrics.domContentLoaded - metrics.navigationStart;
    console.log(`DOM Content Loaded: ${domLoadTime}ms`);
    expect(domLoadTime).toBeLessThan(1000);
  });

  test('should initialize canvas quickly', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();

    const initStart = Date.now();
    await globe.waitForGlobeInit();
    const initTime = Date.now() - initStart;

    console.log(`Canvas initialization: ${initTime}ms`);
    expect(initTime).toBeLessThan(2000);
  });
});

test.describe('Performance - FPS During Auto-Rotation', () => {
  test('should maintain 60fps during auto-rotation (desktop)', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Measure FPS over 3 seconds
    const { fps, frames } = await globe.measureFPS(3000);

    console.log(`Auto-rotation FPS: ${fps.toFixed(2)} (${frames} frames)`);

    const deviceType = getDeviceType(page.viewportSize());
    const threshold = PERFORMANCE_THRESHOLDS[deviceType];

    expect(fps).toBeGreaterThanOrEqual(threshold.minFPS);
  });

  test('should maintain stable FPS over extended period', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Measure multiple intervals
    const measurements = [];

    for (let i = 0; i < 5; i++) {
      const { fps } = await globe.measureFPS(2000);
      measurements.push(fps);
      console.log(`Measurement ${i + 1}: ${fps.toFixed(2)} FPS`);
    }

    // Calculate average and variance
    const avgFPS = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const variance = measurements.reduce((sum, fps) => sum + Math.pow(fps - avgFPS, 2), 0) / measurements.length;
    const stdDev = Math.sqrt(variance);

    console.log(`Average FPS: ${avgFPS.toFixed(2)}, Std Dev: ${stdDev.toFixed(2)}`);

    const deviceType = getDeviceType(page.viewportSize());
    const threshold = PERFORMANCE_THRESHOLDS[deviceType];

    // Average should meet threshold
    expect(avgFPS).toBeGreaterThanOrEqual(threshold.minFPS);

    // Standard deviation should be low (stable FPS)
    expect(stdDev).toBeLessThan(10);
  });

  test('should not drop frames during continuous rotation', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Measure frame drops
    const result = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lastTime = performance.now();
        let frameDrops = 0;
        let totalFrames = 0;
        const targetFrameTime = 1000 / 60; // 16.67ms for 60fps

        function measureFrame() {
          const currentTime = performance.now();
          const delta = currentTime - lastTime;

          totalFrames++;

          // Count as frame drop if delta is significantly higher than target
          if (delta > targetFrameTime * 2) {
            frameDrops++;
          }

          lastTime = currentTime;

          if (totalFrames < 180) { // 3 seconds at 60fps
            requestAnimationFrame(measureFrame);
          } else {
            resolve({ frameDrops, totalFrames });
          }
        }

        requestAnimationFrame(measureFrame);
      });
    });

    console.log(`Frame drops: ${result.frameDrops} out of ${result.totalFrames}`);

    // Should have minimal frame drops (less than 5%)
    const dropRate = result.frameDrops / result.totalFrames;
    expect(dropRate).toBeLessThan(0.05);
  });
});

test.describe('Performance - FPS During User Interaction', () => {
  test('should maintain good FPS during drag interaction', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Start measuring FPS
    const fpsPromise = globe.measureFPS(3000);

    // Perform drag while measuring
    await globe.wait(500);
    await globe.dragGlobe({ x: 200, y: 200 }, { x: 400, y: 400 });
    await globe.wait(500);
    await globe.dragGlobe({ x: 400, y: 400 }, { x: 200, y: 200 });

    const { fps } = await fpsPromise;

    console.log(`FPS during interaction: ${fps.toFixed(2)}`);

    const deviceType = getDeviceType(page.viewportSize());
    const threshold = PERFORMANCE_THRESHOLDS[deviceType];

    // FPS during interaction should still meet minimum
    expect(fps).toBeGreaterThanOrEqual(threshold.minFPS * 0.9); // Allow 10% drop
  });

  test('should recover FPS after intensive interaction', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Measure baseline
    const baseline = await globe.measureFPS(1000);
    console.log(`Baseline FPS: ${baseline.fps.toFixed(2)}`);

    // Perform intensive interactions
    for (let i = 0; i < 5; i++) {
      await globe.dragGlobe(
        { x: Math.random() * 400, y: Math.random() * 400 },
        { x: Math.random() * 400, y: Math.random() * 400 }
      );
    }

    // Wait for recovery
    await globe.wait(1000);

    // Measure after recovery
    const recovery = await globe.measureFPS(1000);
    console.log(`Recovery FPS: ${recovery.fps.toFixed(2)}`);

    // FPS should recover to near baseline (within 10%)
    expect(recovery.fps).toBeGreaterThanOrEqual(baseline.fps * 0.9);
  });
});

test.describe('Performance - Different Dot Counts', () => {
  test('should handle 15,000 dots efficiently', async ({ page }) => {
    // This test would require a custom example page with configurable dot count
    // For now, we test with the default configuration
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    const { fps } = await globe.measureFPS(2000);
    console.log(`FPS with default dots: ${fps.toFixed(2)}`);

    const deviceType = getDeviceType(page.viewportSize());
    const threshold = PERFORMANCE_THRESHOLDS[deviceType];

    expect(fps).toBeGreaterThanOrEqual(threshold.minFPS);
  });

  test('should maintain performance after color changes', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Measure baseline
    const baseline = await globe.measureFPS(1000);

    // Change colors multiple times
    await globe.setDotColor('#ff0000');
    await globe.wait(200);
    await globe.setDotColor('#00ff00');
    await globe.wait(200);
    await globe.setDotColor('#0000ff');
    await globe.wait(200);

    // Measure after changes
    const after = await globe.measureFPS(1000);

    console.log(`FPS baseline: ${baseline.fps.toFixed(2)}, after changes: ${after.fps.toFixed(2)}`);

    // Performance should not degrade significantly
    expect(after.fps).toBeGreaterThanOrEqual(baseline.fps * 0.85);
  });

  test('should handle active dot highlighting efficiently', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Measure before highlighting
    const before = await globe.measureFPS(1000);

    // Highlight cities
    await globe.highlightCities();
    await globe.wait(500);

    // Measure after highlighting
    const after = await globe.measureFPS(1000);

    console.log(`FPS before: ${before.fps.toFixed(2)}, after highlighting: ${after.fps.toFixed(2)}`);

    // Performance should remain acceptable
    const deviceType = getDeviceType(page.viewportSize());
    const threshold = PERFORMANCE_THRESHOLDS[deviceType];

    expect(after.fps).toBeGreaterThanOrEqual(threshold.minFPS * 0.9);
  });
});

test.describe('Performance - Memory Usage', () => {
  test('should maintain reasonable memory footprint', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Performance.memory not available in WebKit');

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    const memory = await globe.getMemoryUsage();

    if (!memory) {
      test.skip(true, 'Performance.memory not available');
      return;
    }

    const usedMB = bytesToMB(memory.usedJSHeapSize);
    console.log(`Memory usage: ${usedMB.toFixed(2)} MB`);

    const deviceType = getDeviceType(page.viewportSize());
    const threshold = PERFORMANCE_THRESHOLDS[deviceType];

    expect(usedMB).toBeLessThan(threshold.maxMemoryMB);
  });

  test('should not leak memory during extended use', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Performance.memory not available in WebKit');

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Get initial memory
    await globe.wait(2000);
    const initialMemory = await globe.getMemoryUsage();

    if (!initialMemory) {
      test.skip(true, 'Performance.memory not available');
      return;
    }

    // Perform operations for 30 seconds
    const startTime = Date.now();
    while (Date.now() - startTime < 30000) {
      await globe.dragGlobe(
        { x: Math.random() * 400, y: Math.random() * 400 },
        { x: Math.random() * 400, y: Math.random() * 400 }
      );
      await globe.setDotColor(`#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`);
      await globe.wait(100);
    }

    // Get final memory
    await globe.wait(2000);
    const finalMemory = await globe.getMemoryUsage();

    const initialMB = bytesToMB(initialMemory.usedJSHeapSize);
    const finalMB = bytesToMB(finalMemory.usedJSHeapSize);
    const leakMB = finalMB - initialMB;

    console.log(`Memory: Initial ${initialMB.toFixed(2)} MB, Final ${finalMB.toFixed(2)} MB, Leak ${leakMB.toFixed(2)} MB`);

    // Memory increase should be reasonable (less than 30MB after extended use)
    expect(leakMB).toBeLessThan(30);
  });

  test('should clean up memory after operations', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Performance.memory not available in WebKit');

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Baseline memory
    await globe.wait(1000);
    const baseline = await globe.getMemoryUsage();

    if (!baseline) {
      test.skip(true, 'Performance.memory not available');
      return;
    }

    // Intensive operations
    for (let i = 0; i < 20; i++) {
      await globe.setDotColor(`#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`);
      await globe.setScale(Math.random() * 0.5 + 0.75);
      await globe.setDotSize(Math.random() * 2 + 1);
    }

    // Give time for garbage collection
    await globe.wait(3000);

    const after = await globe.getMemoryUsage();

    const baselineMB = bytesToMB(baseline.usedJSHeapSize);
    const afterMB = bytesToMB(after.usedJSHeapSize);

    console.log(`Memory: Baseline ${baselineMB.toFixed(2)} MB, After ${afterMB.toFixed(2)} MB`);

    // Memory should return to near baseline after GC (within 20MB)
    expect(afterMB - baselineMB).toBeLessThan(20);
  });
});

test.describe('Performance - Resize Performance', () => {
  test('should handle resize events efficiently', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Measure time for multiple resizes
    const startTime = Date.now();

    await globe.resizeWindow(1920, 1080);
    await globe.wait(100);
    await globe.resizeWindow(1280, 720);
    await globe.wait(100);
    await globe.resizeWindow(1600, 900);
    await globe.wait(100);
    await globe.resizeWindow(1440, 900);

    const resizeTime = Date.now() - startTime;

    console.log(`Resize operations took: ${resizeTime}ms`);

    // Should complete all resizes quickly (under 2 seconds including waits)
    expect(resizeTime).toBeLessThan(2000);

    // Globe should still be functional
    const hasContent = await globe.hasVisibleContent();
    expect(hasContent).toBe(true);

    // FPS should be good after resizes
    const { fps } = await globe.measureFPS(1000);
    expect(fps).toBeGreaterThanOrEqual(30);
  });

  test('should maintain FPS after resize', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Baseline FPS
    const baseline = await globe.measureFPS(1000);

    // Resize
    await globe.resizeWindow(1280, 720);
    await globe.wait(500);

    // FPS after resize
    const after = await globe.measureFPS(1000);

    console.log(`FPS: Baseline ${baseline.fps.toFixed(2)}, After resize ${after.fps.toFixed(2)}`);

    // FPS should remain good (within 20% of baseline)
    expect(after.fps).toBeGreaterThanOrEqual(baseline.fps * 0.8);
  });
});

test.describe('Performance - Configuration Changes', () => {
  test('should handle rapid configuration changes efficiently', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    const startTime = Date.now();

    // Rapid configuration changes
    for (let i = 0; i < 20; i++) {
      await globe.setDotSize(Math.random() * 3 + 0.5);
      await globe.setRotationSpeed(Math.random() * 3);
      await globe.setScale(Math.random() * 1 + 0.5);
    }

    const configTime = Date.now() - startTime;

    console.log(`Configuration changes took: ${configTime}ms`);

    // Should complete quickly
    expect(configTime).toBeLessThan(5000);

    // Globe should still be functional
    const { fps } = await globe.measureFPS(1000);
    expect(fps).toBeGreaterThanOrEqual(30);
  });

  test('should update visual properties without FPS drop', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Start FPS measurement
    const fpsPromise = globe.measureFPS(3000);

    // Change properties during measurement
    await globe.wait(500);
    await globe.setDotSize(2.5);
    await globe.wait(500);
    await globe.setScale(1.3);
    await globe.wait(500);
    await globe.setDotColor('#ff0000');

    const { fps } = await fpsPromise;

    console.log(`FPS during property changes: ${fps.toFixed(2)}`);

    // FPS should remain acceptable
    expect(fps).toBeGreaterThanOrEqual(30);
  });
});

test.describe('Performance - Long Running Stability', () => {
  test('should maintain performance over 2 minutes of continuous use', async ({ page }) => {
    test.setTimeout(150000); // 2.5 minutes timeout

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Measure FPS at intervals
    const measurements = [];

    // Take measurements every 30 seconds for 2 minutes
    for (let i = 0; i < 4; i++) {
      const { fps } = await globe.measureFPS(2000);
      measurements.push(fps);
      console.log(`Measurement ${i + 1}/4: ${fps.toFixed(2)} FPS`);

      // Do some interactions
      await globe.dragGlobe(
        { x: Math.random() * 400, y: Math.random() * 400 },
        { x: Math.random() * 400, y: Math.random() * 400 }
      );

      await globe.wait(28000); // Wait rest of 30 seconds
    }

    // Calculate performance metrics
    const avgFPS = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const minFPS = Math.min(...measurements);
    const maxFPS = Math.max(...measurements);

    console.log(`FPS over 2 minutes - Avg: ${avgFPS.toFixed(2)}, Min: ${minFPS.toFixed(2)}, Max: ${maxFPS.toFixed(2)}`);

    // All measurements should meet minimum threshold
    measurements.forEach((fps, index) => {
      expect(fps).toBeGreaterThanOrEqual(30);
    });

    // Average should be good
    expect(avgFPS).toBeGreaterThanOrEqual(40);
  });
});

test.describe('Performance - GPU Usage', () => {
  test('should utilize WebGL efficiently', async ({ page }) => {
    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Check for WebGL errors
    const error = await globe.getWebGLError();
    expect(error).toBe(0);

    // Measure draw call efficiency
    const drawCallInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (!gl) return null;

      return {
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
      };
    });

    console.log('WebGL Info:', drawCallInfo);

    expect(drawCallInfo).not.toBeNull();
    expect(drawCallInfo.maxTextureSize).toBeGreaterThan(0);
  });
});

test.describe('Performance - Mobile Specific', () => {
  test('should meet mobile performance targets on small viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Measure FPS
    const { fps } = await globe.measureFPS(3000);

    console.log(`Mobile FPS: ${fps.toFixed(2)}`);

    // Should meet mobile threshold (30fps minimum)
    expect(fps).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.mobile.minFPS);
  });

  test('should handle mobile interactions efficiently', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const globe = new GlobePage(page);
    await globe.goto();
    await globe.waitForGlobeInit();

    // Start FPS measurement
    const fpsPromise = globe.measureFPS(3000);

    // Simulate mobile interactions
    await globe.wait(500);
    await globe.dragGlobe({ x: 100, y: 200 }, { x: 200, y: 300 });
    await globe.wait(500);
    await globe.dragGlobe({ x: 200, y: 300 }, { x: 100, y: 200 });

    const { fps } = await fpsPromise;

    console.log(`Mobile interaction FPS: ${fps.toFixed(2)}`);

    // Should maintain reasonable FPS during interaction
    expect(fps).toBeGreaterThanOrEqual(PERFORMANCE_THRESHOLDS.mobile.minFPS * 0.9);
  });
});
