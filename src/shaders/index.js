/**
 * Shader Module Index
 *
 * Central module for loading and managing GLSL shaders for the interactive globe.
 * Provides easy imports and default uniform configurations for both dot and atmosphere shaders.
 *
 * Usage:
 *   import { dotShader, atmosphereShader } from './shaders';
 *   const material = new THREE.ShaderMaterial(dotShader);
 */

import dotVertexShader from './dot.vert.glsl';
import dotFragmentShader from './dot.frag.glsl';
import atmosphereVertexShader from './atmosphere.vert.glsl';
import atmosphereFragmentShader from './atmosphere.frag.glsl';

/**
 * Dot Particle Shader Configuration
 *
 * Creates the main globe surface with dot particles.
 * Includes fresnel-based glow for enhanced depth perception.
 */
export const dotShader = {
  vertexShader: dotVertexShader,
  fragmentShader: dotFragmentShader,
  uniforms: {
    // Point rendering
    u_pointSize: { value: 2.0 },              // Base dot size in pixels
    u_scale: { value: 1.0 },                  // Global scale multiplier

    // Glow effect
    u_glowColor: { value: [0.2, 0.4, 0.6] },  // RGB glow color (default: soft blue)
    u_glowIntensity: { value: 0.3 },          // Glow strength (0.0 - 1.0)
    u_minOpacity: { value: 0.2 },             // Minimum opacity at edges
    u_maxOpacity: { value: 1.0 },             // Maximum opacity at center
    u_glowFalloff: { value: 0.0 }             // Gradient steepness control
  },
  transparent: true,
  depthWrite: false,
  blending: 'AdditiveBlending'  // Note: Use THREE.AdditiveBlending in actual code
};

/**
 * Atmosphere Glow Shader Configuration
 *
 * Creates the soft radial edge glow around the globe (Apple Maps style).
 * Rendered as a slightly larger sphere behind the dot layer.
 */
export const atmosphereShader = {
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  uniforms: {
    // Atmosphere appearance
    u_atmosphereColor: { value: [0.1, 0.15, 0.2] },  // RGB color (default: dark blue-gray)
    u_glowIntensity: { value: 0.5 },                 // Overall brightness (0.0 - 1.0)

    // Opacity control
    u_minOpacity: { value: 0.0 },                    // Opacity at center (usually 0)
    u_maxOpacity: { value: 0.6 },                    // Opacity at edges

    // Falloff configuration
    u_falloffStart: { value: 0.0 },                  // Where fade begins (0.0 - 1.0)
    u_falloffEnd: { value: 1.0 },                    // Where fade ends (0.0 - 1.0)
    u_power: { value: 2.0 }                          // Fresnel power for curve control
  },
  transparent: true,
  side: 'BackSide',  // Note: Use THREE.BackSide in actual code
  depthWrite: false,
  blending: 'NormalBlending'  // Note: Use THREE.NormalBlending in actual code
};

/**
 * Creates a Three.js ShaderMaterial from shader configuration
 *
 * @param {Object} shaderConfig - Shader configuration object (dotShader or atmosphereShader)
 * @param {Object} customUniforms - Optional custom uniform overrides
 * @returns {THREE.ShaderMaterial} Configured shader material
 *
 * @example
 * import * as THREE from 'three';
 * import { createShaderMaterial, dotShader } from './shaders';
 *
 * const material = createShaderMaterial(dotShader, {
 *   u_glowColor: { value: [1.0, 0.0, 0.0] }  // Custom red glow
 * });
 */
export function createShaderMaterial(shaderConfig, customUniforms = {}) {
  // Note: This function requires THREE.js to be available
  // In actual usage, import THREE from 'three'

  const uniforms = {
    ...shaderConfig.uniforms,
    ...customUniforms
  };

  return {
    vertexShader: shaderConfig.vertexShader,
    fragmentShader: shaderConfig.fragmentShader,
    uniforms,
    transparent: shaderConfig.transparent,
    side: shaderConfig.side,
    depthWrite: shaderConfig.depthWrite,
    blending: shaderConfig.blending
  };
}

/**
 * Helper function to update shader uniforms at runtime
 *
 * @param {THREE.ShaderMaterial} material - The shader material to update
 * @param {Object} uniforms - Object containing uniform names and new values
 *
 * @example
 * updateUniforms(dotMaterial, {
 *   u_glowIntensity: 0.8,
 *   u_pointSize: 3.0
 * });
 */
export function updateUniforms(material, uniforms) {
  Object.keys(uniforms).forEach(key => {
    if (material.uniforms[key]) {
      material.uniforms[key].value = uniforms[key];
    }
  });
}

/**
 * Color conversion utilities for shader uniforms
 */
export const colorUtils = {
  /**
   * Converts hex color to RGB array for shader uniforms
   * @param {string} hex - Hex color string (e.g., '#FF0000')
   * @returns {number[]} RGB array with values 0.0 - 1.0
   */
  hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255
        ]
      : [1, 1, 1];
  },

  /**
   * Converts RGB values (0-255) to shader format (0.0-1.0)
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {number[]} RGB array with values 0.0 - 1.0
   */
  rgbToShader(r, g, b) {
    return [r / 255, g / 255, b / 255];
  }
};

export default {
  dotShader,
  atmosphereShader,
  createShaderMaterial,
  updateUniforms,
  colorUtils
};
