/**
 * Dot Vertex Shader
 *
 * Handles position transformations for dot particles on the globe surface.
 * Passes necessary varyings to the fragment shader for fresnel-based glow effects.
 * Supports custom attributes for per-dot color and size variations.
 *
 * Used with: dot.frag.glsl
 */

// Custom attributes per dot
attribute vec3 customColor;      // Per-dot RGB color (0.0 - 1.0)
attribute float customSize;      // Per-dot size multiplier

// Uniforms for global control
uniform float u_pointSize;       // Base point size in pixels
uniform float u_scale;           // Global scale multiplier

// Varyings passed to fragment shader
varying vec3 vNormal;            // Surface normal in view space
varying vec3 vViewDir;           // Direction from camera to vertex in view space
varying vec3 vColor;             // Per-dot color passed through

void main() {
  // Pass custom color to fragment shader
  vColor = customColor;

  // Calculate normal in view space for fresnel effect
  // normalMatrix is the inverse transpose of modelViewMatrix
  vNormal = normalize(normalMatrix * normal);

  // Transform position to view space
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  // Calculate view direction (from camera to vertex)
  // In view space, camera is at origin (0, 0, 0)
  vViewDir = -mvPosition.xyz;

  // Transform to clip space for final position
  gl_Position = projectionMatrix * mvPosition;

  // Set point size with custom multiplier
  // sizeAttenuation is handled by Three.js PointsMaterial settings
  gl_PointSize = u_pointSize * customSize * u_scale;
}
