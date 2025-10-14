# Interactive Globe - Demo Examples

This directory contains comprehensive HTML demo examples showcasing the Interactive Globe's capabilities and customization features.

## Production Examples

### 1. data-dashboard.html
**Advanced Data Dashboard Example**

A professional, production-ready dashboard demonstrating the globe in a real-world data visualization context.

**Features:**
- Full-screen dashboard layout with header, sidebar panels, and central globe view
- 25 active network locations with real-time data simulation
- Left panel: Interactive location list with click-to-rotate functionality
- Right panel: Key metrics, regional distribution charts, and activity timeline
- Real-time statistics updates (connections, traffic, latency)
- Performance monitoring display (FPS, dot count, active locations)
- Professional dark theme with gradient backgrounds
- Responsive design with mobile breakpoints
- Color-coded location status indicators (green/amber)
- Hover interactions and smooth animations

**Use Cases:**
- Global network monitoring dashboards
- Server/CDN status visualization
- Real-time analytics platforms
- IoT device mapping
- Customer distribution analysis
- Multi-location business operations

**Key Statistics Displayed:**
- Total active locations: 25
- Real-time connections: 1,247+
- System uptime: 99.9%
- Traffic per location
- Latency metrics
- User distribution

**Technologies:**
- CSS Grid layout
- Glassmorphism effects (backdrop-filter)
- Real-time data updates via setInterval
- Performance monitoring via requestAnimationFrame
- Responsive breakpoints for tablet/mobile

---

### 2. custom-styling.html
**Visual Styles Showcase**

A comprehensive showcase of different visual themes and customization options available for the globe.

**Features:**
- 6 distinct pre-built themes side-by-side
- Live theme switcher with instant preview
- Side-by-side comparison view
- Interactive controls for each theme
- Responsive grid layout
- Smooth theme transitions

**Included Themes:**

1. **Dark Mode** (Default)
   - White dots on deep blue gradient
   - Professional dashboard aesthetic
   - Perfect for data visualization

2. **Light Mode** (Clean)
   - Dark dots on light purple gradient
   - Modern, airy design
   - Ideal for presentations

3. **Neon Glow** (Vibrant)
   - Cyan and magenta dots on black
   - Cyberpunk aesthetic
   - Eye-catching and creative

4. **Minimal** (Simple)
   - Gray dots on pure white
   - Ultra-clean interface
   - Distraction-free

5. **Ocean Deep** (Nature)
   - Turquoise dots on blue-green gradient
   - Calming, depth-focused
   - Natural, serene

6. **Sunset Vibes** (Warm)
   - Golden/pink dots on red-orange gradient
   - Warm, energetic
   - Vibrant color palette

**Interactive Controls:**
- Highlight major cities button
- Toggle rotation on/off
- Randomize dot colors
- Animate dots sequentially
- Wave effect (speed changes)

**Use Cases:**
- Choosing the right theme for your project
- Understanding customization capabilities
- A/B testing different visual styles
- Client presentations
- Design system demonstrations

---

### 3. basic-example.html
**Simple Getting Started Example**

A straightforward implementation showing core functionality with minimal complexity.

**Features:**
- Full-screen globe with gradient background
- Control panel with real-time adjustments
- Major cities highlighting
- Responsive design
- Clean, documented code

**Customization Controls:**
- Dot color picker
- Active dot color picker
- Dot size slider (0.5 - 5.0)
- Rotation speed slider (0 - 5.0)
- Scale slider (0.5 - 2.0)
- Start/stop rotation toggle
- Highlight cities button

**Perfect for:**
- Learning the Globe API
- Quick prototyping
- Understanding basic configuration
- Code reference for simple implementations

---

## Running the Examples

### Option 1: Local Development Server (Recommended)

All examples use ES6 modules, which require a development server:

```bash
# Navigate to project root
cd /Users/seyitanoke/Documents/interactive-globe

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Or use Vite directly
npx vite
```

Then open:
- http://localhost:5173/examples/data-dashboard.html
- http://localhost:5173/examples/custom-styling.html
- http://localhost:5173/examples/basic-example.html

### Option 2: Python Simple Server

```bash
# From project root
python3 -m http.server 8000

# Open in browser:
# http://localhost:8000/examples/data-dashboard.html
```

### Option 3: Node HTTP Server

```bash
npx http-server -p 8000

# Open in browser:
# http://localhost:8000/examples/data-dashboard.html
```

## Browser Compatibility

All examples are tested and work on:

- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Support:**
- iOS Safari 14+
- Chrome Android 90+

**Requirements:**
- WebGL support
- ES6 modules support
- Modern CSS features (Grid, Flexbox, backdrop-filter)

## Performance Notes

### Expected Performance

**Desktop (High-end):**
- 60 FPS constant
- 25,000 dots rendered smoothly
- Instant interaction response

**Desktop (Mid-range):**
- 50-60 FPS
- Smooth rotation and drag
- Minor frame drops during rapid interaction

**Mobile (Modern):**
- 30-45 FPS
- Reduced dot count recommended (15,000)
- Touch gestures supported

### Optimization Tips

If experiencing performance issues:

1. **Reduce Dot Count:**
   ```javascript
   const globe = new Globe({
     dotCount: 15000  // Down from 20000-25000
   });
   ```

2. **Disable Auto-rotation:**
   ```javascript
   autoRotate: false
   ```

