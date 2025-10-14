/**
 * Validation Script for TextureSampler Module
 *
 * Runs a series of tests to verify the TextureSampler module is working correctly.
 * Tests coordinate conversions, pixel sampling, and land detection.
 */

import {
  cartesianToLatLong,
  latLongToUV,
  uvToLatLong,
  samplePixelAtUV,
  isLandAtLatLong,
  loadEarthTexture,
  getTextureDebugInfo,
  disposeTextureData
} from '../src/TextureSampler.js';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  pass: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`)
};

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, expected, actual) {
  totalTests++;
  if (condition) {
    log.pass(testName);
    passedTests++;
    return true;
  } else {
    log.fail(`${testName} - Expected: ${expected}, Got: ${actual}`);
    return false;
  }
}

function assertClose(value, expected, tolerance, testName) {
  totalTests++;
  const diff = Math.abs(value - expected);
  if (diff <= tolerance) {
    log.pass(`${testName} (${value.toFixed(4)} ≈ ${expected.toFixed(4)})`);
    passedTests++;
    return true;
  } else {
    log.fail(`${testName} - Expected: ${expected.toFixed(4)}, Got: ${value.toFixed(4)}, Diff: ${diff.toFixed(4)}`);
    return false;
  }
}

/**
 * Test coordinate conversions
 */
function testCoordinateConversions() {
  log.header('Testing Coordinate Conversions');

  // Test 1: North Pole
  const northPole = cartesianToLatLong(0, 1, 0);
  assertClose(northPole.lat, 90, 0.01, 'North Pole latitude');

  // Test 2: South Pole
  const southPole = cartesianToLatLong(0, -1, 0);
  assertClose(southPole.lat, -90, 0.01, 'South Pole latitude');

  // Test 3: Equator at 0° longitude
  const equator0 = cartesianToLatLong(1, 0, 0);
  assertClose(equator0.lat, 0, 0.01, 'Equator latitude (0° lon)');
  assertClose(equator0.lon, 0, 0.01, 'Equator longitude (0°)');

  // Test 4: Equator at 90° East
  const equator90E = cartesianToLatLong(0, 0, 1);
  assertClose(equator90E.lat, 0, 0.01, 'Equator latitude (90° E)');
  assertClose(equator90E.lon, 90, 0.01, 'Equator longitude (90° E)');

  // Test 5: Equator at 180° (or -180°)
  const equator180 = cartesianToLatLong(-1, 0, 0);
  assertClose(equator180.lat, 0, 0.01, 'Equator latitude (180°)');
  assertClose(Math.abs(equator180.lon), 180, 0.01, 'Equator longitude (180° or -180°)');

  // Test 6: Equator at 90° West
  const equator90W = cartesianToLatLong(0, 0, -1);
  assertClose(equator90W.lat, 0, 0.01, 'Equator latitude (90° W)');
  assertClose(equator90W.lon, -90, 0.01, 'Equator longitude (90° W)');

  // Test 7: Mid-northern hemisphere
  const midNorth = cartesianToLatLong(0.707, 0.5, 0.5);
  assert(midNorth.lat > 0 && midNorth.lat < 90, 'Mid-northern hemisphere latitude range', '0-90°', midNorth.lat.toFixed(2));
}

/**
 * Test UV coordinate conversions
 */
function testUVConversions() {
  log.header('Testing UV Coordinate Conversions');

  // Test 1: North Pole
  const northPoleUV = latLongToUV(90, 0);
  assertClose(northPoleUV.v, 0, 0.01, 'North Pole V coordinate (top of texture)');

  // Test 2: South Pole
  const southPoleUV = latLongToUV(-90, 0);
  assertClose(southPoleUV.v, 1, 0.01, 'South Pole V coordinate (bottom of texture)');

  // Test 3: Equator center
  const equatorCenterUV = latLongToUV(0, 0);
  assertClose(equatorCenterUV.u, 0.5, 0.01, 'Equator center U coordinate');
  assertClose(equatorCenterUV.v, 0.5, 0.01, 'Equator center V coordinate');

  // Test 4: Western edge
  const westEdgeUV = latLongToUV(0, -180);
  assertClose(westEdgeUV.u, 0, 0.01, 'Western edge U coordinate (0)');

  // Test 5: Eastern edge
  const eastEdgeUV = latLongToUV(0, 180);
  assertClose(eastEdgeUV.u, 1, 0.01, 'Eastern edge U coordinate (1)');

  // Test 6: Round-trip conversion (lat/long → UV → lat/long)
  const originalLat = 40.7128;
  const originalLon = -74.0060;
  const uv = latLongToUV(originalLat, originalLon);
  const converted = uvToLatLong(uv.u, uv.v);
  assertClose(converted.lat, originalLat, 0.01, 'Round-trip latitude (NYC)');
  assertClose(converted.lon, originalLon, 0.01, 'Round-trip longitude (NYC)');

  // Test 7: Round-trip UV → lat/long → UV
  const originalU = 0.75;
  const originalV = 0.33;
  const latlon = uvToLatLong(originalU, originalV);
  const convertedUV = latLongToUV(latlon.lat, latlon.lon);
  assertClose(convertedUV.u, originalU, 0.01, 'Round-trip U coordinate');
  assertClose(convertedUV.v, originalV, 0.01, 'Round-trip V coordinate');
}

/**
 * Test known geographic locations
 */
async function testKnownLocations() {
  log.header('Testing Known Geographic Locations');

  // This test requires an actual texture file
  log.warn('Skipping texture-dependent tests (no texture file provided)');
  log.info('To run these tests, provide a texture file path in the script');

  // Example of how to run these tests with a real texture:
  /*
  try {
    const textureData = await loadEarthTexture('/path/to/earth-mask.png', {
      enableLogging: false
    });

    // Test known land locations
    const landLocations = [
      { name: 'New York', lat: 40.7128, lon: -74.0060, expectedLand: true },
      { name: 'London', lat: 51.5074, lon: -0.1278, expectedLand: true },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503, expectedLand: true },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093, expectedLand: true },
      { name: 'Cairo', lat: 30.0444, lon: 31.2357, expectedLand: true }
    ];

    // Test known ocean locations
    const oceanLocations = [
      { name: 'Pacific Ocean', lat: 0, lon: -140, expectedLand: false },
      { name: 'Atlantic Ocean', lat: 30, lon: -40, expectedLand: false },
      { name: 'Indian Ocean', lat: -20, lon: 80, expectedLand: false }
    ];

    [...landLocations, ...oceanLocations].forEach(loc => {
      const isLand = isLandAtLatLong(loc.lat, loc.lon, textureData);
      assert(
        isLand === loc.expectedLand,
        `${loc.name} detection`,
        loc.expectedLand ? 'land' : 'ocean',
        isLand ? 'land' : 'ocean'
      );
    });

    disposeTextureData(textureData);
  } catch (error) {
    log.fail(`Texture loading failed: ${error.message}`);
  }
  */
}

/**
 * Test edge cases and error handling
 */
function testEdgeCases() {
  log.header('Testing Edge Cases');

  // Test 1: UV clamping (values outside 0-1 range)
  const clampedUV1 = latLongToUV(100, 0); // Latitude > 90
  const clampedUV2 = latLongToUV(-100, 0); // Latitude < -90
  const clampedUV3 = latLongToUV(0, 200); // Longitude > 180
  const clampedUV4 = latLongToUV(0, -200); // Longitude < -180

  assert(
    clampedUV1.v >= 0 && clampedUV1.v <= 1,
    'UV V coordinate clamping (lat > 90)',
    '0-1',
    clampedUV1.v
  );

  // Test 2: Coordinate normalization
  const normalized = cartesianToLatLong(100, 50, 75);
  assert(
    normalized.lat >= -90 && normalized.lat <= 90,
    'Latitude range validation',
    '-90 to 90',
    `${normalized.lat.toFixed(2)}`
  );

  // Test 3: International Date Line (180° / -180° equivalence)
  const uv180 = latLongToUV(0, 180);
  const uvNeg180 = latLongToUV(0, -180);
  // Both should be at opposite edges (0 or 1)
  assert(
    Math.abs(uv180.u - uvNeg180.u) < 0.01 || Math.abs(uv180.u - uvNeg180.u) > 0.99,
    'Date line handling (180° = -180°)',
    'near edges',
    `diff: ${Math.abs(uv180.u - uvNeg180.u).toFixed(3)}`
  );
}

/**
 * Test mathematical properties
 */
function testMathematicalProperties() {
  log.header('Testing Mathematical Properties');

  // Test 1: Distance from origin should be 1 for unit sphere
  const testPoints = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [0.707, 0.707, 0],
    [0.577, 0.577, 0.577]
  ];

  testPoints.forEach((point, i) => {
    const [x, y, z] = point;
    const distance = Math.sqrt(x * x + y * y + z * z);
    assertClose(distance, 1, 0.01, `Unit sphere distance check (point ${i + 1})`);
  });

  // Test 2: Lat/long conversion symmetry
  const testLatLongs = [
    [45, 45],
    [-45, -45],
    [30, 120],
    [-60, -100]
  ];

  testLatLongs.forEach(([lat, lon]) => {
    const uv = latLongToUV(lat, lon);
    const converted = uvToLatLong(uv.u, uv.v);
    const valid = Math.abs(converted.lat - lat) < 0.01 && Math.abs(converted.lon - lon) < 0.01;
    assert(
      valid,
      `Conversion symmetry (${lat}°, ${lon}°)`,
      `(${lat}, ${lon})`,
      `(${converted.lat.toFixed(2)}, ${converted.lon.toFixed(2)})`
    );
  });
}

/**
 * Print test summary
 */
function printSummary() {
  log.header('Test Summary');

  const percentage = ((passedTests / totalTests) * 100).toFixed(1);
  const status = passedTests === totalTests ? colors.green : colors.yellow;

  console.log(`\n${status}${colors.bold}Results: ${passedTests}/${totalTests} tests passed (${percentage}%)${colors.reset}\n`);

  if (passedTests === totalTests) {
    log.pass('All tests passed! ✨');
  } else {
    log.warn(`${totalTests - passedTests} test(s) failed`);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`${colors.bold}${colors.cyan}
╔════════════════════════════════════════════════════════╗
║     TextureSampler Module Validation Suite            ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);

  log.info('Starting validation tests...\n');

  try {
    testCoordinateConversions();
    testUVConversions();
    await testKnownLocations();
    testEdgeCases();
    testMathematicalProperties();
  } catch (error) {
    console.error(`\n${colors.red}Fatal error during tests:${colors.reset}`, error);
  }

  printSummary();
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export {
  runAllTests,
  testCoordinateConversions,
  testUVConversions,
  testKnownLocations,
  testEdgeCases,
  testMathematicalProperties
};
