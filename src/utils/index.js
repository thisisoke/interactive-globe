/**
 * Utility Functions Index
 *
 * Central export point for all utility functions
 * Allows for clean imports throughout the project
 *
 * @example
 * // Instead of:
 * import { parseColor } from './utils/colors.js';
 * import { latLonToCartesian } from './utils/coordinates.js';
 *
 * // You can use:
 * import { parseColor, latLonToCartesian } from './utils/index.js';
 */

// Export all coordinate utilities
export {
  cartesianToLatLon,
  latLonToUV,
  latLonToCartesian,
  cartesianToUV,
  uvToLatLon,
  uvToCartesian,
  generateFibonacciSphere,
  greatCircleDistance,
  normalizeVector,
  vectorMagnitude
} from './coordinates.js';

// Export all color utilities
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
} from './colors.js';
