# Shader Architecture

Visual overview of how the GLSL shaders work together to create the interactive globe.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GLOBE RENDERING                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ├── Layer 1: Atmosphere (Background)
                                │   │
                                │   ├── Geometry: SphereGeometry (radius × 1.15)
                                │   ├── Material: ShaderMaterial
                                │   ├── Vertex Shader: atmosphere.vert.glsl
                                │   ├── Fragment Shader: atmosphere.frag.glsl
                                │   └── Effect: Soft edge glow (inverse fresnel)
                                │
                                └── Layer 2: Dot Particles (Foreground)
                                    │
                                    ├── Geometry: BufferGeometry (points)
                                    ├── Material: ShaderMaterial (Points)
                                    ├── Vertex Shader: dot.vert.glsl
                                    ├── Fragment Shader: dot.frag.glsl
                                    └── Effect: Fresnel-based depth glow
```

## Shader Pipeline

### Dot Particle Pipeline

```
INPUT DATA (CPU)
├── positions: Float32Array (x, y, z)
├── normals: Float32Array (nx, ny, nz)
├── customColor: Float32Array (r, g, b)
└── customSize: Float32Array (size)
        │
        ▼
┌──────────────────────────┐
│  dot.vert.glsl           │
│  (Vertex Shader)         │
├──────────────────────────┤
│  Transform vertices      │
│  Calculate view space    │
│  normals and view dir    │
│  Set point size          │
└──────────────────────────┘
        │
        ├── vNormal (varying)
        ├── vViewDir (varying)
        ├── vColor (varying)
        └── gl_PointSize
        │
        ▼
┌──────────────────────────┐
│  dot.frag.glsl           │
│  (Fragment Shader)       │
├──────────────────────────┤
│  1. Circle rendering     │
│  2. Fresnel calculation  │
│  3. Edge fade effect     │
│  4. Color blending       │
│  5. Opacity calculation  │
└──────────────────────────┘
        │
        ▼
OUTPUT (GPU)
└── gl_FragColor (RGBA)
```

### Atmosphere Pipeline

```
INPUT DATA (CPU)
└── Standard sphere geometry
        │
        ▼
┌──────────────────────────┐
│  atmosphere.vert.glsl    │
│  (Vertex Shader)         │
├──────────────────────────┤
│  Transform vertices      │
│  Calculate normals       │
│  Calculate view dir      │
└──────────────────────────┘
        │
        ├── vNormal (varying)
        ├── vViewDir (varying)
        └── vPosition (varying)
        │
        ▼
┌──────────────────────────┐
│  atmosphere.frag.glsl    │
│  (Fragment Shader)       │
├──────────────────────────┤
│  1. Fresnel calculation  │
│  2. Power curve          │
│  3. Edge fade (inverted) │
│  4. Radial gradient      │
│  5. Color intensity      │
└──────────────────────────┘
        │
        ▼
OUTPUT (GPU)
└── gl_FragColor (RGBA)
```

## Fresnel Effect Comparison

### Dot Shader Fresnel (Normal)
```
Center of Globe          Edge of Globe
(Face-on view)          (Grazing angle)
     │                        │
     ▼                        ▼
  fresnel = 1.0          fresnel = 0.0
     │                        │
     ▼                        ▼
  Maximum Opacity        Minimum Opacity
  (Dots fully visible)   (Dots fade out)

Visual: ■■■■■■■■■ ──→ ░░░░░░░░░
```

### Atmosphere Shader Fresnel (Inverted)
```
Center of Globe          Edge of Globe
(Face-on view)          (Grazing angle)
     │                        │
     ▼                        ▼
  fresnel = 1.0          fresnel = 0.0
     │                        │
  atmosphereFade = 0.0   atmosphereFade = 1.0
     │                        │
     ▼                        ▼
  Minimum Opacity        Maximum Opacity
  (Invisible center)     (Glowing edge)

