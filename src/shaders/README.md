# Globe Shaders

GLSL shader files for the interactive 3D globe visualization. These shaders create the characteristic dot-pattern globe with atmospheric edge glow effects.

## Files

### Dot Shaders
- **dot.vert.glsl** - Vertex shader for dot particles
- **dot.frag.glsl** - Fragment shader with fresnel-based glow effect

### Atmosphere Shaders
- **atmosphere.vert.glsl** - Vertex shader for atmosphere layer
- **atmosphere.frag.glsl** - Fragment shader with radial edge glow (Apple Maps style)

### Utilities
- **index.js** - Shader loader module with default configurations

## Shader Architecture

### Dot Particle System

The dot shaders create the main globe surface using point particles. Each dot:
- Has custom color and size attributes
- Renders as a circular sprite (not square)
- Applies fresnel effect for depth perception
- Fades based on viewing angle

**Key Features:**
- Fresnel-based edge detection
- Per-dot color customization
- Soft circular gradient
- Configurable glow parameters

### Atmosphere Layer

The atmosphere shaders create a subtle glow around the globe edges:
- Rendered as a slightly larger sphere behind dots
- Uses inverse fresnel (opposite of dots)
- Creates soft radial fade from center to edges
- Enhances spherical appearance and depth

**Key Features:**
- Radial gradient fade
- Configurable falloff curve
- Color and intensity controls
- Back-side rendering for proper layering

## Usage

### Basic Setup with Three.js

```javascript
import * as THREE from 'three';
import { dotShader, atmosphereShader, createShaderMaterial } from './shaders';

// Create dot particle material
const dotMaterial = new THREE.ShaderMaterial({
  vertexShader: dotShader.vertexShader,
  fragmentShader: dotShader.fragmentShader,
  uniforms: dotShader.uniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

// Create atmosphere material
const atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: atmosphereShader.vertexShader,
  fragmentShader: atmosphereShader.fragmentShader,
  uniforms: atmosphereShader.uniforms,
  transparent: true,
  side: THREE.BackSide,
  depthWrite: false
});
```

### Customizing Uniforms

```javascript
// Change dot glow color to red
dotMaterial.uniforms.u_glowColor.value = [1.0, 0.0, 0.0];

// Increase glow intensity
dotMaterial.uniforms.u_glowIntensity.value = 0.8;

// Adjust dot size
dotMaterial.uniforms.u_pointSize.value = 3.0;

// Change atmosphere color to purple
atmosphereMaterial.uniforms.u_atmosphereColor.value = [0.5, 0.2, 0.8];
```

### Using Helper Functions

```javascript
import { updateUniforms, colorUtils } from './shaders';

// Update multiple uniforms at once
updateUniforms(dotMaterial, {
  u_glowIntensity: 0.5,
  u_minOpacity: 0.3,
  u_maxOpacity: 1.0
});

// Convert hex color for shader
const redRGB = colorUtils.hexToRGB('#FF0000');
dotMaterial.uniforms.u_glowColor.value = redRGB;
```

## Shader Uniforms Reference

### Dot Shader Uniforms

| Uniform | Type | Default | Description |
|---------|------|---------|-------------|
| `u_pointSize` | float | 2.0 | Base dot size in pixels |
| `u_scale` | float | 1.0 | Global scale multiplier |
| `u_glowColor` | vec3 | [0.2, 0.4, 0.6] | RGB glow color |
| `u_glowIntensity` | float | 0.3 | Glow strength (0.0-1.0) |
| `u_minOpacity` | float | 0.2 | Minimum opacity at edges |
| `u_maxOpacity` | float | 1.0 | Maximum opacity at center |
| `u_glowFalloff` | float | 0.0 | Gradient steepness (0.0-1.0) |

### Atmosphere Shader Uniforms

| Uniform | Type | Default | Description |
|---------|------|---------|-------------|
| `u_atmosphereColor` | vec3 | [0.1, 0.15, 0.2] | RGB atmosphere color |
| `u_glowIntensity` | float | 0.5 | Overall brightness (0.0-1.0) |
| `u_minOpacity` | float | 0.0 | Opacity at center |
| `u_maxOpacity` | float | 0.6 | Opacity at edges |
| `u_falloffStart` | float | 0.0 | Where fade begins (0.0-1.0) |
| `u_falloffEnd` | float | 1.0 | Where fade ends (0.0-1.0) |
| `u_power` | float | 2.0 | Fresnel power (1.0-5.0) |

