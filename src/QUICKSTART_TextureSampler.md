# TextureSampler Quick Start Guide

Quick reference for using the TextureSampler module in your globe implementation.

## 5-Minute Integration

### Step 1: Import the module
```javascript
import {
  loadEarthTexture,
  isLandAtPosition,
  disposeTextureData
} from './src/TextureSampler.js';
```

### Step 2: Load texture (do this once)
```javascript
const textureData = await loadEarthTexture('/assets/textures/earth-mask.png');
```

### Step 3: Filter your dots
```javascript
// During dot generation
if (isLandAtPosition(x, y, z, globeRadius, textureData)) {
  // Keep this dot - it's on land
  landDots.push(x, y, z);
}
```

### Step 4: Clean up (when done)
```javascript
disposeTextureData(textureData);
```

## Complete Example

```javascript
import * as THREE from 'three';
import { loadEarthTexture, isLandAtPosition, disposeTextureData } from './src/TextureSampler.js';

async function createGlobeWithContinents() {
  // 1. Load the Earth texture
  const textureData = await loadEarthTexture('/assets/textures/earth-mask.png', {
    brightnessThreshold: 128,
    enableLogging: true
  });

  // 2. Generate dots using Fibonacci sphere
  const globeRadius = 100;
  const numPoints = 20000;
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
  const landDots = [];

  for (let i = 0; i < numPoints; i++) {
    // Fibonacci sphere distribution
    const y = 1 - (i / (numPoints - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    // Scale to globe radius
    const dotX = x * globeRadius;
    const dotY = y * globeRadius;
    const dotZ = z * globeRadius;

    // 3. Check if dot is on land
    if (isLandAtPosition(dotX, dotY, dotZ, globeRadius, textureData)) {
      landDots.push(dotX, dotY, dotZ);
    }
  }

  console.log(`Generated ${landDots.length / 3} land dots from ${numPoints} total points`);

  // 4. Create Three.js geometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(landDots, 3));

  // 5. Create points material and mesh
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    sizeAttenuation: false
  });
  const points = new THREE.Points(geometry, material);

  // 6. Clean up texture data
  disposeTextureData(textureData);

  return points;
}

// Usage
const globePoints = await createGlobeWithContinents();
scene.add(globePoints);
```

## Common Patterns

### Pattern 1: Check a specific location
```javascript
// Check if New York is on land
const isLand = isLandAtLatLong(40.7128, -74.0060, textureData);
console.log(isLand ? 'On land' : 'In ocean');
```

### Pattern 2: Get brightness at location
```javascript
// Get pixel brightness for a location
const brightness = getBrightnessAtLatLong(51.5074, -0.1278, textureData);
console.log(`London brightness: ${brightness}`);
```

### Pattern 3: Batch check many positions
```javascript
const positions = [
  { x: 50, y: 30, z: 40 },
  { x: -20, y: 10, z: 80 },
  { x: 10, y: -50, z: 30 }
];

const results = batchCheckLand(positions, 100, textureData);
results.forEach((isLand, i) => {
  console.log(`Position ${i}: ${isLand ? 'land' : 'ocean'}`);
});
```

### Pattern 4: Custom threshold
```javascript
// Use custom threshold for desert/shallow water areas
const textureData = await loadEarthTexture('/assets/textures/earth-mask.png', {
  brightnessThreshold: 100  // Lower = more permissive (includes lighter grays)
});
```

### Pattern 5: Progress tracking
```javascript
const textureData = await loadEarthTexture('/assets/textures/earth-mask.png', {
  onProgress: (loaded, total) => {
    const percent = (loaded / total * 100).toFixed(1);
    document.getElementById('progress').textContent = `Loading: ${percent}%`;
  }
});
```

## Coordinate Conversion Cheat Sheet

```javascript
// 3D → Lat/Long
const { lat, lon } = cartesianToLatLong(x, y, z);

// Lat/Long → UV
const { u, v } = latLongToUV(lat, lon);

// UV → Lat/Long
const { lat, lon } = uvToLatLong(u, v);

// One-step: Lat/Long → Brightness
const brightness = getBrightnessAtLatLong(lat, lon, textureData);

// One-step: Lat/Long → Is Land?
const isLand = isLandAtLatLong(lat, lon, textureData);
```

