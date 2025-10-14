# Interactive Globe Utility Functions

This directory contains utility functions for coordinate conversions and color manipulation used in the interactive globe project.

## Files

### coordinates.js
Provides functions to convert between different coordinate systems used in 3D globe rendering.

### colors.js
Provides functions to parse, validate, and manipulate colors in various formats, integrated with Three.js.

---

## Coordinate Utilities (`coordinates.js`)

### Core Conversion Functions

#### `cartesianToLatLon(x, y, z, radius = 1)`
Converts 3D Cartesian coordinates to geographic latitude and longitude.

```javascript
import { cartesianToLatLon } from './utils/coordinates.js';

const { lat, lon } = cartesianToLatLon(0, 1, 0, 1);
// Returns: { lat: 90, lon: 0 } (North Pole)
```

#### `latLonToCartesian(lat, lon, radius = 1)`
Converts geographic coordinates to 3D Cartesian coordinates.

```javascript
import { latLonToCartesian } from './utils/coordinates.js';

const { x, y, z } = latLonToCartesian(0, 0, 2);
// Returns: { x: 0, y: 0, z: 2 } (Equator, Prime Meridian)
```

#### `latLonToUV(lat, lon)`
Converts geographic coordinates to UV texture coordinates (0-1 range).

```javascript
import { latLonToUV } from './utils/coordinates.js';

const { u, v } = latLonToUV(0, 0);
// Returns: { u: 0.5, v: 0.5 } (Center of texture)
```

#### `cartesianToUV(x, y, z, radius = 1)`
Directly converts 3D coordinates to UV coordinates.

```javascript
import { cartesianToUV } from './utils/coordinates.js';

const { u, v } = cartesianToUV(0, 1, 0, 1);
// Returns UV coordinates for the point
```

#### `uvToLatLon(u, v)`
Converts UV texture coordinates to geographic coordinates.

```javascript
import { uvToLatLon } from './utils/coordinates.js';

const { lat, lon } = uvToLatLon(0.5, 0.5);
// Returns: { lat: 0, lon: 0 }
```

#### `uvToCartesian(u, v, radius = 1)`
Converts UV coordinates to 3D Cartesian coordinates.

```javascript
import { uvToCartesian } from './utils/coordinates.js';

const { x, y, z } = uvToCartesian(0.5, 0.5, 2);
// Returns 3D point on sphere
```

### Particle Distribution

#### `generateFibonacciSphere(count, radius = 1)`
Generates evenly distributed points on a sphere using the Fibonacci sphere algorithm.

```javascript
import { generateFibonacciSphere } from './utils/coordinates.js';

const points = generateFibonacciSphere(1000, 2);
// Returns array of { x, y, z, lat, lon } objects

// Usage with Three.js
const positions = new Float32Array(points.length * 3);
points.forEach((point, i) => {
  positions[i * 3] = point.x;
  positions[i * 3 + 1] = point.y;
  positions[i * 3 + 2] = point.z;
});
```

### Distance Calculations

#### `greatCircleDistance(lat1, lon1, lat2, lon2, radius = 1)`
Calculates the shortest distance between two points on a sphere using the Haversine formula.

```javascript
import { greatCircleDistance } from './utils/coordinates.js';

const distance = greatCircleDistance(0, 0, 0, 90, 6371);
// Returns distance in same units as radius (km if radius is Earth's radius)
```

### Vector Operations

#### `normalizeVector(x, y, z)`
Normalizes a 3D vector to unit length.

```javascript
import { normalizeVector } from './utils/coordinates.js';

const normalized = normalizeVector(3, 4, 0);
// Returns: { x: 0.6, y: 0.8, z: 0 }
```

#### `vectorMagnitude(x, y, z)`
Calculates the length of a 3D vector.

```javascript
import { vectorMagnitude } from './utils/coordinates.js';

const length = vectorMagnitude(3, 4, 0);
// Returns: 5
```

---

## Color Utilities (`colors.js`)

### Color Parsing

#### `parseColor(color)`
Parses various color formats to Three.js Color objects.

```javascript
import { parseColor } from './utils/colors.js';

const color1 = parseColor("#ff0000");     // Hex
const color2 = parseColor("rgb(255,0,0)"); // RGB
const color3 = parseColor("rgba(255,0,0,0.5)"); // RGBA
const color4 = parseColor("red");         // Named color
const color5 = parseColor(0xff0000);      // Numeric
```

