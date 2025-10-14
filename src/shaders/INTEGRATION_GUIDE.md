# Shader Integration Guide

Complete guide for integrating the custom GLSL shaders into the interactive globe project.

## Quick Start

### 1. Install Dependencies

```bash
npm install three
# If using build tools that need GLSL loaders:
npm install --save-dev vite-plugin-glsl  # For Vite
# OR
npm install --save-dev glsl-loader       # For Webpack
```

### 2. Configure Build Tool

#### Vite Configuration (vite.config.js)

```javascript
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [
    glsl()
  ]
});
```

#### Webpack Configuration (webpack.config.js)

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader', 'glslify-loader']
      }
    ]
  }
};
```

### 3. Import and Use Shaders

```javascript
import * as THREE from 'three';
import { dotShader, atmosphereShader } from './shaders';

// Create materials
const dotMaterial = new THREE.ShaderMaterial({
  ...dotShader,
  uniforms: THREE.UniformsUtils.clone(dotShader.uniforms)
});

const atmosphereMaterial = new THREE.ShaderMaterial({
  ...atmosphereShader,
  uniforms: THREE.UniformsUtils.clone(atmosphereShader.uniforms)
});
```

## Complete Implementation Example

### Step 1: Scene Setup

```javascript
import * as THREE from 'three';

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Create camera
const camera = new THREE.PerspectiveCamera(
  45,                                    // FOV
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1,                                    // Near plane
  1000                                    // Far plane
);
camera.position.z = 300;

// Create renderer
const renderer = new THREE.WebGLRenderer({
  antialias: false,  // Disabled for performance
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);
```

### Step 2: Dot Particle System

```javascript
import { dotShader } from './shaders';

// Constants
const GLOBE_RADIUS = 100;
const NUM_DOTS = 20000;

// Generate Fibonacci sphere points
function generateFibonacciSphere(numPoints, radius) {
  const positions = [];
  const normals = [];
  const colors = [];
  const sizes = [];

  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < numPoints; i++) {
    const y = 1 - (i / (numPoints - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    // Positions
    positions.push(
      x * radius,
      y * radius,
      z * radius
    );

    // Normals (normalized position for sphere)
    normals.push(x, y, z);

    // Default white color
    colors.push(1.0, 1.0, 1.0);

    // Default size
    sizes.push(1.0);
  }

  return { positions, normals, colors, sizes };
}

// Generate dot data
const dotData = generateFibonacciSphere(NUM_DOTS, GLOBE_RADIUS);

// Create geometry
const dotGeometry = new THREE.BufferGeometry();
dotGeometry.setAttribute('position',
  new THREE.Float32BufferAttribute(dotData.positions, 3)
);
dotGeometry.setAttribute('normal',
  new THREE.Float32BufferAttribute(dotData.normals, 3)
);
dotGeometry.setAttribute('customColor',
  new THREE.Float32BufferAttribute(dotData.colors, 3)
);
dotGeometry.setAttribute('customSize',
  new THREE.Float32BufferAttribute(dotData.sizes, 1)
);

// Create material
const dotMaterial = new THREE.ShaderMaterial({
  vertexShader: dotShader.vertexShader,
  fragmentShader: dotShader.fragmentShader,
  uniforms: THREE.UniformsUtils.clone(dotShader.uniforms),
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

// Create points
const dotPoints = new THREE.Points(dotGeometry, dotMaterial);
scene.add(dotPoints);
```

### Step 3: Atmosphere Layer

```javascript
import { atmosphereShader } from './shaders';

// Create sphere geometry (15% larger than globe)
const atmosphereGeometry = new THREE.SphereGeometry(
  GLOBE_RADIUS * 1.15,
  64,  // Width segments
  64   // Height segments
);

// Create material
const atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: atmosphereShader.vertexShader,
  fragmentShader: atmosphereShader.fragmentShader,
  uniforms: THREE.UniformsUtils.clone(atmosphereShader.uniforms),
  transparent: true,
  side: THREE.BackSide,
  depthWrite: false,
  blending: THREE.NormalBlending
});

// Create mesh
const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphereMesh);
```

### Step 4: Animation Loop

```javascript
function animate() {
  requestAnimationFrame(animate);

  // Auto-rotation
  dotPoints.rotation.y += 0.001;
  atmosphereMesh.rotation.y += 0.001;

  // Render
  renderer.render(scene, camera);
}

animate();
```

### Step 5: Responsive Handling

```javascript
function handleResize() {
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleResize);
```

## Advanced Features

### Land Masking with Texture

```javascript
// Load Earth texture
const textureLoader = new THREE.TextureLoader();
textureLoader.load('/assets/textures/earth-mask.png', (texture) => {
  // Create canvas to read pixel data
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const img = texture.image;
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Filter dots by texture
  const filteredDots = filterDotsByTexture(
    dotData.positions,
    imageData,
    GLOBE_RADIUS
  );

  // Update geometry with filtered dots
  updateGeometryWithFilteredDots(dotGeometry, filteredDots);
});

function filterDotsByTexture(positions, imageData, radius) {
  const filtered = [];

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    // Convert to lat/lon
    const lat = Math.asin(y / radius) * (180 / Math.PI);
    const lon = Math.atan2(z, x) * (180 / Math.PI);

    // Convert to UV coordinates
    const u = (lon + 180) / 360;
    const v = (90 - lat) / 180;

    // Sample texture
    const pixelX = Math.floor(u * imageData.width);
    const pixelY = Math.floor(v * imageData.height);
    const pixelIndex = (pixelY * imageData.width + pixelX) * 4;
    const brightness = imageData.data[pixelIndex]; // Red channel

    // Keep dot if on land (white in texture)
    if (brightness > 128) {
      filtered.push(x, y, z);
    }
  }

  return filtered;
}
```

### Interactive Dot Highlighting

```javascript
import { colorUtils } from './shaders';

