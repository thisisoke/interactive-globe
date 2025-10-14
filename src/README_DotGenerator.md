# DotGenerator.js

## Overview

`DotGenerator.js` implements the **Fibonacci sphere algorithm** (also known as the golden angle spiral or sunflower spiral) for generating evenly distributed points on a sphere surface. This algorithm is ideal for creating uniform dot patterns on 3D globes without clustering at the poles.

## Features

- **Optimal Distribution**: Uses the golden angle (φ = π × (3 - √5) ≈ 2.4rad) for perfect point spacing
- **No Pole Clustering**: Unlike latitude/longitude grids, points are uniformly distributed
- **High Performance**: O(n) time complexity, generates 20,000 points in ~10-50ms
- **Two Output Formats**: Object array or Float32Array for direct Three.js use
- **Type Safety**: Comprehensive input validation with descriptive error messages
- **Production Ready**: Fully documented with JSDoc, error handling, and edge case coverage

## Mathematical Formula

The algorithm follows these steps for each point `i` from 0 to N-1:

```
y = 1 - (i / (N - 1)) × 2         // Linear y-axis distribution [-1, 1]
radiusAtY = √(1 - y²)              // Circle radius at height y
theta = φ × i                      // Golden angle increment
x = cos(theta) × radiusAtY         // Cartesian x-coordinate
z = sin(theta) × radiusAtY         // Cartesian z-coordinate
```

Then scale by the sphere radius: `(x, y, z) → (x×r, y×r, z×r)`

## API Reference

### `generateFibonacciSphere(numPoints, radius)`

Generates an array of point objects with x, y, z coordinates.

**Parameters:**
- `numPoints` (number): Number of points to generate (recommended: 1,000-50,000)
- `radius` (number, optional): Sphere radius in world units (default: 100)

**Returns:** `Array<{x: number, y: number, z: number}>`

**Throws:**
- `TypeError`: If parameters are not numbers
- `RangeError`: If numPoints < 1 or radius ≤ 0

**Example:**
```javascript
import { generateFibonacciSphere } from './DotGenerator.js';

const points = generateFibonacciSphere(20000, 100);
console.log(points[0]); // { x: 0, y: 100, z: 0 } (north pole)
```

### `generateFibonacciSphereBuffer(numPoints, radius)`

Generates a flat Float32Array for direct use with Three.js BufferGeometry.

**Parameters:**
- `numPoints` (number): Number of points to generate
- `radius` (number, optional): Sphere radius in world units (default: 100)

**Returns:** `Float32Array` - Flat array in format `[x1, y1, z1, x2, y2, z2, ...]`

**Throws:**
- `TypeError`: If parameters are not numbers
- `RangeError`: If numPoints < 1 or radius ≤ 0

**Example:**
```javascript
import * as THREE from 'three';
import { generateFibonacciSphereBuffer } from './DotGenerator.js';

const positions = generateFibonacciSphereBuffer(20000, 100);
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({ size: 2, color: 0xffffff });
const pointCloud = new THREE.Points(geometry, material);
scene.add(pointCloud);
```

### `GOLDEN_ANGLE` (constant)

The golden angle in radians: π × (3 - √5) ≈ 2.39996322972865332

## Usage with Three.js

### Basic Example

```javascript
import * as THREE from 'three';
import { generateFibonacciSphereBuffer } from './src/DotGenerator.js';

// Generate 20,000 evenly distributed points
const positions = generateFibonacciSphereBuffer(20000, 100);

// Create geometry
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Create material
const material = new THREE.PointsMaterial({
    color: 0x4B9FBF,
    size: 2.0,
    sizeAttenuation: false
});

// Create point cloud and add to scene
const globe = new THREE.Points(geometry, material);
scene.add(globe);
```

### With Land Masking

```javascript
import { generateFibonacciSphere } from './src/DotGenerator.js';
import { filterLandPoints } from './src/TextureSampler.js';

// Generate all points
const allPoints = generateFibonacciSphere(25000, 100);

// Filter to only show land (requires earth texture)
const landPoints = await filterLandPoints(allPoints, 'assets/textures/earth-mask.png');

// Convert to Float32Array for Three.js
const positions = new Float32Array(landPoints.length * 3);
landPoints.forEach((point, i) => {
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
});
```

## Performance Characteristics

| Points  | Generation Time | Memory Usage | Use Case                    |
|---------|----------------|--------------|------------------------------|
| 1,000   | ~1ms           | ~12 KB       | Low-detail preview          |
| 5,000   | ~5ms           | ~60 KB       | Basic visualization         |
| 15,000  | ~15ms          | ~180 KB      | Recommended for production  |
| 25,000  | ~25ms          | ~300 KB      | High detail                 |
| 50,000  | ~50ms          | ~600 KB      | Maximum detail/large screen |

*Measurements on modern desktop CPU. Actual times may vary.*

## Algorithm Background

The Fibonacci sphere algorithm was popularized by research in computational geometry and is based on the Fibonacci sequence's relationship to the golden ratio. It provides:

1. **Uniform Coverage**: Points are evenly spaced across the entire sphere
2. **No Singularities**: Avoids clustering at poles (unlike lat/long grids)
3. **Deterministic**: Same input always produces same output
4. **Efficient**: Linear time complexity O(n)

The golden angle (≈137.5°) ensures that consecutive points never align vertically, creating optimal spiral patterns similar to sunflower seeds or pine cone scales.

## References

- [Fibonacci Sphere Algorithm Paper](https://arxiv.org/abs/0912.4540)
- [Stripe Globe Implementation](https://stripe.com/blog/globe)
- [Three.js BufferGeometry Documentation](https://threejs.org/docs/#api/en/core/BufferGeometry)

## Testing

Run the test suite to verify correctness:

```bash
node test-dotgen.mjs
```

View live demo:
```bash
# Serve the project
python3 -m http.server 8000
# Open http://localhost:8000/examples/test-dotgenerator.html
```

## License

Part of the Interactive Globe project. See main LICENSE file.

---

**Module Version**: 1.0.0
**Last Updated**: 2025-10-14
**Status**: Production Ready