#### `isValidColor(color)`
Validates if a color string or number is valid.

```javascript
import { isValidColor } from './utils/colors.js';

console.log(isValidColor("#ff0000")); // true
console.log(isValidColor("invalid")); // false
```

### Format Parsing

#### `parseRGB(rgbString)` / `parseRGBA(rgbaString)`
Parses RGB/RGBA strings to component values.

```javascript
import { parseRGB, parseRGBA } from './utils/colors.js';

const rgb = parseRGB("rgb(255, 128, 64)");
// Returns: { r: 255, g: 128, b: 64 }

const rgba = parseRGBA("rgba(255, 128, 64, 0.5)");
// Returns: { r: 255, g: 128, b: 64, a: 0.5 }
```

### Color Conversions

#### `colorToHex(color, includeHash = true)`
Converts Three.js Color to hex string.

```javascript
import { colorToHex, parseColor } from './utils/colors.js';

const color = parseColor("#ff0000");
console.log(colorToHex(color)); // "#ff0000"
console.log(colorToHex(color, false)); // "ff0000"
```

#### `colorToRGB(color)` / `colorToRGBA(color, alpha)`
Converts Three.js Color to RGB/RGBA strings.

```javascript
import { colorToRGB, colorToRGBA, parseColor } from './utils/colors.js';

const color = parseColor("#ff0000");
console.log(colorToRGB(color)); // "rgb(255, 0, 0)"
console.log(colorToRGBA(color, 0.5)); // "rgba(255, 0, 0, 0.5)"
```

#### `hexToRGB(hex)` / `rgbToHex(r, g, b)`
Converts between hex and RGB formats.

```javascript
import { hexToRGB, rgbToHex } from './utils/colors.js';

const rgb = hexToRGB("#ff0000");
// Returns: { r: 255, g: 0, b: 0 }

const hex = rgbToHex(255, 0, 0);
// Returns: "#ff0000"
```

### Color Manipulation

#### `lerpColor(color1, color2, t)`
Linearly interpolates between two colors.

```javascript
import { lerpColor, parseColor } from './utils/colors.js';

const red = parseColor("#ff0000");
const blue = parseColor("#0000ff");
const purple = lerpColor(red, blue, 0.5);
```

#### `adjustBrightness(color, amount)`
Adjusts color brightness (-1 to 1).

```javascript
import { adjustBrightness, parseColor } from './utils/colors.js';

const color = parseColor("#ff6600");
const lighter = adjustBrightness(color, 0.3);  // 30% lighter
const darker = adjustBrightness(color, -0.3);  // 30% darker
```

#### `adjustSaturation(color, amount)`
Adjusts color saturation (-1 to 1).

```javascript
import { adjustSaturation, parseColor } from './utils/colors.js';

const color = parseColor("#ff0000");
const desaturated = adjustSaturation(color, -0.5); // 50% less saturated
```

### Color Analysis

#### `getColorLuminance(color)`
Gets the relative luminance (brightness) of a color.

```javascript
import { getColorLuminance, parseColor } from './utils/colors.js';

const white = parseColor("#ffffff");
const black = parseColor("#000000");
console.log(getColorLuminance(white)); // 1.0
console.log(getColorLuminance(black)); // 0.0
```

#### `isLightColor(color, threshold = 0.5)`
Determines if a color is light or dark.

```javascript
import { isLightColor, parseColor } from './utils/colors.js';

console.log(isLightColor("#ffffff")); // true
console.log(isLightColor("#000000")); // false

// Useful for choosing contrasting text colors
const bgColor = parseColor("#3498db");
const textColor = isLightColor(bgColor) ? "#000000" : "#ffffff";
```

### Advanced Features

#### `createColorPalette(baseColor, count = 5)`
Generates a color palette from a base color.

```javascript
import { createColorPalette, parseColor } from './utils/colors.js';

const palette = createColorPalette("#3498db", 5);
// Returns array of 5 color variations
```

#### `blendColors(color1, color2, mode = 'normal', alpha = 0.5)`
Blends two colors using various blend modes.

```javascript
import { blendColors, parseColor } from './utils/colors.js';

const red = parseColor("#ff0000");
const green = parseColor("#00ff00");

const normal = blendColors(red, green, 'normal', 0.5);
const multiply = blendColors(red, green, 'multiply', 0.5);
const screen = blendColors(red, green, 'screen', 0.5);
const overlay = blendColors(red, green, 'overlay', 0.5);
const add = blendColors(red, green, 'add', 0.5);
```

