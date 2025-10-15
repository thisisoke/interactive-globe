# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive 3D Globe is a production-ready Three.js implementation featuring a minimalist dot-pattern design showing continents, smooth auto-rotation, and comprehensive customization options. The globe supports data visualization by highlighting locations via lat/long coordinates and includes full customization API with 15+ configurable properties.

## Tech Stack

- **Three.js r150** - 3D rendering engine
- **Vite** - Development server and build tool
- **Playwright** - Automated testing framework
- **Vanilla JavaScript (ES6+)** - No framework dependencies
- **WebGL** - Hardware-accelerated graphics via Three.js

## Multi-Agent Development System

This project uses Claude Code with specialized agent roles for development. There are predefined roles and development sequencing when making changes and improvements to this codebase. Act as the orchestrator and use the agents and subagents available to you that are relevant for each task. All roles and development procedures are documented in `agents/CLAUDE_Developemt_Processes.md`.

## Research Protocol

### Context7 First Rule
**MANDATORY**: When researching any libraries, frameworks, or code samples, Context7 MUST be used as the first stop before any other research method.

- Use the prompt format: "use context7: [your research question]"
- Context7 provides up-to-date, version-specific documentation directly from source repositories
- Only use fallback research methods (WebFetch, WebSearch) if Context7 is insufficient
- Full details in `CONTEXT7_RESEARCH_RULES.md`

## Architecture

### Core Components

```
interactive-globe/
├── src/
│   ├── Globe.js              # Main globe class (940+ lines)
│   ├── DotGenerator.js       # Fibonacci sphere dot distribution
│   ├── TextureSampler.js     # Continent masking via texture sampling
│   ├── utils/
│   │   ├── coordinates.js    # Lat/long ↔ Cartesian conversions
│   │   └── colors.js         # Color parsing utilities
│   └── shaders/
│       ├── dot.vert.glsl     # Vertex shader for hexagonal dots
│       └── dot.frag.glsl     # Fragment shader for hexagonal dots
├── examples/
│   ├── basic-example.html    # Interactive demo with controls
│   ├── data-dashboard.html   # Professional dashboard with 25 locations
│   └── custom-styling.html   # Theme variations showcase
├── tests/
│   ├── globe.spec.js         # Functional tests (40+ tests)
│   ├── visual.spec.js        # Visual regression tests (30+ tests)
│   └── performance.spec.js   # Performance benchmarks (10+ tests)
└── assets/
    └── textures/             # Earth texture masks for continents
```

### Key Technical Details

**Globe Implementation:**
- Globe radius: 100 units (dots positioned on surface)
- Inner sphere radius: 98 units (opaque sphere behind dots)
- Default dot count: 20,000 dots
- Fibonacci sphere algorithm for even distribution
- Custom GLSL shaders for hexagonal dot rendering
- BufferGeometry for performance optimization

**Rotation System:**
- Globe auto-rotation via OrbitControls
- Independent inner sphere rotation with configurable speed
- Mouse drag interaction via OrbitControls
- Configurable rotation speeds and directions

**Data Visualization:**
- Highlight locations via lat/long coordinates
- Custom colors per location
- Spatial indexing for efficient coordinate lookup
- Raycasting for hover/click detection

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Start dev server (Vite)
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in UI mode (interactive)
npm run test:ui

# Run specific test suites
npm run test:functional    # Globe functionality tests
npm run test:visual        # Visual regression tests
npm run test:performance   # Performance benchmarks

# Run tests on specific browsers
npm run test:chrome
npm run test:firefox
npm run test:safari
npm run test:edge

# Run tests on mobile/tablet
npm run test:mobile
npm run test:tablet

# Update visual snapshots
npm run test:update-snapshots

# View test report
npm run test:report
```

### Development Workflow

1. **Feature Development:**
   - Use Context7 to research Three.js patterns first
   - Implement changes in `src/` files
   - Test locally with `npm run dev`
   - Add tests in `tests/` directory
   - Update documentation if API changes

2. **Testing Approach:**
   - Functional tests verify API and behavior
   - Visual tests catch rendering regressions
   - Performance tests ensure 60fps on desktop
   - Test across multiple browsers and devices

3. **Code Standards:**
   - Use JSDoc comments for all public methods
   - Include `@example` blocks in documentation
   - Follow existing code patterns and structure
   - Maintain backward compatibility when possible

## Key Implementation Patterns

### Globe Initialization
```javascript
const globe = new Globe('container-id', {
  globeRadius: 100,
  sphereRadius: 98,
  dotCount: 20000,
  dotSize: 4.0,
  dotColor: '#ffffff',
  sphereColor: '#1a1a2e',
  backgroundColor: '#0a0a1e',
  rotationSpeed: 0.3,
  sphereRotationSpeed: 0.5,
  activeDotColor: '#00ff00'
});

