# Three.js Interactive Globe Implementation Research Report

**Date**: 2025-10-14
**Research Focus**: Three.js implementation details for building an interactive 3D globe
**Target Version**: Three.js r150+

---

## Executive Summary

This report provides comprehensive research on implementing an interactive 3D globe using Three.js. The research covers scene setup, efficient particle rendering, camera controls, texture loading, custom shaders, and performance optimization best practices. All information is based on current Three.js documentation and community best practices as of 2024.

**Note**: Context7 MCP server is not yet configured in this project. This research was conducted using web search as a fallback method. To enable Context7 for future research, add `.mcp.json` configuration as documented in `CONTEXT7_RESEARCH_RULES.md`.

---

## 1. Basic Three.js Scene Setup

### Core Components

A Three.js scene requires three essential components:

1. **Scene**: Container for all 3D objects
2. **Camera**: Viewpoint into the 3D world
3. **Renderer**: Renders the scene from the camera's perspective

### WebGLRenderer Configuration

```javascript
// Basic renderer setup with transparency support
const renderer = new THREE.WebGLRenderer({
  alpha: true,           // Enable transparency
  antialias: true,       // Smooth edges
  powerPreference: 'high-performance' // GPU optimization
});

// Essential renderer settings
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
renderer.autoClear = false; // Required for proper alpha blending

// Append to DOM
document.body.appendChild(renderer.domElement);
```

### PerspectiveCamera Configuration

```javascript
// Parameters: FOV, aspect ratio, near clipping plane, far clipping plane
const camera = new THREE.PerspectiveCamera(
  75,                                    // Field of view (degrees)
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1,                                   // Near clipping plane
  1000                                   // Far clipping plane
);

camera.position.z = 5; // Position camera
```

### Performance Considerations

**Far Clipping Plane Optimization**: Reducing the far clipping distance can significantly improve performance:
- Default: 1000 units
- Optimized: 700-800 units
- Impact: Can gain 5-10 FPS depending on scene complexity

**Single WebGL Context**: Create one renderer instance and reuse it throughout your application:
```javascript
// ✅ GOOD: Single renderer, switch scenes
const renderer = new THREE.WebGLRenderer();
renderer.render(scene1, camera);
// Later...
renderer.render(scene2, camera);

// ❌ BAD: Multiple renderers (wastes GPU resources)
const renderer1 = new THREE.WebGLRenderer();
const renderer2 = new THREE.WebGLRenderer();
```

### Transparent Background Setup

For embedding Three.js in existing web pages:

```javascript
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x000000, 0); // Transparent clear color
scene.background = null; // No background
```

---

## 2. Efficient Particle Rendering with BufferGeometry

### Why BufferGeometry?

BufferGeometry provides significant performance benefits for particle systems:
- Reduces GPU memory transfer overhead
- Efficiently stores vertex positions, colors, and custom attributes
- Essential for rendering thousands of particles at 60 FPS

### Basic Particle System Setup

```javascript
// Create geometry
const geometry = new THREE.BufferGeometry();
const particleCount = 10000;

// Create position array (x, y, z for each particle)
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 10;     // x
  positions[i * 3 + 1] = (Math.random() - 0.5) * 10; // y
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
}

// Add position attribute to geometry
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Create material
const material = new THREE.PointsMaterial({
  size: 0.05,
  color: 0xffffff,
  transparent: true,
  opacity: 0.8,
  sizeAttenuation: true // Particles get smaller with distance
});

// Create particle system
const particles = new THREE.Points(geometry, material);
scene.add(particles);
```

### Advanced: Particle Distribution on Sphere

For a globe effect, distribute particles on a sphere surface:

```javascript
const radius = 2;
const particleCount = 5000;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  // Fibonacci sphere algorithm for even distribution
  const phi = Math.acos(-1 + (2 * i) / particleCount);
  const theta = Math.sqrt(particleCount * Math.PI) * phi;

  const x = radius * Math.cos(theta) * Math.sin(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(phi);

  positions[i * 3] = x;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = z;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
```

### Adding Custom Attributes

```javascript
// Add colors for each particle
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  colors[i * 3] = Math.random();     // r
  colors[i * 3 + 1] = Math.random(); // g
  colors[i * 3 + 2] = Math.random(); // b
}

geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Update material to use vertex colors
material.vertexColors = true;
```

