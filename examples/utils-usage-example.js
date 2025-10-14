/**
 * Example: Using Utility Functions with Interactive Globe
 *
 * This file demonstrates how to use the coordinate and color utilities
 * in a real Three.js globe implementation
 */

import * as THREE from 'three';
import {
  generateFibonacciSphere,
  latLonToCartesian,
  latLonToUV,
  greatCircleDistance,
  parseColor,
  lerpColor,
  colorToHex,
  adjustBrightness,
  COLORS
} from '../src/utils/index.js';

/**
 * Example 1: Creating evenly distributed particles on a globe
 */
export function createGlobeParticles(scene, particleCount = 5000, radius = 2) {
  // Generate evenly distributed points using Fibonacci sphere
  const points = generateFibonacciSphere(particleCount, radius);

  // Create buffer geometry
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  points.forEach((point, i) => {
    // Set positions
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;

    // Set colors based on latitude (blue at poles, green at equator)
    const latNormalized = (point.lat + 90) / 180; // 0 to 1
    const color = lerpColor(COLORS.BLUE, COLORS.GREEN, latNormalized);

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  return particles;
}

/**
 * Example 2: Creating location markers with geographic coordinates
 */
export function createLocationMarkers(scene, locations, radius = 2) {
  const markers = [];

  locations.forEach(location => {
    // Convert lat/lon to 3D position
    const { x, y, z } = latLonToCartesian(location.lat, location.lon, radius);

    // Create marker geometry
    const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);

    // Use location color or default
    const markerColor = location.color
      ? parseColor(location.color)
      : COLORS.PRIMARY;

    const markerMaterial = new THREE.MeshBasicMaterial({
      color: markerColor
    });

    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, y, z);

    // Store location data
    marker.userData = {
      name: location.name,
      lat: location.lat,
      lon: location.lon
    };

    scene.add(marker);
    markers.push(marker);
  });

  return markers;
}

/**
 * Example 3: Drawing a path between two locations
 */
export function createPathBetweenLocations(scene, loc1, loc2, radius = 2, segments = 50) {
  const points = [];

  // Create points along the great circle
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;

    // Interpolate latitude and longitude
    const lat = loc1.lat + (loc2.lat - loc1.lat) * t;
    const lon = loc1.lon + (loc2.lon - loc1.lon) * t;

    // Add some height to the path (arc effect)
    const distance = greatCircleDistance(loc1.lat, loc1.lon, loc2.lat, loc2.lon, radius);
    const arcHeight = distance * 0.2; // 20% of distance
    const heightOffset = Math.sin(t * Math.PI) * arcHeight;

    const { x, y, z } = latLonToCartesian(lat, lon, radius + heightOffset);
    points.push(new THREE.Vector3(x, y, z));
  }

  // Create the curve
  const curve = new THREE.CatmullRomCurve3(points);
  const curvePoints = curve.getPoints(segments);

  // Create line geometry
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

  // Create gradient colors along the path
  const lineColors = new Float32Array(curvePoints.length * 3);
  for (let i = 0; i < curvePoints.length; i++) {
    const t = i / (curvePoints.length - 1);
    const color = lerpColor(COLORS.PRIMARY, COLORS.SECONDARY, t);

    lineColors[i * 3] = color.r;
    lineColors[i * 3 + 1] = color.g;
    lineColors[i * 3 + 2] = color.b;
  }

  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    linewidth: 2,
    transparent: true,
    opacity: 0.8
  });

  const line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);

  return line;
}

/**
 * Example 4: Creating a heatmap on the globe using texture coordinates
 */
export function createHeatmapTexture(data, width = 512, height = 256) {
  // Create canvas for texture
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Create gradient for heatmap
  const coldColor = COLORS.BLUE;
  const warmColor = COLORS.RED;

  // Process data points
  data.forEach(point => {
    // Convert lat/lon to UV coordinates
    const { u, v } = latLonToUV(point.lat, point.lon);

    // Convert UV to pixel coordinates
    const x = Math.floor(u * width);
    const y = Math.floor(v * height);

    // Interpolate color based on value (0-1)
    const color = lerpColor(coldColor, warmColor, point.value);

    // Draw point with some blur
    const radius = 5;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, colorToHex(color));
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  });

  // Create Three.js texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

