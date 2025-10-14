/**
 * Example Usage: Globe Shaders
 *
 * This file demonstrates how to integrate the custom GLSL shaders
 * with Three.js to create the interactive globe visualization.
 *
 * Prerequisites:
 * - Three.js installed (npm install three)
 * - GLSL file loader configured (e.g., vite-plugin-glsl or webpack glsl-loader)
 */

import * as THREE from 'three';
import { dotShader, atmosphereShader, colorUtils, updateUniforms } from './index.js';

/**
 * Example 1: Basic Globe Setup
 *
 * Creates a simple globe with dots and atmosphere using default shader settings.
 */
export function createBasicGlobe(scene, globeRadius = 100) {
  // ===================================
  // Dot Particle System
  // ===================================

  // Create geometry for dots (you'll populate this with your Fibonacci sphere algorithm)
  const dotGeometry = new THREE.BufferGeometry();

  // Example: Create dummy positions, colors, and sizes
  const positions = new Float32Array(3 * 1000); // 1000 dots * 3 (x,y,z)
  const colors = new Float32Array(3 * 1000);    // 1000 dots * 3 (r,g,b)
  const sizes = new Float32Array(1000);         // 1000 dots * 1 (size)
  const normals = new Float32Array(3 * 1000);   // 1000 dots * 3 (nx,ny,nz)

  // Populate with actual data (this is where Fibonacci algorithm goes)
  // ... your dot generation code here ...

  // Set attributes
  dotGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  dotGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  dotGeometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
  dotGeometry.setAttribute('customSize', new THREE.BufferAttribute(sizes, 1));

  // Create shader material for dots
  const dotMaterial = new THREE.ShaderMaterial({
    vertexShader: dotShader.vertexShader,
    fragmentShader: dotShader.fragmentShader,
    uniforms: THREE.UniformsUtils.clone(dotShader.uniforms),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  // Create points object
  const dotPoints = new THREE.Points(dotGeometry, dotMaterial);

  // ===================================
  // Atmosphere Layer
  // ===================================

  // Create sphere geometry for atmosphere (slightly larger than globe)
  const atmosphereGeometry = new THREE.SphereGeometry(
    globeRadius * 1.15,  // 15% larger than globe
    64,                   // widthSegments
    64                    // heightSegments
  );

  // Create shader material for atmosphere
  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: atmosphereShader.vertexShader,
    fragmentShader: atmosphereShader.fragmentShader,
    uniforms: THREE.UniformsUtils.clone(atmosphereShader.uniforms),
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.NormalBlending
  });

  // Create atmosphere mesh
  const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

  // ===================================
  // Add to Scene
  // ===================================

  // Group dots and atmosphere together
  const globeGroup = new THREE.Group();
  globeGroup.add(dotPoints);
  globeGroup.add(atmosphereMesh);

  scene.add(globeGroup);

  return {
    group: globeGroup,
    dotPoints,
    dotMaterial,
    atmosphereMesh,
    atmosphereMaterial
  };
}

/**
 * Example 2: Custom Styled Globe
 *
 * Creates a globe with custom colors and glow settings.
 */
export function createStyledGlobe(scene, style = 'neon') {
  const globe = createBasicGlobe(scene);

  // Apply predefined styles
  const styles = {
    neon: {
      dot: {
        u_glowColor: [0.0, 1.0, 0.8],
        u_glowIntensity: 0.9,
        u_pointSize: 3.0
      },
      atmosphere: {
        u_atmosphereColor: [0.0, 0.5, 1.0],
        u_glowIntensity: 0.7
      }
    },
    minimal: {
      dot: {
        u_glowColor: [0.9, 0.9, 0.9],
        u_glowIntensity: 0.2,
        u_pointSize: 1.5
      },
      atmosphere: {
        u_atmosphereColor: [0.1, 0.1, 0.1],
        u_glowIntensity: 0.3
      }
    },
    warm: {
      dot: {
        u_glowColor: [1.0, 0.7, 0.3],
        u_glowIntensity: 0.4,
        u_pointSize: 2.5
      },
      atmosphere: {
        u_atmosphereColor: [0.3, 0.2, 0.1],
        u_glowIntensity: 0.5
      }
    }
  };

  const selectedStyle = styles[style] || styles.minimal;

  // Update uniforms
  updateUniforms(globe.dotMaterial, selectedStyle.dot);
  updateUniforms(globe.atmosphereMaterial, selectedStyle.atmosphere);

  return globe;
}

/**
 * Example 3: Dynamic Color Updates
 *
 * Demonstrates how to change shader colors at runtime.
 */
export function updateGlobeColors(globe, dotColor, atmosphereColor) {
  // Convert hex colors to RGB arrays
  const dotRGB = colorUtils.hexToRGB(dotColor);
  const atmoRGB = colorUtils.hexToRGB(atmosphereColor);

  // Update shader uniforms
  globe.dotMaterial.uniforms.u_glowColor.value = dotRGB;
  globe.atmosphereMaterial.uniforms.u_atmosphereColor.value = atmoRGB;
}