### Animating Particles

```javascript
function animate() {
  requestAnimationFrame(animate);

  // Access position attribute
  const positions = particles.geometry.attributes.position.array;

  // Update positions
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
  }

  // Mark attribute as needing update
  particles.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}
```

### Performance Best Practices

**For 10,000+ Particles**:
- Use GPU-based animation via vertex shaders (see Section 5)
- Avoid updating position arrays on CPU every frame
- Use `Float32Array` for all attribute arrays
- Enable frustum culling: `particles.frustumCulled = true`

**Texture-based Particles**:
```javascript
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('/particle.png');

const material = new THREE.PointsMaterial({
  size: 0.1,
  map: particleTexture,
  transparent: true,
  alphaTest: 0.5, // Discard fragments below this alpha value
  depthWrite: false // Prevents z-fighting
});
```

---

## 3. OrbitControls Configuration

### Installation and Import

```javascript
// Three.js r150+ uses ES6 module imports
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
```

### Basic Setup

```javascript
const controls = new OrbitControls(camera, renderer.domElement);

// Basic configuration
controls.enableDamping = true;     // Smooth inertia
controls.dampingFactor = 0.05;     // Damping strength (0-1)
controls.enableZoom = true;        // Allow zooming
controls.enablePan = true;         // Allow panning
controls.enableRotate = true;      // Allow rotation
```

### Auto-Rotation Configuration

```javascript
controls.autoRotate = true;        // Enable auto-rotation
controls.autoRotateSpeed = 2.0;    // Rotation speed (degrees per second at 60fps)

// Negative values rotate in opposite direction
controls.autoRotateSpeed = -1.0;   // Counter-clockwise rotation
```

### Damping Configuration

**Critical**: Damping requires `controls.update()` in your animation loop:

```javascript
function animate() {
  requestAnimationFrame(animate);

  // Required for damping and auto-rotation
  controls.update();

  renderer.render(scene, camera);
}

animate();
```

### Advanced Configuration

```javascript
// Limit rotation angles
controls.minPolarAngle = Math.PI / 4;    // Minimum vertical angle
controls.maxPolarAngle = Math.PI * 3/4;  // Maximum vertical angle
controls.minAzimuthAngle = -Math.PI / 2; // Minimum horizontal angle
controls.maxAzimuthAngle = Math.PI / 2;  // Maximum horizontal angle

// Zoom limits
controls.minDistance = 2;  // Closest zoom
controls.maxDistance = 10; // Farthest zoom

// Pan speed
controls.panSpeed = 0.5;

// Rotation speed (user interaction)
controls.rotateSpeed = 0.5;

// Zoom speed
controls.zoomSpeed = 0.5;

// Target position (what the camera looks at)
controls.target.set(0, 0, 0);
```

### Smooth Camera Transitions

```javascript
// Animate camera to new position
function animateCameraTo(targetPosition, targetLookAt) {
  const startPosition = camera.position.clone();
  const startLookAt = controls.target.clone();
  const duration = 1000; // ms
  const startTime = Date.now();

  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-in-out function
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    camera.position.lerpVectors(startPosition, targetPosition, eased);
    controls.target.lerpVectors(startLookAt, targetLookAt, eased);
    controls.update();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  update();
}
```

### Event Listeners

```javascript
// Detect when user starts/stops interacting
controls.addEventListener('start', () => {
  console.log('User started interacting');
});

controls.addEventListener('change', () => {
  console.log('Camera position changed');
});

controls.addEventListener('end', () => {
  console.log('User stopped interacting');
});
```

---

## 4. Texture Loading and Pixel Sampling

### TextureLoader Basics

```javascript
const textureLoader = new THREE.TextureLoader();

// Simple loading
const texture = textureLoader.load('/path/to/texture.jpg');

// Loading with callbacks
textureLoader.load(
  '/path/to/texture.jpg',

  // onLoad callback
  (texture) => {
    console.log('Texture loaded:', texture);
    material.map = texture;
    material.needsUpdate = true;
  },

  // onProgress callback
  (progress) => {
    console.log('Loading:', (progress.loaded / progress.total) * 100 + '%');
  },

  // onError callback
  (error) => {
    console.error('Error loading texture:', error);
  }
);
```