### Predefined Colors

The `COLORS` object provides commonly used colors:

```javascript
import { COLORS } from './utils/colors.js';

// Basic colors
COLORS.WHITE
COLORS.BLACK
COLORS.RED
COLORS.GREEN
COLORS.BLUE
COLORS.YELLOW
COLORS.CYAN
COLORS.MAGENTA

// Globe-specific colors
COLORS.OCEAN
COLORS.LAND
COLORS.ATMOSPHERE
COLORS.GLOW
COLORS.PARTICLE

// UI colors
COLORS.PRIMARY
COLORS.SECONDARY
COLORS.SUCCESS
COLORS.WARNING
COLORS.ERROR
COLORS.INFO
```

---

## Usage Examples

### Example 1: Creating a Particle System with Texture Masking

```javascript
import * as THREE from 'three';
import { generateFibonacciSphere, latLonToUV } from './utils/coordinates.js';
import { parseColor } from './utils/colors.js';

// Generate points on sphere
const points = generateFibonacciSphere(5000, 2);

// Load texture for masking
const textureLoader = new THREE.TextureLoader();
textureLoader.load('/earth-map.jpg', (texture) => {
  const canvas = document.createElement('canvas');
  canvas.width = texture.image.width;
  canvas.height = texture.image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(texture.image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Filter points based on texture
  const filteredPoints = points.filter(point => {
    const { u, v } = latLonToUV(point.lat, point.lon);
    const x = Math.floor(u * imageData.width);
    const y = Math.floor(v * imageData.height);
    const index = (y * imageData.width + x) * 4;
    const brightness = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
    return brightness > 50; // Only land masses
  });

  // Create geometry
  const positions = new Float32Array(filteredPoints.length * 3);
  filteredPoints.forEach((point, i) => {
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: parseColor(COLORS.PARTICLE),
    size: 0.02,
    transparent: true,
    opacity: 0.8
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
});
```

### Example 2: Creating a Color Gradient

```javascript
import { lerpColor, parseColor, colorToHex } from './utils/colors.js';

const startColor = parseColor("#ff0000");
const endColor = parseColor("#0000ff");
const steps = 10;

const gradient = [];
for (let i = 0; i < steps; i++) {
  const t = i / (steps - 1);
  const color = lerpColor(startColor, endColor, t);
  gradient.push(colorToHex(color));
}

console.log(gradient);
// ["#ff0000", "#e6001a", "#cc0033", ..., "#0000ff"]
```

### Example 3: Converting Geographic Data

```javascript
import { latLonToCartesian } from './utils/coordinates.js';

// City locations (latitude, longitude)
const cities = [
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 }
];

// Convert to 3D positions for rendering
const globeRadius = 2;
const cityPositions = cities.map(city => ({
  ...city,
  position: latLonToCartesian(city.lat, city.lon, globeRadius)
}));

// Use positions to place markers on globe
cityPositions.forEach(city => {
  const marker = createMarker(city.position);
  scene.add(marker);
});
```

---

## Testing

Run the test suite:

```bash
node test-utils.js
```

This will test all coordinate conversions and color utilities to ensure they're working correctly.

---

## Implementation Notes

### Coordinate System
- **X axis**: Points to 0° longitude (Prime Meridian)
- **Y axis**: Points to 90° latitude (North Pole)
- **Z axis**: Points to 90° longitude

### UV Mapping
- **U coordinate**: Maps longitude (-180° to 180°) to (0 to 1)
- **V coordinate**: Maps latitude (-90° to 90°) to (0 to 1), inverted for standard texture mapping

### Performance Considerations
- All functions use `Float32Array` for optimal Three.js integration
- Fibonacci sphere algorithm provides O(n) even distribution
- Color parsing is cached by Three.js internally

### Browser Compatibility
- Requires ES6 module support
- Compatible with all modern browsers
- Three.js r150+ required

---

## References

- [Three.js Documentation](https://threejs.org/docs/)
- [Fibonacci Sphere Algorithm](https://arxiv.org/abs/0912.4540)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Relative Luminance (Rec. 709)](https://en.wikipedia.org/wiki/Relative_luminance)
- [Three.js Research Report](../../THREE_JS_RESEARCH_REPORT.md)