function highlightDot(dotIndex, color = '#FF6B35') {
  const colorAttribute = dotGeometry.attributes.customColor;
  const rgb = colorUtils.hexToRGB(color);

  colorAttribute.setXYZ(dotIndex, rgb[0], rgb[1], rgb[2]);
  colorAttribute.needsUpdate = true;
}

function highlightLocation(lat, lon, color) {
  // Find nearest dot to coordinates
  const dotIndex = findNearestDot(lat, lon, dotData.positions);
  highlightDot(dotIndex, color);
}

function findNearestDot(lat, lon, positions) {
  // Convert lat/lon to Cartesian
  const targetX = Math.cos(lat * Math.PI / 180) * Math.cos(lon * Math.PI / 180);
  const targetY = Math.sin(lat * Math.PI / 180);
  const targetZ = Math.cos(lat * Math.PI / 180) * Math.sin(lon * Math.PI / 180);

  let nearestIndex = 0;
  let minDistance = Infinity;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i] / GLOBE_RADIUS;
    const y = positions[i + 1] / GLOBE_RADIUS;
    const z = positions[i + 2] / GLOBE_RADIUS;

    const distance = Math.sqrt(
      Math.pow(x - targetX, 2) +
      Math.pow(y - targetY, 2) +
      Math.pow(z - targetZ, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i / 3;
    }
  }

  return nearestIndex;
}

// Usage
highlightLocation(40.7128, -74.0060, '#FF0000'); // New York
highlightLocation(51.5074, -0.1278, '#00FF00');  // London
```

### OrbitControls Integration

```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.enableZoom = false;  // Optional
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Update in animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
```

### Dynamic Uniform Updates

```javascript
import { updateUniforms } from './shaders';

// Change dot appearance
updateUniforms(dotMaterial, {
  u_glowColor: [1.0, 0.0, 0.0],  // Red glow
  u_glowIntensity: 0.8,
  u_pointSize: 3.0
});

// Change atmosphere appearance
updateUniforms(atmosphereMaterial, {
  u_atmosphereColor: [0.0, 0.5, 1.0],  // Blue atmosphere
  u_glowIntensity: 0.6
});
```

### Animated Pulse Effect

```javascript
function animateGlow() {
  const time = Date.now() * 0.001;
  const intensity = 0.5 + Math.sin(time * 2) * 0.2;

  dotMaterial.uniforms.u_glowIntensity.value = intensity;
  atmosphereMaterial.uniforms.u_glowIntensity.value = intensity;
}

// Call in animation loop
function animate() {
  requestAnimationFrame(animate);
  animateGlow();
  controls.update();
  renderer.render(scene, camera);
}
```

## Performance Optimization

### Level of Detail (LOD)

```javascript
function adjustQualityForDevice() {
  const isMobile = /Android|webOS|iPhone|iPad/i.test(navigator.userAgent);

  if (isMobile) {
    // Reduce dot count
    const reducedDots = generateFibonacciSphere(10000, GLOBE_RADIUS);

    // Lower shader quality
    updateUniforms(dotMaterial, {
      u_pointSize: 1.5,
      u_glowIntensity: 0.2
    });
  }
}
```

### Visibility-Based Rendering

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animation
    renderer.setAnimationLoop(null);
  } else {
    // Resume animation
    renderer.setAnimationLoop(animate);
  }
});
```

### Memory Management

```javascript
function dispose() {
  // Dispose geometries
  dotGeometry.dispose();
  atmosphereGeometry.dispose();

  // Dispose materials
  dotMaterial.dispose();
  atmosphereMaterial.dispose();

  // Dispose renderer
  renderer.dispose();

  // Remove event listeners
  window.removeEventListener('resize', handleResize);
}

// Call when unmounting component
window.addEventListener('beforeunload', dispose);
```

## Troubleshooting

### Issue: Shaders not compiling

**Solution**: Check browser console for GLSL errors. Common issues:
- Missing semicolons
- Type mismatches
- Undefined uniforms

### Issue: Dots appear as squares

**Solution**: Ensure fragment shader includes circle rendering code:
```glsl
vec2 center = vec2(0.5, 0.5);
float dist = distance(gl_PointCoord, center);
if (dist > 0.5) discard;
```

### Issue: Glow effect not visible

**Solution**: Verify material settings:
- `transparent: true`
- Correct blending mode
- Uniform values in valid range

### Issue: Performance lag

**Solution**:
- Reduce dot count
- Disable antialiasing
- Lower point size
- Implement LOD system

## Testing Checklist

- [ ] Shaders compile without errors
- [ ] Dots render as circles (not squares)
- [ ] Fresnel glow effect visible
- [ ] Atmosphere layer renders correctly
- [ ] Auto-rotation works smoothly
- [ ] Mouse controls responsive
- [ ] Responsive to window resize
- [ ] No memory leaks on cleanup
- [ ] Performance meets targets (60fps desktop)
- [ ] Mobile compatibility verified

## Resources

- **Three.js Docs**: https://threejs.org/docs/
- **GLSL Reference**: https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language
- **Shader Examples**: See `example-usage.js` in this directory

## Next Steps

1. Implement land masking with texture
2. Add data integration for active locations
3. Implement interactive click/hover handlers
4. Add animation presets
5. Create configuration API
6. Write unit tests for shader utilities

---

**Version**: 1.0
**Last Updated**: 2025-10-14
**Tested With**: Three.js r150+