### Loading Multiple Textures

```javascript
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
  console.log(`Started loading: ${url}`);
};

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  console.log(`Loading: ${itemsLoaded} of ${itemsTotal}`);
};

loadingManager.onLoad = () => {
  console.log('All textures loaded');
  startApplication();
};

const textureLoader = new THREE.TextureLoader(loadingManager);
const texture1 = textureLoader.load('/texture1.jpg');
const texture2 = textureLoader.load('/texture2.jpg');
const texture3 = textureLoader.load('/texture3.jpg');
```

### Sampling Pixel Data from Texture

To mask particles based on texture data (e.g., only show particles on land masses):

```javascript
// Method 1: Using Canvas to read pixel data
function getPixelDataFromTexture(texture) {
  return new Promise((resolve) => {
    const image = texture.image;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    // Get all pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    resolve(imageData);
  });
}

// Usage
const texture = textureLoader.load('/earth-map.jpg', async (loadedTexture) => {
  const imageData = await getPixelDataFromTexture(loadedTexture);

  // Sample pixel at specific UV coordinate
  function getPixelAtUV(u, v) {
    const x = Math.floor(u * imageData.width);
    const y = Math.floor(v * imageData.height);
    const index = (y * imageData.width + x) * 4;

    return {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2],
      a: imageData.data[index + 3]
    };
  }

  // Use for particle masking
  createMaskedParticles(imageData, getPixelAtUV);
});
```

### Globe Texture Masking Example

```javascript
function createMaskedGlobeParticles(imageData, particleCount, radius) {
  const positions = [];
  const colors = [];

  let attempts = 0;
  const maxAttempts = particleCount * 10;

  while (positions.length / 3 < particleCount && attempts < maxAttempts) {
    attempts++;

    // Random point on sphere
    const phi = Math.acos(-1 + (2 * Math.random()));
    const theta = Math.random() * Math.PI * 2;

    // Convert to UV coordinates (0-1)
    const u = theta / (Math.PI * 2);
    const v = phi / Math.PI;

    // Sample texture
    const x = Math.floor(u * imageData.width);
    const y = Math.floor(v * imageData.height);
    const index = (y * imageData.width + x) * 4;

    const r = imageData.data[index];
    const g = imageData.data[index + 1];
    const b = imageData.data[index + 2];

    // Check if pixel is land (adjust threshold based on your map)
    const brightness = (r + g + b) / 3;
    if (brightness > 50) { // Only show particles on brighter areas (land)
      // Convert spherical to Cartesian
      const px = radius * Math.cos(theta) * Math.sin(phi);
      const py = radius * Math.sin(theta) * Math.sin(phi);
      const pz = radius * Math.cos(phi);

      positions.push(px, py, pz);
      colors.push(r / 255, g / 255, b / 255);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  return new THREE.Points(geometry, material);
}
```

### Texture Configuration for Performance

```javascript
// Configure texture properties
texture.minFilter = THREE.LinearFilter;  // Faster than default
texture.magFilter = THREE.LinearFilter;
texture.generateMipmaps = false;         // Skip if not needed

// For pixel-perfect rendering (pixel art)
texture.minFilter = THREE.NearestFilter;
texture.magFilter = THREE.NearestFilter;

// Optimize texture size
texture.encoding = THREE.sRGBEncoding;   // For color textures
texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Sharper at angles
```

### Data Texture (Programmatic Textures)

```javascript
// Create texture from raw data
const size = 512;
const data = new Uint8Array(size * size * 4);

for (let i = 0; i < size * size; i++) {
  const stride = i * 4;
  data[stride] = Math.random() * 255;     // R
  data[stride + 1] = Math.random() * 255; // G
  data[stride + 2] = Math.random() * 255; // B
  data[stride + 3] = 255;                 // A
}

const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
texture.needsUpdate = true;
```

---

## 5. Custom Shaders with ShaderMaterial

### ShaderMaterial Basics

ShaderMaterial allows complete control over the rendering pipeline using GLSL (OpenGL Shading Language).

```javascript
const material = new THREE.ShaderMaterial({
  uniforms: {
    // Values passed from JavaScript to shaders
    time: { value: 0.0 },
    color: { value: new THREE.Color(0x00ff00) }
  },

  vertexShader: `
    // Vertex shader code
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    // Fragment shader code
    uniform vec3 color;
    varying vec2 vUv;

    void main() {
      gl_FragColor = vec4(color, 1.0);
    }
  `
});
```

