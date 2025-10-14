# Globe.js - Interactive 3D Globe Component

## Overview

`Globe.js` is the main class for creating interactive 3D globes using Three.js. It integrates all phases of the globe implementation including scene setup, dot generation, continent masking, rotation controls, data integration, and visual customization.

## Features

### Phase 1: Scene Foundation
- Three.js scene initialization with WebGLRenderer
- PerspectiveCamera setup (FOV 45-60°)
- Configurable renderer: alpha and antialias support
- Ambient and directional lighting
- Responsive canvas that adapts to container size

### Phase 2: Dot Distribution
- Fibonacci sphere algorithm for even dot distribution
- Uses golden angle spiral method
- Configurable dot count (recommended 15,000-25,000)
- BufferGeometry and PointsMaterial for performance

### Phase 3: Continent Masking
- Texture-based land/ocean detection
- Grayscale Earth texture sampling
- Filters dots to only show on continents
- Coordinate conversion (3D ↔ lat/long ↔ UV)

### Phase 4: Rotation & Controls
- OrbitControls integration from Three.js
- Smooth auto-rotation with configurable speed
- Mouse drag interaction with damping
- Pause rotation on user interaction
- Configurable rotation axis (phi, theta)

### Phase 6: Data Integration
- Map lat/long coordinates to dot indices
- Dynamic dot color updates
- `setActiveDots()` API for highlighting locations
- Raycasting for mouse hover/click detection
- Event emission for interactions

### Phase 7: Visual Customization
- Comprehensive configuration API
- Properties: backgroundColor, dotColor, activeDotColor, dotSize, glowColor, glowIntensity, rotationSpeed, scale
- Real-time property updates via `configure()` method
- CSS color format support (hex, rgb, rgba)

### Phase 8: Performance Optimization
- BufferGeometry for efficient rendering
- Visibility change detection (pauses when tab hidden)
- Proper resource disposal for memory management
- Debounced resize events
- 60fps target on desktop, 30fps minimum on mobile

## Installation

```javascript
// Import the Globe class
import { Globe } from './src/Globe.js';

// Or from the main index
import { Globe } from './src/index.js';
```

## Basic Usage

### Simple Example

```javascript
// Create a container element
const container = document.getElementById('globe-container');

// Initialize the globe
const globe = new Globe({
  container: container,
  dotColor: '#FFFFFF',
  dotSize: 1.5,
  autoRotate: true,
  rotationSpeed: 1.0
});

// Initialize (async - loads textures if provided)
await globe.init();

// The globe is now rendering!
```

### With Continent Masking

```javascript
const globe = new Globe({
  container: document.getElementById('globe-container'),
  dotColor: '#4B9FBF',
  activeDotColor: '#FF6B35',
  dotCount: 20000
});

// Initialize with texture for continent masking
await globe.init('/assets/textures/earth-mask.png');
```

### Highlighting Locations

```javascript
// Highlight specific cities
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060 },  // New York
  { lat: 51.5074, lon: -0.1278 },   // London
  { lat: 35.6762, lon: 139.6503 }   // Tokyo
]);

// Highlight with custom colors
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060, color: '#FF0000' },  // New York (red)
  { lat: 51.5074, lon: -0.1278, color: '#00FF00' }    // London (green)
]);
```

## Constructor

```javascript
const globe = new Globe(options);
```

### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `container` | `HTMLElement` | **required** | DOM element to render the globe |
| `width` | `number` | container width | Canvas width in pixels |
| `height` | `number` | container height | Canvas height in pixels |
| `backgroundColor` | `string\|number` | `'transparent'` | Scene background color |
| `dotColor` | `string\|number` | `'#FFFFFF'` | Default dot color |
| `dotSize` | `number` | `1.5` | Dot size in pixels |
| `activeDotColor` | `string\|number` | `'#FF6B35'` | Active dot highlight color |
| `glowColor` | `string\|number` | `'#000000'` | Edge glow color |
| `glowIntensity` | `number` | `0.5` | Glow intensity (0-1) |
| `autoRotate` | `boolean` | `true` | Enable auto-rotation |
| `rotationSpeed` | `number` | `1.0` | Rotation speed (degrees/second) |
| `phi` | `number` | `0` | Initial rotation around X-axis (degrees) |
| `theta` | `number` | `0` | Initial rotation around Y-axis (degrees) |
| `enableMouseDrag` | `boolean` | `true` | Allow mouse drag interaction |
| `enableZoom` | `boolean` | `false` | Allow zoom control |
| `enablePan` | `boolean` | `false` | Allow pan control |
| `dotCount` | `number` | `20000` | Number of dots to generate |
| `antialias` | `boolean` | `false` | WebGL antialiasing |
| `scale` | `number` | `1.0` | Globe size multiplier |
| `texturePath` | `string` | `undefined` | Path to Earth mask texture |
| `onDotClick` | `Function` | `undefined` | Click handler `(dot) => {}` |
| `onDotHover` | `Function` | `undefined` | Hover handler `(dot) => {}` |
| `activeDots` | `Array` | `[]` | Initial active dots |

## Public Methods

### init(texturePath)

Initializes the globe with optional texture path for continent masking.

```javascript
await globe.init('/assets/earth-mask.png');
```

**Parameters:**
- `texturePath` (string, optional): Path to grayscale Earth texture

**Returns:** `Promise<void>`

---

### configure(options)

Updates globe configuration in real-time.

```javascript
globe.configure({
  dotColor: '#00FF00',
  rotationSpeed: 2.0,
  scale: 1.5,
  autoRotate: false
});
```

**Parameters:**
- `options` (object): Configuration options to update

---

### setActiveDots(coordinates)

Highlights specific locations on the globe.

```javascript
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060, color: '#FF0000' },
  { lat: 51.5074, lon: -0.1278 }
]);
```

**Parameters:**
- `coordinates` (Array): Array of `{lat, lon, color?}` objects

---

### updateDotColor(index, color)

Updates the color of a specific dot by index.

```javascript
globe.updateDotColor(100, '#FF0000');
```

**Parameters:**
- `index` (number): Dot index
- `color` (string|number|THREE.Color): New color

---

### setRotation(phi, theta)

Sets the globe rotation angles.

```javascript
globe.setRotation(15, 30);  // 15° around X, 30° around Y
```

**Parameters:**
- `phi` (number): Rotation around X-axis (degrees)
- `theta` (number): Rotation around Y-axis (degrees)

---

### startRotation()

Starts auto-rotation.

```javascript
globe.startRotation();
```

---

### stopRotation()

Stops auto-rotation.

```javascript
globe.stopRotation();
```

---

### start()

Starts the animation loop.

```javascript
globe.start();
```

---

### stop()

Stops the animation loop.

```javascript
globe.stop();
```

---

### setBackgroundColor(color)

Sets the scene background color.

```javascript
globe.setBackgroundColor('#000000');
globe.setBackgroundColor('transparent');
```

**Parameters:**
- `color` (string|number): New background color

---

### setDotColor(color)

Sets the default color for all dots.

```javascript
globe.setDotColor('#FFFFFF');
```

**Parameters:**
- `color` (string|number): New dot color

---

### setScale(scale)

Sets the globe scale multiplier.

```javascript
globe.setScale(1.5);  // 150% of original size
```

**Parameters:**
- `scale` (number): Scale multiplier

---

### dispose()

Cleans up all resources and removes event listeners.

```javascript
globe.dispose();
```

**Important:** Always call `dispose()` when you're done with the globe to prevent memory leaks.

## Event Handlers

### onDotClick

Called when a dot is clicked.

```javascript
const globe = new Globe({
  container,
  onDotClick: (dot) => {
    if (dot) {
      console.log(`Clicked at: ${dot.lat.toFixed(2)}°, ${dot.lon.toFixed(2)}°`);
      console.log(`Dot index: ${dot.index}`);
    }
  }
});
```

**Callback Parameters:**
- `dot` (object|null): Dot information or null if clicked elsewhere
  - `index` (number): Dot index
  - `lat` (number): Latitude in degrees
  - `lon` (number): Longitude in degrees
  - `color` (object): Current color `{r, g, b}`

### onDotHover

Called when mouse hovers over a dot.

