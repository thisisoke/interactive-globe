/**
 * Color Utility Functions for Interactive Globe
 *
 * Provides functions to parse, validate, and convert between different color formats
 * Compatible with Three.js Color class
 *
 * @module utils/colors
 */

import * as THREE from 'three';

/**
 * Parses various CSS color formats to Three.js Color object
 *
 * Supports:
 * - Hex: "#ff0000", "#f00", "0xff0000"
 * - RGB: "rgb(255, 0, 0)"
 * - RGBA: "rgba(255, 0, 0, 1.0)"
 * - Named colors: "red", "blue", etc.
 *
 * @param {string|number} color - Color in any supported format
 * @returns {THREE.Color|null} Three.js Color object or null if invalid
 *
 * @example
 * const color1 = parseColor("#ff0000");
 * const color2 = parseColor("rgb(255, 0, 0)");
 * const color3 = parseColor("red");
 * const color4 = parseColor(0xff0000);
 */
export function parseColor(color) {
  try {
    // Handle numeric hex values
    if (typeof color === 'number') {
      return new THREE.Color(color);
    }

    // Handle string inputs
    if (typeof color === 'string') {
      color = color.trim();

      // Handle hex colors
      if (color.startsWith('#')) {
        return new THREE.Color(color);
      }

      // Handle 0x prefix hex colors
      if (color.startsWith('0x')) {
        return new THREE.Color(parseInt(color, 16));
      }

      // Handle RGB format
      if (color.startsWith('rgb(')) {
        const rgbValues = parseRGB(color);
        if (rgbValues) {
          return new THREE.Color(
            rgbValues.r / 255,
            rgbValues.g / 255,
            rgbValues.b / 255
          );
        }
      }

      // Handle RGBA format (ignore alpha channel for Three.Color)
      if (color.startsWith('rgba(')) {
        const rgbaValues = parseRGBA(color);
        if (rgbaValues) {
          return new THREE.Color(
            rgbaValues.r / 255,
            rgbaValues.g / 255,
            rgbaValues.b / 255
          );
        }
      }

      // Try to parse as named color or other CSS color
      return new THREE.Color(color);
    }

    return null;
  } catch (error) {
    console.warn('Failed to parse color:', color, error);
    return null;
  }
}

/**
 * Validates if a color string or number is valid
 *
 * @param {string|number} color - Color to validate
 * @returns {boolean} True if color is valid, false otherwise
 *
 * @example
 * console.log(isValidColor("#ff0000")); // true
 * console.log(isValidColor("invalid")); // false
 * console.log(isValidColor(0xff0000)); // true
 */
export function isValidColor(color) {
  const parsed = parseColor(color);
  return parsed !== null;
}

/**
 * Parses RGB string format to component values
 *
 * @param {string} rgbString - RGB string in format "rgb(r, g, b)"
 * @returns {{r: number, g: number, b: number}|null} RGB components (0-255) or null if invalid
 *
 * @example
 * const rgb = parseRGB("rgb(255, 128, 64)");
 * console.log(rgb); // { r: 255, g: 128, b: 64 }
 */
export function parseRGB(rgbString) {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return null;
  }

  return { r, g, b };
}

/**
 * Parses RGBA string format to component values
 *
 * @param {string} rgbaString - RGBA string in format "rgba(r, g, b, a)"
 * @returns {{r: number, g: number, b: number, a: number}|null} RGBA components or null if invalid
 *
 * @example
 * const rgba = parseRGBA("rgba(255, 128, 64, 0.5)");
 * console.log(rgba); // { r: 255, g: 128, b: 64, a: 0.5 }
 */
export function parseRGBA(rgbaString) {
  const match = rgbaString.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!match) return null;

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = parseFloat(match[4]);

  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) {
    return null;
  }

  return { r, g, b, a };
}

/**
 * Converts a Three.js Color object to hex string
 *
 * @param {THREE.Color} color - Three.js Color object
 * @param {boolean} [includeHash=true] - Whether to include '#' prefix
 * @returns {string} Hex color string
 *
 * @example
 * const threeColor = new THREE.Color(0xff0000);
 * console.log(colorToHex(threeColor)); // "#ff0000"
 * console.log(colorToHex(threeColor, false)); // "ff0000"
 */
export function colorToHex(color, includeHash = true) {
  const hex = color.getHexString();
  return includeHash ? `#${hex}` : hex;
}

/**
 * Converts a Three.js Color object to RGB string
 *
 * @param {THREE.Color} color - Three.js Color object
 * @returns {string} RGB string in format "rgb(r, g, b)"
 *
 * @example
 * const threeColor = new THREE.Color(0xff0000);
 * console.log(colorToRGB(threeColor)); // "rgb(255, 0, 0)"
 */