Visual: ░░░░░░░░░ ──→ ■■■■■■■■■
```

## Data Flow Diagram

```
┌────────────────────┐
│  Fibonacci Sphere  │
│  Algorithm (CPU)   │
└────────────────────┘
          │
          ├─── 20,000 points generated
          │
          ▼
┌────────────────────┐
│  Land Mask Filter  │
│  (Texture Sample)  │
└────────────────────┘
          │
          ├─── ~12,000 land dots
          │
          ▼
┌────────────────────┐
│  BufferGeometry    │
│  • position        │
│  • normal          │
│  • customColor     │
│  • customSize      │
└────────────────────┘
          │
          ▼
┌────────────────────┐
│  Dot Shader        │
│  Material          │
└────────────────────┘
          │
          ├─── Uniforms
          │    • u_pointSize
          │    • u_glowColor
          │    • u_glowIntensity
          │
          ▼
┌────────────────────┐
│  GPU Rendering     │
│  (Points)          │
└────────────────────┘
          │
          ▼
    [Screen Output]
```

## Uniform Flow

### From JavaScript to GLSL

```javascript
// JavaScript (CPU)
dotMaterial.uniforms.u_glowColor.value = [1.0, 0.0, 0.0];
                │
                ├─── WebGL API
                │
                ▼
// GLSL (GPU)
uniform vec3 u_glowColor;  // [1.0, 0.0, 0.0]
                │
                ├─── Used in fragment shader
                │
                ▼
vec3 finalColor = mix(vColor, u_glowColor, u_glowIntensity);
```

## Attribute Flow

### Per-Vertex Data to Fragment Shader

```
CPU (BufferAttribute)
├── customColor[0] = [1.0, 0.0, 0.0]  // Dot 0: Red
├── customColor[1] = [0.0, 1.0, 0.0]  // Dot 1: Green
└── customColor[2] = [0.0, 0.0, 1.0]  // Dot 2: Blue
        │
        ▼
Vertex Shader (dot.vert.glsl)
attribute vec3 customColor;
varying vec3 vColor;
vColor = customColor;
        │
        ▼
Fragment Shader (dot.frag.glsl)
varying vec3 vColor;  // Interpolated color
gl_FragColor = vec4(vColor, opacity);
```

## Coordinate Space Transformations

```
Object Space (Model)
     │
     ├── modelMatrix
     │
     ▼
World Space
     │
     ├── viewMatrix
     │
     ▼
View Space (Camera)
     │                  ┌────────────────────┐
     ├──────────────────│ Fresnel Calculation│
     │                  │ (Done in View Space)│
     │                  └────────────────────┘
     │
     ├── projectionMatrix
     │
     ▼
Clip Space
     │
     ├── Perspective divide
     │
     ▼
Normalized Device Coordinates (NDC)
     │
     ├── Viewport transform
     │
     ▼
Screen Space (Pixels)
```

## Blending Modes

### Dot Particles (Additive Blending)

```
Result = (Source Color × Source Alpha) + (Dest Color × Dest Alpha)

Effect: Overlapping dots appear brighter
Use case: Creating glowing, ethereal dot effect
```

### Atmosphere (Normal Blending)

```
Result = (Source Color × Source Alpha) + (Dest Color × (1 - Source Alpha))

Effect: Standard alpha transparency
Use case: Soft background glow without over-brightening
```

## Rendering Order

```
1. Clear frame buffer
   └── Background color (usually black or transparent)

2. Render atmosphere (background layer)
   ├── side: THREE.BackSide
   ├── Renders only back faces
   └── Creates halo behind globe

3. Render dot particles (foreground layer)
   ├── Renders as points
   ├── Additive blending
   └── Appears in front of atmosphere

4. Post-processing (optional)
   └── Screen-space effects
```

## Performance Considerations

### Vertex Shader Optimization

```
✓ DO:
- Keep calculations simple
- Use built-in functions
- Pass heavy calculations to uniforms

