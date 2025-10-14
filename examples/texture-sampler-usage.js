/**
 * TextureSampler Usage Example
 *
 * Demonstrates how to use the TextureSampler module for continent masking
 * in the Interactive Globe project.
 */

import {
  loadEarthTexture,
  isLandAtPosition,
  isLandAtLatLong,
  getBrightnessAtLatLong,
  getTextureDebugInfo,
  disposeTextureData
} from '../src/TextureSampler.js';

/**
 * Example 1: Basic texture loading and sampling
 */
async function basicExample() {
  console.log('=== Basic Texture Loading Example ===');

  try {
    // Load the Earth texture with options
    const textureData = await loadEarthTexture(
      '/assets/textures/earth-mask.png',
      {
        brightnessThreshold: 128,
        enableLogging: true,
        onProgress: (loaded, total) => {
          const percent = ((loaded / total) * 100).toFixed(1);
          console.log(`Loading: ${percent}%`);
        }
      }
    );

    // Get debug information
    const debugInfo = getTextureDebugInfo(textureData);
    console.log('Texture Info:', debugInfo);

    // Test some known locations
    const locations = [
      { name: 'New York', lat: 40.7128, lon: -74.0060 },
      { name: 'London', lat: 51.5074, lon: -0.1278 },
      { name: 'Atlantic Ocean', lat: 30, lon: -40 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093 }
    ];

    console.log('\nTesting known locations:');
    locations.forEach(loc => {
      const isLand = isLandAtLatLong(loc.lat, loc.lon, textureData);
      const brightness = getBrightnessAtLatLong(loc.lat, loc.lon, textureData);
      console.log(
        `${loc.name}: ${isLand ? 'LAND' : 'OCEAN'} (brightness: ${brightness.toFixed(0)})`
      );
    });

    // Clean up
    disposeTextureData(textureData);
    console.log('\nTexture resources disposed');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 2: Filtering dots for globe visualization
 */
async function dotFilteringExample() {
  console.log('\n=== Dot Filtering Example ===');

  try {
    const textureData = await loadEarthTexture('/assets/textures/earth-mask.png');

    // Simulate dot generation (simplified Fibonacci sphere)
    const globeRadius = 100;
    const numDots = 10000;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    const landDots = [];
    const oceanDots = [];

    console.log(`Generating ${numDots} dots on sphere...`);

    for (let i = 0; i < numDots; i++) {
      // Fibonacci sphere distribution
      const y = 1 - (i / (numDots - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      // Scale to globe radius
      const dotX = x * globeRadius;
      const dotY = y * globeRadius;
      const dotZ = z * globeRadius;

      // Check if on land
      const isLand = isLandAtPosition(dotX, dotY, dotZ, globeRadius, textureData);

      if (isLand) {
        landDots.push({ x: dotX, y: dotY, z: dotZ });
      } else {
        oceanDots.push({ x: dotX, y: dotY, z: dotZ });
      }
    }

    console.log(`\nResults:`);
    console.log(`  Total dots: ${numDots}`);
    console.log(`  Land dots: ${landDots.length} (${((landDots.length / numDots) * 100).toFixed(1)}%)`);
    console.log(`  Ocean dots: ${oceanDots.length} (${((oceanDots.length / numDots) * 100).toFixed(1)}%)`);
    console.log(`  Filtered out: ${oceanDots.length} dots`);

    // Clean up
    disposeTextureData(textureData);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 3: Custom threshold testing
 */
async function thresholdTestingExample() {
  console.log('\n=== Threshold Testing Example ===');

  try {
    // Test different thresholds
    const thresholds = [64, 128, 192];
    const testLocation = { name: 'North Africa', lat: 20, lon: 10 };

    console.log(`Testing location: ${testLocation.name} (${testLocation.lat}°, ${testLocation.lon}°)`);

    for (const threshold of thresholds) {
      const textureData = await loadEarthTexture(
        '/assets/textures/earth-mask.png',
        { brightnessThreshold: threshold, enableLogging: false }
      );

      const brightness = getBrightnessAtLatLong(
        testLocation.lat,
        testLocation.lon,
        textureData
      );
      const isLand = brightness > threshold;

      console.log(
        `  Threshold ${threshold}: ${isLand ? 'LAND' : 'OCEAN'} (brightness: ${brightness.toFixed(0)})`
      );

      disposeTextureData(textureData);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 4: Batch processing
 */
async function batchProcessingExample() {
  console.log('\n=== Batch Processing Example ===');

  try {
    const textureData = await loadEarthTexture('/assets/textures/earth-mask.png');

    // Generate random positions
    const numPositions = 1000;
    const globeRadius = 100;
    const positions = [];

    for (let i = 0; i < numPositions; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.push({
        x: Math.sin(phi) * Math.cos(theta) * globeRadius,
        y: Math.cos(phi) * globeRadius,
        z: Math.sin(phi) * Math.sin(theta) * globeRadius
      });
    }

    console.log(`Processing ${numPositions} random positions...`);

    // Measure performance
    const startTime = performance.now();

    let landCount = 0;
    positions.forEach(pos => {
      if (isLandAtPosition(pos.x, pos.y, pos.z, globeRadius, textureData)) {
        landCount++;
      }
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`\nResults:`);
    console.log(`  Positions checked: ${numPositions}`);
    console.log(`  Land positions: ${landCount}`);
    console.log(`  Time taken: ${duration.toFixed(2)}ms`);
    console.log(`  Average per position: ${(duration / numPositions).toFixed(3)}ms`);

    disposeTextureData(textureData);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  await basicExample();
  await dotFilteringExample();
  await thresholdTestingExample();
  await batchProcessingExample();

  console.log('\n=== All examples completed ===');
}

// Export for use in other modules
export {
  basicExample,
  dotFilteringExample,
  thresholdTestingExample,
  batchProcessingExample,
  runAllExamples
};

// Run examples if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}