### Edge Glow Effect (Fresnel)

The Fresnel effect creates a glow around the edges of spheres:

```javascript
const glowMaterial = new THREE.ShaderMaterial({
  uniforms: {
    glowColor: { value: new THREE.Color(0x00ffff) },
    viewVector: { value: camera.position }
  },

  vertexShader: `
    uniform vec3 viewVector;
    varying float intensity;

    void main() {
      vec3 vNormal = normalize(normalMatrix * normal);
      vec3 vNormel = normalize(normalMatrix * viewVector);
      intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 glowColor;
    varying float intensity;

    void main() {
      vec3 glow = glowColor * intensity;
      gl_FragColor = vec4(glow, 1.0);
    }
  `,

  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true
});

// Create glow sphere (slightly larger than main sphere)
const glowGeometry = new THREE.SphereGeometry(2.1, 32, 32);
const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glowMesh);
```

### Animated Glow with Time Uniform

```javascript
const glowMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    glowColor: { value: new THREE.Color(0x00ffff) },
    intensity: { value: 1.5 }
  },

  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec3 glowColor;
    uniform float intensity;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Calculate view direction
      vec3 viewDirection = normalize(cameraPosition - vPosition);

      // Fresnel effect
      float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);

      // Pulse effect
      float pulse = 0.5 + 0.5 * sin(time * 2.0);

      // Combine effects
      vec3 glow = glowColor * fresnel * intensity * pulse;

      gl_FragColor = vec4(glow, fresnel);
    }
  `,

  side: THREE.FrontSide,
  blending: THREE.AdditiveBlending,
  transparent: true
});

// In animation loop
function animate() {
  glowMaterial.uniforms.time.value += 0.01;
  // ... rest of animation
}
```

### Point Shader for Custom Particle Effects

```javascript
const particleMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    size: { value: 10.0 },
    texture: { value: particleTexture }
  },

  vertexShader: `
    uniform float size;
    uniform float time;
    attribute float customSize;
    attribute vec3 customColor;
    varying vec3 vColor;

    void main() {
      vColor = customColor;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

      // Particle size based on distance and custom attribute
      gl_PointSize = size * customSize * (300.0 / -mvPosition.z);

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform sampler2D texture;
    varying vec3 vColor;

    void main() {
      // Use point coordinate for texture sampling
      vec4 texColor = texture2D(texture, gl_PointCoord);

      // Apply custom color
      gl_FragColor = vec4(vColor, 1.0) * texColor;

      // Discard transparent pixels
      if (gl_FragColor.a < 0.1) discard;
    }
  `,

  transparent: true,
  depthWrite: false
});

// Add custom attributes to geometry
const sizes = new Float32Array(particleCount);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  sizes[i] = Math.random();
  colors[i * 3] = Math.random();
  colors[i * 3 + 1] = Math.random();
  colors[i * 3 + 2] = Math.random();
}

geometry.setAttribute('customSize', new THREE.BufferAttribute(sizes, 1));
geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
```

### Atmosphere Shader for Globe

```javascript
const atmosphereMaterial = new THREE.ShaderMaterial({
  uniforms: {
    atmosphereColor: { value: new THREE.Color(0x4488ff) },
    atmosphereStrength: { value: 1.5 }
  },

  vertexShader: `
    varying vec3 vNormal;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 atmosphereColor;
    uniform float atmosphereStrength;
    varying vec3 vNormal;

    void main() {
      float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      gl_FragColor = vec4(atmosphereColor, 1.0) * intensity * atmosphereStrength;
    }
  `,

  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true
});
```

### Shader Best Practices

1. **Minimize Calculations**: Move static calculations to vertex shader or uniforms
2. **Use Built-in Variables**: Leverage Three.js built-ins like `projectionMatrix`, `modelViewMatrix`
3. **Optimize Texture Lookups**: Minimize texture reads in fragment shader
4. **Precision**: Use `precision mediump float;` for mobile optimization
5. **Discard vs. Alpha**: Use `discard` to skip fragments entirely

---

## 6. Performance Optimization Best Practices

### BufferGeometry Optimization

```javascript
// ✅ GOOD: Reuse geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
for (let i = 0; i < 100; i++) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(i, 0, 0);
  scene.add(mesh);
}

