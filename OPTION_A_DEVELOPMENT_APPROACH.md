# Interactive 3D Globe - Option A: Custom Three.js Implementation

## Project Overview
Build a custom interactive 3D globe from scratch using Three.js, optimized for web-based data dashboards. The globe features a minimalist dot-pattern design showing continents, smooth auto-rotation, mouse-drag interaction, and customizable visual properties.

## Visual Reference
- **Style**: Dark theme with dotted continents (similar to Stripe's globe)
- **Aesthetic**: Apple Maps-style with soft radial gradient edges for 3D depth
- **Pattern**: Dots represent geographic locations forming continent shapes without borders
- **Background**: Supports transparent or solid color backgrounds

## Technical Stack
- **Core**: Three.js (r150+)
- **Language**: JavaScript/TypeScript
- **Rendering**: WebGL via Three.js WebGLRenderer
- **Controls**: OrbitControls for mouse interaction
- **Textures**: PNG/JPG grayscale Earth map for continent masking

## Architecture Overview

### Component Structure
```
Globe System
├── Scene Setup (camera, renderer, lighting)
├── Globe Geometry (sphere with dot particles)
├── Dot Generation System (Fibonacci spiral distribution)
├── Land Masking System (continent detection via texture)
├── Animation Loop (rotation + user interaction)
├── Shader System (edge glow, dot styling)
└── Data Binding Layer (lat/long to active dots)
```

## Development Phases

### Phase 1: Scene Foundation (Priority: CRITICAL)
**Goal**: Set up basic Three.js scene with camera and renderer

**Tasks**:
1. Initialize Three.js scene with WebGLRenderer
2. Set up PerspectiveCamera with proper FOV (45-60°)
3. Configure renderer settings:
   - Alpha: true (for transparency)
   - Antialias: false (performance optimization per Stripe)
   - Canvas size responsive to container
4. Add basic ambient and directional lighting
5. Create base sphere geometry (radius: 100 units, segments: 64)

**Expected Output**: Black canvas with properly initialized WebGL context

**Key Code Pattern**:
```javascript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
  alpha: true, 
  antialias: false 
});
```

### Phase 2: Dot Distribution System (Priority: CRITICAL)
**Goal**: Generate evenly distributed dots across sphere surface using Fibonacci/sunflower spiral

**Algorithm**: Fibonacci Sphere (Golden Angle Spiral)
- Uses golden ratio (φ = 1.618...) for optimal point distribution
- Avoids clustering at poles (unlike lat/long grid)
- Generates N points with consistent spacing

**Tasks**:
1. Implement Fibonacci sphere point generation algorithm
2. Convert spherical coordinates to Cartesian (x, y, z)
3. Generate 15,000-25,000 points for full coverage
4. Store points in BufferGeometry for performance
5. Create point material with size and color properties

**Mathematical Formula**:
```
For i = 0 to N points:
  y = 1 - (i / (N - 1)) * 2  // y from 1 to -1
  radius = sqrt(1 - y²)
  theta = φ * i  // golden angle increment
  x = cos(theta) * radius
  z = sin(theta) * radius
```

**Expected Output**: Sphere covered uniformly with dots

**Key Code Pattern**:
```javascript
const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
for (let i = 0; i < numPoints; i++) {
  const y = 1 - (i / (numPoints - 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = phi * i;
  const x = Math.cos(theta) * radius;
  const z = Math.sin(theta) * radius;
  positions.push(x * globeRadius, y * globeRadius, z * globeRadius);
}
```

### Phase 3: Continent Masking (Priority: CRITICAL)
**Goal**: Only show dots on land masses, hide dots over oceans

**Approach**: Use grayscale Earth texture as a mask
- White pixels = land (show dot)
- Black pixels = ocean (hide dot)
- Sample texture at each dot's lat/long position

**Tasks**:
1. Load grayscale Earth texture (2048x1024 recommended)
2. Use Canvas API to extract pixel data via `getImageData()`
3. For each generated dot:
   - Convert 3D position to lat/long
   - Convert lat/long to UV texture coordinates
   - Sample pixel brightness at UV coordinate
   - Keep dot if brightness > threshold (e.g., 128)
4. Filter out ocean dots before creating geometry
5. Store filtered positions in BufferGeometry

**Coordinate Conversions**:
```javascript
// 3D Cartesian to Lat/Long
lat = Math.asin(y / radius) * (180 / Math.PI);
lon = Math.atan2(z, x) * (180 / Math.PI);

// Lat/Long to UV texture coordinates
u = (lon + 180) / 360;  // 0 to 1
v = (90 - lat) / 180;    // 0 to 1 (flipped)
```

**Expected Output**: Dots only appear on continents, forming recognizable land shapes

**Texture Sources**:
- NASA Visible Earth: https://visibleearth.nasa.gov/
- Natural Earth: https://www.naturalearthdata.com/
- Convert to grayscale using image processing

### Phase 4: Rotation & Controls (Priority: HIGH)
**Goal**: Implement smooth auto-rotation and mouse-drag interaction

**Features**:
- Continuous auto-rotation when idle
- Mouse drag overrides auto-rotation
- Smooth momentum when user releases drag
- Configurable rotation speed

**Tasks**:
1. Add OrbitControls from Three.js examples
2. Configure OrbitControls:
   - `enableDamping: true` (smooth momentum)
   - `dampingFactor: 0.05`
   - `rotateSpeed: 0.5`
   - `enableZoom: false` (optional, per requirements)
   - `enablePan: false`
3. Implement auto-rotation in animation loop:
   - Rotate globe on Y-axis when controls are idle
   - Detect user interaction to pause auto-rotation
4. Add configurable rotation speed property
5. Implement rotation axis configuration (phi, theta)

**Expected Output**: Globe rotates smoothly, responds to mouse drag

**Key Code Pattern**:
```javascript
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
```

### Phase 5: Edge Glow Shader (Priority: MEDIUM)
**Goal**: Add radial gradient fade at globe edges for 3D depth effect (Apple Maps style)

**Approach**: Custom fragment shader or post-processing
- Calculate distance from sphere center in screen space
- Apply opacity gradient: full opacity at center, fade to 0 at edges
- Create soft atmospheric glow effect

**Tasks**:
1. Create custom ShaderMaterial for dots or base sphere
2. Implement fragment shader with fresnel-like effect:
   - Calculate view direction dot normal
   - Apply smoothstep gradient based on angle
3. Add uniforms for customization:
   - Glow color
   - Glow intensity
   - Glow falloff radius
4. Alternative: Use sprite-based particles with texture alpha

**Shader Pseudocode**:
```glsl
// Fresnel-like edge detection
float fresnel = dot(normalize(vNormal), normalize(vViewDir));
float edgeFade = smoothstep(0.0, 1.0, fresnel);
float opacity = mix(u_minOpacity, 1.0, edgeFade);
```

**Expected Output**: Globe edges appear to fade softly, enhancing roundness

### Phase 6: Data Integration (Priority: HIGH)
**Goal**: Enable programmatic control of specific dots via lat/long coordinates

**Features**:
- Mark specific locations as "active" via coordinates
- Change active dot colors
- Animate active dots (pulse, scale, color transitions)
- Support hover and click interactions

**Tasks**:
1. Create data structure mapping lat/long to dot indices
2. Implement coordinate-to-dot lookup function:
   - Input: latitude, longitude
   - Output: nearest dot index
   - Use spatial hash or k-d tree for performance
3. Add color attribute array to BufferGeometry
4. Implement dot state update methods:
   - `setActiveDots(coordinates[])`
   - `updateDotColor(index, color)`
   - `animateDot(index, properties)`
5. Add raycasting for mouse hover/click detection
6. Emit events for user interactions

**Data Structure**:
```javascript
const dotData = {
  positions: Float32Array,  // x, y, z for each dot
  colors: Float32Array,      // r, g, b for each dot
  latLongs: Array,           // [{lat, lon}, ...] for each dot
  states: Array              // [{active, value, ...}, ...] metadata
};
```

**Expected Output**: Ability to highlight specific locations, respond to clicks

### Phase 7: Visual Customization API (Priority: MEDIUM)
**Goal**: Expose configuration API for all visual properties

**Configurable Properties**:
- `backgroundColor`: Scene background color/transparent
- `dotColor`: Default dot color (hex/rgb)
- `activeDotColor`: Active dot highlight color
- `dotSize`: Dot diameter in pixels
- `glowColor`: Edge gradient color
- `glowIntensity`: Edge fade intensity (0-1)
- `rotationSpeed`: Auto-rotation speed (deg/sec)
- `rotationAxis`: {phi, theta} rotation angles
- `scale`: Globe size multiplier

**Tasks**:
1. Create configuration object with defaults
2. Implement property setter methods with validation
3. Update scene in real-time when properties change
4. Support CSS color formats (hex, rgb, rgba)
5. Add scale transform to globe group
6. Persist configuration state

**API Example**:
```javascript
globe.configure({
  backgroundColor: 'transparent',
  dotColor: '#4B9FBF',
  activeDotColor: '#FF6B35',
  glowColor: '#1C1C1E',
  rotationSpeed: 2.0,
  scale: 1.2
});
```

**Expected Output**: All visual properties can be changed dynamically

### Phase 8: Performance Optimization (Priority: HIGH)
**Goal**: Maintain 60fps on target devices (desktop, mobile)

**Optimization Strategies**:
1. Use BufferGeometry (not Geometry) - already done
2. Instance rendering for dots if using meshes
3. Disable antialiasing (per Stripe findings)
4. Implement LOD (Level of Detail):
   - Reduce dot count on lower-end devices
   - Detect GPU capabilities
5. Frustum culling (automatic with Three.js)
6. Pause rendering when tab not visible:
   ```javascript
   document.addEventListener('visibilitychange', () => {
     if (document.hidden) pauseAnimation();
     else resumeAnimation();
   });
   ```
7. Use `PointsMaterial` instead of individual mesh instances
8. Optimize texture sizes (power of 2, compressed)
9. Debounce resize events
10. Memory management (dispose geometries/materials on cleanup)

**Performance Targets**:
- 60fps on desktop (Chrome, Firefox, Safari, Edge)
- 30fps minimum on mobile (iOS Safari, Chrome Android)
- <100ms load time for main scene
- <500ms for all textures

### Phase 9: Testing & Refinement (Priority: MEDIUM)
**Goal**: Ensure cross-browser compatibility and smooth UX

**Test Matrix**:
- Browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Devices: Desktop, tablet, mobile (iOS/Android)
- Interactions: Mouse, touch, trackpad, keyboard
- Edge cases: Slow networks, low-end GPUs, high DPI displays

**Testing Checklist**:
1. Auto-rotation smoothness
2. Mouse drag responsiveness
3. Touch gesture support (pinch, swipe)
4. Resize behavior (responsive)
5. Memory leaks (extended use)
6. Dot visibility on all continents
7. Active dot highlighting accuracy
8. Performance under load (many active dots)

## Implementation Guidelines

### Code Organization
```
project/
├── src/
│   ├── Globe.js              # Main globe class
│   ├── DotGenerator.js       # Fibonacci sphere algorithm
│   ├── TextureSampler.js     # Land mask sampling
│   ├── shaders/
│   │   ├── dot.vert.glsl     # Dot vertex shader
│   │   └── dot.frag.glsl     # Dot fragment shader
│   ├── utils/
│   │   ├── coordinates.js    # Lat/long conversions
│   │   └── colors.js         # Color utilities
│   └── index.js              # Entry point
├── assets/
│   ├── textures/
│   │   └── earth-mask.png    # Grayscale continent mask
│   └── ...
└── examples/
    ├── basic.html
    ├── data-dashboard.html
    └── custom-styling.html
```

### Best Practices
1. **Modularity**: Separate concerns (rendering, data, interaction)
2. **Performance**: Profile regularly, optimize hot paths
3. **Documentation**: JSDoc comments for public APIs
4. **Error Handling**: Graceful fallbacks for WebGL failures
5. **Accessibility**: Keyboard navigation, screen reader support
6. **Responsive**: Handle all viewport sizes
7. **Clean Up**: Dispose Three.js resources properly

### Critical Implementation Details

#### Dot Size Handling
- Use `PointsMaterial` with `sizeAttenuation: false` for consistent size
- Or `sizeAttenuation: true` for depth-based scaling (more realistic)
- Size in pixels vs. world units consideration

#### Coordinate System
- Three.js: Y-up, right-handed coordinate system
- Earth: Z-axis = North Pole, X-axis = 0° lon, Y-axis = 90° lon
- Match orientation to reference images

#### Texture Loading
- Use `TextureLoader` with proper error handling
- Show loading state while textures load
- Consider fallback if texture fails to load

#### Memory Management
```javascript
// Essential cleanup
function dispose() {
  geometry.dispose();
  material.dispose();
  texture.dispose();
  renderer.dispose();
}
```

## Configuration API Specification

### Constructor
```javascript
const globe = new InteractiveGlobe({
  container: document.getElementById('globe-container'),
  width: 800,
  height: 600,
  // ... configuration options
});
```

### Configuration Object
```javascript
{
  // Visual Properties
  backgroundColor: 'transparent',        // 'transparent' | hex | rgb
  dotColor: '#FFFFFF',                   // Default dot color
  dotSize: 1.5,                          // Dot diameter in pixels
  activeDotColor: '#FF6B35',            // Highlighted dot color
  glowColor: '#000000',                  // Edge gradient color
  glowIntensity: 0.5,                    // 0 (none) to 1 (full)
  
  // Rotation Properties
  autoRotate: true,                      // Enable auto-rotation
  rotationSpeed: 1.0,                    // Degrees per second
  phi: 0,                                // Rotation around X-axis (degrees)
  theta: 0,                              // Rotation around Y-axis (degrees)
  
  // Interaction
  enableMouseDrag: true,                 // Allow user drag
  enableZoom: false,                     // Allow zoom in/out
  enablePan: false,                      // Allow pan movement
  
  // Performance
  dotCount: 20000,                       // Number of dots to generate
  antialias: false,                      // WebGL antialiasing
  
  // Data
  activeDots: [],                        // [{lat, lon, color?}, ...]
  onDotClick: (dot) => {},              // Click handler
  onDotHover: (dot) => {},              // Hover handler
  
  // Scale
  scale: 1.0                             // Globe size multiplier
}
```

### Public Methods
```javascript
// Update configuration
globe.configure(options);

// Set active locations
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060, color: '#FF0000' },  // New York
  { lat: 51.5074, lon: -0.1278, color: '#00FF00' }    // London
]);

// Rotation control
globe.setRotation(phi, theta);
globe.rotateToPoint(lat, lon, duration);
globe.startRotation();
globe.stopRotation();

// Visual updates
globe.setDotColor(color);
globe.setBackgroundColor(color);
globe.setScale(multiplier);

// Cleanup
globe.dispose();
```

## Reference Resources

### Essential Libraries
- Three.js Documentation: https://threejs.org/docs/
- OrbitControls: https://threejs.org/docs/#examples/en/controls/OrbitControls

### Algorithm References
- Fibonacci Sphere: https://arxiv.org/abs/0912.4540
- Stripe Globe Article: https://stripe.com/blog/globe
- Book of Shaders: https://thebookofshaders.com/

### Texture Resources
- NASA Visible Earth: https://visibleearth.nasa.gov/
- Natural Earth Data: https://www.naturalearthdata.com/

## Success Criteria

### Functional Requirements ✓
- [ ] Globe renders with dots forming continents
- [ ] Smooth auto-rotation (60fps desktop)
- [ ] Mouse drag interaction works
- [ ] Active dots can be set via lat/long
- [ ] All visual properties are configurable
- [ ] Responsive to container size changes

### Visual Requirements ✓
- [ ] Matches reference aesthetic (dark, minimalist)
- [ ] Soft edge glow effect present
- [ ] Dots evenly distributed
- [ ] Continents clearly recognizable
- [ ] No visual glitches or artifacts

### Performance Requirements ✓
- [ ] 60fps on desktop browsers
- [ ] 30fps minimum on mobile devices
- [ ] <500ms initial load time
- [ ] <50MB memory footprint
- [ ] Smooth interaction (no lag)

## Estimated Timeline
- Phase 1: 4 hours (Scene setup)
- Phase 2: 6 hours (Dot generation)
- Phase 3: 8 hours (Land masking)
- Phase 4: 4 hours (Rotation/controls)
- Phase 5: 6 hours (Edge glow shader)
- Phase 6: 10 hours (Data integration)
- Phase 7: 6 hours (Customization API)
- Phase 8: 8 hours (Performance optimization)
- Phase 9: 8 hours (Testing/refinement)

**Total: ~60 hours** (1.5 weeks for experienced Three.js developer)

## Final Deliverables
1. Globe component library (ES6 module)
2. Comprehensive API documentation
3. Example implementations (3-5 demos)
4. Performance benchmarks
5. Browser compatibility matrix
6. Deployment guide

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-14  
**Author**: Development Team  
**Status**: Ready for Implementation
