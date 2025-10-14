/**
 * Interactive Globe - Main Entry Point
 *
 * Exports the Globe class and related utilities for creating
 * interactive 3D globe visualizations with Three.js
 *
 * @module interactive-globe
 * @version 1.0.0
 *
 * @example
 * // Import the main Globe class
 * import { Globe } from './src/index.js';
 *
 * // Create a new globe instance
 * const globe = new Globe({
 *   container: document.getElementById('globe-container'),
 *   dotColor: '#FFFFFF',
 *   autoRotate: true
 * });
 *
 * // Initialize the globe
 * await globe.init();
 *
 * @example
 * // Import specific utilities
 * import { Globe, latLonToCartesian, parseColor } from './src/index.js';
 */

// Export the main Globe class
export { Globe, Globe as default } from './Globe.js';

// Export dot generation utilities
export {
  generateFibonacciSphere,
  generateFibonacciSphereBuffer,
  GOLDEN_ANGLE
} from './DotGenerator.js';

// Export texture sampling utilities
export {
  loadEarthTexture,
  isLandAtPosition,
  samplePixelAtUV,
  cartesianToLatLong,
  latLongToUV,
  uvToLatLong,
  batchCheckLand,
  getBrightnessAtLatLong,
  isLandAtLatLong,
  disposeTextureData,
  getTextureDebugInfo
} from './TextureSampler.js';

// Export coordinate utilities
export {
  cartesianToLatLon,
  latLonToUV,
  latLonToCartesian,
  cartesianToUV,
  uvToLatLon,
  uvToCartesian,
  generateFibonacciSphere as generateFibonacciSphereWithCoords,
  greatCircleDistance,
  normalizeVector,
  vectorMagnitude
} from './utils/coordinates.js';

// Export color utilities
export {
  parseColor,
  isValidColor,
  parseRGB,
  parseRGBA,
  colorToHex,
  colorToRGB,
  colorToRGBA,
  hexToRGB,
  rgbToHex,
  lerpColor,
  getColorLuminance,
  isLightColor,
  adjustBrightness,
  adjustSaturation,
  createColorPalette,
  blendColors,
  COLORS
} from './utils/colors.js';
