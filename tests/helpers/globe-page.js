/**
 * Page Object Model for Globe Tests
 *
 * Provides reusable methods and selectors for interacting with the globe component.
 * Follows Playwright best practices for maintainable test code.
 *
 * @class GlobePage
 */

export class GlobePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Locators
    this.globeContainer = page.locator('#globe-container');
    this.canvas = page.locator('canvas');
    this.loadingIndicator = page.locator('#loading');

    // Control elements
    this.dotColorInput = page.locator('#dotColor');
    this.activeDotColorInput = page.locator('#activeDotColor');
    this.dotSizeInput = page.locator('#dotSize');
    this.rotationSpeedInput = page.locator('#rotationSpeed');
    this.scaleInput = page.locator('#scale');
    this.toggleRotationButton = page.locator('#toggleRotation');
    this.highlightCitiesButton = page.locator('#highlightCities');

    // Value displays
    this.dotSizeValue = page.locator('#dotSizeValue');
    this.rotationSpeedValue = page.locator('#rotationSpeedValue');
    this.scaleValue = page.locator('#scaleValue');
  }

  /**
   * Navigate to the globe example page
   */
  async goto() {
    await this.page.goto('/examples/basic-example.html');
  }

  /**
   * Wait for the globe to fully initialize
   * @param {number} timeout - Maximum wait time in ms
   */
  async waitForGlobeInit(timeout = 30000) {
    // Wait for loading indicator to disappear
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout });

    // Wait for canvas to be visible
    await this.canvas.waitFor({ state: 'visible', timeout: 5000 });

    // Give globe a moment to render
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get the WebGL context from the canvas
   * @returns {Promise<boolean>} True if WebGL context exists
   */
  async hasWebGLContext() {
    return await this.page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;

      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return gl !== null;
    });
  }

  /**
   * Get the globe instance from the window
   * @returns {Promise<Object>} Globe configuration and state
   */
  async getGlobeState() {
    return await this.page.evaluate(() => {
      // Access the globe instance through the module scope
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      return {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        hasContent: canvas.toDataURL().length > 0,
      };
    });
  }

  /**
   * Get dot count by analyzing canvas
   * @returns {Promise<number>} Estimated number of visible dots
   */
  async getDotCount() {
    return await this.page.evaluate(() => {
      // This is an approximation - we check for non-transparent pixels
      const canvas = document.querySelector('canvas');
      if (!canvas) return 0;

      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let dotPixels = 0;
      for (let i = 3; i < data.length; i += 4) {
        // Check alpha channel
        if (data[i] > 0) {
          dotPixels++;
        }
      }

      // Rough estimate: each dot is ~4 pixels
      return Math.floor(dotPixels / 4);
    });
  }

  /**
   * Check if globe is rotating
   * @param {number} duration - Time to observe in ms
   * @returns {Promise<boolean>} True if rotation detected
   */
  async isRotating(duration = 1000) {
    const before = await this.page.screenshot();
    await this.page.waitForTimeout(duration);
    const after = await this.page.screenshot();

    // Compare screenshots
    return !before.equals(after);
  }

  /**
   * Drag the globe
   * @param {Object} from - Starting position {x, y}
   * @param {Object} to - Ending position {x, y}
   */
  async dragGlobe(from, to) {
    const canvas = await this.canvas.boundingBox();
    if (!canvas) throw new Error('Canvas not found');

    await this.page.mouse.move(canvas.x + from.x, canvas.y + from.y);
    await this.page.mouse.down();
    await this.page.mouse.move(canvas.x + to.x, canvas.y + to.y, { steps: 10 });
    await this.page.mouse.up();

    // Wait for drag to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Click on the globe at specific coordinates
   * @param {number} x - X coordinate relative to canvas
   * @param {number} y - Y coordinate relative to canvas
   */
  async clickGlobe(x, y) {
    const canvas = await this.canvas.boundingBox();
    if (!canvas) throw new Error('Canvas not found');

    await this.page.mouse.click(canvas.x + x, canvas.y + y);
  }

  /**
   * Set dot color
   * @param {string} color - Hex color value (e.g., '#FF0000')
   */
  async setDotColor(color) {
    await this.dotColorInput.fill(color);
    await this.page.waitForTimeout(200);
  }

  /**
   * Set active dot color
   * @param {string} color - Hex color value
   */
  async setActiveDotColor(color) {
    await this.activeDotColorInput.fill(color);
    await this.page.waitForTimeout(200);
  }

  /**
   * Set dot size
   * @param {number} size - Dot size value
   */
  async setDotSize(size) {
    await this.dotSizeInput.fill(size.toString());
    await this.page.waitForTimeout(200);
  }

  /**
   * Set rotation speed
   * @param {number} speed - Rotation speed value
   */
  async setRotationSpeed(speed) {
    await this.rotationSpeedInput.fill(speed.toString());
    await this.page.waitForTimeout(200);
  }

  /**
   * Set globe scale
   * @param {number} scale - Scale value
   */
  async setScale(scale) {
    await this.scaleInput.fill(scale.toString());
    await this.page.waitForTimeout(200);
  }

  /**
   * Toggle rotation on/off
   */
  async toggleRotation() {
    await this.toggleRotationButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Highlight major cities
   */
  async highlightCities() {
    await this.highlightCitiesButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get canvas dimensions
   * @returns {Promise<{width: number, height: number}>}
   */
  async getCanvasDimensions() {
    const box = await this.canvas.boundingBox();
    return {
      width: box.width,
      height: box.height,
    };
  }

  /**
   * Resize browser window
   * @param {number} width
   * @param {number} height
   */
  async resizeWindow(width, height) {
    await this.page.setViewportSize({ width, height });
    await this.page.waitForTimeout(500);
  }

  /**
   * Get current rotation button text
   * @returns {Promise<string>}
   */
  async getRotationButtonText() {
    return await this.toggleRotationButton.textContent();
  }

  /**
   * Measure FPS over a duration
   * @param {number} duration - Duration in ms to measure
   * @returns {Promise<{fps: number, frames: number}>}
   */
  async measureFPS(duration = 2000) {
    return await this.page.evaluate((measureDuration) => {
      return new Promise((resolve) => {
        let frames = 0;
        const startTime = performance.now();

        function countFrame() {
          frames++;
          if (performance.now() - startTime < measureDuration) {
            requestAnimationFrame(countFrame);
          } else {
            const elapsed = performance.now() - startTime;
            const fps = (frames / elapsed) * 1000;
            resolve({ fps, frames });
          }
        }

        requestAnimationFrame(countFrame);
      });
    }, duration);
  }

  /**
   * Get memory usage
   * @returns {Promise<{usedJSHeapSize: number, totalJSHeapSize: number}>}
   */
  async getMemoryUsage() {
    return await this.page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        };
      }
      return null;
    });
  }

  /**
   * Wait for a specific amount of time
   * @param {number} ms - Milliseconds to wait
   */
  async wait(ms) {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Take a screenshot of the canvas only
   * @returns {Promise<Buffer>}
   */
  async screenshotCanvas() {
    return await this.canvas.screenshot();
  }

  /**
   * Check if canvas contains non-transparent pixels
   * @returns {Promise<boolean>}
   */
  async hasVisibleContent() {
    return await this.page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;

      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Check if any pixel has non-zero alpha
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true;
      }

      return false;
    });
  }

  /**
   * Get pixel color at specific canvas coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Promise<{r: number, g: number, b: number, a: number}>}
   */
  async getPixelColor(x, y) {
    return await this.page.evaluate(({ x, y }) => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(x, y, 1, 1);
      const data = imageData.data;

      return {
        r: data[0],
        g: data[1],
        b: data[2],
        a: data[3],
      };
    }, { x, y });
  }

  /**
   * Check for console errors
   * @returns {Promise<Array<string>>} Array of console error messages
   */
  async getConsoleErrors() {
    const errors = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  /**
   * Check for WebGL errors
   * @returns {Promise<number|null>} WebGL error code or null
   */
  async getWebGLError() {
    return await this.page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (!gl) return null;

      return gl.getError();
    });
  }
}
