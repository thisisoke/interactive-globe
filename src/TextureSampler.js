/**
 * TextureSampler.js
 *
 * Handles loading Earth textures and sampling pixel data for continent masking.
 * This module provides functionality to determine whether a given 3D position
 * on a sphere corresponds to land or ocean by sampling a grayscale texture.
 *
 * @module TextureSampler
 * @author Interactive Globe Development Team
 * @version 1.0.0
 */

import * as THREE from 'three';

/**
 * Texture data structure containing pixel information and metadata
 * @typedef {Object} TextureData
 * @property {Uint8ClampedArray} data - Raw RGBA pixel data from canvas
 * @property {number} width - Texture width in pixels
 * @property {number} height - Texture height in pixels
 * @property {HTMLCanvasElement} canvas - Canvas element used for pixel extraction
 * @property {THREE.Texture} texture - Three.js texture object
 */

/**
 * Configuration options for texture loading
 * @typedef {Object} TextureLoadOptions
 * @property {number} [brightnessThreshold=128] - Threshold for land detection (0-255)
 * @property {boolean} [enableLogging=false] - Enable console logging for debugging
 * @property {Function} [onProgress] - Progress callback function (loaded, total)
 */

/**
 * Default configuration values
 * @private
 */
const DEFAULT_OPTIONS = {
  brightnessThreshold: 128,
  enableLogging: false,
  onProgress: null
};

/**
 * Loads an Earth texture and extracts pixel data for sampling.
 * Uses Three.js TextureLoader to load the texture and Canvas API to extract pixel data.
 *
 * @async
 * @param {string} texturePath - Path to the grayscale Earth texture (PNG/JPG)
 * @param {TextureLoadOptions} [options={}] - Configuration options
 * @returns {Promise<TextureData>} Texture data object with pixel information
 * @throws {Error} If texture loading fails or path is invalid
 *
 * @example
 * const textureData = await loadEarthTexture('/assets/textures/earth-mask.png', {
 *   brightnessThreshold: 128,
 *   enableLogging: true,
 *   onProgress: (loaded, total) => console.log(`${(loaded/total*100).toFixed(1)}%`)
 * });
 */
export async function loadEarthTexture(texturePath, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Validate input
  if (!texturePath || typeof texturePath !== 'string') {
    throw new Error('TextureSampler: Invalid texture path. Expected a non-empty string.');
  }

  if (config.enableLogging) {
    console.log(`TextureSampler: Loading texture from ${texturePath}`);
  }

  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();

    // Set up progress tracking if callback provided
    const onProgress = config.onProgress
      ? (xhr) => {
          if (xhr.lengthComputable) {
            config.onProgress(xhr.loaded, xhr.total);
          }
        }
      : undefined;

    // Load the texture
    loader.load(
      texturePath,

      // onLoad callback
      (texture) => {
        try {
          // Extract pixel data using canvas
          const imageData = extractPixelData(texture.image);

          const textureData = {
            data: imageData.data,
            width: imageData.width,
            height: imageData.height,
            canvas: imageData.canvas,
            texture: texture,
            brightnessThreshold: config.brightnessThreshold
          };

          if (config.enableLogging) {
            console.log(`TextureSampler: Texture loaded successfully (${imageData.width}x${imageData.height})`);
            console.log(`TextureSampler: Extracted ${imageData.data.length / 4} pixels`);
          }

          resolve(textureData);
        } catch (error) {
          reject(new Error(`TextureSampler: Failed to extract pixel data - ${error.message}`));
        }
      },

      // onProgress callback
      onProgress,

      // onError callback
      (error) => {
        const errorMsg = `TextureSampler: Failed to load texture from ${texturePath}`;
        console.error(errorMsg, error);
        reject(new Error(errorMsg));
      }
    );
  });
}

/**
 * Extracts pixel data from a loaded image using Canvas API.
 * Converts the image to a canvas and uses getImageData() to access raw pixels.
 *
 * @private
 * @param {HTMLImageElement} image - Loaded image element
 * @returns {Object} Object containing ImageData and canvas reference
 * @throws {Error} If canvas creation or data extraction fails
 */