// ❌ BAD: Create new geometry each time
for (let i = 0; i < 100; i++) {
  const geometry = new THREE.BoxGeometry(1, 1, 1); // Wasteful!
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}
```

### Proper Disposal

```javascript
// Dispose of resources when no longer needed
function disposeObject(object) {
  if (object.geometry) {
    object.geometry.dispose();
  }

  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach(material => disposeMaterial(material));
    } else {
      disposeMaterial(object.material);
    }
  }
}

function disposeMaterial(material) {
  // Dispose textures
  if (material.map) material.map.dispose();
  if (material.lightMap) material.lightMap.dispose();
  if (material.bumpMap) material.bumpMap.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.specularMap) material.specularMap.dispose();
  if (material.envMap) material.envMap.dispose();

  // Dispose material
  material.dispose();
}

// Remove from scene and dispose
scene.remove(mesh);
disposeObject(mesh);
```

### Mesh Instancing for Identical Objects

For rendering many identical objects:

```javascript
const geometry = new THREE.SphereGeometry(0.1, 16, 16);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

// Create instanced mesh (renders 10000 spheres in one draw call!)
const instancedMesh = new THREE.InstancedMesh(geometry, material, 10000);

// Set position for each instance
const matrix = new THREE.Matrix4();
for (let i = 0; i < 10000; i++) {
  matrix.setPosition(
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
    Math.random() * 100 - 50
  );
  instancedMesh.setMatrixAt(i, matrix);
}

instancedMesh.instanceMatrix.needsUpdate = true;
scene.add(instancedMesh);
```

### Efficient Animation Loop

```javascript
let lastTime = 0;

function animate(currentTime) {
  requestAnimationFrame(animate);

  // Delta time for frame-rate independent animation
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // Only update if delta is reasonable (tab wasn't inactive)
  if (deltaTime < 100) {
    // Update logic here
    controls.update();
    renderer.render(scene, camera);
  }
}

animate(0);
```

### Level of Detail (LOD)

```javascript
const lod = new THREE.LOD();

// High detail (close)
const geometryHigh = new THREE.SphereGeometry(1, 32, 32);
const meshHigh = new THREE.Mesh(geometryHigh, material);
lod.addLevel(meshHigh, 0);

// Medium detail
const geometryMed = new THREE.SphereGeometry(1, 16, 16);
const meshMed = new THREE.Mesh(geometryMed, material);
lod.addLevel(meshMed, 50);

// Low detail (far)
const geometryLow = new THREE.SphereGeometry(1, 8, 8);
const meshLow = new THREE.Mesh(geometryLow, material);
lod.addLevel(meshLow, 100);

scene.add(lod);
```

### Frustum Culling

```javascript
// Ensure frustum culling is enabled (it is by default)
mesh.frustumCulled = true;

// For large scenes, consider bounding boxes
geometry.computeBoundingBox();
geometry.computeBoundingSphere();
```

### Texture Optimization

```javascript
// Compress textures
renderer.capabilities.getMaxAnisotropy(); // Check hardware limits

// Use appropriate texture sizes (power of 2)
// 512x512, 1024x1024, 2048x2048

// Compress with appropriate formats
texture.format = THREE.RGBFormat; // No alpha = smaller
texture.generateMipmaps = true;   // Better performance when zoomed out

// Use texture atlases instead of multiple textures
// Combine multiple small textures into one large texture
```

### Draw Call Optimization

**Target**: Keep draw calls under 1000, ideally under 100 for mobile

```javascript
// Check draw call count
console.log(renderer.info.render.calls);

// Techniques to reduce draw calls:
// 1. Merge geometries
const geometries = [geo1, geo2, geo3];
const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);

// 2. Use instancing for identical objects
// 3. Use texture atlases
// 4. Reduce number of materials
```

### Monitor Performance

```javascript
// Built-in stats
console.log(renderer.info);
// Shows:
// - render.calls: Number of draw calls
// - render.triangles: Number of triangles
// - memory.geometries: Number of geometry objects
// - memory.textures: Number of textures

