# Interactive Globe Examples - Index

Quick navigation to all examples and documentation.

## Live Examples

Start the dev server first: `npm run dev`

Then access:

| Example | URL | Description |
|---------|-----|-------------|
| Basic Example | [/examples/basic-example.html](http://localhost:5173/examples/basic-example.html) | Simple getting started example with controls |
| Data Dashboard | [/examples/data-dashboard.html](http://localhost:5173/examples/data-dashboard.html) | Advanced professional dashboard with 25 locations |
| Custom Styling | [/examples/custom-styling.html](http://localhost:5173/examples/custom-styling.html) | 6 theme variations and style showcase |

## Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](./QUICK_START.md) | Get started in 5 minutes |
| [README.md](./README.md) | Comprehensive examples documentation |
| [../EXAMPLES_SUMMARY.md](../EXAMPLES_SUMMARY.md) | Complete deliverables summary |

## Assets

| Asset | Location | Purpose |
|-------|----------|---------|
| Earth Mask (PNG) | [/assets/textures/earth-mask.png](../assets/textures/earth-mask.png) | Primary land/ocean mask (2048x1024) |
| Earth Mask (TIF) | [/assets/textures/earth-mask.tif](../assets/textures/earth-mask.tif) | Source texture file |
| Grayscale Mask | [/assets/textures/earth-mask-grayscale.png](../assets/textures/earth-mask-grayscale.png) | Alternative version |
| Textures README | [/assets/textures/README.md](../assets/textures/README.md) | Texture documentation |

## Quick Start

### 1. Start Server
```bash
npm run dev
```

### 2. Open Example
Click any link above or navigate to:
```
http://localhost:5173/examples/basic-example.html
```

### 3. Modify Code
Edit the HTML files directly and see changes on refresh.

## Example Features Comparison

| Feature | Basic | Dashboard | Styling |
|---------|-------|-----------|---------|
| Interactive Controls | ✓ | ✓ | ✓ |
| Location Highlighting | ✓ | ✓ | ✓ |
| Real-time Updates | - | ✓ | - |
| Multiple Themes | - | - | ✓ |
| Performance Monitor | - | ✓ | - |
| Statistics Panel | - | ✓ | - |
| Responsive Layout | ✓ | ✓ | ✓ |
| Mobile Support | ✓ | ✓ | ✓ |
| Code Complexity | Simple | Advanced | Medium |
| Lines of Code | 286 | 595 | 623 |

## Common Tasks

### Change Dot Color
```javascript
globe.setDotColor('#FF6B35');
```

### Highlight Locations
```javascript
globe.setActiveDots([
  { lat: 40.7128, lon: -74.0060 }  // New York
]);
```

### Control Rotation
```javascript
globe.startRotation();
globe.stopRotation();
```

### Load Texture
```javascript
await globe.init('/assets/textures/earth-mask.png');
```

## Recommended Learning Path

1. **Start Here:** [QUICK_START.md](./QUICK_START.md)
2. **Run:** `basic-example.html`
3. **Explore:** `data-dashboard.html`
4. **Customize:** `custom-styling.html`
5. **Deep Dive:** [README.md](./README.md)
6. **Build:** Your own implementation!

## File Sizes

| File | Size | Load Time |
|------|------|-----------|
| basic-example.html | 7.4 KB | <100ms |
| data-dashboard.html | 21 KB | <150ms |
| custom-styling.html | 20 KB | <150ms |
| earth-mask.png | 278 KB | <300ms |

## Browser Support

- ✓ Chrome 90+
- ✓ Firefox 88+
- ✓ Safari 14+
- ✓ Edge 90+
- ✓ Mobile browsers (iOS/Android)

## Need Help?

1. [QUICK_START.md](./QUICK_START.md) - Fast answers
2. [README.md](./README.md) - Detailed guide
3. Browser console - Check for errors
4. [Source code](../src/Globe.js) - API reference

---

**Last Updated:** 2025-10-14