### Dot Shader Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `customColor` | vec3 | Per-dot RGB color (0.0-1.0) |
| `customSize` | float | Per-dot size multiplier |

## Fresnel Effect Explained

The fresnel effect creates depth by varying opacity based on viewing angle:

```glsl
// Calculate dot product of surface normal and view direction
float fresnel = dot(normalize(vNormal), normalize(vViewDir));

// Apply smooth gradient
float edgeFade = smoothstep(0.0, 1.0, fresnel);

// Mix min/max opacity
float opacity = mix(u_minOpacity, u_maxOpacity, edgeFade);
```

**Result:**
- Face-on views (fresnel ≈ 1.0): Maximum opacity
- Grazing angles (fresnel ≈ 0.0): Minimum opacity

This creates the characteristic "3D sphere" appearance where edges fade naturally.

## Performance Notes

1. **Point Sprites**: Dots use `gl_PointCoord` for efficient circular rendering
2. **Discard Optimization**: Pixels outside circle radius are discarded early
3. **Depth Write**: Disabled for transparent rendering performance
4. **Blending**: Additive blending for dots, normal for atmosphere

## Visual Customization Examples

### Vibrant Neon Look
```javascript
dotMaterial.uniforms.u_glowColor.value = [0.0, 1.0, 0.8];
dotMaterial.uniforms.u_glowIntensity.value = 0.9;
atmosphereMaterial.uniforms.u_atmosphereColor.value = [0.0, 0.5, 1.0];
```

### Subtle Monochrome
```javascript
dotMaterial.uniforms.u_glowColor.value = [0.9, 0.9, 0.9];
dotMaterial.uniforms.u_glowIntensity.value = 0.2;
atmosphereMaterial.uniforms.u_atmosphereColor.value = [0.1, 0.1, 0.1];
```

### Warm Earth Tones
```javascript
dotMaterial.uniforms.u_glowColor.value = [1.0, 0.7, 0.3];
dotMaterial.uniforms.u_glowIntensity.value = 0.4;
atmosphereMaterial.uniforms.u_atmosphereColor.value = [0.3, 0.2, 0.1];
```

## Integration with Three.js BufferGeometry

### Setting Custom Attributes

```javascript
const geometry = new THREE.BufferGeometry();

// Position attribute (required)
geometry.setAttribute('position',
  new THREE.Float32BufferAttribute(positions, 3)
);

// Normal attribute (required for fresnel)
geometry.setAttribute('normal',
  new THREE.Float32BufferAttribute(normals, 3)
);

// Custom color attribute
geometry.setAttribute('customColor',
  new THREE.Float32BufferAttribute(colors, 3)
);

// Custom size attribute
geometry.setAttribute('customSize',
  new THREE.Float32BufferAttribute(sizes, 1)
);

const points = new THREE.Points(geometry, dotMaterial);
```

## Troubleshooting

### Dots appear as squares
- Ensure fragment shader discards pixels outside circle radius
- Check `gl_PointCoord` is being used correctly

### Glow effect not visible
- Verify `transparent: true` is set on material
- Check uniform values are in correct range (0.0-1.0)
- Ensure normals are calculated correctly

### Atmosphere renders in front of dots
- Set `side: THREE.BackSide` on atmosphere material
- Verify atmosphere sphere is slightly larger than dot sphere
- Check render order if using multiple scenes

### Performance issues
- Reduce `u_pointSize` for smaller dots
- Lower total dot count in geometry
- Consider using LOD (Level of Detail) system

## Technical References

- **Fresnel Effect**: Based on viewing angle dot product
- **Smoothstep**: GLSL built-in for smooth interpolation
- **Point Sprites**: Efficient particle rendering technique
- **Shader Coordinates**: View space for accurate fresnel calculation

## Browser Compatibility

These shaders use standard GLSL ES 1.0 features:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Mobile support:
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+

## Development Tips

1. **Testing Uniforms**: Use dat.GUI or similar for live uniform tweaking
2. **Visual Debugging**: Output intermediate values via `gl_FragColor`
3. **Performance Profiling**: Use browser DevTools WebGL inspector
4. **Shader Compilation**: Check console for GLSL compilation errors

## License

Part of the Interactive Globe project. See project LICENSE file for details.

---

**Last Updated**: 2025-10-14
**GLSL Version**: ES 1.0
**Three.js Compatibility**: r150+