```javascript
const globe = new Globe({
  container,
  onDotHover: (dot) => {
    if (dot) {
      console.log(`Hovering: ${dot.lat.toFixed(2)}°, ${dot.lon.toFixed(2)}°`);
    } else {
      console.log('Not hovering over any dot');
    }
  }
});
```

**Callback Parameters:**
- `dot` (object|null): Dot information or null if not hovering

## Complete Example

```javascript
import { Globe } from './src/Globe.js';

// Create container
const container = document.getElementById('globe-container');

// Initialize globe with full configuration
const globe = new Globe({
  container: container,
  width: 800,
  height: 600,

  // Visual properties
  backgroundColor: '#0a1929',
  dotColor: '#4B9FBF',
  dotSize: 1.5,
  activeDotColor: '#FF6B35',
  glowColor: '#1C1C1E',
  glowIntensity: 0.5,

  // Rotation properties
  autoRotate: true,
  rotationSpeed: 1.0,
  phi: 15,
  theta: 30,

  // Interaction
  enableMouseDrag: true,
  enableZoom: false,
  enablePan: false,

  // Performance
  dotCount: 20000,
  antialias: false,

  // Scale
  scale: 1.2,

  // Event handlers
  onDotClick: (dot) => {
    if (dot) {
      console.log('Clicked:', dot.lat, dot.lon);
    }
  },
  onDotHover: (dot) => {
    if (dot) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  }
});

// Initialize with continent masking
await globe.init('/assets/textures/earth-mask.png');

// Highlight major cities
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060, color: '#FF0000' },  // New York
  { lat: 51.5074, lon: -0.1278, color: '#00FF00' },   // London
  { lat: 35.6762, lon: 139.6503, color: '#0000FF' }   // Tokyo
]);

// Update configuration dynamically
setTimeout(() => {
  globe.configure({
    rotationSpeed: 2.0,
    dotColor: '#FFFFFF'
  });
}, 5000);

// Cleanup when done
window.addEventListener('beforeunload', () => {
  globe.dispose();
});
```

## Performance Considerations

### Recommended Settings

**Desktop (High Performance):**
```javascript
{
  dotCount: 25000,
  antialias: false,
  dotSize: 1.5
}
```

**Mobile (Optimized):**
```javascript
{
  dotCount: 15000,
  antialias: false,
  dotSize: 2.0
}
```

### Memory Management

Always call `dispose()` when the globe is no longer needed:

```javascript
// Before removing component
globe.dispose();

// Before creating a new globe in the same container
if (globe) {
  globe.dispose();
}
globe = new Globe({ container });
```

### Performance Features

1. **Automatic Pause:** Animation pauses when browser tab is hidden
2. **Debounced Resize:** Window resize events are debounced for performance
3. **BufferGeometry:** Uses efficient Three.js geometry for rendering
4. **PointsMaterial:** Optimized material for particle systems

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**WebGL Requirement:** Requires WebGL support in the browser.

## Known Limitations

1. **Texture Loading:** Texture must be served from same origin or CORS-enabled server
2. **Mobile Performance:** Auto-rotation may be laggy on older mobile devices
3. **Dot Density:** Very high dot counts (>50,000) may impact performance
4. **Memory:** Large textures can consume significant memory

## Troubleshooting

### Globe not rendering

```javascript
// Check if container exists
if (!container) {
  console.error('Container element not found');
}

// Check WebGL support
if (!window.WebGLRenderingContext) {
  console.error('WebGL not supported');
}
```

### Texture not loading

```javascript
// Check texture path
await globe.init('/assets/earth-mask.png').catch(error => {
  console.error('Failed to load texture:', error);
  // Globe will still work without texture (shows all dots)
});
```

### Performance issues

```javascript
// Reduce dot count
globe.configure({ dotCount: 10000 });

// Increase dot size (fewer dots needed)
globe.configure({ dotSize: 2.5 });

// Disable antialiasing
// Set in constructor: antialias: false
```

## Related Documentation

- [DotGenerator.js](./README_DotGenerator.md) - Fibonacci sphere algorithm
- [TextureSampler.js](./README_TextureSampler.md) - Continent masking
- [Coordinate Utilities](./utils/README.md) - Coordinate conversion functions
- [Three.js Documentation](https://threejs.org/docs/)

## License

ISC

## Version

1.0.0
