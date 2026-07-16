/**
 * Button Fireworks - Content Script
 * Displays fireworks when buttons are clicked on web pages
 * Supports URL and button selector configuration
 */

(function() {
  'use strict';

  let canvas, ctx;
  let particles = [];
  let animationId = null;
  let currentSettings = null;
  let audioContext = null;

  // Initialize audio context for sound effects
  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  }

  // Play a pop sound using Web Audio API
  function playPopSound() {
    try {
      const ctx = initAudio();

      // Create oscillator for the main pop
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Set up the pop sound characteristics
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

      // Envelope for a quick pop
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);

      // Add a slight crackle for realism
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.1;
      }

      const noiseSource = ctx.createBufferSource();
      const noiseGain = ctx.createGain();

      noiseSource.buffer = noiseBuffer;
      noiseSource.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      noiseSource.start(ctx.currentTime);
      noiseSource.stop(ctx.currentTime + 0.05);
    } catch (error) {
      // Audio might not be available or not yet initialized
      console.error('Audio error:', error);
    }
  }

  // Default settings
  const defaultSettings = {
    mode: 'all',              // 'all' or 'whitelist'
    urls: [],                 // Array of URL patterns
    buttonSelector: '',       // Specific CSS selector for buttons
    buttonSelectorMode: 'default'  // 'default' (auto-detect) or 'custom' (use selector)
  };

  // Load settings from storage
  async function loadSettings() {
    try {
      const result = await browser.storage.local.get('fireworksSettings');
      currentSettings = result.fireworksSettings || { ...defaultSettings };
    } catch (error) {
      console.error('Failed to load settings:', error);
      currentSettings = { ...defaultSettings };
    }
    return currentSettings;
  }

  // Check if current URL should activate
  function shouldActivate(settings) {
    if (settings.mode === 'all') {
      return true;
    }

    // Whitelist mode - check if current URL matches any pattern
    const currentUrl = window.location.href;

    return settings.urls.some(pattern => {
      return matchUrlPattern(currentUrl, pattern);
    });
  }

  // Match URL against pattern (supports * wildcard)
  function matchUrlPattern(url, pattern) {
    // Escape special regex characters except *
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');

    try {
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(url);
    } catch (error) {
      return false;
    }
  }

  // Initialize canvas overlay
  function initCanvas() {
    if (canvas) return;

    canvas = document.createElement('canvas');
    canvas.id = 'fireworks-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999999;
    `;
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.body.appendChild(canvas);
  }

  function resizeCanvas() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  // Particle class for fireworks
  class Particle {
    constructor(x, y, color, velocityMultiplier = 1, sizeMultiplier = 1) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 6 + 2) * velocityMultiplier;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity;
      this.gravity = 0.1;
      this.friction = 0.98;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.01;
      this.size = (Math.random() * 3 + 1) * sizeMultiplier;
      this.hasSparkle = Math.random() < 0.15; // 15% chance to sparkle
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw(context) {
      context.save();
      context.globalAlpha = this.alpha;

      if (this.hasSparkle) {
        // Sparkle effect - alternating brightness
        context.fillStyle = Math.random() > 0.5 ? '#ffffff' : this.color;
        context.shadowColor = this.color;
        context.shadowBlur = 10;
      } else {
        context.fillStyle = this.color;
      }

      context.beginPath();
      context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    isDead() {
      return this.alpha <= 0;
    }
  }

  // Create a burst of fireworks at the specified coordinates
  function createFireworks(x, y) {
    initCanvas();

    const colors = [
      '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
      '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24',
      '#ff7675', '#fd79a8', '#a29bfe', '#74b9ff', '#00cec9',
      '#fdcb6e', '#e17055', '#d63031', '#6c5ce7', '#0984e3'
    ];

    // Create more varied bursts across the entire screen
    const burstCount = 15;  // More bursts

    for (let burst = 0; burst < burstCount; burst++) {
      // Random position across the screen
      const burstX = Math.random() * window.innerWidth;
      const burstY = Math.random() * window.innerHeight;

      // Variety: each burst has different characteristics
      const variety = Math.random();

      let particleCount = 40;
      let velocityMultiplier = 1;
      let sizeMultiplier = 1;

      if (variety < 0.25) {
        // Big explosion
        particleCount = 80;
        velocityMultiplier = 1.5;
        sizeMultiplier = 1.5;
      } else if (variety < 0.5) {
        // Small burst
        particleCount = 25;
        velocityMultiplier = 0.7;
        sizeMultiplier = 0.7;
      } else if (variety < 0.75) {
        // Fast burst
        particleCount = 50;
        velocityMultiplier = 2;
        sizeMultiplier = 0.8;
      }

      // Play pop sound with slight delay
      setTimeout(() => {
        playPopSound();
      }, burst * 40);

      // Create burst particles with variety
      for (let i = 0; i < particleCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(burstX, burstY, color, velocityMultiplier, sizeMultiplier));
      }
    }

    if (!animationId) {
      animate();
    }
  }

  // Animation loop
  function animate() {
    if (particles.length === 0) {
      animationId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(particle => {
      particle.update();
      particle.draw(ctx);
      return !particle.isDead();
    });

    animationId = requestAnimationFrame(animate);
  }

  // Check if clicked element matches the configured button
  function isTargetButton(event, settings) {
    // Default mode: detect all button-like elements
    if (settings.buttonSelectorMode === 'default') {
      return event.target.closest('button, [role="button"], input[type="button"], input[type="submit"]');
    }

    // Custom mode: use specific selector
    if (settings.buttonSelectorMode === 'custom' && settings.buttonSelector) {
      try {
        // Check if clicked element or its parent matches the selector
        return event.target.closest(settings.buttonSelector);
      } catch (error) {
        console.error('Invalid button selector:', error);
        return false;
      }
    }

    return false;
  }

  // Main click handler
  function handleClick(event) {
    if (!currentSettings) return;

    // Check URL first
    if (!shouldActivate(currentSettings)) {
      return;
    }

    // Check button
    if (isTargetButton(event, currentSettings)) {
      // Resume audio context if suspended (browser autoplay policy)
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
      createFireworks(event.clientX, event.clientY);
    }
  }

  // Setup click listener
  function setupClickHandler() {
    loadSettings().then(settings => {
      if (shouldActivate(settings)) {
        document.addEventListener('click', handleClick, true); // Use capture phase
        console.log('Button Fireworks activated for:', window.location.href);
        console.log('Button selector mode:', settings.buttonSelectorMode);
        if (settings.buttonSelectorMode === 'custom') {
          console.log('Custom selector:', settings.buttonSelector);
        }
      } else {
        console.log('Button Fireworks: URL not in whitelist:', window.location.href);
      }
    });
  }

  // Listen for settings changes
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'reloadSettings') {
      // Remove old listener and re-setup
      document.removeEventListener('click', handleClick, true);
      setupClickHandler();
    }
  });

  // Clean up when page unloads
  window.addEventListener('beforeunload', () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });

  // Initialize
  setupClickHandler();
})();