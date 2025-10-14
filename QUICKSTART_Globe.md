# Globe.js Quickstart Guide

Get up and running with the Interactive Globe in 5 minutes!

## Prerequisites

- Modern browser with WebGL support
- ES6 module support
- Three.js r150+ (already in package.json)

## Installation

No build step required! The globe uses ES6 modules.

```bash
# If you haven't already, install dependencies
npm install
```

## 1. Minimal Example (No Texture)

Create an HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #0a1929; }
    #globe-container { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="globe-container"></div>

  <script type="module">
    import { Globe } from './src/Globe.js';

    const globe = new Globe({
      container: document.getElementById('globe-container')
    });

    await globe.init();
  </script>
</body>
</html>
```

**Result**: A rotating sphere with evenly distributed white dots.

---

## 2. Styled Globe

Add visual customization:

```javascript
import { Globe } from './src/Globe.js';

const globe = new Globe({
  container: document.getElementById('globe-container'),
  dotColor: '#4B9FBF',           // Teal dots
  dotSize: 2,                     // Larger dots
  backgroundColor: '#0a1929',     // Dark background
  autoRotate: true,
  rotationSpeed: 1.5              // Faster rotation
});

await globe.init();
```

**Result**: A styled globe with teal dots on dark background.

---

## 3. With Continent Masking

Show dots only on land:

```javascript
const globe = new Globe({
  container: document.getElementById('globe-container'),
  dotColor: '#FFFFFF',
  dotCount: 20000
});

// Initialize with Earth texture
await globe.init('/assets/earth-mask.png');
```

**Note**: You need a grayscale Earth texture where white = land, black = ocean.

**Texture Sources**:
- NASA Visible Earth: https://visibleearth.nasa.gov/
- Natural Earth: https://www.naturalearthdata.com/

---

## 4. Highlighting Locations

Mark specific cities or points:

```javascript
const globe = new Globe({
  container: document.getElementById('globe-container'),
  activeDotColor: '#FF6B35'  // Orange highlights
});

await globe.init();

// Highlight major cities
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060 },  // New York
  { lat: 51.5074, lon: -0.1278 },   // London
  { lat: 35.6762, lon: 139.6503 },  // Tokyo
  { lat: -33.8688, lon: 151.2093 }  // Sydney
]);
```

**Result**: Highlighted dots at specified coordinates.

---

## 5. Interactive Globe

Add hover and click handlers:

```javascript
const globe = new Globe({
  container: document.getElementById('globe-container'),
  onDotHover: (dot) => {
    if (dot) {
      console.log(`Lat: ${dot.lat.toFixed(2)}°, Lon: ${dot.lon.toFixed(2)}°`);
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  },
  onDotClick: (dot) => {
    if (dot) {
      alert(`Clicked at: ${dot.lat.toFixed(2)}°, ${dot.lon.toFixed(2)}°`);
    }
  }
});

await globe.init();
```

**Result**: Interactive globe with hover and click feedback.

---

## 6. Dynamic Configuration

Change properties in real-time:

```javascript
const globe = new Globe({
  container: document.getElementById('globe-container')
});

await globe.init();

// Change appearance after 2 seconds
setTimeout(() => {
  globe.configure({
    dotColor: '#00FF00',
    rotationSpeed: 3.0,
    dotSize: 2.5
  });
}, 2000);

// Stop rotation after 5 seconds
setTimeout(() => {
  globe.stopRotation();
}, 5000);
```

**Result**: Globe appearance changes dynamically.

---

## 7. Complete Example

Full-featured globe with all options:

```javascript
import { Globe } from './src/Globe.js';

const globe = new Globe({
  container: document.getElementById('globe-container'),

  // Visual
  backgroundColor: '#0a1929',
  dotColor: '#4B9FBF',
  activeDotColor: '#FF6B35',
  dotSize: 1.5,

  // Rotation
  autoRotate: true,
  rotationSpeed: 1.0,
  phi: 15,              // Initial X rotation
  theta: 30,            // Initial Y rotation

  // Interaction
  enableMouseDrag: true,
  enableZoom: false,

  // Performance
  dotCount: 20000,
  antialias: false,

  // Scale
  scale: 1.2,

  // Events
  onDotHover: (dot) => {
    if (dot) console.log('Hover:', dot.lat, dot.lon);
  },
  onDotClick: (dot) => {
    if (dot) console.log('Click:', dot.lat, dot.lon);
  }
});

// Initialize with texture
await globe.init('/assets/earth-mask.png');

// Highlight locations
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060, color: '#FF0000' },
  { lat: 51.5074, lon: -0.1278, color: '#00FF00' }
]);

// Cleanup when done
window.addEventListener('beforeunload', () => {
  globe.dispose();
});
```

---

## Common Patterns

### Control Panel

```html
<button onclick="globe.stopRotation()">Stop</button>
<button onclick="globe.startRotation()">Start</button>
<input type="color" onchange="globe.setDotColor(this.value)">
<input type="range" min="0.5" max="5" step="0.1"
       onchange="globe.configure({rotationSpeed: this.value})">
```

### Data Visualization

```javascript
// Show data points on globe
const dataPoints = fetchDataFromAPI();  // [{lat, lon, value}, ...]

globe.setActiveDots(
  dataPoints.map(point => ({
    lat: point.lat,
    lon: point.lon,
    color: point.value > threshold ? '#FF0000' : '#00FF00'
  }))
);
```

### Responsive Container

```javascript
window.addEventListener('resize', () => {
  // Globe handles this automatically!
  // Resize events are debounced internally
});
```

---

## Troubleshooting

### Globe not visible?
```javascript
// Check container has size
console.log(container.clientWidth, container.clientHeight);

// Make sure container has dimensions in CSS
#globe-container {
  width: 800px;
  height: 600px;
}
```

### Texture not loading?
```javascript
// Check path and CORS
await globe.init('/assets/earth-mask.png').catch(error => {
  console.error('Texture failed:', error);
  // Globe still works without texture
});
```

### Performance issues?
```javascript
// Reduce dot count
globe.configure({ dotCount: 10000 });

// Or increase dot size
globe.configure({ dotSize: 2.5 });
```

---

## Live Demo

Open the example files to see it in action:

```bash
# Serve with any static server
npx vite

# Or use Python
python -m http.server 8000

# Or use Node.js
npx serve
```

Then open:
- `http://localhost:8000/examples/basic-example.html` - Full demo with controls
- `http://localhost:8000/examples/test-globe.html` - Automated test suite

---

## API Quick Reference

```javascript
// Initialization
await globe.init(texturePath?)

// Configuration
globe.configure(options)
globe.setBackgroundColor(color)
globe.setDotColor(color)
globe.setScale(scale)

// Data
globe.setActiveDots([{lat, lon, color?}])
globe.updateDotColor(index, color)

// Rotation
globe.setRotation(phi, theta)
globe.startRotation()
globe.stopRotation()

// Animation
globe.start()
globe.stop()

// Cleanup
globe.dispose()
```

---

## Next Steps

1. **Read the full documentation**: [README_Globe.md](./src/README_Globe.md)
2. **Explore examples**: Check the `/examples` folder
3. **Customize visuals**: Experiment with colors and sizes
4. **Add your data**: Use `setActiveDots()` with your coordinates
5. **Optimize performance**: Adjust `dotCount` for your target devices

---

## Need Help?

- **Documentation**: See [README_Globe.md](./src/README_Globe.md)
- **Examples**: Browse `/examples` folder
- **Issues**: Check troubleshooting section above
- **Three.js Docs**: https://threejs.org/docs/

---

Happy globe building! 🌍
