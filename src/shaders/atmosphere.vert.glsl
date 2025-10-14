/**
 * Atmosphere Vertex Shader
 *
 * Handles vertex transformations for the globe's atmospheric glow layer.
 * This shader creates the soft radial edge fade effect (Apple Maps style).
 * Calculates normals and view directions needed for fresnel-based edge detection.
 *
 * Visual Effect: Creates a subtle glow around the globe edges that enhances depth perception.
 *
 * Used with: atmosphere.frag.glsl
 */

// Varyings passed to fragment shader
varying vec3 vNormal;            // Surface normal in view space
varying vec3 vViewDir;           // Direction from camera to vertex in view space
varying vec3 vPosition;          // Vertex position in world space

void main() {
  // Calculate normal in view space for fresnel effect
  // normalMatrix = inverse transpose of modelViewMatrix
  // This ensures normals are correctly transformed even with non-uniform scaling
  vNormal = normalize(normalMatrix * normal);

  // Transform vertex position to world space
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vPosition = worldPosition.xyz;

  // Transform position to view space (camera space)
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  // Calculate view direction (from camera to vertex)
  // In view space, camera is at origin (0, 0, 0)
  // The negative sign gives direction from camera TO vertex
  vViewDir = -mvPosition.xyz;

  // Transform to clip space for final position
  // This is the required output for vertex shaders
  gl_Position = projectionMatrix * mvPosition;
}
