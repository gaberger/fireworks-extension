/**
 * Button Fireworks - Options Page
 * Manages extension settings, URL whitelist, and button selector configuration
 */

(function() {
  'use strict';

  // DOM Elements
  const modeAll = document.getElementById('mode-all');
  const modeWhitelist = document.getElementById('mode-whitelist');
  const urlSection = document.getElementById('url-section');
  const urlModeHelp = document.getElementById('url-mode-help');
  const newUrlInput = document.getElementById('new-url');
  const addUrlBtn = document.getElementById('add-url');
  const savedUrlsContainer = document.getElementById('saved-urls');

  const buttonModeDefault = document.getElementById('button-mode-default');
  const buttonModeCustom = document.getElementById('button-mode-custom');
  const buttonSelectorSection = document.getElementById('button-selector-section');
  const buttonModeHelp = document.getElementById('button-mode-help');
  const buttonSelectorInput = document.getElementById('button-selector');

  const saveBtn = document.getElementById('save-settings');
  const statusEl = document.getElementById('status');
  const testFireworksBtn = document.getElementById('test-fireworks');

  // Default settings
  const defaultSettings = {
    mode: 'all',                     // 'all' or 'whitelist'
    urls: [],                        // Array of URL patterns
    buttonSelector: '',              // Specific CSS selector for buttons
    buttonSelectorMode: 'default'    // 'default' (auto-detect) or 'custom' (use selector)
  };

  // Current settings
  let settings = { ...defaultSettings };

  // Initialize options page
  async function init() {
    await loadSettings();
    setupEventListeners();
    renderSettings();
  }

  // Load settings from storage
  async function loadSettings() {
    try {
      const result = await browser.storage.local.get('fireworksSettings');
      settings = result.fireworksSettings || { ...defaultSettings };
    } catch (error) {
      console.error('Failed to load settings:', error);
      settings = { ...defaultSettings };
    }
  }

  // Save settings to storage
  async function saveSettings() {
    try {
      await browser.storage.local.set({ fireworksSettings: settings });
      showStatus('Settings saved successfully!', 'success');

      // Notify content scripts to reload
      const tabs = await browser.tabs.query({});
      for (const tab of tabs) {
        try {
          await browser.tabs.sendMessage(tab.id, { action: 'reloadSettings' });
        } catch (e) {
          // Tab might not have content script loaded, ignore
        }
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showStatus('Failed to save settings', 'error');
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    // URL mode selection
    modeAll.addEventListener('click', () => {
      settings.mode = 'all';
      renderSettings();
    });

    modeWhitelist.addEventListener('click', () => {
      settings.mode = 'whitelist';
      renderSettings();
    });

    // Button mode selection
    buttonModeDefault.addEventListener('click', () => {
      settings.buttonSelectorMode = 'default';
      settings.buttonSelector = '';
      renderSettings();
    });

    buttonModeCustom.addEventListener('click', () => {
      settings.buttonSelectorMode = 'custom';
      renderSettings();
    });

    // Add URL
    addUrlBtn.addEventListener('click', addUrl);
    newUrlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addUrl();
    });

    // Button selector input
    buttonSelectorInput.addEventListener('input', (e) => {
      settings.buttonSelector = e.target.value.trim();
    });

    // Save settings
    saveBtn.addEventListener('click', saveSettings);

    // Test fireworks
    testFireworksBtn.addEventListener('click', () => {
      const rect = testFireworksBtn.getBoundingClientRect();
      createTestFireworks(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    // Quick selector examples
    document.querySelectorAll('.selector-example').forEach(example => {
      example.addEventListener('click', () => {
        settings.buttonSelector = example.dataset.selector;
        settings.buttonSelectorMode = 'custom';
        renderSettings();
      });
    });
  }

  // Add new URL to whitelist
  function addUrl() {
    const url = newUrlInput.value.trim();

    if (!url) {
      showStatus('Please enter a URL pattern', 'error');
      return;
    }

    if (settings.urls.includes(url)) {
      showStatus('URL already in whitelist', 'error');
      return;
    }

    // Validate URL pattern
    if (!isValidUrlPattern(url)) {
      showStatus('Invalid URL pattern. Examples: https://example.com/* or https://example.com/page', 'error');
      return;
    }

    settings.urls.push(url);
    newUrlInput.value = '';
    renderSettings();
    showStatus('URL added', 'success');
  }

  // Remove URL from whitelist
  function removeUrl(url) {
    settings.urls = settings.urls.filter(u => u !== url);
    renderSettings();
  }

  // Validate URL pattern
  function isValidUrlPattern(pattern) {
    // Replace wildcards for validation
    const testPattern = pattern
      .replace(/\*/g, 'example')
      .replace(/:/g, '://')
      .replace(/\?/g, 'example');

    try {
      new URL(testPattern);
      return true;
    } catch {
      return false;
    }
  }

  // Render current settings
  function renderSettings() {
    // Update URL mode selection
    if (settings.mode === 'all') {
      modeAll.classList.add('active');
      modeWhitelist.classList.remove('active');
      urlSection.style.display = 'none';
      urlModeHelp.textContent = 'Fireworks appear on buttons across all websites.';
    } else {
      modeWhitelist.classList.add('active');
      modeAll.classList.remove('active');
      urlSection.style.display = 'block';
      urlModeHelp.textContent = 'Fireworks only appear on the whitelisted URLs below.';
    }

    // Update button mode selection
    if (settings.buttonSelectorMode === 'default') {
      buttonModeDefault.classList.add('active');
      buttonModeCustom.classList.remove('active');
      buttonSelectorSection.style.display = 'none';
      buttonModeHelp.textContent = 'Fireworks appear on all button-like elements (button, [role="button"], etc.).';
    } else {
      buttonModeCustom.classList.add('active');
      buttonModeDefault.classList.remove('active');
      buttonSelectorSection.style.display = 'block';
      buttonModeHelp.textContent = 'Fireworks only appear on elements matching your custom CSS selector.';
    }

    // Update button selector input
    buttonSelectorInput.value = settings.buttonSelector || '';

    // Render saved URLs
    renderSavedUrls();
  }

  // Render saved URLs list
  function renderSavedUrls() {
    savedUrlsContainer.innerHTML = '';

    if (settings.urls.length === 0) {
      savedUrlsContainer.innerHTML = '<div style="color: rgba(224,224,224,0.5); padding: 10px; text-align: center;">No URLs added yet</div>';
      return;
    }

    settings.urls.forEach(url => {
      const item = document.createElement('div');
      item.className = 'saved-url-item';
      item.textContent = '';
      item.appendChild(document.createTextNode(url));

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-remove';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        removeUrl(url);
      });

      item.appendChild(removeBtn);
      savedUrlsContainer.appendChild(item);
    });
  }

  // Show status message
  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = `status show ${type}`;

    setTimeout(() => {
      statusEl.classList.remove('show');
    }, 3000);
  }

  // Simple test fireworks with full screen effect and sound
  function createTestFireworks(x, y) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999999;';
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const particles = [];
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24'];

    // Create multiple bursts across the screen
    const burstCount = 8;
    const particleCount = 40;

    for (let burst = 0; burst < burstCount; burst++) {
      const burstX = Math.random() * window.innerWidth;
      const burstY = Math.random() * window.innerHeight;

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 6 + 2;
        particles.push({
          x: burstX, y: burstY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.01,
          size: Math.random() * 3 + 1
        });
      }
    }

    // Play sound for each burst
    for (let burst = 0; burst < burstCount; burst++) {
      setTimeout(() => playPopSound(), burst * 50);
    }

    function animate() {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const alive = [];
      particles.forEach(p => {
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += 0.1;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          alive.push(p);
        }
      });

      if (alive.length > 0) {
        particles.length = 0;
        particles.push(...alive);
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }
    animate();
  }

  // Play a pop sound using Web Audio API
  function playPopSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Create oscillator for the main pop
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400 + Math.random() * 200, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.15);

      // Add crackle
      const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.1;
      }

      const noiseSource = audioCtx.createBufferSource();
      const noiseGain = audioCtx.createGain();

      noiseSource.buffer = noiseBuffer;
      noiseSource.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);

      noiseGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

      noiseSource.start(audioCtx.currentTime);
      noiseSource.stop(audioCtx.currentTime + 0.05);
    } catch (error) {
      console.error('Audio error:', error);
    }
  }

  // Initialize
  init();
})();