function extractPixelData(image) {
  if (!image || !image.width || !image.height) {
    throw new Error('Invalid image object');
  }

  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  // Get 2D context
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Failed to get 2D rendering context');
  }

  // Draw image to canvas
  context.drawImage(image, 0, 0);

  // Extract pixel data
  let imageData;
  try {
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  } catch (error) {
    throw new Error(`Failed to extract image data: ${error.message}`);
  }

  return {
    data: imageData.data,
    width: imageData.width,
    height: imageData.height,
    canvas: canvas
  };
}

/**
 * Checks if a 3D position on a sphere corresponds to land.
 * Converts the 3D Cartesian coordinates to lat/long, then to UV coordinates,
 * and samples the texture to determine if it's land or ocean.
 *
 * @param {number} x - X coordinate in 3D space
 * @param {number} y - Y coordinate in 3D space
 * @param {number} z - Z coordinate in 3D space
 * @param {number} radius - Sphere radius (for coordinate normalization)
 * @param {TextureData} textureData - Loaded texture data object
 * @returns {boolean} True if position is on land, false if ocean
 *
 * @example
 * const isLand = isLandAtPosition(50, 30, 40, 100, textureData);
 * if (isLand) {
 *   // Position is on a continent
 * }
 */
export function isLandAtPosition(x, y, z, radius, textureData) {
  if (!textureData || !textureData.data) {
    console.warn('TextureSampler: Invalid texture data provided to isLandAtPosition');
    return false;
  }

  // Normalize coordinates if radius is provided
  const normalizedX = x / radius;
  const normalizedY = y / radius;
  const normalizedZ = z / radius;

  // Convert 3D Cartesian to Lat/Long
  const { lat, lon } = cartesianToLatLong(normalizedX, normalizedY, normalizedZ);

  // Convert Lat/Long to UV texture coordinates
  const { u, v } = latLongToUV(lat, lon);

  // Sample pixel brightness at UV coordinate
  const brightness = samplePixelAtUV(u, v, textureData);

  // Determine if land based on brightness threshold
  const threshold = textureData.brightnessThreshold || DEFAULT_OPTIONS.brightnessThreshold;
  return brightness > threshold;
}

/**
 * Samples the pixel brightness at given UV coordinates.
 * UV coordinates are normalized (0-1) texture coordinates.
 * Returns the grayscale brightness value (0-255).
 *
 * @param {number} u - Horizontal texture coordinate (0-1)
 * @param {number} v - Vertical texture coordinate (0-1)
 * @param {TextureData} textureData - Loaded texture data object
 * @returns {number} Brightness value (0-255), or 0 if sampling fails
 *
 * @example
 * const brightness = samplePixelAtUV(0.5, 0.5, textureData);
 * console.log(`Center pixel brightness: ${brightness}`);
 */
export function samplePixelAtUV(u, v, textureData) {
  if (!textureData || !textureData.data) {
    console.warn('TextureSampler: Invalid texture data provided to samplePixelAtUV');
    return 0;
  }

  // Clamp UV coordinates to [0, 1] range
  const clampedU = Math.max(0, Math.min(1, u));
  const clampedV = Math.max(0, Math.min(1, v));

  // Convert UV to pixel coordinates
  const pixelX = Math.floor(clampedU * (textureData.width - 1));
  const pixelY = Math.floor(clampedV * (textureData.height - 1));

  // Calculate pixel index in the flat RGBA array
  // Format: [R, G, B, A, R, G, B, A, ...]
  const index = (pixelY * textureData.width + pixelX) * 4;

  // Validate index
  if (index < 0 || index >= textureData.data.length) {
    console.warn(`TextureSampler: Pixel index out of bounds (${index})`);
    return 0;
  }

  // Extract RGB values (for grayscale, R=G=B)
  const r = textureData.data[index];
  const g = textureData.data[index + 1];
  const b = textureData.data[index + 2];

  // Calculate brightness (average of RGB channels)
  // For grayscale images, all channels should be equal, but we average for safety
  const brightness = (r + g + b) / 3;

  return brightness;
}

