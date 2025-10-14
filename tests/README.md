# Interactive Globe - Test Suite Documentation

Comprehensive Playwright test suite for the Interactive 3D Globe component, covering functional tests, visual regression tests, and performance benchmarks.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Categories](#test-categories)
- [Configuration](#configuration)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The test suite validates all requirements from `OPTION_A_DEVELOPMENT_APPROACH.md` Phase 9, including:

- Scene initialization and WebGL context
- Dot generation and distribution (Fibonacci sphere)
- Continent masking via texture sampling
- Auto-rotation and manual controls
- Mouse drag interaction
- Active dot highlighting
- Color customization API
- Responsive resize behavior
- Cross-browser compatibility
- Performance benchmarks (60fps desktop, 30fps mobile)
- Memory leak detection
- Visual regression across browsers

## Test Structure

```
tests/
├── README.md                 # This file
├── globe.spec.js            # Main functional tests (150+ assertions)
├── visual.spec.js           # Visual regression tests (50+ snapshots)
├── performance.spec.js      # Performance benchmarks (30+ metrics)
└── helpers/
    └── globe-page.js        # Page Object Model for reusability
```

### Test Files

**`globe.spec.js`** - Comprehensive functional tests:
- Scene initialization (WebGL context, canvas setup)
- Dot generation and distribution
- Auto-rotation functionality
- Mouse drag interaction
- OrbitControls responsiveness
- Active dot highlighting via `setActiveDots()`
- Color customization (`setDotColor`, `setBackgroundColor`)
- Resize behavior
- Configuration API (all properties)
- Memory management
- Error handling

**`visual.spec.js`** - Visual regression tests:
- Globe states (initial, rotated, after drag)
- Color customization baselines
- Active dot highlighting
- Size and scale variations
- Edge glow rendering
- Cross-browser consistency
- Responsive design (mobile, tablet, desktop)
- High DPI display rendering

**`performance.spec.js`** - Performance benchmarks:
- Initial load time (<500ms desktop)
- FPS during auto-rotation (60fps desktop, 30fps mobile)
- FPS during user interaction
- Performance with different dot counts
- Memory usage monitoring (<50MB)
- Long-running stability tests
- GPU utilization
- Configuration change performance

**`helpers/globe-page.js`** - Page Object Model:
- Reusable methods for globe interaction
- WebGL context validation
- FPS measurement utilities
- Memory usage tracking
- Canvas screenshot helpers
- Configuration change methods

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Basic Commands

```bash
# Run all tests (headless)
npm test

# Run with UI (interactive mode)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode (step through tests)
npm run test:debug
```

### Browser-Specific Tests

```bash
# Chrome only
npm run test:chrome

# Firefox only
npm run test:firefox

# Safari only
npm run test:safari

# Edge only
npm run test:edge

# All mobile viewports
npm run test:mobile

# All tablet viewports
npm run test:tablet
```

### Test Category Commands

```bash
# Functional tests only
npm run test:functional

# Visual regression tests only
npm run test:visual

# Performance benchmarks only
npm run test:performance
```

### Additional Commands

```bash
# View test report
npm run test:report

# Update visual snapshots (after intentional changes)
npm run test:update-snapshots

# Generate test code interactively
npm run test:codegen
```

## Test Categories

### 1. Functional Tests (`globe.spec.js`)

Tests core functionality and API behavior:

**Scene Initialization**
- WebGL context creation
- Canvas sizing and responsiveness
- Loading state management
- Error-free initialization

**Dot Generation**
- Fibonacci sphere distribution
- Expected dot count (accounting for masking)
- Even distribution across surface

**Auto-Rotation**
- Default rotation behavior
- Start/stop toggle
- Speed configuration
- Pause at zero speed

**Mouse Interaction**
- Drag responsiveness
- Multiple drag operations
- Smooth interaction without errors

**Active Dots**
- Highlighting via `setActiveDots()`
- Custom active colors
- Coordinate-to-dot mapping

**Configuration API**
- Dot color updates
- Size changes
- Scale transformations
- Rotation speed modifications
- All properties work correctly

**Resize Behavior**
- Window resize adaptation
- Aspect ratio maintenance
- Rapid resize handling

**Memory Management**
- No memory leaks over time
- Proper cleanup on disposal

### 2. Visual Regression Tests (`visual.spec.js`)

Captures and compares screenshots across browsers:

**Globe States**
- Initial rendering
- After rotation
- After drag interaction
- Stopped state

**Color Variations**
- Red, blue, green dot colors
- Custom active dot colors
- Background color changes

**Size Variations**
- Large dots (4.0px)
- Small dots (0.8px)
- Scaled up globe (1.5x)
- Scaled down globe (0.7x)

**Edge Effects**
- Edge glow rendering
- Glow at different scales

**Responsive**
- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Desktop viewport (1920x1080)
- Landscape orientations

**Cross-Browser**
- Chrome baseline
- Firefox baseline
- Safari baseline
- Edge baseline

### 3. Performance Tests (`performance.spec.js`)

Measures and validates performance metrics:

**Load Time**
- Initial load (<500ms desktop)
- Canvas initialization time
- DOM content loaded time

**Frame Rate**
- Auto-rotation FPS (≥60fps desktop)
- Interaction FPS (≥30fps minimum)
- Stable FPS over time (low variance)
- No significant frame drops

**Memory Usage**
- Initial footprint (<50MB)
- No leaks during extended use
- Memory recovery after operations

**Stress Tests**
- Rapid configuration changes
- Multiple drag operations
- Extended continuous use (2+ minutes)

**Mobile Performance**
- Mobile FPS (≥30fps)
- Touch interaction performance
- Smaller viewport optimization

**GPU Utilization**
- WebGL error monitoring
- Efficient draw calls
- GPU info validation

## Configuration

### Playwright Config (`playwright.config.js`)

Key settings:

```javascript
{
  timeout: 60000,                    // Max test timeout
  retries: 2,                        // CI retry count
  workers: 1,                        // Parallel workers (CI)

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: 'npm run dev',          // Start Vite dev server
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  }
}
```

### Browser Projects

Configured for:
- Chrome (desktop, mobile)
- Firefox (desktop)
- Safari/WebKit (desktop, mobile)
- Edge (desktop)
- iPad (portrait, landscape)
- iPhone (various models)
- Pixel (Android)

### Visual Comparison Thresholds

```javascript
{
  maxDiffPixels: 500,     // Allow 500 pixel differences
  threshold: 0.2,         // 20% color tolerance
}
```

## Writing Tests

### Using the Page Object

```javascript
import { test, expect } from '@playwright/test';
import { GlobePage } from './helpers/globe-page.js';

test('example test', async ({ page }) => {
  const globe = new GlobePage(page);

  // Navigate and initialize
  await globe.goto();
  await globe.waitForGlobeInit();

  // Interact with globe
  await globe.setDotColor('#ff0000');
  await globe.highlightCities();
  await globe.dragGlobe({ x: 100, y: 100 }, { x: 300, y: 300 });

  // Assertions
  const hasContent = await globe.hasVisibleContent();
  expect(hasContent).toBe(true);

  const { fps } = await globe.measureFPS(2000);
  expect(fps).toBeGreaterThan(60);
});
```

### Performance Testing Pattern

```javascript
test('performance test', async ({ page }) => {
  const globe = new GlobePage(page);
  await globe.goto();
  await globe.waitForGlobeInit();

  // Measure FPS
  const { fps, frames } = await globe.measureFPS(3000);
  console.log(`FPS: ${fps.toFixed(2)} (${frames} frames)`);
  expect(fps).toBeGreaterThanOrEqual(60);

  // Measure memory (if available)
  const memory = await globe.getMemoryUsage();
  if (memory) {
    const usedMB = memory.usedJSHeapSize / (1024 * 1024);
    expect(usedMB).toBeLessThan(50);
  }
});
```

### Visual Testing Pattern

```javascript
test('visual test', async ({ page, browserName }) => {
  const globe = new GlobePage(page);
  await globe.goto();
  await globe.waitForGlobeInit();

  // Set consistent state
  await globe.toggleRotation();
  await globe.setDotColor('#4B9FBF');
  await globe.wait(500);

  // Take and compare screenshot
  const screenshot = await globe.screenshotCanvas();
  expect(screenshot).toMatchSnapshot(`test-${browserName}.png`, {
    maxDiffPixels: 500,
    threshold: 0.2,
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Environment Variables

```bash
# CI mode (enables retries, disables parallelism)
export CI=true

# Custom Playwright config
export PLAYWRIGHT_BROWSERS_PATH=/custom/path
```

## Test Results

### Report Location

After running tests:
- HTML Report: `playwright-report/index.html`
- JSON Results: `test-results/results.json`
- Screenshots: `test-results/*.png`
- Videos: `test-results/*.webm`

### Viewing Reports

```bash
npm run test:report
```

Opens the HTML report in your browser with:
- Test results summary
- Failed test details
- Screenshots and videos
- Traces for debugging

## Troubleshooting

### Common Issues

**Tests timing out**
```bash
# Increase timeout in test
test.setTimeout(120000);

# Or in config
timeout: 120 * 1000
```

**Visual snapshots failing**
```bash
# Update snapshots after intentional changes
npm run test:update-snapshots

# Or for specific browser
npx playwright test --update-snapshots --project=chromium-desktop
```

**WebGL not available**
```javascript
// Skip test if WebGL unavailable
const hasWebGL = await globe.hasWebGLContext();
test.skip(!hasWebGL, 'WebGL not available');
```

**Performance.memory not available**
```javascript
// Skip memory tests in Safari
test.skip(browserName === 'webkit', 'Performance.memory not available');
```

**Dev server not starting**
```bash
# Manually start dev server first
npm run dev

# Then run tests with existing server
npm test
```

### Debug Mode

```bash
# Step through test execution
npm run test:debug

# Or specific test file
npx playwright test tests/globe.spec.js --debug
```

### Headed Mode

```bash
# See browser while tests run
npm run test:headed

# Slow down execution
npx playwright test --headed --slow-mo=1000
```

## Best Practices

1. **Use Page Objects**: Always use `GlobePage` helper for consistency
2. **Wait for Init**: Always call `waitForGlobeInit()` before interactions
3. **Stop Rotation**: Stop auto-rotation for consistent visual tests
4. **Handle Skips**: Skip tests gracefully when features unavailable
5. **Log Results**: Console.log performance metrics for monitoring
6. **Clean State**: Each test should start with clean globe state
7. **Timeouts**: Use appropriate timeouts for long-running tests
8. **Screenshots**: Take screenshots on failure for debugging

## Success Criteria

Tests validate all requirements from Phase 9:

- ✓ Globe renders with dots forming continents
- ✓ Smooth auto-rotation (60fps desktop)
- ✓ Mouse drag interaction works
- ✓ Active dots can be set via lat/long
- ✓ All visual properties are configurable
- ✓ Responsive to container size changes
- ✓ Matches reference aesthetic (minimalist, dark)
- ✓ Edge glow effect present
- ✓ No visual glitches or artifacts
- ✓ 60fps on desktop browsers
- ✓ 30fps minimum on mobile devices
- ✓ <500ms initial load time
- ✓ <50MB memory footprint
- ✓ Smooth interaction (no lag)

## Contributing

When adding new tests:

1. Follow existing patterns (Page Object, async/await)
2. Add clear test descriptions
3. Include console.log for metrics
4. Update this README with new test categories
5. Ensure tests work across all browsers
6. Add appropriate timeouts
7. Handle browser-specific skips

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Performance Testing](https://playwright.dev/docs/api/class-page#page-evaluate)
- [Project Structure](../OPTION_A_DEVELOPMENT_APPROACH.md)

## License

ISC
