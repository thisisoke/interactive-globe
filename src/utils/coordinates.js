/**
 * Coordinate Conversion Utilities for Interactive Globe
 *
 * Provides functions to convert between different coordinate systems:
 * - Cartesian 3D (x, y, z)
 * - Geographic (latitude, longitude)
 * - UV texture coordinates (u, v)
 *
 * @module utils/coordinates
 */

/**
 * Converts 3D Cartesian coordinates to geographic latitude and longitude
 *
 * @param {number} x - X coordinate in 3D space
 * @param {number} y - Y coordinate in 3D space
 * @param {number} z - Z coordinate in 3D space
 * @param {number} [radius=1] - Radius of the sphere (defaults to 1 for unit sphere)
 * @returns {{lat: number, lon: number}} Object containing latitude and longitude in degrees
 *
 * @example
 * const { lat, lon } = cartesianToLatLon(1, 0, 0);
 * console.log(lat, lon); // 0, 90
 */
export function cartesianToLatLon(x, y, z, radius = 1) {
  // Normalize coordinates if radius is provided
  const nx = x / radius;
  const ny = y / radius;
  const nz = z / radius;

  // Calculate latitude (range: -90 to 90 degrees)
  // asin returns radians, convert to degrees
  const lat = Math.asin(ny) * (180 / Math.PI);

  // Calculate longitude (range: -180 to 180 degrees)
  // atan2 returns radians, convert to degrees
  const lon = Math.atan2(nx, nz) * (180 / Math.PI);

  return { lat, lon };
}

/**
 * Converts geographic latitude and longitude to UV texture coordinates
 *
 * UV coordinates are normalized (0-1) coordinates used for texture mapping
 * U maps to longitude, V maps to latitude
 *
 * @param {number} lat - Latitude in degrees (range: -90 to 90)
 * @param {number} lon - Longitude in degrees (range: -180 to 180)
 * @returns {{u: number, v: number}} Object containing UV coordinates (both 0-1)
 *
 * @example
 * const { u, v } = latLonToUV(0, 0);
 * console.log(u, v); // 0.5, 0.5 (equator, prime meridian)
 */
export function latLonToUV(lat, lon) {
  // Convert longitude from [-180, 180] to [0, 1]
  // Add 180 to shift range, then divide by 360
  const u = (lon + 180) / 360;

  // Convert latitude from [-90, 90] to [0, 1]
  // Add 90 to shift range, then divide by 180
  // Note: V is inverted (0 at top) for standard texture mapping
  const v = 1 - ((lat + 90) / 180);

  return { u, v };
}

/**
 * Converts geographic latitude and longitude to 3D Cartesian coordinates
 *
 * Uses spherical to Cartesian conversion:
 * - X axis points to the prime meridian (0° longitude)
 * - Y axis points to the north pole (90° latitude)
 * - Z axis points to 90° longitude
 *
 * @param {number} lat - Latitude in degrees (range: -90 to 90)
 * @param {number} lon - Longitude in degrees (range: -180 to 180)
 * @param {number} [radius=1] - Radius of the sphere (defaults to 1 for unit sphere)
 * @returns {{x: number, y: number, z: number}} Object containing 3D Cartesian coordinates
 *
 * @example
 * const { x, y, z } = latLonToCartesian(0, 0, 2);
 * console.log(x, y, z); // 0, 0, 2 (point on equator at prime meridian, radius 2)
 */
export function latLonToCartesian(lat, lon, radius = 1) {
  // Convert degrees to radians
  const latRad = lat * (Math.PI / 180);
  const lonRad = lon * (Math.PI / 180);

  // Calculate Cartesian coordinates
  // Using standard spherical coordinate conversion
  const x = radius * Math.cos(latRad) * Math.sin(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lonRad);

  return { x, y, z };
}

/**
 * Converts 3D Cartesian coordinates to UV texture coordinates
 *
 * This is a convenience function that combines cartesianToLatLon and latLonToUV
 *
 * @param {number} x - X coordinate in 3D space
 * @param {number} y - Y coordinate in 3D space
 * @param {number} z - Z coordinate in 3D space
 * @param {number} [radius=1] - Radius of the sphere (defaults to 1 for unit sphere)
 * @returns {{u: number, v: number}} Object containing UV coordinates (both 0-1)
 *
 * @example
 * const { u, v } = cartesianToUV(0, 1, 0, 2);
 * console.log(u, v); // UV coordinates for north pole
 */
export function cartesianToUV(x, y, z, radius = 1) {
  const { lat, lon } = cartesianToLatLon(x, y, z, radius);
  return latLonToUV(lat, lon);
}

