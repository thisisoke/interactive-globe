/**
 * Test Fixtures and Utilities
 *
 * Reusable test data, constants, and helper functions for the test suite.
 */

/**
 * Major world cities for testing active dot highlighting
 */
export const MAJOR_CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332 },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
];

/**
 * Test color schemes
 */
export const COLOR_SCHEMES = {
  default: {
    dotColor: '#FFFFFF',
    activeDotColor: '#FF6B35',
    backgroundColor: 'transparent',
  },
  blue: {
    dotColor: '#4B9FBF',
    activeDotColor: '#0066CC',
    backgroundColor: '#001122',
  },
  green: {
    dotColor: '#00FF00',
    activeDotColor: '#FFFF00',
    backgroundColor: '#001100',
  },
  red: {
    dotColor: '#FF0000',
    activeDotColor: '#FFFF00',
    backgroundColor: '#110000',
  },
  monochrome: {
    dotColor: '#CCCCCC',
    activeDotColor: '#FFFFFF',
    backgroundColor: '#000000',
  },
};

/**
 * Viewport sizes for responsive testing
 */
export const VIEWPORTS = {
  mobile: {
    iphone: { width: 390, height: 844, name: 'iPhone 13' },
    iphoneSE: { width: 375, height: 667, name: 'iPhone SE' },
    pixel: { width: 393, height: 851, name: 'Pixel 5' },
    galaxyS20: { width: 360, height: 800, name: 'Galaxy S20' },
  },
  tablet: {
    ipad: { width: 768, height: 1024, name: 'iPad' },
    ipadPro: { width: 1024, height: 1366, name: 'iPad Pro' },
    ipadLandscape: { width: 1024, height: 768, name: 'iPad Landscape' },
  },
  desktop: {
    hd: { width: 1280, height: 720, name: '720p HD' },
    fhd: { width: 1920, height: 1080, name: '1080p FHD' },
    wqhd: { width: 2560, height: 1440, name: '1440p WQHD' },
    uhd: { width: 3840, height: 2160, name: '4K UHD' },
    ultrawide: { width: 3440, height: 1440, name: 'Ultrawide' },
  },
};

/**
 * Performance thresholds by device type
 */
export const PERFORMANCE_THRESHOLDS = {
  desktop: {
    minFPS: 60,
    targetFPS: 60,
    maxLoadTime: 500,
    maxMemoryMB: 50,
    maxFrameDropRate: 0.05, // 5%
  },
  mobile: {
    minFPS: 30,
    targetFPS: 30,
    maxLoadTime: 1000,
    maxMemoryMB: 75,
    maxFrameDropRate: 0.10, // 10%
  },
  tablet: {
    minFPS: 45,
    targetFPS: 60,
    maxLoadTime: 750,
    maxMemoryMB: 60,
    maxFrameDropRate: 0.07, // 7%
  },
};

/**
 * Test configuration presets
 */
export const GLOBE_CONFIGS = {
  minimal: {
    dotSize: 1.0,
    dotCount: 10000,
    rotationSpeed: 0.5,
    scale: 0.8,
  },
  standard: {
    dotSize: 1.5,
    dotCount: 20000,
    rotationSpeed: 1.0,
    scale: 1.0,
  },
  detailed: {
    dotSize: 2.0,
    dotCount: 30000,
    rotationSpeed: 0.8,
    scale: 1.2,
  },
  performance: {
    dotSize: 1.0,
    dotCount: 15000,
    rotationSpeed: 1.5,
    scale: 1.0,
    antialias: false,
  },
};

/**
 * Coordinate sets for testing different regions
 */
export const REGIONS = {
  northAmerica: [
    { lat: 40.7128, lon: -74.0060 },  // New York
    { lat: 34.0522, lon: -118.2437 }, // Los Angeles
    { lat: 41.8781, lon: -87.6298 },  // Chicago
    { lat: 29.7604, lon: -95.3698 },  // Houston
  ],
  europe: [
    { lat: 51.5074, lon: -0.1278 },   // London
    { lat: 48.8566, lon: 2.3522 },    // Paris
    { lat: 52.5200, lon: 13.4050 },   // Berlin
    { lat: 41.9028, lon: 12.4964 },   // Rome
  ],
  asia: [
    { lat: 35.6762, lon: 139.6503 },  // Tokyo
    { lat: 31.2304, lon: 121.4737 },  // Shanghai
    { lat: 1.3521, lon: 103.8198 },   // Singapore
    { lat: 19.0760, lon: 72.8777 },   // Mumbai
  ],
  southAmerica: [
    { lat: -23.5505, lon: -46.6333 }, // São Paulo
    { lat: -34.6037, lon: -58.3816 }, // Buenos Aires
    { lat: -12.0464, lon: -77.0428 }, // Lima
    { lat: 4.7110, lon: -74.0721 },   // Bogotá
  ],
  africa: [
    { lat: 6.5244, lon: 3.3792 },     // Lagos
    { lat: 30.0444, lon: 31.2357 },   // Cairo
    { lat: -26.2041, lon: 28.0473 },  // Johannesburg
    { lat: -1.2921, lon: 36.8219 },   // Nairobi
  ],
  oceania: [
    { lat: -33.8688, lon: 151.2093 }, // Sydney
    { lat: -37.8136, lon: 144.9631 }, // Melbourne
    { lat: -41.2865, lon: 174.7762 }, // Wellington
    { lat: -6.2088, lon: 106.8456 },  // Jakarta
  ],
};

