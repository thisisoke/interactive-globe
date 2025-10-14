/**
 * Globe.js
 *
 * Main class for the Interactive 3D Globe component.
 * Integrates all phases of the globe implementation including scene setup,
 * dot generation, continent masking, rotation controls, data integration,
 * and visual customization.
 *
 * @module Globe
 * @author Interactive Globe Development Team
 * @version 1.0.0
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { generateFibonacciSphereBuffer } from './DotGenerator.js';
import {
  loadEarthTexture,
  isLandAtPosition,
  disposeTextureData
} from './TextureSampler.js';
import { cartesianToLatLon, latLonToCartesian } from './utils/coordinates.js';
import { parseColor } from './utils/colors.js';

/**
 * Configuration options for the Globe
 * @typedef {Object} GlobeOptions
 * @property {HTMLElement} container - DOM element to render the globe
 * @property {number} [width] - Canvas width (defaults to container width)
 * @property {number} [height] - Canvas height (defaults to container height)
 * @property {string|number} [backgroundColor='transparent'] - Scene background color
 * @property {string|number} [dotColor='#FFFFFF'] - Default dot color
 * @property {number} [dotSize=1.5] - Dot size in pixels
 * @property {string|number} [activeDotColor='#FF6B35'] - Active dot highlight color
 * @property {string|number} [glowColor='#000000'] - Edge glow color
 * @property {number} [glowIntensity=0.5] - Glow intensity (0-1)
 * @property {boolean} [autoRotate=true] - Enable auto-rotation
 * @property {number} [rotationSpeed=1.0] - Rotation speed in degrees per second
 * @property {number} [phi=0] - Initial rotation around X-axis (degrees)
 * @property {number} [theta=0] - Initial rotation around Y-axis (degrees)
 * @property {boolean} [enableMouseDrag=true] - Allow mouse drag interaction
 * @property {boolean} [enableZoom=false] - Allow zoom control
 * @property {boolean} [enablePan=false] - Allow pan control
 * @property {number} [dotCount=20000] - Number of dots to generate
 * @property {boolean} [antialias=false] - WebGL antialiasing
 * @property {number} [scale=1.0] - Globe size multiplier
 * @property {string} [texturePath] - Path to Earth mask texture
 * @property {Function} [onDotClick] - Click handler (dot) => {}
 * @property {Function} [onDotHover] - Hover handler (dot) => {}
 * @property {Array} [activeDots] - Initial active dots [{lat, lon, color}, ...]
 */

/**
 * Default configuration values
 * @private
 */
const DEFAULT_CONFIG = {
  backgroundColor: 'transparent',
  dotColor: '#FFFFFF',
  dotSize: 1.5,
  activeDotColor: '#FF6B35',
  glowColor: '#000000',
  glowIntensity: 0.5,
  autoRotate: true,
  rotationSpeed: 1.0,
  phi: 0,
  theta: 0,
  enableMouseDrag: true,
  enableZoom: false,
  enablePan: false,
  dotCount: 20000,
  antialias: false,
  scale: 1.0,
  globeRadius: 100
};

/**
 * Interactive 3D Globe component
 *
 * @class Globe
 *
 * @example
 * // Basic usage
 * const globe = new Globe({
 *   container: document.getElementById('globe-container'),
 *   dotColor: '#4B9FBF',
 *   autoRotate: true
 * });
 *
 * await globe.init();
 *
 * @example
 * // With active locations
 * const globe = new Globe({ container });
 * await globe.init();
 * globe.setActiveDots([
 *   { lat: 40.7128, lon: -74.0060 }, // New York
 *   { lat: 51.5074, lon: -0.1278 }   // London
 * ]);
 */
