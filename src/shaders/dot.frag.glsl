/**
 * Dot Fragment Shader
 *
 * Implements fresnel-like edge detection for soft glow effect on dot particles.
 * Creates atmospheric depth by fading dots based on viewing angle.
 * Supports configurable glow parameters for visual customization.
 *
 * Visual Effect: Dots appear brighter when viewed face-on, fade when viewed at grazing angles.
 * This enhances the 3D spherical appearance of the globe.
 *
 * Used with: dot.vert.glsl
 */

precision highp float;

// Varyings from vertex shader
varying vec3 vNormal;            // Surface normal in view space
varying vec3 vViewDir;           // Direction from camera to vertex
varying vec3 vColor;             // Per-dot custom color

// Uniforms for glow control
uniform vec3 u_glowColor;        // Color of the atmospheric glow (RGB)
uniform float u_glowIntensity;   // Glow strength (0.0 = none, 1.0 = full)
uniform float u_minOpacity;      // Minimum opacity at edges (0.0 - 1.0)
uniform float u_maxOpacity;      // Maximum opacity at center (0.0 - 1.0)
uniform float u_glowFalloff;     // Controls glow gradient steepness (0.0 - 1.0)

void main() {
  // Calculate point circle shape (round dots instead of squares)
  // gl_PointCoord ranges from (0,0) to (1,1) across the point sprite
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(gl_PointCoord, center);

  // Discard pixels outside circle radius for round dots
  if (dist > 0.5) {
    discard;
  }

  // Create soft edge within the dot circle
  float circleFade = smoothstep(0.5, 0.3, dist);

  // ============================================
  // Fresnel-like edge detection for 3D glow
  // ============================================

  // Calculate fresnel term: dot product of normal and view direction
  // Both vectors are normalized for accurate angle calculation
  // Result: 1.0 when viewing face-on, 0.0 when viewing at grazing angle
  float fresnel = dot(normalize(vNormal), normalize(vViewDir));

  // Apply smooth gradient based on viewing angle
  // smoothstep creates smooth transition between 0.0 and 1.0
  // u_glowFalloff controls the gradient steepness
  float edgeFade = smoothstep(u_glowFalloff, 1.0, fresnel);

  // Mix minimum and maximum opacity based on edge fade
  // Center of globe: full opacity (u_maxOpacity)
  // Edges of globe: reduced opacity (u_minOpacity)
  float opacity = mix(u_minOpacity, u_maxOpacity, edgeFade);

  // ============================================
  // Final color composition
  // ============================================

  // Blend dot color with glow color based on intensity
  vec3 finalColor = mix(vColor, u_glowColor, u_glowIntensity * (1.0 - edgeFade));

  // Apply fresnel-based opacity and circular fade
  float finalOpacity = opacity * circleFade;

  // Output final color with calculated transparency
  gl_FragColor = vec4(finalColor, finalOpacity);
}