export function colorToRGB(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts a Three.js Color object to RGBA string with specified alpha
 *
 * @param {THREE.Color} color - Three.js Color object
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA string in format "rgba(r, g, b, a)"
 *
 * @example
 * const threeColor = new THREE.Color(0xff0000);
 * console.log(colorToRGBA(threeColor, 0.5)); // "rgba(255, 0, 0, 0.5)"
 */
export function colorToRGBA(color, alpha = 1.0) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Converts hex string to RGB object
 *
 * @param {string} hex - Hex color string (with or without #)
 * @returns {{r: number, g: number, b: number}|null} RGB components (0-255) or null if invalid
 *
 * @example
 * const rgb = hexToRGB("#ff0000");
 * console.log(rgb); // { r: 255, g: 0, b: 0 }
 */
export function hexToRGB(hex) {
  const color = parseColor(hex);
  if (!color) return null;

  return {
    r: Math.round(color.r * 255),
    g: Math.round(color.g * 255),
    b: Math.round(color.b * 255)
  };
}

/**
 * Converts RGB values to hex string
 *
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @param {boolean} [includeHash=true] - Whether to include '#' prefix
 * @returns {string|null} Hex color string or null if invalid
 *
 * @example
 * console.log(rgbToHex(255, 0, 0)); // "#ff0000"
 */
export function rgbToHex(r, g, b, includeHash = true) {
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return null;
  }

  const toHex = (n) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const hex = toHex(r) + toHex(g) + toHex(b);
  return includeHash ? `#${hex}` : hex;
}

/**
 * Linearly interpolates between two colors
 *
 * @param {THREE.Color|string|number} color1 - Start color
 * @param {THREE.Color|string|number} color2 - End color
 * @param {number} t - Interpolation factor (0-1)
 * @returns {THREE.Color|null} Interpolated color or null if invalid input
 *
 * @example
 * const red = new THREE.Color(0xff0000);
 * const blue = new THREE.Color(0x0000ff);
 * const purple = lerpColor(red, blue, 0.5);
 */
export function lerpColor(color1, color2, t) {
  const c1 = color1 instanceof THREE.Color ? color1 : parseColor(color1);
  const c2 = color2 instanceof THREE.Color ? color2 : parseColor(color2);

  if (!c1 || !c2) return null;

  const result = new THREE.Color();
  result.lerpColors(c1, c2, t);
  return result;
}

/**
 * Gets the luminance (brightness) of a color
 * Uses the relative luminance formula (Rec. 709)
 *
 * @param {THREE.Color|string|number} color - Color to analyze
 * @returns {number|null} Luminance value (0-1) or null if invalid
 *
 * @example
 * const brightness = getColorLuminance("#ffffff");
 * console.log(brightness); // 1.0 (white is brightest)
 */
export function getColorLuminance(color) {
  const c = color instanceof THREE.Color ? color : parseColor(color);
  if (!c) return null;

  // Relative luminance formula (Rec. 709)
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

/**
 * Determines if a color is considered "light" or "dark"
 * Useful for choosing contrasting text colors
 *
 * @param {THREE.Color|string|number} color - Color to analyze
 * @param {number} [threshold=0.5] - Luminance threshold (0-1)
 * @returns {boolean|null} True if light, false if dark, null if invalid
 *
 * @example
 * console.log(isLightColor("#ffffff")); // true
 * console.log(isLightColor("#000000")); // false
 */
export function isLightColor(color, threshold = 0.5) {
  const luminance = getColorLuminance(color);
  if (luminance === null) return null;
  return luminance > threshold;
}

/**
 * Adjusts the brightness of a color
 *
 * @param {THREE.Color|string|number} color - Color to adjust
 * @param {number} amount - Amount to adjust (-1 to 1, negative darkens, positive lightens)
 * @returns {THREE.Color|null} Adjusted color or null if invalid
 *
 * @example
 * const color = parseColor("#ff0000");
 * const lighter = adjustBrightness(color, 0.5); // 50% lighter
 * const darker = adjustBrightness(color, -0.5); // 50% darker
 */
export function adjustBrightness(color, amount) {
  const c = color instanceof THREE.Color ? color.clone() : parseColor(color);
  if (!c) return null;

  const adjustment = Math.max(-1, Math.min(1, amount));

  if (adjustment > 0) {
    // Lighten
    c.r = c.r + (1 - c.r) * adjustment;
    c.g = c.g + (1 - c.g) * adjustment;
    c.b = c.b + (1 - c.b) * adjustment;
  } else {
    // Darken
    c.r = c.r + c.r * adjustment;
    c.g = c.g + c.g * adjustment;
    c.b = c.b + c.b * adjustment;
  }

  return c;
}

/**
 * Adjusts the saturation of a color
 *
 * @param {THREE.Color|string|number} color - Color to adjust
 * @param {number} amount - Amount to adjust (-1 to 1, negative desaturates, positive saturates)
 * @returns {THREE.Color|null} Adjusted color or null if invalid
 *
 * @example
 * const color = parseColor("#ff0000");
 * const desaturated = adjustSaturation(color, -0.5); // 50% less saturated
 */
export function adjustSaturation(color, amount) {
  const c = color instanceof THREE.Color ? color.clone() : parseColor(color);
  if (!c) return null;

  const adjustment = Math.max(-1, Math.min(1, amount));

  // Get HSL values
  const hsl = {};
  c.getHSL(hsl);

  // Adjust saturation
  hsl.s = Math.max(0, Math.min(1, hsl.s + adjustment));

  // Set back to color
  c.setHSL(hsl.h, hsl.s, hsl.l);

  return c;
}

/**
 * Creates a color palette by generating variations of a base color
 *
 * @param {THREE.Color|string|number} baseColor - Base color for the palette
 * @param {number} [count=5] - Number of colors in the palette
 * @returns {Array<THREE.Color>|null} Array of colors or null if invalid base color
 *
 * @example
 * const palette = createColorPalette("#ff0000", 5);
 * palette.forEach(color => console.log(colorToHex(color)));
 */
export function createColorPalette(baseColor, count = 5) {
  const base = baseColor instanceof THREE.Color ? baseColor : parseColor(baseColor);
  if (!base) return null;

  const palette = [];
  const hsl = {};
  base.getHSL(hsl);

  for (let i = 0; i < count; i++) {
    const color = new THREE.Color();
    const hueShift = (i / count) * 0.1 - 0.05; // Small hue variation
    const lightnessShift = (i / (count - 1)) * 0.4 - 0.2; // -0.2 to +0.2

    color.setHSL(
      (hsl.h + hueShift + 1) % 1,
      hsl.s,
      Math.max(0, Math.min(1, hsl.l + lightnessShift))
    );

    palette.push(color);
  }

  return palette;
}

/**
 * Blends two colors using a specified blend mode
 *
 * @param {THREE.Color|string|number} color1 - First color
 * @param {THREE.Color|string|number} color2 - Second color
 * @param {string} [mode='normal'] - Blend mode ('normal', 'multiply', 'screen', 'overlay', 'add')
 * @param {number} [alpha=0.5] - Blend amount (0-1)
 * @returns {THREE.Color|null} Blended color or null if invalid
 *
 * @example
 * const result = blendColors("#ff0000", "#0000ff", "multiply", 0.5);
 */
export function blendColors(color1, color2, mode = 'normal', alpha = 0.5) {
  const c1 = color1 instanceof THREE.Color ? color1 : parseColor(color1);
  const c2 = color2 instanceof THREE.Color ? color2 : parseColor(color2);

  if (!c1 || !c2) return null;

  const result = new THREE.Color();
  const a = Math.max(0, Math.min(1, alpha));

  switch (mode) {
    case 'multiply':
      result.r = c1.r * c2.r;
      result.g = c1.g * c2.g;
      result.b = c1.b * c2.b;
      break;

    case 'screen':
      result.r = 1 - (1 - c1.r) * (1 - c2.r);
      result.g = 1 - (1 - c1.g) * (1 - c2.g);
      result.b = 1 - (1 - c1.b) * (1 - c2.b);
      break;

    case 'overlay':
      result.r = c1.r < 0.5 ? 2 * c1.r * c2.r : 1 - 2 * (1 - c1.r) * (1 - c2.r);
      result.g = c1.g < 0.5 ? 2 * c1.g * c2.g : 1 - 2 * (1 - c1.g) * (1 - c2.g);
      result.b = c1.b < 0.5 ? 2 * c1.b * c2.b : 1 - 2 * (1 - c1.b) * (1 - c2.b);
      break;

    case 'add':
      result.r = Math.min(1, c1.r + c2.r);
      result.g = Math.min(1, c1.g + c2.g);
      result.b = Math.min(1, c1.b + c2.b);
      break;

    case 'normal':
    default:
      result.lerpColors(c1, c2, a);
      return result;
  }

  // Apply alpha blending for non-normal modes
  result.lerp(c1, 1 - a);
  return result;
}

/**
 * Color constants for common use cases
 */
export const COLORS = {
  // Basic colors
  WHITE: new THREE.Color(0xffffff),
  BLACK: new THREE.Color(0x000000),
  RED: new THREE.Color(0xff0000),
  GREEN: new THREE.Color(0x00ff00),
  BLUE: new THREE.Color(0x0000ff),
  YELLOW: new THREE.Color(0xffff00),
  CYAN: new THREE.Color(0x00ffff),
  MAGENTA: new THREE.Color(0xff00ff),

  // Globe-specific colors
  OCEAN: new THREE.Color(0x1e3a5f),
  LAND: new THREE.Color(0x4a7c59),
  ATMOSPHERE: new THREE.Color(0x4488ff),
  GLOW: new THREE.Color(0x00ffff),
  PARTICLE: new THREE.Color(0xffffff),

  // UI colors
  PRIMARY: new THREE.Color(0x2196f3),
  SECONDARY: new THREE.Color(0xf50057),
  SUCCESS: new THREE.Color(0x4caf50),
  WARNING: new THREE.Color(0xff9800),
  ERROR: new THREE.Color(0xf44336),
  INFO: new THREE.Color(0x2196f3)
};