export class Globe {
  /**
   * Creates a new Globe instance
   * @param {GlobeOptions} options - Configuration options
   */
  constructor(options = {}) {
    // Validate container
    if (!options.container || !(options.container instanceof HTMLElement)) {
      throw new Error('Globe: container must be a valid HTMLElement');
    }

    // Merge options with defaults
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.container = options.container;

    // Set canvas dimensions
    this.width = options.width || this.container.clientWidth;
    this.height = options.height || this.container.clientHeight;

    // Phase 1: Scene Foundation - Initialize core Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    // Globe components
    this.globeGroup = null;
    this.dotsGeometry = null;
    this.dotsMaterial = null;
    this.dotsPoints = null;

    // Data structures
    this.dotData = {
      positions: null,    // Float32Array of x, y, z coordinates
      colors: null,       // Float32Array of r, g, b colors
      latLongs: [],       // Array of {lat, lon} for each dot
      indices: new Map()  // Map of "lat,lon" -> dot index for lookups
    };

    // Texture data
    this.textureData = null;

    // Animation state
    this.animationFrameId = null;
    this.isAnimating = false;
    this.lastFrameTime = 0;

    // Raycasting for interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredDot = null;

    // Event handlers (bound for proper cleanup)
    this._boundHandleResize = this._handleResize.bind(this);
    this._boundHandleMouseMove = this._handleMouseMove.bind(this);
    this._boundHandleClick = this._handleClick.bind(this);
    this._boundHandleVisibilityChange = this._handleVisibilityChange.bind(this);

    // Initialization flag
    this._initialized = false;
  }

  /**
   * Initializes the globe (async due to texture loading)
   * @async
   * @param {string} [texturePath] - Path to Earth mask texture
   * @returns {Promise<void>}
   *
   * @example
   * const globe = new Globe({ container });
   * await globe.init('/assets/earth-mask.png');
   */
  async init(texturePath) {
    if (this._initialized) {
      console.warn('Globe: already initialized');
      return;
    }

    try {
      // Phase 1: Setup scene foundation
      this._setupScene();
      this._setupCamera();
      this._setupRenderer();
      this._setupLights();

      // Phase 3: Load texture for continent masking (if provided)
      if (texturePath || this.config.texturePath) {
        this.textureData = await loadEarthTexture(
          texturePath || this.config.texturePath,
          { enableLogging: false }
        );
      }

      // Phase 2 & 3: Generate dots with continent masking
      await this._generateDots();

      // Phase 4: Setup rotation and controls
      this._setupControls();

      // Setup event listeners
      this._setupEventListeners();

      // Start animation loop
      this.start();

      // Set initial active dots if provided
      if (this.config.activeDots && this.config.activeDots.length > 0) {
        this.setActiveDots(this.config.activeDots);
      }

      this._initialized = true;
    } catch (error) {
      console.error('Globe: initialization failed', error);
      throw error;
    }
  }

  /**
   * Phase 1: Sets up the Three.js scene
   * @private
   */
  _setupScene() {
    this.scene = new THREE.Scene();

    // Set background color
    if (this.config.backgroundColor !== 'transparent') {
      const bgColor = parseColor(this.config.backgroundColor);
      if (bgColor) {
        this.scene.background = bgColor;
      }
    }

    // Create globe group for transformations
    this.globeGroup = new THREE.Group();
    this.globeGroup.scale.setScalar(this.config.scale);
    this.scene.add(this.globeGroup);
  }

  /**
   * Phase 1: Sets up the perspective camera
   * @private
   */
  _setupCamera() {
    const fov = 45;
    const aspect = this.width / this.height;
    const near = 0.1;
    const far = 2000;

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = 300;
  }