/**
 * Converts 3D Cartesian coordinates to latitude and longitude.
 * Assumes normalized coordinates (on unit sphere) where:
 * - Y-axis points up (North)
 * - X-axis points to 0° longitude
 * - Z-axis points to 90° East longitude
 *
 * @param {number} x - X coordinate (normalized)
 * @param {number} y - Y coordinate (normalized)
 * @param {number} z - Z coordinate (normalized)
 * @returns {{lat: number, lon: number}} Latitude and longitude in degrees
 *
 * @example
 * const { lat, lon } = cartesianToLatLong(0.5, 0.5, 0.707);
 * console.log(`Position: ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`);
 */
export function cartesianToLatLong(x, y, z) {
  // Calculate latitude from Y coordinate
  // asin(y) gives angle from equator in radians
  const lat = Math.asin(y) * (180 / Math.PI);

  // Calculate longitude from X and Z coordinates
  // atan2(z, x) gives angle around Y-axis in radians
  const lon = Math.atan2(z, x) * (180 / Math.PI);

  return { lat, lon };
}

/**
 * Converts latitude and longitude to UV texture coordinates.
 * UV coordinates are normalized (0-1) where:
 * - U: 0 at 180°W, 1 at 180°E
 * - V: 0 at North Pole, 1 at South Pole
 *
 * @param {number} lat - Latitude in degrees (-90 to 90)
 * @param {number} lon - Longitude in degrees (-180 to 180)
 * @returns {{u: number, v: number}} UV texture coordinates (0-1)
 *
 * @example
 * const { u, v } = latLongToUV(40.7128, -74.0060); // New York City
 * console.log(`UV coordinates: (${u.toFixed(3)}, ${v.toFixed(3)})`);
 */
export function latLongToUV(lat, lon) {
  // Convert longitude to U coordinate (0 to 1)
  // Longitude range: -180 to 180
  // U range: 0 (at -180) to 1 (at 180)
  const u = (lon + 180) / 360;

  // Convert latitude to V coordinate (0 to 1)
  // Latitude range: -90 to 90
  // V range: 0 (at North Pole, 90) to 1 (at South Pole, -90)
  // Note: V is flipped because texture coordinates start at top-left
  const v = (90 - lat) / 180;

  return { u, v };
}

/**
 * Converts UV texture coordinates to latitude and longitude.
 * Inverse operation of latLongToUV.
 *
 * @param {number} u - Horizontal texture coordinate (0-1)
 * @param {number} v - Vertical texture coordinate (0-1)
 * @returns {{lat: number, lon: number}} Latitude and longitude in degrees
 *
 * @example
 * const { lat, lon } = uvToLatLong(0.5, 0.5); // Center of map
 * console.log(`Position: ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`);
 */
export function uvToLatLong(u, v) {
  // Convert U to longitude
  const lon = u * 360 - 180;

  // Convert V to latitude
  const lat = 90 - v * 180;

  return { lat, lon };
}

/**
 * Batch samples multiple positions to determine land/ocean status.
 * More efficient than calling isLandAtPosition multiple times.
 *
 * @param {Array<{x: number, y: number, z: number}>} positions - Array of 3D positions
 * @param {number} radius - Sphere radius
 * @param {TextureData} textureData - Loaded texture data object
 * @returns {Array<boolean>} Array of boolean values (true = land, false = ocean)
 *
 * @example
 * const positions = [
 *   { x: 50, y: 30, z: 40 },
 *   { x: -20, y: 10, z: 80 }
 * ];
 * const results = batchCheckLand(positions, 100, textureData);
 * console.log(`First position is ${results[0] ? 'land' : 'ocean'}`);
 */
export function batchCheckLand(positions, radius, textureData) {
  if (!Array.isArray(positions)) {
    throw new Error('TextureSampler: positions must be an array');
  }

  return positions.map(pos => {
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number' || typeof pos.z !== 'number') {
      console.warn('TextureSampler: Invalid position object in batch check');
      return false;
    }
    return isLandAtPosition(pos.x, pos.y, pos.z, radius, textureData);
  });
}

