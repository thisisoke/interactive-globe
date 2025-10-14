# Quick Start Guide - Interactive Globe Examples

Get started with the Interactive Globe examples in under 5 minutes.

## Step 1: Start Development Server

```bash
# Navigate to project directory
cd /Users/seyitanoke/Documents/interactive-globe

# Start Vite dev server
npm run dev
```

You should see:
```
VITE v5.x.x ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 2: Open Examples

Click on any example to view:

### Basic Example
**URL:** http://localhost:5173/examples/basic-example.html

**What you'll see:**
- Full-screen globe with white dots
- Control panel on the left
- Simple interface

**Try this:**
1. Click "Highlight Major Cities" - see cities light up
2. Drag the globe with your mouse
3. Adjust the dot size slider
4. Change dot colors with color pickers

### Data Dashboard
**URL:** http://localhost:5173/examples/data-dashboard.html

**What you'll see:**
- Professional 3-panel dashboard
- 25 active network locations
- Real-time statistics
- Performance monitor

**Try this:**
1. Click any location in the left panel - globe rotates to it
2. Watch the statistics update in real-time
3. Observe FPS counter in top-left
4. Notice the location status indicators pulsing

### Custom Styling
**URL:** http://localhost:5173/examples/custom-styling.html

**What you'll see:**
- 6 different theme variations
- Side-by-side comparison
- Interactive theme switcher

**Try this:**
1. Scroll down to see all 6 themes
2. Click buttons below each theme (Highlight, Toggle, Randomize)
3. Use the Interactive Theme Switcher at bottom
4. Compare Dark vs Light mode side-by-side

## Step 3: Experiment with Code

### Modify Basic Example

Open `/examples/basic-example.html` and change:

```javascript
// Line 207 - Change dot color
dotColor: '#FF6B35',  // Change to any hex color

// Line 208 - Make dots bigger
dotSize: 3.0,  // Default is 1.5

// Line 211 - Speed up rotation
rotationSpeed: 3.0,  // Default is 1.0
```

Save and refresh - see changes instantly!

### Add Your Own Location

```javascript
// Find the majorCities array (around line 193)
const majorCities = [
  { lat: 40.7128, lon: -74.0060 },  // New York
  // Add your location:
  { lat: YOUR_LATITUDE, lon: YOUR_LONGITUDE }
];
```

### Change Theme in Dashboard

In `data-dashboard.html`, find line 380:

```javascript
dotColor: '#667eea',  // Change to '#FF0000' for red dots
```

## Common Coordinates

Use these to test location highlighting:

```javascript
// Major World Cities
{ lat: 40.7128, lon: -74.0060 }   // New York, USA
{ lat: 51.5074, lon: -0.1278 }    // London, UK
{ lat: 35.6762, lon: 139.6503 }   // Tokyo, Japan
{ lat: 48.8566, lon: 2.3522 }     // Paris, France
{ lat: -33.8688, lon: 151.2093 }  // Sydney, Australia
{ lat: 55.7558, lon: 37.6173 }    // Moscow, Russia
{ lat: 19.4326, lon: -99.1332 }   // Mexico City, Mexico
{ lat: 1.3521, lon: 103.8198 }    // Singapore
{ lat: 25.2048, lon: 55.2708 }    // Dubai, UAE
{ lat: -23.5505, lon: -46.6333 }  // São Paulo, Brazil
```

## Quick Configuration Reference

### Basic Globe Setup

```javascript
import { Globe } from '../src/Globe.js';

const globe = new Globe({
  container: document.getElementById('globe-container'),
  dotColor: '#FFFFFF',           // Hex color
  dotSize: 1.5,                  // 0.5 to 5.0
  activeDotColor: '#FF6B35',     // Highlight color
  autoRotate: true,              // true/false
  rotationSpeed: 1.0,            // 0 to 5.0
  enableMouseDrag: true,         // true/false
  enableZoom: false,             // true/false
  dotCount: 20000,               // 10000 to 30000
  scale: 1.0                     // 0.5 to 2.0
});

await globe.init();
```

### With Continent Masking

```javascript
// Load with Earth texture
await globe.init('/assets/textures/earth-mask.png');
```

### Highlight Locations

```javascript
// Single color
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060 }
]);

// Multiple colors
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060, color: '#FF0000' },
  { lat: 51.5074, lon: -0.1278, color: '#00FF00' }
]);
```

### Control Rotation

```javascript
globe.startRotation();
globe.stopRotation();
globe.configure({ rotationSpeed: 2.0 });
```

### Change Colors

```javascript
globe.setDotColor('#4B9FBF');
globe.configure({ activeDotColor: '#FF6B35' });
```

## Troubleshooting

### "Cannot use import statement outside a module"
**Solution:** Start development server (npm run dev), don't open HTML directly

### "Failed to fetch dynamically imported module"
**Solution:** Check file paths, ensure running from project root

### Black screen, no globe
**Solution:**
1. Check browser console for errors
2. Ensure WebGL is enabled
3. Try Chrome/Firefox (best support)

### Low FPS / Laggy
**Solution:**
```javascript
const globe = new Globe({
  dotCount: 15000,  // Reduce from 20000
  antialias: false  // Keep disabled
});
```

### Dots appear in ocean, not land
**Solution:** Texture not loaded or inverted. Make sure:
```javascript
await globe.init('/assets/textures/earth-mask.png');
```

## Next Steps

1. **Read the full README:** `/examples/README.md`
2. **Check API docs:** `/src/Globe.js` (JSDoc comments)
3. **Explore source code:** `/src/` directory
4. **Read development guide:** `/OPTION_A_DEVELOPMENT_APPROACH.md`

## Quick Performance Tips

### Desktop (Good Performance)
```javascript
dotCount: 25000,
dotSize: 1.5,
rotationSpeed: 1.0
```

### Mobile (Better Performance)
```javascript
dotCount: 15000,
dotSize: 1.2,
rotationSpeed: 0.8,
autoRotate: false  // Save battery
```

### Presentation Mode (Best Visual)
```javascript
dotCount: 30000,
dotSize: 2.0,
rotationSpeed: 0.5,  // Slow, elegant
scale: 1.2
```

## Keyboard Shortcuts (Browser DevTools)

- **Cmd/Ctrl + Shift + I** - Open DevTools
- **Cmd/Ctrl + R** - Reload page
- **Cmd/Ctrl + Shift + R** - Hard reload (clear cache)
- **F12** - Toggle DevTools (Windows)

## Color Picker Quick Colors

Copy-paste these hex codes:

**Blues:**
- `#667eea` - Purple-blue (default)
- `#4B9FBF` - Ocean blue
- `#00ffff` - Cyan

**Warm:**
- `#FF6B35` - Orange-red
- `#ff00ff` - Magenta
- `#ffd54f` - Gold

**Cool:**
- `#10b981` - Green
- `#26c6da` - Turquoise
- `#FFFFFF` - White

## Performance Monitoring

Add to your code:

```javascript
let fps = 0;
let frames = 0;
let lastTime = performance.now();

function monitorFPS() {
  frames++;
  const now = performance.now();

  if (now >= lastTime + 1000) {
    fps = frames;
    console.log('FPS:', fps);
    frames = 0;
    lastTime = now;
  }

  requestAnimationFrame(monitorFPS);
}

monitorFPS();
```

## Getting Help

1. Check browser console for errors
2. Read `/examples/README.md` for detailed info
3. Review source code in `/src/Globe.js`
4. Check WebGL support: https://get.webgl.org/

---

**Happy coding!**

Start with `basic-example.html` and work your way up to `data-dashboard.html` once you're comfortable with the API.