  /**
   * Phase 1: Sets up the WebGL renderer
   * @private
   */
  _setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: this.config.antialias
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Append to container
    this.container.appendChild(this.renderer.domElement);
  }

  /**
   * Phase 1: Sets up scene lighting
   * @private
   */
  _setupLights() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Directional light for depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);
  }

  /**
   * Phase 2 & 3: Generates dots using Fibonacci sphere with continent masking
   * @private
   * @async
   */
  async _generateDots() {
    // Generate all positions using Fibonacci sphere algorithm
    const allPositions = generateFibonacciSphereBuffer(
      this.config.dotCount,
      this.config.globeRadius
    );

    // Filter dots to only show on land if texture is available
    const filteredPositions = [];
    const filteredLatLongs = [];

    for (let i = 0; i < allPositions.length; i += 3) {
      const x = allPositions[i];
      const y = allPositions[i + 1];
      const z = allPositions[i + 2];

      let isLand = true;

      // Phase 3: Check if position is on land using texture
      if (this.textureData) {
        isLand = isLandAtPosition(x, y, z, this.config.globeRadius, this.textureData);
      }

      if (isLand) {
        filteredPositions.push(x, y, z);

        // Calculate and store lat/long for this dot
        const { lat, lon } = cartesianToLatLon(x, y, z, this.config.globeRadius);
        filteredLatLongs.push({ lat, lon, index: filteredLatLongs.length });
      }
    }

    // Store final dot count
    const finalDotCount = filteredPositions.length / 3;

    // Create Float32Arrays for positions and colors
    this.dotData.positions = new Float32Array(filteredPositions);
    this.dotData.colors = new Float32Array(finalDotCount * 3);
    this.dotData.latLongs = filteredLatLongs;

    // Initialize all dots with default color
    const defaultColor = parseColor(this.config.dotColor);
    for (let i = 0; i < finalDotCount; i++) {
      this.dotData.colors[i * 3] = defaultColor.r;
      this.dotData.colors[i * 3 + 1] = defaultColor.g;
      this.dotData.colors[i * 3 + 2] = defaultColor.b;
    }

    // Build spatial index for lat/long lookups
    this._buildSpatialIndex();

    // Create BufferGeometry and add attributes
    this.dotsGeometry = new THREE.BufferGeometry();
    this.dotsGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.dotData.positions, 3)
    );
    this.dotsGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(this.dotData.colors, 3)
    );

    // Create PointsMaterial
    this.dotsMaterial = new THREE.PointsMaterial({
      size: this.config.dotSize,
      vertexColors: true,
      sizeAttenuation: false,
      transparent: true,
      opacity: 1.0
    });

    // Create Points mesh and add to scene
    this.dotsPoints = new THREE.Points(this.dotsGeometry, this.dotsMaterial);
    this.globeGroup.add(this.dotsPoints);
  }

  /**
   * Phase 6: Builds spatial index for efficient lat/long lookups
   * @private
   */
  _buildSpatialIndex() {
    this.dotData.indices.clear();

    this.dotData.latLongs.forEach((coord, index) => {
      // Create key with rounded coordinates for approximate matching
      const latKey = Math.round(coord.lat * 10) / 10;
      const lonKey = Math.round(coord.lon * 10) / 10;
      const key = `${latKey},${lonKey}`;

      // Store index in map (multiple dots may share same key)
      if (!this.dotData.indices.has(key)) {
        this.dotData.indices.set(key, []);
      }
      this.dotData.indices.get(key).push(index);
    });
  }

  /**
   * Phase 4: Sets up OrbitControls for rotation and interaction
   * @private
   */
  _setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Configure controls
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.enableZoom = this.config.enableZoom;
    this.controls.enablePan = this.config.enablePan;
    this.controls.autoRotate = this.config.autoRotate;
    this.controls.autoRotateSpeed = this.config.rotationSpeed;
    this.controls.enabled = this.config.enableMouseDrag;

    // Set initial rotation
    if (this.config.phi !== 0 || this.config.theta !== 0) {
      this.setRotation(this.config.phi, this.config.theta);
    }
  }

  /**
   * Sets up event listeners for interaction and responsiveness
   * @private
   */
  _setupEventListeners() {
    // Resize handler (debounced)
    window.addEventListener('resize', this._boundHandleResize);

    // Mouse interaction handlers
    if (this.config.onDotHover) {
      this.renderer.domElement.addEventListener('mousemove', this._boundHandleMouseMove);
    }

    if (this.config.onDotClick) {
      this.renderer.domElement.addEventListener('click', this._boundHandleClick);
    }

    // Phase 8: Visibility change detection for performance
    document.addEventListener('visibilitychange', this._boundHandleVisibilityChange);
  }

  /**
   * Handles window resize events
   * @private
   */
  _handleResize() {
    // Debounce resize events
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
    }

    this._resizeTimeout = setTimeout(() => {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
    }, 150);
  }

  /**
   * Phase 6: Handles mouse move for hover interactions
   * @private
   */
  _handleMouseMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this._checkHover();
  }

  /**
   * Phase 6: Checks for dot hover using raycasting
   * @private
   */
  _checkHover() {
    if (!this.dotsPoints || !this.config.onDotHover) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.dotsPoints);

    if (intersects.length > 0) {
      const index = intersects[0].index;
      if (this.hoveredDot !== index) {
        this.hoveredDot = index;
        const dotInfo = this._getDotInfo(index);
        this.config.onDotHover(dotInfo);
      }
    } else if (this.hoveredDot !== null) {
      this.hoveredDot = null;
      this.config.onDotHover(null);
    }
  }

  /**
   * Phase 6: Handles click events on dots
   * @private
   */
  _handleClick(event) {
    if (!this.dotsPoints || !this.config.onDotClick) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.dotsPoints);

    if (intersects.length > 0) {
      const index = intersects[0].index;
      const dotInfo = this._getDotInfo(index);
      this.config.onDotClick(dotInfo);
    }
  }

  /**
   * Gets information about a dot by index
   * @private
   */
  _getDotInfo(index) {
    if (index < 0 || index >= this.dotData.latLongs.length) {
      return null;
    }

    const coord = this.dotData.latLongs[index];
    const colorOffset = index * 3;

    return {
      index,
      lat: coord.lat,
      lon: coord.lon,
      color: {
        r: this.dotData.colors[colorOffset],
        g: this.dotData.colors[colorOffset + 1],
        b: this.dotData.colors[colorOffset + 2]
      }
    };
  }

  /**
   * Phase 8: Handles visibility change for performance optimization
   * @private
   */
  _handleVisibilityChange() {
    if (document.hidden) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Animation loop
   * @private
   */
  _animate() {
    if (!this.isAnimating) return;

    this.animationFrameId = requestAnimationFrame(this._animate.bind(this));

    // Update controls (includes auto-rotation)
    if (this.controls) {
      this.controls.update();
    }

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Phase 6: Sets active dots by coordinates
   *
   * @param {Array<{lat: number, lon: number, color?: string}>} coordinates - Array of coordinates
   *
   * @example
   * globe.setActiveDots([
   *   { lat: 40.7128, lon: -74.0060, color: '#FF0000' },
   *   { lat: 51.5074, lon: -0.1278 }
   * ]);
   */
  setActiveDots(coordinates) {
    if (!Array.isArray(coordinates)) {
      console.warn('Globe: setActiveDots expects an array');
      return;
    }

    const activeColor = parseColor(this.config.activeDotColor);

    coordinates.forEach(coord => {
      if (typeof coord.lat !== 'number' || typeof coord.lon !== 'number') {
        console.warn('Globe: invalid coordinate', coord);
        return;
      }

      // Find nearest dot index
      const index = this._findNearestDotIndex(coord.lat, coord.lon);

      if (index !== -1) {
        // Use custom color if provided, otherwise use default active color
        const color = coord.color ? parseColor(coord.color) : activeColor;
        this.updateDotColor(index, color);
      }
    });
  }

  /**
   * Phase 6: Finds the nearest dot index for given coordinates
   * @private
   */
  _findNearestDotIndex(lat, lon) {
    // Try exact match first (with rounding)
    const latKey = Math.round(lat * 10) / 10;
    const lonKey = Math.round(lon * 10) / 10;
    const key = `${latKey},${lonKey}`;

    const indices = this.dotData.indices.get(key);
    if (indices && indices.length > 0) {
      return indices[0];
    }

    // If no exact match, find nearest dot
    let minDistance = Infinity;
    let nearestIndex = -1;

    this.dotData.latLongs.forEach((coord, index) => {
      const distance = Math.sqrt(
        Math.pow(coord.lat - lat, 2) +
        Math.pow(coord.lon - lon, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }

  /**
   * Phase 6: Updates the color of a specific dot
   *
   * @param {number} index - Dot index
   * @param {THREE.Color|string|number} color - New color
   *
   * @example
   * globe.updateDotColor(100, '#FF0000');
   */
  updateDotColor(index, color) {
    if (index < 0 || index >= this.dotData.latLongs.length) {
      console.warn('Globe: invalid dot index', index);
      return;
    }

    const threeColor = color instanceof THREE.Color ? color : parseColor(color);
    if (!threeColor) {
      console.warn('Globe: invalid color', color);
      return;
    }

    const colorOffset = index * 3;
    this.dotData.colors[colorOffset] = threeColor.r;
    this.dotData.colors[colorOffset + 1] = threeColor.g;
    this.dotData.colors[colorOffset + 2] = threeColor.b;

    // Update geometry attribute
    this.dotsGeometry.attributes.color.needsUpdate = true;
  }

  /**
   * Phase 7: Updates globe configuration
   *
   * @param {Object} options - Configuration options to update
   *
   * @example
   * globe.configure({
   *   dotColor: '#00FF00',
   *   rotationSpeed: 2.0,
   *   scale: 1.5
   * });
   */
  configure(options) {
    Object.assign(this.config, options);

    // Update background color
    if (options.backgroundColor !== undefined) {
      if (options.backgroundColor === 'transparent') {
        this.scene.background = null;
      } else {
        const color = parseColor(options.backgroundColor);
        if (color) this.scene.background = color;
      }
    }

    // Update dot size
    if (options.dotSize !== undefined && this.dotsMaterial) {
      this.dotsMaterial.size = options.dotSize;
    }

    // Update rotation speed
    if (options.rotationSpeed !== undefined && this.controls) {
      this.controls.autoRotateSpeed = options.rotationSpeed;
    }

    // Update auto-rotation
    if (options.autoRotate !== undefined && this.controls) {
      this.controls.autoRotate = options.autoRotate;
    }

    // Update scale
    if (options.scale !== undefined && this.globeGroup) {
      this.globeGroup.scale.setScalar(options.scale);
    }

    // Update zoom/pan settings
    if (options.enableZoom !== undefined && this.controls) {
      this.controls.enableZoom = options.enableZoom;
    }

    if (options.enablePan !== undefined && this.controls) {
      this.controls.enablePan = options.enablePan;
    }
  }

  /**
   * Phase 4: Sets rotation angles
   *
   * @param {number} phi - Rotation around X-axis (degrees)
   * @param {number} theta - Rotation around Y-axis (degrees)
   *
   * @example
   * globe.setRotation(15, 30);
   */
  setRotation(phi, theta) {
    if (this.globeGroup) {
      this.globeGroup.rotation.x = phi * (Math.PI / 180);
      this.globeGroup.rotation.y = theta * (Math.PI / 180);
    }
  }

  /**
   * Phase 4: Starts auto-rotation
   *
   * @example
   * globe.startRotation();
   */
  startRotation() {
    if (this.controls) {
      this.controls.autoRotate = true;
    }
  }

  /**
   * Phase 4: Stops auto-rotation
   *
   * @example
   * globe.stopRotation();
   */
  stopRotation() {
    if (this.controls) {
      this.controls.autoRotate = false;
    }
  }

  /**
   * Starts the animation loop
   *
   * @example
   * globe.start();
   */
  start() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this._animate();
    }
  }

  /**
   * Stops the animation loop
   *
   * @example
   * globe.stop();
   */
  stop() {
    this.isAnimating = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Phase 7: Sets the background color
   *
   * @param {string|number} color - New background color
   *
   * @example
   * globe.setBackgroundColor('#000000');
   */
  setBackgroundColor(color) {
    this.configure({ backgroundColor: color });
  }

  /**
   * Phase 7: Sets the default dot color
   *
   * @param {string|number} color - New dot color
   *
   * @example
   * globe.setDotColor('#FFFFFF');
   */
  setDotColor(color) {
    const threeColor = parseColor(color);
    if (!threeColor) {
      console.warn('Globe: invalid color', color);
      return;
    }

    this.config.dotColor = color;

    // Update all dots to new color
    for (let i = 0; i < this.dotData.latLongs.length; i++) {
      const colorOffset = i * 3;
      this.dotData.colors[colorOffset] = threeColor.r;
      this.dotData.colors[colorOffset + 1] = threeColor.g;
      this.dotData.colors[colorOffset + 2] = threeColor.b;
    }

    if (this.dotsGeometry) {
      this.dotsGeometry.attributes.color.needsUpdate = true;
    }
  }

  /**
   * Phase 7: Sets the globe scale
   *
   * @param {number} scale - Scale multiplier
   *
   * @example
   * globe.setScale(1.5);
   */
  setScale(scale) {
    this.configure({ scale });
  }

  /**
   * Phase 8: Disposes of all resources and cleans up
   *
   * @example
   * globe.dispose();
   */
  dispose() {
    // Stop animation
    this.stop();

    // Remove event listeners
    window.removeEventListener('resize', this._boundHandleResize);
    document.removeEventListener('visibilitychange', this._boundHandleVisibilityChange);

    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('mousemove', this._boundHandleMouseMove);
      this.renderer.domElement.removeEventListener('click', this._boundHandleClick);
    }

    // Dispose geometries
    if (this.dotsGeometry) {
      this.dotsGeometry.dispose();
    }

    // Dispose materials
    if (this.dotsMaterial) {
      this.dotsMaterial.dispose();
    }

    // Dispose texture data
    if (this.textureData) {
      disposeTextureData(this.textureData);
    }

    // Dispose controls
    if (this.controls) {
      this.controls.dispose();
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    // Clear references
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.globeGroup = null;
    this.dotsGeometry = null;
    this.dotsMaterial = null;
    this.dotsPoints = null;
    this.dotData = null;
    this.textureData = null;

    this._initialized = false;
  }
}

/**
 * Default export
 */
export default Globe;
