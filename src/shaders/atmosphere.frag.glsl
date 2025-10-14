/**
 * Atmosphere Fragment Shader
 *
 * Creates the Apple Maps-style atmospheric glow effect around globe edges.
 * Uses fresnel effect to create radial gradient fade:
 * - Full opacity at center (face-on viewing)
 * - Fade to transparent at edges (grazing angles)
 *
 * Visual Effect: Soft luminous halo that enhances the spherical appearance
 * and creates depth perception without overwhelming the globe visualization.
 *
 * Used with: atmosphere.vert.glsl
 */

precision highp float;

// Varyings from vertex shader
varying vec3 vNormal;            // Surface normal in view space
varying vec3 vViewDir;           // Direction from camera to vertex
varying vec3 vPosition;          // Vertex position in world space

// Uniforms for atmosphere customization
uniform vec3 u_atmosphereColor;  // Base color of the atmosphere glow (RGB)
uniform float u_glowIntensity;   // Overall glow brightness (0.0 - 1.0)
uniform float u_minOpacity;      // Minimum opacity at center (0.0 - 1.0)
uniform float u_maxOpacity;      // Maximum opacity at edges (0.0 - 1.0)
uniform float u_falloffStart;    // Where edge fade begins (0.0 - 1.0)
uniform float u_falloffEnd;      // Where edge fade ends (0.0 - 1.0)
uniform float u_power;           // Fresnel power for controlling gradient curve (1.0 - 5.0)

void main() {
  // ============================================
  // Fresnel effect for edge glow
  // ============================================

  // Calculate fresnel term using dot product
  // Normalize both vectors for accurate angle calculation
  // Result ranges from:
  //   - 1.0: viewing face-on (center of globe)
  //   - 0.0: viewing at grazing angle (edge of globe)
  float fresnel = dot(normalize(vNormal), normalize(vViewDir));

  // Clamp to prevent negative values from back-facing surfaces
  fresnel = max(0.0, fresnel);

  // Apply power function to control falloff curve
  // Higher power = sharper falloff, more concentrated glow
  // Lower power = softer falloff, more spread out glow
  float fresnelPower = pow(fresnel, u_power);

  // ============================================
  // Radial gradient fade
  // ============================================

  // Create smooth transition for edge fade
  // u_falloffStart: where the fade begins (closer to center)
  // u_falloffEnd: where the fade ends (at the edge)
  float edgeFade = smoothstep(u_falloffStart, u_falloffEnd, fresnelPower);

  // Invert the fade for atmosphere effect
  // We want MORE opacity at edges, LESS at center (opposite of dots)
  float atmosphereFade = 1.0 - edgeFade;

  // Mix minimum and maximum opacity based on fade
  // Edges: maximum opacity (most visible glow)
  // Center: minimum opacity (subtle or invisible)
  float opacity = mix(u_minOpacity, u_maxOpacity, atmosphereFade);

  // ============================================
  // Color intensity modulation
  // ============================================

  // Brighten the color at edges for enhanced glow
  // This creates a luminous quality to the atmosphere
  float colorIntensity = mix(0.5, 1.5, atmosphereFade);
  vec3 finalColor = u_atmosphereColor * colorIntensity * u_glowIntensity;

  // ============================================
  // Final output
  // ============================================

  // Combine color with calculated opacity
  // The alpha channel creates the soft fade effect
  gl_FragColor = vec4(finalColor, opacity * u_glowIntensity);

  // Optional: Discard fully transparent pixels for performance
  if (gl_FragColor.a < 0.01) {
    discard;
  }
}