## Troubleshooting Checklist

### ✓ Dots not appearing on continents?
1. Check texture path is correct
2. Verify texture is grayscale (white=land, black=ocean)
3. Try different brightness threshold (64, 128, 192)
4. Use `getTextureDebugInfo()` to inspect texture

### ✓ Too many/few dots?
- Increase threshold to show fewer dots (more strict)
- Decrease threshold to show more dots (more permissive)

### ✓ Continents look wrong?
- Verify texture is equirectangular projection
- Check coordinate system matches (Y-up in Three.js)

### ✓ Performance issues?
- Load texture once, reuse `textureData`
- Use smaller texture resolution (2048x1024)
- Consider `batchCheckLand()` for bulk operations

## Debug Your Texture

```javascript
// Get texture statistics
const debugInfo = getTextureDebugInfo(textureData);
console.log(debugInfo);

// Output:
// {
//   width: 2048,
//   height: 1024,
//   totalPixels: 2097152,
//   brightnessThreshold: 128,
//   estimatedLandPercentage: "29.2%",
//   estimatedOceanPercentage: "70.8%",
//   ...
// }
```

## Memory Management

```javascript
// Always dispose when done
function cleanup() {
  disposeTextureData(textureData);
}

// Or in a class
class Globe {
  constructor() {
    this.textureData = null;
  }

  async init() {
    this.textureData = await loadEarthTexture('/path/to/texture.png');
  }

  dispose() {
    if (this.textureData) {
      disposeTextureData(this.textureData);
      this.textureData = null;
    }
  }
}
```

## API Quick Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `loadEarthTexture(path, opts)` | Load texture | `Promise<TextureData>` |
| `isLandAtPosition(x,y,z,r,tex)` | Check if 3D point is land | `boolean` |
| `isLandAtLatLong(lat,lon,tex)` | Check if lat/long is land | `boolean` |
| `samplePixelAtUV(u,v,tex)` | Get brightness at UV | `number` (0-255) |
| `getBrightnessAtLatLong(lat,lon,tex)` | Get brightness at coords | `number` (0-255) |
| `cartesianToLatLong(x,y,z)` | 3D → Lat/Long | `{lat, lon}` |
| `latLongToUV(lat,lon)` | Lat/Long → UV | `{u, v}` |
| `uvToLatLong(u,v)` | UV → Lat/Long | `{lat, lon}` |
| `batchCheckLand(positions,r,tex)` | Check multiple points | `boolean[]` |
| `disposeTextureData(tex)` | Free memory | `void` |
| `getTextureDebugInfo(tex)` | Debug info | `object` |

## Recommended Texture Settings

```javascript
// For high-quality desktop
const textureData = await loadEarthTexture('/assets/textures/earth-4k.png', {
  brightnessThreshold: 128
});

// For mobile/performance
const textureData = await loadEarthTexture('/assets/textures/earth-2k.png', {
  brightnessThreshold: 128
});

// For development/testing
const textureData = await loadEarthTexture('/assets/textures/earth-1k.png', {
  brightnessThreshold: 128,
  enableLogging: true
});
```

## Where to Get Textures

1. **Natural Earth** (recommended for production)
   - https://www.naturalearthdata.com/
   - Pre-made grayscale land masks
   - Multiple resolutions available

2. **NASA Visible Earth**
   - https://visibleearth.nasa.gov/
   - High-resolution Earth imagery
   - Convert to grayscale in image editor

3. **DIY: Convert any equirectangular map**
   ```bash
   # Using ImageMagick
   convert earth-color.png -colorspace Gray earth-mask.png
   ```

## Next Steps

- Read full documentation: `/src/README_TextureSampler.md`
- See complete examples: `/examples/texture-sampler-usage.js`
- Check Phase 3 specs: `OPTION_A_DEVELOPMENT_APPROACH.md` (lines 100-136)

---

**Last Updated**: 2025-10-14
**Module Version**: 1.0.0
**Questions?** Check the full README or examples directory
