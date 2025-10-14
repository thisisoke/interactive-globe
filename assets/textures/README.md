# Earth Texture Assets

This directory contains Earth texture maps used for the Interactive Globe visualization.

## Files

### earth-mask.png
- **Resolution**: 2048 x 1024 pixels
- **Format**: PNG (RGB, 8-bit/color)
- **Size**: ~278 KB
- **Purpose**: Land/ocean mask for dot filtering on globe surface
- **Usage**: White pixels = land (show dots), Black pixels = ocean (hide dots)

### earth-mask.tif
- **Resolution**: 2048 x 1024 pixels
- **Format**: TIFF (RGB, deflate compression)
- **Size**: ~331 KB
- **Purpose**: Original source file from Solar System Scope

### earth-mask-grayscale.png
- **Resolution**: 2048 x 1024 pixels
- **Format**: PNG (optimized)
- **Size**: ~278 KB
- **Purpose**: Alternative grayscale version for compatibility

## Source Attribution

These textures are derived from the **Earth Specular Map** provided by:

**Solar System Scope**
- Website: https://www.solarsystemscope.com/textures/
- License: Attribution 4.0 International (CC BY 4.0)
- Original File: 2k_earth_specular_map.tif

The specular map shows the reflectivity of Earth's surface, where:
- **White/Bright areas** = Water (oceans, lakes) - reflective surfaces
- **Black/Dark areas** = Land masses - non-reflective surfaces

For the Interactive Globe implementation, this map is used in reverse:
- We use the dark (land) areas to position dots
- We hide dots from bright (water) areas

This creates the effect of continents appearing as patterns of dots while oceans remain empty.

## License

These textures are distributed under the **Creative Commons Attribution 4.0 International License**.

When using these textures, please provide attribution to Solar System Scope:
"Textures from Solar System Scope (https://www.solarsystemscope.com/textures/) - CC BY 4.0"

## Technical Notes

### Resolution
The 2048 x 1024 resolution follows the **equirectangular projection** format:
- Width (2048) = 360 degrees of longitude
- Height (1024) = 180 degrees of latitude
- Aspect ratio: 2:1

### Coordinate Mapping
To sample the texture for a given latitude/longitude:
```javascript
// Convert lat/lon to UV coordinates
const u = (longitude + 180) / 360;  // 0 to 1
const v = (90 - latitude) / 180;     // 0 to 1 (flipped)

// Sample texture at UV coordinate
const pixelX = Math.floor(u * textureWidth);
const pixelY = Math.floor(v * textureHeight);
```

### File Format Considerations
- **PNG files** are recommended for web use (better browser support, smaller size)
- **TIF files** are provided for archival and editing purposes
- All files use the same equirectangular projection and can be used interchangeably

## Usage in Interactive Globe

The texture sampler loads these images and uses them to filter dot positions:

```javascript
import { loadEarthTexture, isLandAtPosition } from './TextureSampler.js';

// Load the texture
const textureData = await loadEarthTexture('/assets/textures/earth-mask.png');

// Check if a position is on land
const onLand = isLandAtPosition(textureData, latitude, longitude);
```

See `src/TextureSampler.js` for the complete implementation.

## Alternative Sources

If you need different resolutions or styles:

1. **Higher Resolution (8K)**:
   - Solar System Scope: https://www.solarsystemscope.com/textures/
   - Download: 8k_earth_specular_map.tif

2. **NASA Visible Earth**:
   - Website: https://visibleearth.nasa.gov/
   - Search for "Blue Marble" collections

3. **Natural Earth Data**:
   - Website: https://www.naturalearthdata.com/
   - Raster data available at multiple scales

4. **Planet Pixel Emporium**:
   - Website: https://planetpixelemporium.com/earth.html
   - Various Earth texture maps

## Troubleshooting

### Inverted Land/Ocean
If dots appear on oceans instead of land, you may need to invert the mask logic in your code or use image editing software to invert the colors.

### Resolution Issues
For better performance on mobile devices, consider downsampling to 1024 x 512. For higher quality on desktop, use the 8K version.

### Format Conversion
To convert between formats:
```bash
# TIF to PNG (macOS)
sips -s format png earth-mask.tif --out earth-mask.png

# Resize (macOS)
sips -z 512 1024 earth-mask.png --out earth-mask-512.png
```

---

Last updated: 2025-10-14
