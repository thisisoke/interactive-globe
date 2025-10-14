/**
 * TypeScript Declaration File for Globe Shaders
 *
 * Provides type definitions for shader configurations and utility functions.
 * Enables IntelliSense and type checking when using the shader module.
 */

import * as THREE from 'three';

/**
 * Uniform value types
 */
export interface UniformValue<T> {
  value: T;
}

/**
 * Shader uniform configuration
 */
export interface ShaderUniforms {
  [key: string]: UniformValue<any>;
}

/**
 * Dot shader uniform types
 */
export interface DotShaderUniforms {
  u_pointSize: UniformValue<number>;
  u_scale: UniformValue<number>;
  u_glowColor: UniformValue<number[]>;
  u_glowIntensity: UniformValue<number>;
  u_minOpacity: UniformValue<number>;
  u_maxOpacity: UniformValue<number>;
  u_glowFalloff: UniformValue<number>;
}

/**
 * Atmosphere shader uniform types
 */
export interface AtmosphereShaderUniforms {
  u_atmosphereColor: UniformValue<number[]>;
  u_glowIntensity: UniformValue<number>;
  u_minOpacity: UniformValue<number>;
  u_maxOpacity: UniformValue<number>;
  u_falloffStart: UniformValue<number>;
  u_falloffEnd: UniformValue<number>;
  u_power: UniformValue<number>;
}

/**
 * Base shader configuration
 */
export interface ShaderConfig<T = ShaderUniforms> {
  vertexShader: string;
  fragmentShader: string;
  uniforms: T;
  transparent: boolean;
  depthWrite: boolean;
  blending: string | THREE.Blending;
  side?: string | THREE.Side;
}

/**
 * Dot shader configuration
 */
export interface DotShaderConfig extends ShaderConfig<DotShaderUniforms> {
  blending: 'AdditiveBlending' | THREE.AdditiveBlending;
}

/**
 * Atmosphere shader configuration
 */
export interface AtmosphereShaderConfig extends ShaderConfig<AtmosphereShaderUniforms> {
  side: 'BackSide' | THREE.BackSide;
  blending: 'NormalBlending' | THREE.NormalBlending;
}

/**
 * Shader material options
 */
export interface ShaderMaterialOptions {
  vertexShader: string;
  fragmentShader: string;
  uniforms: ShaderUniforms;
  transparent: boolean;
  side?: THREE.Side;
  depthWrite: boolean;
  blending: THREE.Blending;
}

/**
 * Color utilities
 */
export interface ColorUtils {
  /**
   * Converts hex color to RGB array for shaders
   * @param hex - Hex color string (e.g., '#FF0000')
   * @returns RGB array with values 0.0 - 1.0
   */
  hexToRGB(hex: string): [number, number, number];

  /**
   * Converts RGB values (0-255) to shader format (0.0-1.0)
   * @param r - Red (0-255)
   * @param g - Green (0-255)
   * @param b - Blue (0-255)
   * @returns RGB array with values 0.0 - 1.0
   */
  rgbToShader(r: number, g: number, b: number): [number, number, number];
}

/**
 * Dot shader configuration export
 */
export const dotShader: DotShaderConfig;

/**
 * Atmosphere shader configuration export
 */
export const atmosphereShader: AtmosphereShaderConfig;

/**
 * Color utilities export
 */
export const colorUtils: ColorUtils;

/**
 * Creates a Three.js ShaderMaterial from shader configuration
 *
 * @param shaderConfig - Shader configuration object
 * @param customUniforms - Optional custom uniform overrides
 * @returns Configured shader material options
 */
export function createShaderMaterial(
  shaderConfig: ShaderConfig,
  customUniforms?: Partial<ShaderUniforms>
): ShaderMaterialOptions;

/**
 * Updates shader uniforms at runtime
 *
 * @param material - The shader material to update
 * @param uniforms - Object containing uniform names and new values
 */
export function updateUniforms(
  material: THREE.ShaderMaterial,
  uniforms: Record<string, any>
): void;

/**
 * Default export with all shader utilities
 */
declare const shaderModule: {
  dotShader: DotShaderConfig;
  atmosphereShader: AtmosphereShaderConfig;
  createShaderMaterial: typeof createShaderMaterial;
  updateUniforms: typeof updateUniforms;
  colorUtils: ColorUtils;
};

export default shaderModule;
