# TextureSampler Module

A production-ready module for loading Earth textures and sampling pixel data for continent masking in the Interactive Globe project.

## Overview

The TextureSampler module handles the critical task of determining whether a point on a sphere corresponds to land or ocean by sampling a grayscale Earth texture. This is essential for creating the dot-pattern globe visualization where dots only appear on continents.

## Features

- **Async Texture Loading**: Uses Three.js TextureLoader with Promise-based API
- **Pixel Data Extraction**: Leverages Canvas API and `getImageData()` for direct pixel access
- **Coordinate Conversions**: Seamless conversion between 3D Cartesian, lat/long, and UV coordinates
- **Configurable Threshold**: Adjustable brightness threshold for land detection
- **Batch Processing**: Efficient methods for checking multiple positions
- **Memory Management**: Proper cleanup and disposal functions
- **Debug Utilities**: Helper functions for troubleshooting and verification
- **Comprehensive Error Handling**: Robust error handling with meaningful messages
- **Full JSDoc Documentation**: Complete type definitions and examples

## Installation

Ensure Three.js is installed in your project:

```bash
npm install three
```

## Basic Usage

```javascript
import { loadEarthTexture, isLandAtPosition } from './src/TextureSampler.js';

// Load the Earth texture
const textureData = await loadEarthTexture('/assets/textures/earth-mask.png');

// Check if a 3D position is on land
const globeRadius = 100;
const x = 50, y = 30, z = 40;
const isLand = isLandAtPosition(x, y, z, globeRadius, textureData);

console.log(isLand ? 'This point is on land' : 'This point is in ocean');

// Clean up when done
disposeTextureData(textureData);
```

## API Reference

### Core Functions

#### `loadEarthTexture(texturePath, options)`

Loads an Earth texture and extracts pixel data for sampling.

**Parameters:**
- `texturePath` (string): Path to the grayscale Earth texture (PNG/JPG)
- `options` (object, optional):
  - `brightnessThreshold` (number): Threshold for land detection (0-255), default: 128
  - `enableLogging` (boolean): Enable console logging, default: false
  - `onProgress` (function): Progress callback (loaded, total)

**Returns:** `Promise<TextureData>`

**Example:**
```javascript
const textureData = await loadEarthTexture('/assets/textures/earth-mask.png', {
  brightnessThreshold: 128,
  enableLogging: true,
  onProgress: (loaded, total) => {
    console.log(`${(loaded/total*100).toFixed(1)}% loaded`);
  }
});
```

---

#### `isLandAtPosition(x, y, z, radius, textureData)`

Checks if a 3D position on a sphere corresponds to land.

**Parameters:**
- `x, y, z` (number): 3D Cartesian coordinates
- `radius` (number): Sphere radius for normalization
- `textureData` (TextureData): Loaded texture data object

**Returns:** `boolean` - True if on land, false if ocean

**Example:**
```javascript
const isLand = isLandAtPosition(50, 30, 40, 100, textureData);
```

---

#### `samplePixelAtUV(u, v, textureData)`

Samples the pixel brightness at given UV coordinates.

**Parameters:**
- `u` (number): Horizontal texture coordinate (0-1)
- `v` (number): Vertical texture coordinate (0-1)
- `textureData` (TextureData): Loaded texture data object

**Returns:** `number` - Brightness value (0-255)

**Example:**
```javascript
const brightness = samplePixelAtUV(0.5, 0.5, textureData);
console.log(`Center pixel brightness: ${brightness}`);
```

---

### Coordinate Conversion Functions

#### `cartesianToLatLong(x, y, z)`

Converts 3D Cartesian coordinates to latitude and longitude.

**Parameters:**
- `x, y, z` (number): Normalized coordinates on unit sphere

**Returns:** `{lat: number, lon: number}` - Latitude and longitude in degrees

**Example:**
```javascript
const { lat, lon } = cartesianToLatLong(0.5, 0.5, 0.707);
```

---

#### `latLongToUV(lat, lon)`

Converts latitude and longitude to UV texture coordinates.

**Parameters:**
- `lat` (number): Latitude in degrees (-90 to 90)
- `lon` (number): Longitude in degrees (-180 to 180)

**Returns:** `{u: number, v: number}` - UV coordinates (0-1)

**Example:**
```javascript
const { u, v } = latLongToUV(40.7128, -74.0060); // New York
```

---

#### `uvToLatLong(u, v)`

Converts UV texture coordinates to latitude and longitude.

**Parameters:**
- `u` (number): Horizontal texture coordinate (0-1)
- `v` (number): Vertical texture coordinate (0-1)

**Returns:** `{lat: number, lon: number}` - Latitude and longitude in degrees

**Example:**
```javascript
const { lat, lon } = uvToLatLong(0.5, 0.5);
```

---

### Convenience Functions

#### `isLandAtLatLong(lat, lon, textureData)`

Checks if a lat/long coordinate is on land.

**Parameters:**
- `lat` (number): Latitude in degrees
- `lon` (number): Longitude in degrees
- `textureData` (TextureData): Loaded texture data object

**Returns:** `boolean`

**Example:**
```javascript
const isLand = isLandAtLatLong(51.5074, -0.1278, textureData); // London
```

---

#### `getBrightnessAtLatLong(lat, lon, textureData)`

Gets pixel brightness at a specific lat/long coordinate.

**Parameters:**
- `lat` (number): Latitude in degrees
- `lon` (number): Longitude in degrees
- `textureData` (TextureData): Loaded texture data object

**Returns:** `number` - Brightness value (0-255)

---

#### `batchCheckLand(positions, radius, textureData)`

Batch checks multiple positions for land/ocean status.