await globe.init('/path/to/earth-texture.png');
```

### Highlighting Locations
```javascript
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060 },  // New York
  { lat: 51.5074, lon: -0.1278 }    // London
]);
```

### Configuration Updates
```javascript
globe.configure({
  dotColor: '#00ff00',
  rotationSpeed: 2.0,
  scale: 1.5
});
```

### Custom Shaders
The globe uses custom GLSL shaders for hexagonal dots:
- `dot.vert.glsl` - Transforms positions and passes attributes
- `dot.frag.glsl` - Renders hexagonal shape using distance fields

## Performance Considerations

**Optimization Techniques:**
- BufferGeometry for efficient dot rendering
- Spatial indexing for coordinate lookups
- Debounced resize handling
- Visibility change detection for animation pause
- Proper disposal of Three.js resources

**Performance Targets:**
- Desktop: 60fps sustained
- Mobile: 30fps minimum
- Initial load: <2 seconds
- Memory: Stable over time (no leaks)

## Testing Strategy

**Functional Tests (`globe.spec.js`):**
- Initialization and setup
- Configuration API
- Data visualization (setActiveDots)
- Rotation controls
- Event handling
- Resize handling
- Disposal and cleanup

**Visual Tests (`visual.spec.js`):**
- Rendering accuracy across themes
- Hexagonal dot shapes
- Color customization
- Rotation states
- Browser compatibility
- Device-specific rendering

**Performance Tests (`performance.spec.js`):**
- FPS benchmarks
- Memory usage monitoring
- Initialization timing
- Configuration change performance
- Stress testing with rapid changes

## Common Tasks

### Adding a New Configuration Option

1. Add to `DEFAULT_CONFIG` in `Globe.js`
2. Implement setter method if needed (e.g., `setNewOption()`)
3. Update `configure()` method to handle the option
4. Add to JSDoc configuration examples
5. Create test in `globe.spec.js`
6. Update examples if user-facing

### Modifying Shader Behavior

1. Edit `src/shaders/dot.vert.glsl` or `dot.frag.glsl`
2. Update shader uniforms in `Globe.js` if needed
3. Test rendering in all examples
4. Add visual regression test
5. Document shader changes in code comments

### Adding New Example

1. Create HTML file in `examples/`
2. Import Globe.js as ES module
3. Follow existing example patterns
4. Add to `examples/INDEX.md`
5. Add to README.md quick start section
6. Create Playwright test if complex

## Important Notes

- **WebGL Compatibility**: Check browser support at https://get.webgl.org/
- **Texture Loading**: Textures must be same-origin or CORS-enabled
- **Performance**: Test on low-end devices after changes
- **Three.js Version**: Locked to r150 for stability
- **Coordinate System**: Uses standard lat/long (latitude: -90 to 90, longitude: -180 to 180)
- **Color Formats**: Supports hex (#ffffff), RGB (rgb(255,255,255)), and RGBA

## Troubleshooting

**Globe not rendering:**
- Check WebGL support in browser
- Verify container element exists
- Check browser console for errors
- Ensure Three.js loaded correctly

**Performance issues:**
- Reduce dot count for low-end devices
- Disable auto-rotation if needed
- Check for memory leaks with DevTools
- Verify proper disposal on cleanup

**Dots not highlighting:**
- Verify coordinates are valid lat/long
- Check that dots are visible (not in ocean if using texture)
- Ensure active color contrasts with dot color
- Check console for debug logs

## Resources

- **Three.js Documentation**: https://threejs.org/docs/
- **Three.js Examples**: https://threejs.org/examples/
- **WebGL Reference**: https://www.khronos.org/webgl/
- **GLSL Reference**: https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language
- **Project Documentation**: See `README.md` and files in root directory

## Future Enhancements

Potential areas for expansion:
- Animation curves for location highlights
- Support for arcs/paths between locations
- Interactive tooltips on hover
- Country boundary rendering
- Real-time data integration
- Time-based animations (day/night cycle)
- Touch gesture support improvements
- VR/AR rendering modes