/**
 * Gets pixel brightness at a specific lat/long coordinate.
 * Convenience function that combines coordinate conversion and sampling.
 *
 * @param {number} lat - Latitude in degrees (-90 to 90)
 * @param {number} lon - Longitude in degrees (-180 to 180)
 * @param {TextureData} textureData - Loaded texture data object
 * @returns {number} Brightness value (0-255)
 *
 * @example
 * const brightness = getBrightnessAtLatLong(51.5074, -0.1278, textureData); // London
 * console.log(`London pixel brightness: ${brightness}`);
 */
export function getBrightnessAtLatLong(lat, lon, textureData) {
  const { u, v } = latLongToUV(lat, lon);
  return samplePixelAtUV(u, v, textureData);
}

/**
 * Checks if a lat/long coordinate is on land.
 * Convenience function for checking land without 3D coordinates.
 *
 * @param {number} lat - Latitude in degrees (-90 to 90)
 * @param {number} lon - Longitude in degrees (-180 to 180)
 * @param {TextureData} textureData - Loaded texture data object
 * @returns {boolean} True if position is on land, false if ocean
 *
 * @example
 * const isLand = isLandAtLatLong(40.7128, -74.0060, textureData); // New York
 * console.log(`New York is ${isLand ? 'on land' : 'in ocean'}`);
 */
export function isLandAtLatLong(lat, lon, textureData) {
  const brightness = getBrightnessAtLatLong(lat, lon, textureData);
  const threshold = textureData.brightnessThreshold || DEFAULT_OPTIONS.brightnessThreshold;
  return brightness > threshold;
}

/**
 * Disposes of texture resources to free memory.
 * Should be called when texture data is no longer needed.
 *
 * @param {TextureData} textureData - Texture data object to dispose
 *
 * @example
 * // Clean up when done
 * disposeTextureData(textureData);
 */
export function disposeTextureData(textureData) {
  if (!textureData) return;

  // Dispose Three.js texture
  if (textureData.texture && typeof textureData.texture.dispose === 'function') {
    textureData.texture.dispose();
  }

  // Clear canvas reference
  if (textureData.canvas) {
    const context = textureData.canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, textureData.canvas.width, textureData.canvas.height);
    }
  }

  // Clear data references (helps garbage collection)
  textureData.data = null;
  textureData.canvas = null;
  textureData.texture = null;
}

/**
 * Gets debug information about the texture data.
 * Useful for troubleshooting and verification.
 *
 * @param {TextureData} textureData - Texture data object
 * @returns {Object} Debug information object
 *
 * @example
 * const debug = getTextureDebugInfo(textureData);
 * console.log('Texture Debug Info:', debug);
 */
export function getTextureDebugInfo(textureData) {
  if (!textureData) {
    return { error: 'No texture data provided' };
  }

  const totalPixels = textureData.width * textureData.height;
  let landPixels = 0;
  let oceanPixels = 0;

  // Sample threshold
  const threshold = textureData.brightnessThreshold || DEFAULT_OPTIONS.brightnessThreshold;

  // Count land and ocean pixels (sample every 10th pixel for performance)
  for (let i = 0; i < textureData.data.length; i += 40) { // 40 = 4 channels * 10 pixels
    const r = textureData.data[i];
    const g = textureData.data[i + 1];
    const b = textureData.data[i + 2];
    const brightness = (r + g + b) / 3;

    if (brightness > threshold) {
      landPixels++;
    } else {
      oceanPixels++;
    }
  }

  const sampledPixels = landPixels + oceanPixels;
  const landPercentage = ((landPixels / sampledPixels) * 100).toFixed(2);
  const oceanPercentage = ((oceanPixels / sampledPixels) * 100).toFixed(2);

  return {
    width: textureData.width,
    height: textureData.height,
    totalPixels,
    brightnessThreshold: threshold,
    sampledPixels,
    estimatedLandPercentage: landPercentage + '%',
    estimatedOceanPercentage: oceanPercentage + '%',
    dataArrayLength: textureData.data.length,
    hasCanvas: !!textureData.canvas,
    hasTexture: !!textureData.texture
  };
}

/**
 * Default export object containing all functions
 */
export default {
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
};
