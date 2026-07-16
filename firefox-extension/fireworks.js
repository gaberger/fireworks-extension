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
  let logoCanvas = null;
  let logoCtx = null;
  let logoAlpha = 0;
  let logoShowing = false;
  let logoImage = null;

  // Forward Networks SVG logo
  const logoSvgData = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNzAgMjIiPgogICAgPHBhdGggZmlsbD0iI2ZmMzUwNiIgZD0iTTE1MC44ODkgMmgtMTYuOTV2NC4wNTdoMTMuMTE5TDEzMS4wNjkgMjFoNS43NTNsMTMuMDk3LTEzLjA1OXYyMWgtOC42MDlWNi4wOWMwLTEuNzA2LTEuMzkzLTMuMDktMy4wOTktMy4wOSIvPgogICAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTYxLjQzIDMuNjY4Yy0uODYtLjg3OS0xLjg4Mi0xLjU1Ny0zLjA1OC0yLjAzOXMtMi40Ni0uNzIxLTMuODUtLjcyMS0yLjY3My4yMzktMy44NS43MjFjLTEuMTc2LjQ4Mi0yLjIwMyAxLjE2LTMuMDcxIDIuMDM5LS44NzMuODc5LTEuNTQ4IDEuOTMyLTIuMDMyIDMuMTYtLjQ4MyAxLjIyOC0uNzIzIDIuNTg1LS43MjMgNC4wNnYuMTk2YzAgMS40OTcuMjQgMi44NjIuNzIzIDQuMDlzMS4xNTkgMi4yODIgMi4wMzIgMy4xNmMuODczLjg3OSAxLjg5NSAxLjU1NyAzLjA3MSAyLjAzOXMyLjQ2LjcyMSAzLjg1LjcyMSAyLjY3My0uMjM5IDMuODUtLjcyMWMxLjE3Ni0uNDgyIDIuMTk0LTEuMTYgMy4wNTgtMi4wMzlzMS41MzYtMS45MzIgMi4wMTUtMy4xNmMuNDgzLTEuMjI4LjcyMy0yLjU5My43MjMtNC4wOXYtLjE5NmMwLTEuNDgtLjI0LTIuODMyLS43MjMtNC4wNi0uNDc5LTEuMjI4LTEuMTUxLTIuMjgyLTIuMDE1LTMuMTZtLTEuMjkyIDcuNDE3YzAgMS4yOTItLjI0IDIuNDAxLS43MjMgMy4zMjctLjQ4My45MjUtMS4xNDYgMS42MjktMS45ODkgMi4xMnMtMS44MTQuNzM0LTIuOTA0LjczNC0yLjA2Ni0uMjQzLTIuOTE3LS43MzRjLS44NTEtLjQ5LTEuNTE4LTEuMTk4LTIuMDAyLTIuMTItLjQ4My0uOTI2LS43MjMtMi4wMzQtLjcyMy0zLjMyN3YtLjE5NmMwLTEuMjc1LjI0LTIuMzc2LjcyMy0zLjMwMS40ODMtLjkyNiAxLjE1MS0xLjYyOSAyLjAwMi0yLjEyLjg1MS0uNDkgMS44MjYtLjczNCAyLjkxNy0uNzM0czIuMDYyLjI0NyAyLjkwNC43MzRjLjg0My40OSAxLjUwNiAxLjE5OCAxLjk4OSAyLjEyLjQ4My45MjYuNzIzIDIuMDI2LjcyMyAzLjMwMXptMjIuNDgzIDIuMDg2YzEuMDcxLS40OTcgMS45LTEuMjIyIDIuNDk1LTIuMTg1LjU5MS0uOTYzLjg4Ni0yLjE0OS44ODYtMy41NTZzLS4yOTUtMi41NjMtLjg4Ni0zLjUxNmMtLjU5MS0uOTU0LTEuNDI0LTEuNjc1LTIuNDk1LTIuMTcxQzU3LjU3MiAxLjI0NiA1Ni4zMjQgMSA1NC44OTIgMUg0NnYyMGg0LjA2OXYtNy4wODZoNC4xNDhMNThLjAxMyAyMWg0LjYxNmwtNC4zMi03LjY5N2MuMTA2LS4wNDQuMjI1LS4wODQuMzM1LS4xMzJabS04LjU3NC04Ljc2OWg0LjYyYy45NTcgMCAxLjcyNC4yODYgMi4zMDYuODU3cS44NzMuODU2NS44NzMgMi4yMjljMCAxLjM3MjUtLjI5MSAxLjcwMS0uODczIDIuMjQyLS41ODIuNTQ1LTEuMzUzLjgxMy0yLjMwNi44MTNoLTQuNjJ6bTM3Ljg1NiAxMC41MjNMODMuNzU5IDFoLTQuNDk3TDc1LjA3IDE0LjkzNCA3MS41MjYgMUg2Ny40bDUuNTI4IDIwaDQuMjE0bDQuMzU1LTE1LjAyOUw4NS44NzkgMjFoNC4xNTdsNS41NTktMjBoLTQuMTI2ek01LjA0MiA0LjY1N2gxMC40OTJWMUgxdjIwaDQuMDQydi03LjQ1NWg5LjgwNFY5Ljk0MUg1LjA0Mm0xMzYuNjAxIDguNTE0YzEuMDcxLS40OTcgMS45LTEuMjIyIDIuNDkxLTIuMTg1cy44OS0yLjE0OS44OS0zLjU1Ni0uMjk1LTIuNTYzLS44OS0zLjUxNmMtLjg4OS0xLjA3Ni0xLjg2LTEuODUzLTIuNDkxLTIuMTcxLTEuMDcxLS40OTctMi4zMjMtLjc0My0zLjc1Ni0uNzQzSDEyOXYyMGg0LjA2OXYtNy4wODZoNC4xNDhMMTQxLjAxMyAyMWg0LjYxbC00LjMyLTcuNjk3Yy4xMTEtLjA0NC4yMy0uMDc5LjM0LS4xMzJtLTguNTc0LTguNzY5aDQuNjE2Yy45NTcgMCAxLjcyNC4yODYgMi4zMDUuODU3LjU4My41NzEuODc0IDEuMzE0Ljg3NCAyLjIyOXMtLjI5MSAxLjcwMS0uODc0IDIuMjQyYy0uNTgyLjU0NS0xLjM1My44MTMtMi4zMDUuODEzaC00LjYxNnptMzUuMDkyIDIuNDUzYy0uNTA2LTEuMi0xLjIwOC0yLjIzNy0yLjEwNy0zLjExMnMtMS45NTctMS41NTItMy4xNzktMi4wMzFDMTU4LjY1NSAxLjIzNyAxNTUuMzIzIDEgMTUyLjg5IDFIMTQ2djIwaDcuODljMS40MTUgMCAyLjczLS4yMzcgMy45NDItLjcxMnMyMi4yNzUtMS4xNTYgMy4xODItMi4wNDRjLjkwOC0uODg4IDEuNjE5LTEuOTMgMi4xMzUtMy4xM3MuNzcxLTIuNTMyLjc3MS00di0uMjg2Yy4wMDQtMS40NTEtLjI1MS0yLjc3NC0uNzU5LTMuOTc0Wm0tMy4zOTQgNC4yNTVjMCAxLjIxOC0uMjY1IDIuMjg2LS43ODkgMy4ycy0xLjI1NyAxLjYzMS0yLjE5MSAyLjE0NWMtLjkzNS41MTQtMi4wMDYuNzY5LTMuMjA5Ljc2OWgtMy41MDlWNC43NjdoMy41MDljMS4yNDQgMCAyLjMyOS4yNTUgMy4yNTQuNzU2LjkyNi41MDUgMS42NDkgMS4yMDkgMi4xNjUgMi4xMTRzLjc3MSAxLjk2NS43NzEgMy4xODd2LjI4NloiLz4KPC9zdmc+`;

  // Load logo image
  function loadLogoImage() {
    return new Promise((resolve, reject) => {
      if (logoImage) {
        resolve(logoImage);
        return;
      }

      const img = new Image();
      img.onload = () => {
        logoImage = img;
        console.log('✅ Logo loaded successfully');
        resolve(img);
      };
      img.onerror = (e) => {
        console.error('❌ Logo failed to load:', e);
        reject(e);
      };
      console.log('📥 Loading logo from data URL...');
      img.src = logoSvgData;
    });
  }

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

      // Resume if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      console.log('Playing pop sound, context state:', ctx.state);

      // Create oscillator for the main pop
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Set up the pop sound characteristics
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

      // Envelope for a quick pop - INCREASED VOLUME
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);

      // Add a crackle for realism
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.15;
      }

      const noiseSource = ctx.createBufferSource();
      const noiseGain = ctx.createGain();

      noiseSource.buffer = noiseBuffer;
      noiseSource.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
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
      const result = await chrome.storage.local.get('fireworksSettings');
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
    constructor(x, y, color, velocityMultiplier = 1, sizeMultiplier = 1, shape = 'circle') {
      this.x = x;
      this.y = y;
      this.color = color;
      this.shape = shape || this.randomShape();
      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 6 + 2) * velocityMultiplier;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity;
      this.gravity = 0.08; // Slower gravity for longer effect
      this.friction = 0.985; // Less friction for longer travel
      this.alpha = 1;
      this.decay = Math.random() * 0.003 + 0.005; // Lasts ~1000ms
      this.size = (Math.random() * 3 + 1) * sizeMultiplier;
      this.hasSparkle = Math.random() < 0.2; // 20% chance to sparkle
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.15; // Slower rotation
    }

    randomShape() {
      const shapes = ['circle', 'star', 'diamond', 'triangle', 'heart', 'square'];
      return shapes[Math.floor(Math.random() * shapes.length)];
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
      this.rotation += this.rotationSpeed;
    }

    draw(context) {
      context.save();
      context.globalAlpha = this.alpha;
      context.translate(this.x, this.y);
      context.rotate(this.rotation);

      if (this.hasSparkle) {
        context.fillStyle = Math.random() > 0.5 ? '#ffffff' : this.color;
        context.shadowColor = this.color;
        context.shadowBlur = 10;
      } else {
        context.fillStyle = this.color;
      }

      this.drawShape(context);
      context.restore();
    }

    drawShape(context) {
      const s = this.size;

      switch (this.shape) {
        case 'star':
          this.drawStar(context, 0, 0, 5, s, s / 2);
          break;
        case 'diamond':
          context.beginPath();
          context.moveTo(0, -s);
          context.lineTo(s * 0.6, 0);
          context.lineTo(0, s);
          context.lineTo(-s * 0.6, 0);
          context.closePath();
          context.fill();
          break;
        case 'triangle':
          context.beginPath();
          context.moveTo(0, -s);
          context.lineTo(s * 0.866, s * 0.5);
          context.lineTo(-s * 0.866, s * 0.5);
          context.closePath();
          context.fill();
          break;
        case 'heart':
          this.drawHeart(context, 0, 0, s);
          break;
        case 'square':
          context.fillRect(-s, -s, s * 2, s * 2);
          break;
        default: // circle
          context.beginPath();
          context.arc(0, 0, s, 0, Math.PI * 2);
          context.fill();
      }
    }

    drawStar(context, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }

      context.lineTo(cx, cy - outerRadius);
      context.closePath();
      context.fill();
    }

    drawHeart(context, x, y, size) {
      const s = size * 0.8;
      context.beginPath();
      context.moveTo(x, y + s * 0.3);
      context.bezierCurveTo(x, y - s * 0.5, x - s, y - s * 0.5, x - s, y + s * 0.2);
      context.bezierCurveTo(x - s, y + s * 0.7, x, y + s, x, y + s);
      context.bezierCurveTo(x, y + s, x + s, y + s * 0.7, x + s, y + s * 0.2);
      context.bezierCurveTo(x + s, y - s * 0.5, x, y - s * 0.5, x, y + s * 0.3);
      context.fill();
    }

    isDead() {
      return this.alpha <= 0;
    }
  }

  // Create a burst of fireworks at the specified coordinates
  function createFireworks(x, y) {
    initCanvas();

    const colors = [
      // Reds and Pinks
      '#ff6b6b', '#ff7675', '#fd79a8', '#e84393', '#d63031',
      '#c0392b', '#e55039', '#eb4d4b', '#ff4757', '#ff7f50',

      // Oranges and Yellows
      '#feca57', '#fdcb6e', '#f1c40f', '#f39c12', '#e17055',
      '#ff9f43', '#ee5a24', '#d35400', '#e67e22', '#f39c12',

      // Greens and Teals
      '#48dbfb', '#74b9ff', '#00cec9', '#10ac84', '#00b894',
      '#55efc4', '#00d2d3', '#16a085', '#1abc9c', '#2ecc71',

      // Blues and Purples
      '#54a0ff', '#5f27cd', '#6c5ce7', '#a29bfe', '#0984e3',
      '#3498db', '#2980b9', '#8e44ad', '#9b59b6', '#6c5ce7',

      // Special colors
      '#ffd700', '#c0c0c0', '#ffffff', '#7fff00', '#ff00ff',
      '#00ffff', '#ff1493', '#00ff00', '#ff6347', '#20b2aa'
    ];

    // Create more varied bursts across the entire screen
    const burstCount = 30;  // More bursts (doubled)

    // Show logo in center
    showLogo();

    for (let burst = 0; burst < burstCount; burst++) {
      // Random position across the screen
      const burstX = Math.random() * window.innerWidth;
      const burstY = Math.random() * window.innerHeight;

      // Variety: each burst has different characteristics
      const variety = Math.random();

      let particleCount = 60;  // More particles (increased from 40)
      let velocityMultiplier = 1;
      let sizeMultiplier = 1;

      // Dominant shape for this burst (70% use this shape, 30% random)
      const shapes = ['circle', 'star', 'diamond', 'triangle', 'heart', 'square'];
      const dominantShape = shapes[Math.floor(Math.random() * shapes.length)];

      if (variety < 0.25) {
        // Big explosion
        particleCount = 120;  // Increased from 80
        velocityMultiplier = 1.5;
        sizeMultiplier = 1.5;
      } else if (variety < 0.5) {
        // Small burst
        particleCount = 40;  // Increased from 25
        velocityMultiplier = 0.7;
        sizeMultiplier = 0.7;
      } else if (variety < 0.75) {
        // Fast burst
        particleCount = 80;  // Increased from 50
        velocityMultiplier = 2;
        sizeMultiplier = 0.8;
      }

      // Play pop sound with slight delay
      setTimeout(() => {
        playPopSound();
      }, burst * 25);  // Faster sound timing

      // Create burst particles with variety
      for (let i = 0; i < particleCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        // 70% use dominant shape, 30% random
        const shape = Math.random() < 0.7 ? dominantShape : null;
        particles.push(new Particle(burstX, burstY, color, velocityMultiplier, sizeMultiplier, shape));
      }
    }

    if (!animationId) {
      animate();
    }
  }

  // Show logo in center of screen
  function showLogo() {
    console.log('🎆 showLogo called, logoImage:', !!logoImage);

    if (!logoCanvas) {
      logoCanvas = document.createElement('canvas');
      logoCanvas.id = 'fireworks-logo';
      logoCanvas.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 2147483647;
      `;
      document.body.appendChild(logoCanvas);
      logoCtx = logoCanvas.getContext('2d');
    }

    logoCanvas.width = 500;
    logoCanvas.height = 120;
    logoAlpha = 1;
    logoShowing = true;
    logoStartTime = Date.now();
  }

  // Draw the logo
  function drawLogo() {
    if (!logoShowing || !logoCtx) {
      console.log('⚠️ drawLogo: not showing or no ctx', { logoShowing, hasCtx: !!logoCtx });
      return;
    }

    logoCtx.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
    logoCtx.save();
    logoCtx.globalAlpha = logoAlpha;

    console.log('Drawing logo, alpha:', logoAlpha, 'image loaded:', !!logoImage);

    // Calculate scale animation
    const elapsed = Date.now() - logoStartTime;
    const scale = Math.min(1, 0.3 + (elapsed / 400) * 0.7);

    // Center and scale
    const centerX = logoCanvas.width / 2;
    const centerY = logoCanvas.height / 2;

    logoCtx.translate(centerX, centerY);
    logoCtx.scale(scale, scale);
    logoCtx.translate(-centerX, -centerY);

    if (logoImage) {
      // Draw Forward Networks logo
      const logoWidth = 340;
      const logoHeight = 44;
      const x = (logoCanvas.width - logoWidth) / 2;
      const y = (logoCanvas.height - logoHeight) / 2;

      // Add glow effect
      logoCtx.shadowColor = '#ff3506';
      logoCtx.shadowBlur = 25;

      logoCtx.drawImage(logoImage, x, y, logoWidth, logoHeight);
    } else {
      // Fallback: draw text
      logoCtx.fillStyle = '#ff3506';
      logoCtx.font = 'bold 32px Arial';
      logoCtx.textAlign = 'center';
      logoCtx.textBaseline = 'middle';
      logoCtx.fillText('FORWARD NETWORKS', 200, 50);
    }

    logoCtx.restore();
  }

  let logoStartTime = 0;

  // Fade out logo
  function updateLogo() {
    if (!logoShowing) return;

    logoAlpha -= 0.008;  // Fade out over ~2 seconds

    if (logoAlpha <= 0) {
      logoShowing = false;
      if (logoCanvas && logoCanvas.parentNode) {
        logoCanvas.parentNode.removeChild(logoCanvas);
        logoCanvas = null;
        logoCtx = null;
      }
    }
  }

  // Animation loop
  function animate() {
    if (particles.length === 0 && !logoShowing) {
      animationId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Use clearRect for full transparency (no dark background)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(particle => {
      particle.update();
      particle.draw(ctx);
      return !particle.isDead();
    });

    // Update and draw logo
    updateLogo();
    drawLogo();

    animationId = requestAnimationFrame(animate);
  }

  // Check if clicked element matches the configured button
  function isTargetButton(event, settings) {
    // Default mode: detect all button-like elements
    if (settings.buttonSelectorMode === 'default') {
      const target = event.target.closest('button, [role="button"], input[type="button"], input[type="submit"]');
      if (target) {
        console.log('🎆 Button detected (default mode):', target.tagName, target.className);
      }
      return target;
    }

    // Custom mode: use specific selector
    if (settings.buttonSelectorMode === 'custom' && settings.buttonSelector) {
      try {
        // Check if clicked element or its parent matches the selector
        const target = event.target.closest(settings.buttonSelector);
        if (target) {
          console.log('🎆 Button detected (custom selector):', settings.buttonSelector);
        }
        return target;
      } catch (error) {
        console.error('Invalid button selector:', error);
        return false;
      }
    }

    return false;
  }

  // Main click handler
  function handleClick(event) {
    if (!currentSettings) {
      console.log('⚠️ No settings loaded');
      return;
    }

    // Check URL first
    if (!shouldActivate(currentSettings)) {
      console.log('🚫 URL not activated for:', window.location.href);
      console.log('   Mode:', currentSettings.mode, 'URLs:', currentSettings.urls);
      return;
    }

    // Check button
    if (isTargetButton(event, currentSettings)) {
      // Resume audio context if suspended (browser autoplay policy)
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
      console.log('🎆 FIREWORKS ACTIVATED!');
      createFireworks(event.clientX, event.clientY);
    }
  }

  // Setup click listener
  function setupClickHandler() {
    loadSettings().then(settings => {
      currentSettings = settings;
      console.log('🎆 Button Fireworks Settings Loaded:');
      console.log('   URL mode:', settings.mode);
      console.log('   Whitelist URLs:', settings.urls);
      console.log('   Button selector mode:', settings.buttonSelectorMode);
      console.log('   Custom selector:', settings.buttonSelector);
      console.log('   Current URL:', window.location.href);

      if (shouldActivate(settings)) {
        document.addEventListener('click', handleClick, true); // Use capture phase
        console.log('✅ Button Fireworks ACTIVATED for this page');
        console.log('   Click any button to test');
      } else {
        console.log('❌ Button Fireworks NOT activated - URL not in whitelist');
      }
    });
  }

  // Listen for settings changes
  chrome.runtime.onMessage.addListener((message) => {
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

  // Preload logo image
  loadLogoImage().catch(() => {
    console.log('Logo preloading failed, will use fallback');
  });
})();