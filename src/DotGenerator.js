/**
 * DotGenerator.js
 *
 * Implements the Fibonacci sphere algorithm for generating evenly distributed
 * points on a sphere surface using the golden angle spiral method.
 *
 * This algorithm provides optimal point distribution without clustering at
 * poles (unlike traditional latitude/longitude grids), making it ideal for
 * creating uniform dot patterns on 3D globes.
 *
 * @module DotGenerator
 * @author Interactive Globe Development Team
 * @version 1.0.0
 */

/**
 * Golden angle constant in radians.
 * φ = π * (3 - √5) ≈ 2.39996322972865332
 *
 * This is the complement of the golden ratio angle (≈137.5°), which ensures
 * optimal packing of points on a sphere with minimal overlap or clustering.
 *
 * @constant {number}
 * @private
 */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Generates evenly distributed points on a sphere surface using the
 * Fibonacci (sunflower) spiral algorithm.
 *
 * Algorithm Overview:
 * - Uses the golden angle (φ) to increment azimuthal angle for optimal distribution
 * - Distributes points uniformly along the y-axis from top to bottom
 * - Calculates radius at each height using the sphere equation: r = √(1 - y²)
 * - Converts spherical coordinates to Cartesian (x, y, z) coordinates
 *
 * Mathematical Formula:
 * For i = 0 to N-1:
 *   y = 1 - (i / (N - 1)) * 2        // Linear y-axis distribution [-1, 1]
 *   radius_at_y = √(1 - y²)          // Circle radius at height y
 *   theta = φ * i                    // Golden angle increment
 *   x = cos(theta) * radius_at_y     // Cartesian x-coordinate
 *   z = sin(theta) * radius_at_y     // Cartesian z-coordinate
 *
 * Performance:
 * - Time Complexity: O(n) where n is the number of points
 * - Space Complexity: O(n) for the output array
 * - Typical generation time: ~10-50ms for 20,000 points
 *
 * @param {number} numPoints - Number of points to generate on the sphere.
 *                             Recommended range: 1,000 to 50,000 points.
 *                             Higher values provide better coverage but impact performance.
 *
 * @param {number} [radius=100] - Radius of the sphere in world units.
 *                                Default value matches Three.js scene scale conventions.
 *                                Must be a positive number.
 *
 * @returns {Array<{x: number, y: number, z: number}>} Array of 3D point positions.
 *          Each point is an object with x, y, z Cartesian coordinates.
 *          Points are ordered from north pole (y=radius) to south pole (y=-radius).
 *
 * @throws {TypeError} If numPoints is not a number or radius is not a number
 * @throws {RangeError} If numPoints is less than 1 or radius is not positive
 *
 * @example
 * // Generate 20,000 points on a sphere with radius 100
 * const points = generateFibonacciSphere(20000, 100);
 * console.log(points.length); // 20000
 * console.log(points[0]);     // { x: 0, y: 100, z: 0 } (north pole)
 *
 * @example
 * // Generate 5,000 points with default radius
 * const points = generateFibonacciSphere(5000);
 *
 * @example
 * // Use with Three.js BufferGeometry
 * import * as THREE from 'three';
 * const points = generateFibonacciSphere(15000, 100);
 * const positions = new Float32Array(points.length * 3);
 * points.forEach((point, i) => {
 *   positions[i * 3] = point.x;
 *   positions[i * 3 + 1] = point.y;
 *   positions[i * 3 + 2] = point.z;
 * });
 * const geometry = new THREE.BufferGeometry();
 * geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
 *
 * @see {@link https://arxiv.org/abs/0912.4540|Fibonacci Sphere Algorithm Paper}
 * @see {@link https://threejs.org/docs/#api/en/core/BufferGeometry|Three.js BufferGeometry}
 */
export function generateFibonacciSphere(numPoints, radius = 100) {
  // Input validation
  if (typeof numPoints !== 'number') {
    throw new TypeError(
      `Expected numPoints to be a number, received ${typeof numPoints}`
    );
  }

  if (typeof radius !== 'number') {
    throw new TypeError(
      `Expected radius to be a number, received ${typeof radius}`
    );
  }

  if (!Number.isFinite(numPoints) || numPoints < 1) {
    throw new RangeError(
      `numPoints must be a positive integer, received ${numPoints}`
    );
  }

  if (!Number.isFinite(radius) || radius <= 0) {
    throw new RangeError(
      `radius must be a positive number, received ${radius}`
    );
  }

  // Round numPoints to integer for consistency
  numPoints = Math.floor(numPoints);

  // Pre-allocate array for better performance
  const points = new Array(numPoints);

  // Handle edge case: single point at north pole
  if (numPoints === 1) {
    points[0] = { x: 0, y: radius, z: 0 };
    return points;
  }

  // Generate points using Fibonacci spiral algorithm
  for (let i = 0; i < numPoints; i++) {
    // Calculate normalized y-coordinate [-1, 1]
    // Points are distributed linearly from north pole (y=1) to south pole (y=-1)
    const y = 1 - (i / (numPoints - 1)) * 2;

    // Calculate radius of the circular cross-section at height y
    // Using the equation of a sphere: x² + y² + z² = r²
    // At height y: x² + z² = r² - y² = 1 - y² (for unit sphere)
    const radiusAtY = Math.sqrt(1 - y * y);

    // Calculate azimuthal angle using golden angle increment
    // This ensures optimal angular spacing without repetition
    const theta = GOLDEN_ANGLE * i;

    // Convert spherical coordinates to Cartesian coordinates
    // x = r * cos(theta) * sin(phi)  where phi is angle from y-axis
    // z = r * sin(theta) * sin(phi)
    // y = r * cos(phi)
    // Simplified using radiusAtY = sin(phi)
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    // Scale by sphere radius and store point
    points[i] = {
      x: x * radius,
      y: y * radius,
      z: z * radius
    };
  }

  return points;
}

/**
 * Generates Fibonacci sphere points as a flat Float32Array suitable for
 * direct use with Three.js BufferGeometry.
 *
 * This is a performance-optimized version that returns data in the format
 * expected by Three.js without additional processing steps.
 *
 * @param {number} numPoints - Number of points to generate
 * @param {number} [radius=100] - Sphere radius in world units
 *
 * @returns {Float32Array} Flat array of coordinates in format [x1, y1, z1, x2, y2, z2, ...]
 *                         Array length will be numPoints * 3
 *
 * @throws {TypeError} If numPoints or radius are not numbers
 * @throws {RangeError} If numPoints < 1 or radius <= 0
 *
 * @example
 * import * as THREE from 'three';
 * const positions = generateFibonacciSphereBuffer(20000, 100);
 * const geometry = new THREE.BufferGeometry();
 * geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
 * const material = new THREE.PointsMaterial({ size: 2, color: 0xffffff });
 * const points = new THREE.Points(geometry, material);
 * scene.add(points);
 */
export function generateFibonacciSphereBuffer(numPoints, radius = 100) {
  // Input validation (reuse logic)
  if (typeof numPoints !== 'number') {
    throw new TypeError(
      `Expected numPoints to be a number, received ${typeof numPoints}`
    );
  }

  if (typeof radius !== 'number') {
    throw new TypeError(
      `Expected radius to be a number, received ${typeof radius}`
    );
  }

  if (!Number.isFinite(numPoints) || numPoints < 1) {
    throw new RangeError(
      `numPoints must be a positive integer, received ${numPoints}`
    );
  }

  if (!Number.isFinite(radius) || radius <= 0) {
    throw new RangeError(
      `radius must be a positive number, received ${radius}`
    );
  }

  numPoints = Math.floor(numPoints);

  // Pre-allocate typed array for optimal performance
  const positions = new Float32Array(numPoints * 3);

  // Handle edge case
  if (numPoints === 1) {
    positions[0] = 0;
    positions[1] = radius;
    positions[2] = 0;
    return positions;
  }

  // Generate points directly into flat array
  for (let i = 0; i < numPoints; i++) {
    const y = 1 - (i / (numPoints - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    const index = i * 3;
    positions[index] = x * radius;
    positions[index + 1] = y * radius;
    positions[index + 2] = z * radius;
  }

  return positions;
}

/**
 * Default export for convenience
 */
export default {
  generateFibonacciSphere,
  generateFibonacciSphereBuffer,
  GOLDEN_ANGLE
};