// Use Stats.js for real-time monitoring
import Stats from 'three/examples/jsm/libs/stats.module.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  stats.begin();

  // Your render code
  renderer.render(scene, camera);

  stats.end();
  requestAnimationFrame(animate);
}
```

### Memory Management Checklist

1. **Dispose on Removal**: Always dispose geometries, materials, and textures when removing objects
2. **Reuse Resources**: Share geometries and materials between objects when possible
3. **Limit Texture Size**: Use appropriate texture dimensions (don't use 4K textures for small objects)
4. **Use Object Pooling**: Reuse objects instead of creating/destroying constantly
5. **Monitor Memory**: Use browser DevTools memory profiler
6. **Limit Scene Complexity**: Keep polygon count reasonable (< 1M triangles for smooth 60fps)

### Three.js r150+ Specific Notes

1. **WebGLRenderer Changes**:
   - Improved shadow map performance
   - Better memory management for large scenes

2. **Geometry API**:
   - `THREE.Geometry` is fully deprecated - use `BufferGeometry` exclusively
   - Use `BufferGeometryUtils.mergeGeometries()` instead of `GeometryUtils.merge()`

3. **Material Updates**:
   - Physical materials now use better PBR (Physically Based Rendering)
   - Improved shader compilation caching

4. **Module Imports**:
   - Always use ES6 imports: `import * as THREE from 'three';`
   - Controls and utilities: `import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';`

---

## Complete Globe Implementation Example

```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class InteractiveGlobe {
  constructor(container) {
    this.container = container;
    this.init();
    this.createGlobe();
    this.createParticles();
    this.createAtmosphere();
    this.animate();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 10;

    // Handle resize
    window.addEventListener('resize', () => this.onResize());
  }

  createGlobe() {
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    const texture = textureLoader.load('/earth-texture.jpg');

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.1
    });

    this.globe = new THREE.Mesh(geometry, material);
    this.scene.add(this.globe);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);
  }

  createParticles() {
    const particleCount = 5000;
    const radius = 2.05;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createAtmosphere() {
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x0088ff) }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor, 1.0) * intensity * 1.5;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const glowGeometry = new THREE.SphereGeometry(2.3, 32, 32);
    this.atmosphere = new THREE.Mesh(glowGeometry, glowMaterial);
    this.scene.add(this.atmosphere);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.controls.update();

    // Rotate particles slightly
    if (this.particles) {
      this.particles.rotation.y += 0.0002;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  dispose() {
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    this.renderer.dispose();
    this.controls.dispose();
  }
}

// Usage
const container = document.getElementById('globe-container');
const globe = new InteractiveGlobe(container);
```

---

## Key Takeaways

### Performance Hierarchy (Impact on FPS)
1. **Highest Impact**: Number of draw calls, polygon count
2. **High Impact**: Texture size and count, shader complexity
3. **Medium Impact**: Shadow rendering, post-processing effects
4. **Low Impact**: Object count (if using instancing), simple animations

### Three.js r150+ Modern Patterns
- Use `BufferGeometry` exclusively
- Leverage ES6 module imports
- Implement proper disposal patterns
- Use instancing for repeated objects
- Optimize with LOD for distant objects
- Monitor with `renderer.info`

### Interactive Globe Specific
- Fibonacci sphere for even particle distribution
- Fresnel shaders for atmospheric glow
- Texture-based masking for realistic particle placement
- OrbitControls with damping for smooth interaction
- InstancedMesh for thousands of identical markers

---

## Next Steps

1. **Setup Context7**: Configure `.mcp.json` for future research (see `CONTEXT7_RESEARCH_RULES.md`)
2. **Prototype**: Start with basic scene setup and add features incrementally
3. **Test Performance**: Monitor FPS and draw calls during development
4. **Iterate**: Optimize based on target device performance
5. **Enhance**: Add interactions, animations, and visual effects

---

## Additional Resources

- Three.js Official Docs: https://threejs.org/docs/
- Three.js Examples: https://threejs.org/examples/
- Discover Three.js (Tutorial): https://discoverthreejs.com/
- Three.js Journey: https://threejs-journey.com/
- Shader Book: https://thebookofshaders.com/

---

**Report Generated**: 2025-10-14
**Research Method**: Web Search (Context7 not yet configured)
**Target Implementation**: Interactive 3D Globe with Three.js r150+