/**
 * Helper function to generate random color
 * @returns {string} Hex color
 */
export function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Helper function to generate random coordinate
 * @returns {{lat: number, lon: number}}
 */
export function randomCoordinate() {
  return {
    lat: Math.random() * 180 - 90,  // -90 to 90
    lon: Math.random() * 360 - 180, // -180 to 180
  };
}

/**
 * Helper to convert bytes to megabytes
 * @param {number} bytes
 * @returns {number} Megabytes
 */
export function bytesToMB(bytes) {
  return bytes / (1024 * 1024);
}

/**
 * Helper to calculate FPS from frame time
 * @param {number} frameTime - Time in milliseconds
 * @returns {number} FPS
 */
export function calculateFPS(frameTime) {
  return 1000 / frameTime;
}

/**
 * Helper to wait for a specific condition
 * @param {Function} condition - Function that returns boolean
 * @param {number} timeout - Max wait time in ms
 * @param {number} interval - Check interval in ms
 * @returns {Promise<boolean>}
 */
export async function waitForCondition(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return false;
}

/**
 * Helper to retry a function multiple times
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise<any>}
 */
export async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Helper to calculate distance between two coordinates
 * @param {Object} coord1 - {lat, lon}
 * @param {Object} coord2 - {lat, lon}
 * @returns {number} Distance in degrees
 */
export function coordinateDistance(coord1, coord2) {
  const latDiff = coord1.lat - coord2.lat;
  const lonDiff = coord1.lon - coord2.lon;
  return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
}

/**
 * Helper to get device type from viewport size
 * @param {Object} viewport - {width, height}
 * @returns {string} 'mobile', 'tablet', or 'desktop'
 */
export function getDeviceType(viewport) {
  if (!viewport) return 'desktop';
  const width = viewport.width;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Helper to format performance metrics
 * @param {Object} metrics - Performance metrics
 * @returns {string} Formatted string
 */
export function formatMetrics(metrics) {
  const lines = [];

  if (metrics.fps !== undefined) {
    lines.push(`FPS: ${metrics.fps.toFixed(2)}`);
  }
  if (metrics.frames !== undefined) {
    lines.push(`Frames: ${metrics.frames}`);
  }
  if (metrics.loadTime !== undefined) {
    lines.push(`Load Time: ${metrics.loadTime}ms`);
  }
  if (metrics.memoryMB !== undefined) {
    lines.push(`Memory: ${metrics.memoryMB.toFixed(2)} MB`);
  }
  if (metrics.dropRate !== undefined) {
    lines.push(`Drop Rate: ${(metrics.dropRate * 100).toFixed(2)}%`);
  }

  return lines.join(', ');
}

/**
 * Test data for visual regression tests
 */
export const VISUAL_TEST_STATES = [
  { name: 'initial', description: 'Initial globe state' },
  { name: 'rotated', description: 'After rotation', wait: 3000 },
  { name: 'dragged', description: 'After drag interaction' },
  { name: 'highlighted', description: 'With cities highlighted' },
  { name: 'red-dots', description: 'Red dot color', color: '#ff0000' },
  { name: 'blue-dots', description: 'Blue dot color', color: '#0000ff' },
  { name: 'large-scale', description: 'Scaled up 1.5x', scale: 1.5 },
  { name: 'small-scale', description: 'Scaled down 0.7x', scale: 0.7 },
];

/**
 * Expected WebGL error codes
 */
export const WEBGL_ERRORS = {
  NO_ERROR: 0,
  INVALID_ENUM: 0x0500,
  INVALID_VALUE: 0x0501,
  INVALID_OPERATION: 0x0502,
  OUT_OF_MEMORY: 0x0505,
  CONTEXT_LOST: 0x9242,
};

/**
 * Console log levels for filtering
 */
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warning',
  INFO: 'info',
  LOG: 'log',
  DEBUG: 'debug',
};

/**
 * Helper to create a performance observer
 * @param {Page} page - Playwright page object
 * @param {Array<string>} entryTypes - Types to observe
 * @returns {Promise<Array>} Performance entries
 */
export async function observePerformance(page, entryTypes = ['navigation', 'measure']) {
  return await page.evaluate((types) => {
    return new Promise((resolve) => {
      const entries = [];
      const observer = new PerformanceObserver((list) => {
        entries.push(...list.getEntries());
      });

      types.forEach(type => {
        try {
          observer.observe({ entryTypes: [type] });
        } catch (e) {
          console.warn(`Cannot observe ${type}:`, e);
        }
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(entries);
      }, 5000);
    });
  }, entryTypes);
}

export default {
  MAJOR_CITIES,
  COLOR_SCHEMES,
  VIEWPORTS,
  PERFORMANCE_THRESHOLDS,
  GLOBE_CONFIGS,
  REGIONS,
  VISUAL_TEST_STATES,
  WEBGL_ERRORS,
  LOG_LEVELS,
  randomColor,
  randomCoordinate,
  bytesToMB,
  calculateFPS,
  waitForCondition,
  retry,
  coordinateDistance,
  getDeviceType,
  formatMetrics,
  observePerformance,
};
