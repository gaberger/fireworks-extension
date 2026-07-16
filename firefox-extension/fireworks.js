/**
 * Button Fireworks - Content Script
 * Displays fireworks when buttons are clicked on web pages
 * Supports URL and button selector configuration
 * Cross-browser compatible (Chrome/Firefox)
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
  let logoStartTime = 0;

  // Forward Networks SVG logo (inline)
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 22" width="340" height="44">
    <path fill="#ff3506" d="M118.901 1h-16.95v4.057h13.119L99.081 21h5.753l13.097-13.059V21H122V4.09c0-1.706-1.393-3.09-3.099-3.09"/>
    <path fill="#ffffff" d="M37.452 3.668c-.86-.879-1.882-1.557-3.058-2.039s-2.46-.721-3.85-.721-2.673.239-3.85.721c-1.176.482-2.203 1.16-3.071 2.039-.873.879-1.548 1.932-2.032 3.16-.483 1.228-.723 2.585-.723 4.06v.196c0 1.497.24 2.862.723 4.09s1.159 2.282 2.032 3.16c.873.879 1.895 1.557 3.071 2.039s2.46.721 3.85.721 2.673-.239 3.85-.721c1.176-.482 2.194-1.16 3.058-2.039s1.536-1.932 2.015-3.16c.483-1.228.723-2.593.723-4.09v-.196c0-1.48-.24-2.832-.723-4.06-.479-1.228-1.151-2.282-2.015-3.16m-1.292 7.417c0 1.292-.24 2.401-.723 3.327-.483.925-1.146 1.629-1.989 2.12s-1.814.734-2.904.734-2.066-.243-2.917-.734c-.851-.49-1.518-1.198-2.002-2.12-.483-.926-.723-2.034-.723-3.327v-.196c0-1.275.24-2.376.723-3.301.483-.926 1.151-1.629 2.002-2.12.851-.49 1.826-.734 2.917-.734s2.062.247 2.904.734c.843.49 1.506 1.198 1.989 2.12.483.926.723 2.026.723 3.301zm22.483 2.086c1.071-.497 1.9-1.222 2.495-2.185.591-.963.886-2.149.886-3.556s-.295-2.563-.886-3.516c-.591-.954-1.424-1.675-2.495-2.171C57.572 1.246 56.324 1 54.892 1H46v20h4.069v-7.086h4.148L58.013 21h4.616l-4.32-7.697c.106-.044.225-.084.335-.132Zm-8.574-8.769h4.62c.957 0 1.724.286 2.306.857q.873.8565.873 2.229c0 1.3725-.291 1.701-.873 2.242-.582.545-1.353.813-2.306.813h-4.62zm37.856 10.523L83.759 1h-4.497L75.07 14.934 71.526 1H67.4l5.528 20h4.214l4.355-15.029L85.879 21h4.157l5.559-20h-4.126zM5.042 4.657h10.492V1H1v20h4.042v-7.455h9.804V9.941H5.042zm136.601 8.514c1.071-.497 1.9-1.222 2.491-2.185s.89-2.149.89-3.556-.295-2.563-.89-3.516c-.889-1.076-1.86-1.853-2.491-2.171-1.071-.497-2.323-.743-3.756-.743H129v20h4.069v-7.086h4.148L141.013 21h4.61l-4.32-7.697c.111-.044.23-.079.34-.132m-8.574-8.769h4.616c.957 0 1.724.286 2.305.857.583.571.874 1.314.874 2.229s-.291 1.701-.874 2.242c-.582.545-1.353.813-2.305.813h-4.616zm35.092 2.453c-.506-1.2-1.208-2.237-2.107-3.112s-1.957-1.552-3.179-2.031C161.654 1.237 160.323 1 158.89 1H151v20h7.89c1.415 0 2.73-.237 3.942-.712s2.275-1.156 3.182-2.044c.908-.888 1.619-1.93 2.135-3.13s.771-2.532.771-4v-.286c.004-1.451-.251-2.774-.759-3.974Zm-3.394 4.255c0 1.218-.265 2.286-.789 3.2s-1.257 1.631-2.191 2.145c-.935.514-2.006.769-3.209.769h-3.509V4.767h3.509c1.244 0 2.329.255 3.254.756.926.505 1.649 1.209 2.165 2.114s.771 1.965.771 3.187v.286Z"/>
</svg>`;

  // Load logo image using Blob
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
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (e) => {
        console.error('❌ Logo failed to load:', e);
        reject(e);
      };

      const svgBlob = new Blob([logoSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      console.log('📥 Loading logo from SVG Blob...');
      img.src = url;
    });
  }

  // Default settings
  const defaultSettings = {
    mode: 'all',
    urls: [],
    buttonSelector: '',
    buttonSelectorMode: 'default'
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

    const currentUrl = window.location.href;
    return settings.urls.some(pattern => {
      return matchUrlPattern(currentUrl, pattern);
    });
  }

  // Match URL against pattern (supports * wildcard)
  function matchUrlPattern(url, pattern) {
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

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      console.log('Playing pop sound, context state:', ctx.state);

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);

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
      console.error('Audio error:', error);
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
      this.gravity = 0.08;
      this.friction = 0.985;
      this.alpha = 1;
      this.decay = Math.random() * 0.003 + 0.005;
      this.size = (Math.random() * 3 + 1) * sizeMultiplier;
      this.hasSparkle = Math.random() < 0.2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.15;
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
        default:
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

  // Create fireworks bursts
  function createFireworks(x, y) {
    initCanvas();

    const colors = [
      '#ff6b6b', '#ff7675', '#fd79a8', '#e84393', '#d63031',
      '#c0392b', '#e55039', '#eb4d4b', '#ff4757', '#ff7f50',
      '#feca57', '#fdcb6e', '#f1c40f', '#f39c12', '#e17055',
      '#ff9f43', '#ee5a24', '#d35400', '#e67e22', '#f39c12',
      '#48dbfb', '#74b9ff', '#00cec9', '#10ac84', '#00b894',
      '#55efc4', '#00d2d3', '#16a085', '#1abc9c', '#2ecc71',
      '#54a0ff', '#5f27cd', '#6c5ce7', '#a29bfe', '#0984e3',
      '#3498db', '#2980b9', '#8e44ad', '#9b59b6', '#6c5ce7',
      '#ffd700', '#c0c0c0', '#ffffff', '#7fff00', '#ff00ff',
      '#00ffff', '#ff1493', '#00ff00', '#ff6347', '#20b2aa'
    ];

    const burstCount = 30;
    const shapes = ['circle', 'star', 'diamond', 'triangle', 'heart', 'square'];

    showLogo();

    for (let burst = 0; burst < burstCount; burst++) {
      const burstX = Math.random() * window.innerWidth;
      const burstY = Math.random() * window.innerHeight;
      const dominantShape = shapes[Math.floor(Math.random() * shapes.length)];

      const variety = Math.random();

      let particleCount = 60;
      let velocityMultiplier = 1;
      let sizeMultiplier = 1;

      if (variety < 0.25) {
        particleCount = 120;
        velocityMultiplier = 1.5;
        sizeMultiplier = 1.5;
      } else if (variety < 0.5) {
        particleCount = 40;
        velocityMultiplier = 0.7;
        sizeMultiplier = 0.7;
      } else if (variety < 0.75) {
        particleCount = 80;
        velocityMultiplier = 2;
        sizeMultiplier = 0.8;
      }

      setTimeout(() => {
        playPopSound();
      }, burst * 25);

      for (let i = 0; i < particleCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
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

    const elapsed = Date.now() - logoStartTime;
    const scale = Math.min(1, 0.3 + (elapsed / 400) * 0.7);

    const centerX = logoCanvas.width / 2;
    const centerY = logoCanvas.height / 2;

    logoCtx.translate(centerX, centerY);
    logoCtx.scale(scale, scale);
    logoCtx.translate(-centerX, -centerY);

    if (logoImage) {
      const logoWidth = 340;
      const logoHeight = 44;
      const x = (logoCanvas.width - logoWidth) / 2;
      const y = (logoCanvas.height - logoHeight) / 2;

      logoCtx.shadowColor = '#ff3506';
      logoCtx.shadowBlur = 25;

      logoCtx.drawImage(logoImage, x, y, logoWidth, logoHeight);
    } else {
      logoCtx.fillStyle = '#ff3506';
      logoCtx.font = 'bold 32px Arial';
      logoCtx.textAlign = 'center';
      logoCtx.textBaseline = 'middle';
      logoCtx.fillText('FORWARD NETWORKS', 200, 50);
    }

    logoCtx.restore();
  }

  // Fade out logo
  function updateLogo() {
    if (!logoShowing) return;

    logoAlpha -= 0.008;

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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(particle => {
      particle.update();
      particle.draw(ctx);
      return !particle.isDead();
    });

    updateLogo();
    drawLogo();

    animationId = requestAnimationFrame(animate);
  }

  // Check if clicked element matches the configured button
  function isTargetButton(event, settings) {
    if (settings.buttonSelectorMode === 'default') {
      const target = event.target.closest('button, [role="button"], input[type="button"], input[type="submit"]');
      if (target) {
        console.log('🎆 Button detected (default mode):', target.tagName, target.className);
      }
      return target;
    }

    if (settings.buttonSelectorMode === 'custom' && settings.buttonSelector) {
      try {
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

    if (!shouldActivate(currentSettings)) {
      console.log('🚫 URL not activated for:', window.location.href);
      console.log('   Mode:', currentSettings.mode, 'URLs:', currentSettings.urls);
      return;
    }

    if (isTargetButton(event, currentSettings)) {
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
        document.addEventListener('click', handleClick, true);
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