**Parameters:**
- `positions` (Array): Array of `{x, y, z}` position objects
- `radius` (number): Sphere radius
- `textureData` (TextureData): Loaded texture data object

**Returns:** `Array<boolean>`

**Example:**
```javascript
const positions = [
  { x: 50, y: 30, z: 40 },
  { x: -20, y: 10, z: 80 }
];
const results = batchCheckLand(positions, 100, textureData);
```

---

### Utility Functions

#### `disposeTextureData(textureData)`

Disposes of texture resources to free memory.

**Example:**
```javascript
disposeTextureData(textureData);
```

---

#### `getTextureDebugInfo(textureData)`

Gets debug information about the texture data.

**Returns:** Object with debug information including dimensions, land/ocean percentages, etc.

**Example:**
```javascript
const debugInfo = getTextureDebugInfo(textureData);
console.log(debugInfo);
```

---

## Coordinate Systems

### Three.js Coordinate System
- Y-axis: Points up (North)
- X-axis: Points to 0° longitude
- Z-axis: Points to 90° East longitude
- Right-handed coordinate system

### Geographic Coordinates
- Latitude: -90° (South Pole) to +90° (North Pole)
- Longitude: -180° (West) to +180° (East)

### UV Texture Coordinates
- U: 0 at 180°W, 1 at 180°E
- V: 0 at North Pole (90°N), 1 at South Pole (90°S)
- Origin: Top-left corner (standard texture coordinates)

## Integration with Globe

Example of filtering dots for continent display:

```javascript
import { loadEarthTexture, isLandAtPosition } from './src/TextureSampler.js';

async function generateContinentDots() {
  // Load texture
  const textureData = await loadEarthTexture('/assets/textures/earth-mask.png');

  // Generate Fibonacci sphere points
  const globeRadius = 100;
  const numPoints = 20000;
  const phi = Math.PI * (3 - Math.sqrt(5));

  const landDots = [];

  for (let i = 0; i < numPoints; i++) {
    const y = 1 - (i / (numPoints - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radius * globeRadius;
    const z = Math.sin(theta) * radius * globeRadius;
    const dotY = y * globeRadius;

    // Only keep dots on land
    if (isLandAtPosition(x, dotY, z, globeRadius, textureData)) {
      landDots.push(x, dotY, z);
    }
  }

  // Create BufferGeometry with filtered dots
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',
    new THREE.Float32BufferAttribute(landDots, 3)
  );

  // Clean up
  disposeTextureData(textureData);

  return geometry;
}
```

## Performance Considerations

1. **Texture Resolution**: Use 2048x1024 or 4096x2048 for optimal balance between accuracy and performance
2. **Caching**: Load the texture once and reuse the `textureData` object
3. **Batch Processing**: Use `batchCheckLand()` for checking many positions
4. **Memory Management**: Always call `disposeTextureData()` when done
5. **Threshold Tuning**: Adjust `brightnessThreshold` based on your texture (typically 128)

## Texture Requirements

The Earth texture should be:
- **Format**: PNG or JPG
- **Type**: Grayscale (though RGB is supported)
- **Content**: White pixels for land, black for ocean
- **Resolution**: Power of 2 recommended (2048x1024, 4096x2048)
- **Projection**: Equirectangular (latitude-longitude)

### Recommended Texture Sources
1. **NASA Visible Earth**: https://visibleearth.nasa.gov/
2. **Natural Earth**: https://www.naturalearthdata.com/
3. Custom textures: Convert color maps to grayscale using image processing

## Error Handling

All functions include comprehensive error handling:

```javascript
try {
  const textureData = await loadEarthTexture('/path/to/texture.png');
  // Use texture data...
} catch (error) {
  console.error('Failed to load texture:', error.message);
  // Handle error gracefully
}
```

## TypeScript Support

TypeScript definitions are included via JSDoc comments. For full TypeScript support, create a `TextureSampler.d.ts` file:

```typescript
export interface TextureData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  texture: THREE.Texture;
  brightnessThreshold?: number;
}

export interface TextureLoadOptions {
  brightnessThreshold?: number;
  enableLogging?: boolean;
  onProgress?: (loaded: number, total: number) => void;
}

export function loadEarthTexture(
  texturePath: string,
  options?: TextureLoadOptions
): Promise<TextureData>;

export function isLandAtPosition(
  x: number,
  y: number,
  z: number,
  radius: number,
  textureData: TextureData
): boolean;

// ... other function declarations
```

## Testing

See `/examples/texture-sampler-usage.js` for comprehensive examples including:
- Basic texture loading
- Dot filtering for globe visualization
- Custom threshold testing
- Batch processing performance tests

Run examples:
```bash
node examples/texture-sampler-usage.js
```

## Troubleshooting

### Issue: All positions return false (ocean)
**Solution**: Check texture path, ensure texture loaded correctly, verify brightness threshold

### Issue: Continents look wrong
**Solution**: Verify texture is equirectangular projection, check UV coordinate mapping

### Issue: Performance is slow
**Solution**: Reduce texture resolution, use batch processing, cache texture data

### Issue: Memory leaks
**Solution**: Ensure `disposeTextureData()` is called when texture no longer needed

## Contributing

When modifying this module:
1. Maintain backward compatibility
2. Update JSDoc comments
3. Add tests for new functionality
4. Update this README
5. Follow existing code style

## License

Part of the Interactive Globe project.

## Version History

- **1.0.0** (2025-10-14): Initial implementation
  - Core texture loading functionality
  - Coordinate conversion utilities
  - Batch processing support
  - Debug utilities

---

**Module Location**: `/src/TextureSampler.js`
**Documentation**: This file
**Examples**: `/examples/texture-sampler-usage.js`
**Dependencies**: Three.js (r150+)
