# Testing Guide - Interactive Globe

Quick start guide for running the Playwright test suite.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (first time only)
npx playwright install

# 3. Run all tests
npm test
```

## Test Commands

### Running Tests

```bash
# All tests (headless)
npm test

# With UI (interactive)
npm run test:ui

# With visible browser
npm run test:headed

# Debug mode
npm run test:debug
```

### Specific Test Suites

```bash
# Functional tests only (globe.spec.js)
npm run test:functional

# Visual regression tests (visual.spec.js)
npm run test:visual

# Performance benchmarks (performance.spec.js)
npm run test:performance
```

### Browser-Specific

```bash
# Chrome
npm run test:chrome

# Firefox
npm run test:firefox

# Safari
npm run test:safari

# Edge
npm run test:edge

# Mobile devices
npm run test:mobile

# Tablets
npm run test:tablet
```

## Test Results

After running tests, view the report:

```bash
npm run test:report
```

Results are saved in:
- `playwright-report/` - HTML report
- `test-results/` - Screenshots, videos, traces

## Visual Snapshots

If visual tests fail due to intentional changes:

```bash
# Update all snapshots
npm run test:update-snapshots

# Update for specific browser
npx playwright test --update-snapshots --project=chromium-desktop
```

## Development Workflow

1. **Start dev server** (optional, Playwright starts it automatically):
   ```bash
   npm run dev
   ```

2. **Run tests in watch mode**:
   ```bash
   npm run test:ui
   ```

3. **Debug failing tests**:
   ```bash
   npm run test:debug
   ```

## Test Coverage

The test suite covers:

### Functional Tests (150+ assertions)
- ✓ Scene initialization & WebGL context
- ✓ Dot generation (Fibonacci sphere)
- ✓ Continent masking
- ✓ Auto-rotation
- ✓ Mouse drag interaction
- ✓ Active dot highlighting
- ✓ Color customization
- ✓ Resize behavior
- ✓ Configuration API
- ✓ Memory management

### Visual Tests (50+ snapshots)
- ✓ Globe states across browsers
- ✓ Color variations
- ✓ Size and scale changes
- ✓ Edge glow effects
- ✓ Responsive layouts
- ✓ High DPI displays

### Performance Tests (30+ benchmarks)
- ✓ Load time (<500ms)
- ✓ FPS during rotation (60fps desktop)
- ✓ FPS during interaction (30fps minimum)
- ✓ Memory usage (<50MB)
- ✓ Long-running stability
- ✓ Mobile performance

## Performance Targets

- **Desktop**: 60fps, <500ms load, <50MB memory
- **Mobile**: 30fps, <1000ms load, <75MB memory
- **Tablet**: 45fps, <750ms load, <60MB memory

## Browser Support

Tests run on:
- Chrome (desktop, mobile)
- Firefox (desktop)
- Safari/WebKit (desktop, mobile)
- Edge (desktop)
- iPad (portrait, landscape)
- iPhone (various models)
- Android (Pixel)

## Troubleshooting

### Tests Failing

**Visual snapshots failing**
```bash
# View diff in HTML report
npm run test:report

# Update if change is intentional
npm run test:update-snapshots
```

**Performance tests failing**
- Check if other processes are using CPU/GPU
- Close other applications
- Run tests individually: `npm run test:performance`

**Timeout errors**
- Increase timeout in `playwright.config.js`
- Check if dev server is starting correctly

### Common Issues

**"Server is not ready"**
```bash
# Manually start dev server first
npm run dev

# Then run tests in another terminal
npm test
```

**"Browser not found"**
```bash
# Reinstall Playwright browsers
npx playwright install --force
```

**"WebGL not available"**
- Update graphics drivers
- Enable hardware acceleration in browser
- Tests will skip gracefully if WebGL unavailable

## CI/CD

The test suite is CI-ready:

```yaml
# GitHub Actions example
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test
```

Set `CI=true` environment variable to enable:
- Automatic retries (2x)
- Serial test execution
- Optimized for CI environment

## Documentation

For detailed information, see:
- [tests/README.md](./tests/README.md) - Complete test documentation
- [playwright.config.js](./playwright.config.js) - Test configuration
- [OPTION_A_DEVELOPMENT_APPROACH.md](./OPTION_A_DEVELOPMENT_APPROACH.md) - Project requirements

## Getting Help

If tests are failing:

1. Check the HTML report: `npm run test:report`
2. Look at screenshots/videos in `test-results/`
3. Run in debug mode: `npm run test:debug`
4. Check console output for errors
5. Review [tests/README.md](./tests/README.md) for troubleshooting

## Contributing Tests

When adding new tests:

1. Use the `GlobePage` helper from `tests/helpers/globe-page.js`
2. Follow existing patterns (async/await, proper waits)
3. Add clear descriptions to test names
4. Include console.log for performance metrics
5. Update documentation in `tests/README.md`

## License

ISC