3. **Lower Resolution:**
   - Close other browser tabs
   - Reduce browser window size
   - Use lower display scaling

4. **Disable Effects:**
   - Reduce dot size
   - Use simpler themes
   - Disable backdrop-filter on older devices

## Code Structure

All examples follow this pattern:

```javascript
import { Globe } from '../src/Globe.js';

// Initialize globe with configuration
const globe = new Globe({
  container: document.getElementById('globe-container'),
  dotColor: '#FFFFFF',
  dotSize: 1.5,
  // ... other options
});

// Initialize (async)
await globe.init();

// Optionally load texture for continent masking
// await globe.init('/assets/textures/earth-mask.png');

// Interact with globe
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060 }  // New York
]);

// Clean up when done
window.addEventListener('beforeunload', () => {
  globe.dispose();
});
```

## Customization Examples

### Changing Colors

```javascript
// Set base dot color
globe.setDotColor('#4B9FBF');

// Set active dot color
globe.configure({ activeDotColor: '#FF6B35' });
```

### Controlling Rotation

```javascript
// Start rotation
globe.startRotation();

// Stop rotation
globe.stopRotation();

// Change speed
globe.configure({ rotationSpeed: 2.0 });

// Rotate to specific location
globe.rotateToPoint(51.5074, -0.1278, 1000);  // London, 1s duration
```

### Setting Active Locations

```javascript
// Single location
globe.setActiveDots([
  { lat: 35.6762, lon: 139.6503 }  // Tokyo
]);

// Multiple locations with custom colors
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060, color: '#FF0000' },  // New York - Red
  { lat: 51.5074, lon: -0.1278, color: '#00FF00' }    // London - Green
]);
```

### Scaling

```javascript
// Make globe larger
globe.setScale(1.5);

// Make globe smaller
globe.setScale(0.8);
```

## Common Use Cases

### Corporate Dashboard
Use `data-dashboard.html` as a template:
- Replace sample locations with your office/server locations
- Connect to real API for live data updates
- Customize color scheme to match brand
- Add company logo and branding

### Marketing Website
Use `custom-styling.html` themes:
- Choose theme that matches brand
- Add product-specific data points
- Integrate with analytics platform
- Show customer distribution

### Educational Platform
Use `basic-example.html` as base:
- Show historical events on timeline
- Visualize geographic data
- Interactive geography lessons
- Climate data visualization

### Network Monitoring
Use `data-dashboard.html` with modifications:
- Real-time server status
- Network latency visualization
- Traffic flow indicators
- Alert system integration

## Troubleshooting

### Globe Not Appearing

**Issue:** Black screen or "Loading..." stuck

**Solutions:**
1. Check browser console for errors
2. Ensure running from development server (not file://)
3. Verify Three.js is loading correctly
4. Check WebGL is enabled in browser

### Module Import Errors

**Issue:** "Failed to resolve module specifier"

**Solutions:**
1. Must use development server for ES6 modules
2. Check import paths are correct relative to HTML file
3. Ensure `src/Globe.js` exists

### Poor Performance

**Issue:** Low FPS, stuttering, lag

**Solutions:**
1. Reduce `dotCount` to 15,000 or lower
2. Disable `autoRotate`
3. Close other applications/tabs
4. Try different browser (Chrome recommended)
5. Check GPU drivers are up to date

### Dots Not Showing on Continents

**Issue:** Random dot distribution instead of continent shapes

**Solutions:**
1. Ensure texture is loaded: `await globe.init('/assets/textures/earth-mask.png')`
2. Check texture file exists at specified path
3. Verify texture is proper land/ocean mask format
4. Check browser console for texture loading errors

## File Size Reference

| File | Size | Lines | Load Time |
|------|------|-------|-----------|
| basic-example.html | 7.4 KB | 286 | <100ms |
| data-dashboard.html | 21 KB | 595 | <150ms |
| custom-styling.html | 20 KB | 623 | <150ms |

**Dependencies:**
- Three.js: ~600 KB (CDN cached)
- Globe.js + modules: ~30 KB
- Earth texture (optional): ~278 KB

**Total initial load:** ~900 KB (first visit), ~300 KB (cached)

## Additional Resources

### Documentation
- Main README: `/README.md`
- Development approach: `/OPTION_A_DEVELOPMENT_APPROACH.md`
- API documentation: `/src/Globe.js` (JSDoc comments)
- Texture guide: `/assets/textures/README.md`

### Source Code
- Globe component: `/src/Globe.js`
- Dot generator: `/src/DotGenerator.js`
- Texture sampler: `/src/TextureSampler.js`
- Utilities: `/src/utils/`
- Shaders: `/src/shaders/`

### External Resources
- Three.js docs: https://threejs.org/docs/
- OrbitControls: https://threejs.org/docs/#examples/en/controls/OrbitControls
- WebGL compatibility: https://caniuse.com/webgl

## Contributing Examples

To add new examples:

1. Create HTML file in `/examples/` directory
2. Follow existing code structure
3. Import Globe from `../src/Globe.js`
4. Include comprehensive comments
5. Test on multiple browsers
6. Update this README with description
7. Ensure responsive design

## License

These examples are part of the Interactive Globe project and follow the same license as the main project.

Textures are from Solar System Scope under CC BY 4.0 license.

---

**Last Updated:** 2025-10-14
**Examples Version:** 1.0.0
**Globe Version:** 1.0.0
