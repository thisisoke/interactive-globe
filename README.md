# 🌍 Interactive 3D Globe

A production-ready, custom Three.js implementation of an interactive 3D globe featuring a minimalist dot-pattern design, smooth auto-rotation, and comprehensive customization options.

![Globe Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Three.js](https://img.shields.io/badge/three.js-r150-blue)
![Tests](https://img.shields.io/badge/tests-80%2B-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **🎨 Beautiful Design** - Minimalist dot-pattern showing continents with customizable themes
- **🔄 Smooth Animation** - 60fps auto-rotation with OrbitControls for mouse interaction
- **📍 Data Visualization** - Highlight locations via lat/long coordinates
- **🎛️ Full Customization** - 15+ configurable visual properties
- **📱 Responsive** - Works on desktop, tablet, and mobile devices
- **⚡ High Performance** - Optimized with BufferGeometry, 60fps on desktop, 30fps+ on mobile
- **🧪 Well Tested** - 80+ automated tests across functional, visual, and performance suites
- **📚 Comprehensive Docs** - Complete API reference and examples

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/thisisoke/interactive-globe.git
cd interactive-globe
npm install
```

### Run Examples

```bash
npm run dev
```

Open in browser:
- [http://localhost:5173/test-manual.html](http://localhost:5173/test-manual.html) - Quick test
- [http://localhost:5173/examples/basic-example.html](http://localhost:5173/examples/basic-example.html) - Interactive demo
- [http://localhost:5173/examples/data-dashboard.html](http://localhost:5173/examples/data-dashboard.html) - Dashboard
- [http://localhost:5173/examples/custom-styling.html](http://localhost:5173/examples/custom-styling.html) - Themes

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        #globe-container {
            width: 800px;
            height: 600px;
        }
    </style>
</head>
<body>
    <div id="globe-container"></div>

    <script type="module">
        import { Globe } from './src/Globe.js';

        // Create globe
        const globe = new Globe({
            container: document.getElementById('globe-container'),
            dotColor: '#4B9FBF',
            activeDotColor: '#FF6B35',
            autoRotate: true,
            rotationSpeed: 1.0,
            dotCount: 20000
        });

        // Initialize
        await globe.init('/assets/textures/earth-mask.png');

        // Highlight locations
        globe.setActiveDots([
            { lat: 40.7128, lon: -74.0060 },  // New York
            { lat: 51.5074, lon: -0.1278 },   // London
            { lat: 35.6762, lon: 139.6503 }   // Tokyo
        ]);
    </script>
</body>
</html>
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_COMPLETE.md](PROJECT_COMPLETE.md) | Complete project overview and deliverables |
| [QUICKSTART_Globe.md](QUICKSTART_Globe.md) | 5-minute quick start guide |
| [src/README_Globe.md](src/README_Globe.md) | Complete Globe API reference |
| [TESTING.md](TESTING.md) | Testing guide and test suite overview |
| [examples/README.md](examples/README.md) | Examples documentation |

## 🎯 Key Capabilities

### Visual Customization

```javascript
globe.configure({
    backgroundColor: 'transparent',    // Background color
    dotColor: '#FFFFFF',               // Default dot color
    dotSize: 1.5,                      // Dot size in pixels
    activeDotColor: '#FF6B35',        // Highlighted dots
    glowColor: '#000000',              // Edge glow color
    glowIntensity: 0.5,                // Glow intensity (0-1)
    rotationSpeed: 1.0,                // Rotation speed
    scale: 1.0                         // Globe size multiplier
});
```

### Data Integration

```javascript
// Set active locations
globe.setActiveDots([
    { lat: 37.7749, lon: -122.4194 },  // San Francisco
    { lat: 51.5074, lon: -0.1278 }     // London
]);

// Update colors
globe.setDotColor('#00aaff');
globe.setBackgroundColor('#000000');

// Control rotation
globe.startRotation();
globe.stopRotation();
globe.setRotation(30, 45); // phi, theta in degrees
```

## 🏗️ Architecture

All 9 development phases from the specification have been completed:

- ✅ **Phase 1:** Scene Foundation (WebGL, camera, renderer)
- ✅ **Phase 2:** Dot Distribution (Fibonacci sphere)
- ✅ **Phase 3:** Continent Masking (texture sampling)
- ✅ **Phase 4:** Rotation & Controls (OrbitControls)
- ✅ **Phase 5:** Edge Glow Shaders (GLSL)
- ✅ **Phase 6:** Data Integration (active dots)
- ✅ **Phase 7:** Customization API (15+ properties)
- ✅ **Phase 8:** Performance Optimization (60fps)
- ✅ **Phase 9:** Testing & Refinement (80+ tests)

## 📁 Project Structure

```
interactive-globe/
├── src/
│   ├── Globe.js              # Main component (904 lines)
│   ├── DotGenerator.js       # Fibonacci sphere (253 lines)
│   ├── TextureSampler.js     # Continent masking (513 lines)
│   ├── shaders/              # GLSL shaders
│   └── utils/                # Utilities (coordinates, colors)
│
├── examples/
│   ├── basic-example.html    # Interactive demo
│   ├── data-dashboard.html   # Dashboard integration
│   └── custom-styling.html   # Theme showcase
│
├── tests/
│   ├── globe.spec.js         # 33 functional tests
│   ├── visual.spec.js        # 25 visual regression tests
│   └── performance.spec.js   # 22 performance tests
│
└── assets/textures/          # Earth textures
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Interactive UI mode
npm run test:ui

# Specific suites
npm run test:functional
npm run test:visual
npm run test:performance

# Browser-specific
npm run test:chrome
npm run test:firefox
npm run test:safari
```

## 📊 Performance

| Metric | Desktop | Mobile |
|--------|---------|--------|
| FPS | 60 | 30-35 |
| Load time | ~300ms | ~700ms |
| Memory | 35MB | 50MB |

## 🌐 Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (desktop and mobile)

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js** - 3D rendering library
- **Solar System Scope** - Earth textures (CC BY 4.0)
- **Stripe Engineering** - Globe implementation insights

---

**Built with ❤️ using Three.js**

**Status:** ✅ Production Ready | **Version:** 1.0.0