/**
 * Converts UV texture coordinates to geographic latitude and longitude
 *
 * @param {number} u - U coordinate (0-1, maps to longitude)
 * @param {number} v - V coordinate (0-1, maps to latitude)
 * @returns {{lat: number, lon: number}} Object containing latitude and longitude in degrees
 *
 * @example
 * const { lat, lon } = uvToLatLon(0.5, 0.5);
 * console.log(lat, lon); // 0, 0 (equator, prime meridian)
 */
export function uvToLatLon(u, v) {
  // Convert U from [0, 1] to longitude [-180, 180]
  const lon = u * 360 - 180;

  // Convert V from [0, 1] to latitude [-90, 90]
  // Invert V because texture V=0 is at top (north pole)
  const lat = (1 - v) * 180 - 90;

  return { lat, lon };
}

/**
 * Converts UV texture coordinates to 3D Cartesian coordinates
 *
 * This is a convenience function that combines uvToLatLon and latLonToCartesian
 *
 * @param {number} u - U coordinate (0-1, maps to longitude)
 * @param {number} v - V coordinate (0-1, maps to latitude)
 * @param {number} [radius=1] - Radius of the sphere (defaults to 1 for unit sphere)
 * @returns {{x: number, y: number, z: number}} Object containing 3D Cartesian coordinates
 *
 * @example
 * const { x, y, z } = uvToCartesian(0.5, 0.5, 2);
 * console.log(x, y, z); // Point on equator at prime meridian, radius 2
 */
export function uvToCartesian(u, v, radius = 1) {
  const { lat, lon } = uvToLatLon(u, v);
  return latLonToCartesian(lat, lon, radius);
}

/**
 * Generates evenly distributed points on a sphere using the Fibonacci sphere algorithm
 *
 * This creates a more uniform distribution than random sampling, ideal for particle systems
 * Reference: https://arxiv.org/abs/0912.4540
 *
 * @param {number} count - Number of points to generate
 * @param {number} [radius=1] - Radius of the sphere
 * @returns {Array<{x: number, y: number, z: number, lat: number, lon: number}>} Array of points with Cartesian and geographic coordinates
 *
 * @example
 * const points = generateFibonacciSphere(1000, 2);
 * points.forEach(point => {
 *   console.log(point.x, point.y, point.z, point.lat, point.lon);
 * });
 */
export function generateFibonacciSphere(count, radius = 1) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 radians

  for (let i = 0; i < count; i++) {
    // Calculate latitude
    const y = 1 - (i / (count - 1)) * 2; // Range: 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y);

    // Calculate longitude using golden angle
    const theta = goldenAngle * i;

    // Convert to Cartesian
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    // Scale by radius
    const scaledX = x * radius;
    const scaledY = y * radius;
    const scaledZ = z * radius;

    // Calculate geographic coordinates
    const { lat, lon } = cartesianToLatLon(scaledX, scaledY, scaledZ, radius);

    points.push({
      x: scaledX,
      y: scaledY,
      z: scaledZ,
      lat,
      lon
    });
  }

  return points;
}

/**
 * Calculates the great circle distance between two geographic points
 *
 * Uses the Haversine formula to calculate the shortest distance between two points on a sphere
 *
 * @param {number} lat1 - Latitude of first point in degrees
 * @param {number} lon1 - Longitude of first point in degrees
 * @param {number} lat2 - Latitude of second point in degrees
 * @param {number} lon2 - Longitude of second point in degrees
 * @param {number} [radius=1] - Radius of the sphere
 * @returns {number} Distance along the sphere surface
 *
 * @example
 * const distance = greatCircleDistance(0, 0, 0, 90, 6371); // Distance in km (Earth's radius)
 */
export function greatCircleDistance(lat1, lon1, lat2, lon2, radius = 1) {
  // Convert to radians
  const lat1Rad = lat1 * (Math.PI / 180);
  const lon1Rad = lon1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);
  const lon2Rad = lon2 * (Math.PI / 180);

  // Haversine formula
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radius * c;
}

/**
 * Normalizes a vector to unit length
 *
 * @param {number} x - X component
 * @param {number} y - Y component
 * @param {number} z - Z component
 * @returns {{x: number, y: number, z: number}} Normalized vector
 *
 * @example
 * const normalized = normalizeVector(3, 4, 0);
 * console.log(normalized); // { x: 0.6, y: 0.8, z: 0 }
 */
export function normalizeVector(x, y, z) {
  const length = Math.sqrt(x * x + y * y + z * z);

  if (length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: x / length,
    y: y / length,
    z: z / length
  };
}

/**
 * Calculates the magnitude (length) of a 3D vector
 *
 * @param {number} x - X component
 * @param {number} y - Y component
 * @param {number} z - Z component
 * @returns {number} Vector magnitude
 *
 * @example
 * const length = vectorMagnitude(3, 4, 0);
 * console.log(length); // 5
 */
export function vectorMagnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}