✗ DON'T:
- Complex math in vertex shader
- Unnecessary attribute lookups
- Redundant transformations
```

### Fragment Shader Optimization

```
✓ DO:
- Early discard for invisible pixels
- Use smoothstep for gradients
- Minimize texture lookups

✗ DON'T:
- Loops in fragment shader
- Complex branching (if/else)
- Expensive math operations
```

## Shader Interaction Matrix

| Layer | Affects | How |
|-------|---------|-----|
| Atmosphere | Background | Creates soft glow foundation |
| Dots | Foreground | Rendered on top with additive blend |
| Atmosphere + Dots | Combined | Atmosphere provides depth, dots provide detail |

## Memory Layout

### Dot Geometry Buffer

```
Position Buffer (Float32Array)
[x0, y0, z0, x1, y1, z1, x2, y2, z2, ...]
 └─ Dot 0  └─ Dot 1  └─ Dot 2

Normal Buffer (Float32Array)
[nx0, ny0, nz0, nx1, ny1, nz1, ...]
 └─ Dot 0      └─ Dot 1

Color Buffer (Float32Array)
[r0, g0, b0, r1, g1, b1, ...]
 └─ Dot 0  └─ Dot 1

Size Buffer (Float32Array)
[s0, s1, s2, ...]
```

## Coordinate System Reference

```
      +Y (Up)
       │
       │
       │
       └────── +X (Right)
      ╱
     ╱
   +Z (Forward)

Globe Orientation:
- North Pole: +Y axis
- Equator: XZ plane
- Prime Meridian: +X axis
```

## Shader Compilation Flow

```
1. Load GLSL files
   ├── dot.vert.glsl
   ├── dot.frag.glsl
   ├── atmosphere.vert.glsl
   └── atmosphere.frag.glsl

2. Create ShaderMaterial
   ├── Pass vertex shader source
   ├── Pass fragment shader source
   ├── Define uniforms
   └── Define attributes

3. WebGL compilation
   ├── Compile vertex shader
   ├── Compile fragment shader
   ├── Link program
   └── Validate

4. Runtime
   ├── Update uniforms
   ├── Update attributes
   └── Render
```

## Key Formulas

### Fresnel Term
```glsl
float fresnel = dot(normalize(vNormal), normalize(vViewDir));
```

### Edge Fade (Dots)
```glsl
float edgeFade = smoothstep(u_glowFalloff, 1.0, fresnel);
float opacity = mix(u_minOpacity, u_maxOpacity, edgeFade);
```

### Atmosphere Fade
```glsl
float atmosphereFade = 1.0 - smoothstep(u_falloffStart, u_falloffEnd, fresnelPower);
float opacity = mix(u_minOpacity, u_maxOpacity, atmosphereFade);
```

### Circle Rendering
```glsl
vec2 center = vec2(0.5, 0.5);
float dist = distance(gl_PointCoord, center);
if (dist > 0.5) discard;
float circleFade = smoothstep(0.5, 0.3, dist);
```

## Integration Points

```
Application Code
       │
       ├── imports shaders/index.js
       │
       ▼
Shader Module
       │
       ├── exports shader configurations
       ├── exports utility functions
       │
       ▼
Three.js Scene
       │
       ├── creates ShaderMaterial
       ├── creates geometry
       ├── creates mesh/points
       │
       ▼
WebGL Renderer
       │
       └── outputs to canvas
```

## Future Enhancements

1. **Data Visualization Layer**
   - Additional shader for data markers
   - Height-based rendering
   - Heat map effects

2. **Animation System**
   - Transition shaders
   - Particle trails
   - Wave effects

3. **Post-Processing**
   - Bloom effect
   - God rays
   - Depth of field

---

**Last Updated**: 2025-10-14
**Version**: 1.0
**Diagram Format**: ASCII Art