/**
 * Example 4: Animated Glow Effect
 *
 * Animates the glow intensity using sine wave for pulsing effect.
 */
export function createPulsingGlobe(scene) {
  const globe = createBasicGlobe(scene);

  // Animation function
  const animate = () => {
    const time = Date.now() * 0.001; // Convert to seconds

    // Pulse glow intensity between 0.3 and 0.7
    const intensity = 0.5 + Math.sin(time * 2) * 0.2;

    globe.dotMaterial.uniforms.u_glowIntensity.value = intensity;
    globe.atmosphereMaterial.uniforms.u_glowIntensity.value = intensity;
  };

  return { globe, animate };
}

/**
 * Example 5: Per-Dot Color Variation
 *
 * Shows how to set individual colors for each dot.
 */
export function setDotColors(dotPoints, dotIndex, color) {
  const colorAttribute = dotPoints.geometry.attributes.customColor;

  // Convert hex to RGB if needed
  const rgb = typeof color === 'string' ? colorUtils.hexToRGB(color) : color;

  // Set color for specific dot
  colorAttribute.setXYZ(dotIndex, rgb[0], rgb[1], rgb[2]);

  // Mark as needing update
  colorAttribute.needsUpdate = true;
}

/**
 * Example 6: Highlight Active Locations
 *
 * Changes colors of dots at specific indices to highlight them.
 */
export function highlightLocations(dotPoints, dotIndices, highlightColor = '#FF6B35') {
  const rgb = colorUtils.hexToRGB(highlightColor);

  dotIndices.forEach(index => {
    setDotColors(dotPoints, index, rgb);
  });
}

/**
 * Example 7: Responsive Shader Settings
 *
 * Adjusts shader quality based on device performance.
 */
export function optimizeForDevice(globe) {
  // Detect device capabilities
  const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const pixelRatio = window.devicePixelRatio || 1;

  if (isMobile || pixelRatio < 2) {
    // Lower quality for mobile/low DPI
    updateUniforms(globe.dotMaterial, {
      u_pointSize: 1.5,
      u_glowIntensity: 0.2
    });

    updateUniforms(globe.atmosphereMaterial, {
      u_glowIntensity: 0.3,
      u_maxOpacity: 0.4
    });
  } else {
    // Higher quality for desktop/high DPI
    updateUniforms(globe.dotMaterial, {
      u_pointSize: 2.5,
      u_glowIntensity: 0.5
    });

    updateUniforms(globe.atmosphereMaterial, {
      u_glowIntensity: 0.6,
      u_maxOpacity: 0.6
    });
  }
}

/**
 * Example 8: Complete Globe Initialization
 *
 * Full setup with scene, camera, and renderer.
 */
export function initializeGlobe(containerElement) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    45,
    containerElement.clientWidth / containerElement.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 300;

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    antialias: false,  // Disabled for performance (per Stripe findings)
    alpha: true
  });
  renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  containerElement.appendChild(renderer.domElement);

  // Create globe
  const globe = createBasicGlobe(scene);

  // Optimize for device
  optimizeForDevice(globe);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Auto-rotation
    globe.group.rotation.y += 0.001;

    renderer.render(scene, camera);
  }

  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = containerElement.clientWidth / containerElement.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
  });

  return { scene, camera, renderer, globe };
}

/**
 * Example 9: Custom Uniform Controls with dat.GUI
 *
 * Interactive controls for live shader tweaking during development.
 */
export function addDebugControls(globe) {
  // Note: Requires dat.gui library (npm install dat.gui)
  // Uncomment when using:
  /*
  import * as dat from 'dat.gui';

  const gui = new dat.GUI();

  // Dot controls
  const dotFolder = gui.addFolder('Dot Shader');
  dotFolder.add(globe.dotMaterial.uniforms.u_pointSize, 'value', 0.5, 5.0)
    .name('Point Size');
  dotFolder.add(globe.dotMaterial.uniforms.u_glowIntensity, 'value', 0.0, 1.0)
    .name('Glow Intensity');
  dotFolder.add(globe.dotMaterial.uniforms.u_minOpacity, 'value', 0.0, 1.0)
    .name('Min Opacity');
  dotFolder.open();

  // Atmosphere controls
  const atmoFolder = gui.addFolder('Atmosphere Shader');
  atmoFolder.add(globe.atmosphereMaterial.uniforms.u_glowIntensity, 'value', 0.0, 1.0)
    .name('Glow Intensity');
  atmoFolder.add(globe.atmosphereMaterial.uniforms.u_power, 'value', 1.0, 5.0)
    .name('Fresnel Power');
  atmoFolder.open();

  return gui;
  */
}

// Export all examples
export default {
  createBasicGlobe,
  createStyledGlobe,
  updateGlobeColors,
  createPulsingGlobe,
  setDotColors,
  highlightLocations,
  optimizeForDevice,
  initializeGlobe,
  addDebugControls
};