/**
 * Example 5: Creating atmospheric glow with color variations
 */
export function createAtmosphere(scene, radius = 2, glowColor = COLORS.ATMOSPHERE) {
  const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.15, 64, 64);

  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: parseColor(glowColor) },
      intensity: { value: 1.5 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float intensity;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);

        vec3 glow = glowColor * fresnel * intensity;
        gl_FragColor = vec4(glow, fresnel);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);

  return atmosphere;
}

/**
 * Example 6: Dynamic color theme switching
 */
export function createThemeManager() {
  const themes = {
    default: {
      ocean: COLORS.OCEAN,
      land: COLORS.LAND,
      atmosphere: COLORS.ATMOSPHERE,
      particles: COLORS.PARTICLE
    },
    dark: {
      ocean: parseColor('#0a1929'),
      land: parseColor('#1e3a3a'),
      atmosphere: parseColor('#2d4a7c'),
      particles: parseColor('#64b5f6')
    },
    warm: {
      ocean: parseColor('#8b4513'),
      land: parseColor('#cd853f'),
      atmosphere: parseColor('#ff8c00'),
      particles: parseColor('#ffd700')
    },
    cool: {
      ocean: parseColor('#1e3a5f'),
      land: parseColor('#4a7c7c'),
      atmosphere: parseColor('#00bcd4'),
      particles: parseColor('#80deea')
    }
  };

  let currentTheme = 'default';

  return {
    getTheme: (themeName = currentTheme) => themes[themeName] || themes.default,

    setTheme: (themeName) => {
      if (themes[themeName]) {
        currentTheme = themeName;
        return themes[themeName];
      }
      return themes.default;
    },

    createCustomTheme: (baseTheme, adjustments = {}) => {
      const base = themes[baseTheme] || themes.default;
      return {
        ocean: adjustments.ocean || base.ocean,
        land: adjustments.land || base.land,
        atmosphere: adjustments.atmosphere || base.atmosphere,
        particles: adjustments.particles || base.particles
      };
    },

    adjustThemeBrightness: (themeName, amount) => {
      const theme = themes[themeName] || themes.default;
      return {
        ocean: adjustBrightness(theme.ocean, amount),
        land: adjustBrightness(theme.land, amount),
        atmosphere: adjustBrightness(theme.atmosphere, amount),
        particles: adjustBrightness(theme.particles, amount)
      };
    }
  };
}

/**
 * Example 7: Sample data for demonstrations
 */
export const sampleLocations = [
  { name: "New York", lat: 40.7128, lon: -74.0060, color: "#ff0000" },
  { name: "London", lat: 51.5074, lon: -0.1278, color: "#00ff00" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, color: "#0000ff" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, color: "#ffff00" },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333, color: "#ff00ff" },
  { name: "Cairo", lat: 30.0444, lon: 31.2357, color: "#00ffff" }
];

export const sampleHeatmapData = [
  { lat: 40.7128, lon: -74.0060, value: 0.8 },
  { lat: 51.5074, lon: -0.1278, value: 0.6 },
  { lat: 35.6762, lon: 139.6503, value: 0.9 },
  { lat: -33.8688, lon: 151.2093, value: 0.5 },
  { lat: -23.5505, lon: -46.6333, value: 0.7 }
];

// Complete usage example
export function initializeGlobeWithAllFeatures(container) {
  // Setup scene
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Create globe features
  const particles = createGlobeParticles(scene, 3000, 2);
  const markers = createLocationMarkers(scene, sampleLocations, 2);
  const atmosphere = createAtmosphere(scene, 2);

  // Create paths between locations
  const path1 = createPathBetweenLocations(
    scene,
    sampleLocations[0],
    sampleLocations[2],
    2
  );

  // Initialize theme manager
  const themeManager = createThemeManager();
  const theme = themeManager.getTheme('default');

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    particles.rotation.y += 0.001;

    renderer.render(scene, camera);
  }

  animate();

  return {
    scene,
    camera,
    renderer,
    particles,
    markers,
    atmosphere,
    themeManager
  };
}
