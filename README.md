# 🎆 Fireworks Extension

[![Latest Release](https://img.shields.io/github/v/release/gaberger/fireworks-extension)](https://github.com/gaberger/fireworks-extension/releases/latest)
[![License](https://img.shields.io/github/license/gaberger/fireworks-extension)](LICENSE)
[![GitHub Topics](https://img.shields.io/github/topics/gaberger/fireworks-extension/browser-extension)](https://github.com/gaberger/fireworks-extension)

A fun browser extension that displays colorful fireworks animations with customizable triggers on web pages.

## ✨ Features

- 🎆 **Colorful Fireworks** - Beautiful particle-based animations with physics
- 🎯 **Configurable Triggers** - URL whitelisting and custom element selectors
- 🌐 **Cross-Browser** - Works on Firefox, Chrome, and DuckDuckGo browsers
- 🔊 **Sound Effects** - Enhanced audio feedback for better experience
- 🎨 **Transparent Logo** - Clean Forward Networks branding overlay
- ⚡ **Smooth Performance** - 60fps animations with optimized canvas rendering
- 🎪 **Customizable** - Easy configuration through intuitive settings UI

## 🚀 Quick Start

### Option 1: Download Release (Recommended)

1. Download the latest release from [GitHub Releases](https://github.com/gaberger/fireworks-extension/releases/latest)
2. Extract `fireworks-extension-v2.0.zip`
3. Install in your browser:
   - **Firefox**: `about:addons` → Gear → "Install Add-on From File..."
   - **Chrome**: `chrome://extensions/` → "Developer mode" → "Load unpacked"
   - **DuckDuckGo**: Similar to Chrome installation

### Option 2: Clone and Install

```bash
git clone https://github.com/gaberger/fireworks-extension.git
cd fireworks-extension/firefox-extension
```

Then load the extension in your browser's developer mode.

## 📖 Documentation

- **[Installation Guide](INSTALL.md)** - Detailed installation instructions for all browsers
- **[FAQ](FAQ.md)** - Common questions and solutions (especially Firefox verification issues)
- **[Extension README](firefox-extension/README.md)** - Comprehensive features and configuration guide

## 🎮 Usage

1. **Install the extension** using one of the methods above
2. **Click the extension icon** in your browser toolbar
3. **Configure settings**:
   - Choose "All Sites" or "Whitelist" mode
   - Add URLs for whitelist mode
   - Set custom element selectors if needed
4. **Test** using the built-in "Click to Test Fireworks!" button
5. **Enjoy fireworks** on your configured websites!

## 🛠️ Technical Details

- **Manifest Version**: 3 (modern extension format)
- **Rendering**: HTML5 Canvas for smooth animations
- **Storage**: Browser storage API for persistent settings
- **Performance**: Optimized particle system with physics
- **Compatibility**: Cross-browser with fallback support

## ⚙️ Configuration Examples

### Example 1: GitHub Pull Request Pages
```javascript
URL Mode: Whitelist
Allowed URLs:
- https://github.com/*/pull/*

Button Mode: All Buttons
```
*Fireworks appear only on GitHub pull request pages*

### Example 2: Submit Buttons on All Sites
```javascript
URL Mode: All Sites

Button Mode: Custom Selector
Custom Selector: button[type="submit"]
```
*Fireworks appear on all submit buttons across all websites*

### Example 3: Multiple Domains with Specific Triggers
```javascript
URL Mode: Whitelist
Allowed URLs:
- https://github.com/*
- https://gitlab.com/*

Button Mode: Custom Selector
Custom Selector: button.btn-primary, .merge-button
```
*Fireworks appear on primary and merge buttons on GitHub/GitLab*

### Example 4: Company Dashboard
```javascript
URL Mode: Whitelist
Allowed URLs:
- https://dashboard.company.com/*

Button Mode: Custom Selector
Custom Selector: [data-action="submit"], [role="button"]
```
*Fireworks appear on submit actions and button roles on company dashboard*

## 📋 CSS Selector Guide

### Finding Selectors
1. Right-click on an element
2. Select "Inspect" 
3. Right-click the highlighted element
4. Choose "Copy → Copy selector"

### Common Selectors
```css
/* By ID */
#submit-button

/* By Class */  
.btn-primary
.submit-form

/* By Attribute */
[data-testid="submit"]
[type="submit"]

/* Combined */
button.btn-primary.submit
div.container > button.action

/* Multiple */
button.primary, button.secondary, .submit-action
```

### URL Pattern Examples
```
https://example.com/*           # All pages on example.com
https://*.github.com/*          # All GitHub subdomains
*://*.github.com/*              # GitHub across all protocols
https://github.com/*/issues/*   # All GitHub issue pages
```

## 🧪 Testing Configuration

1. Open browser console (F12)
2. Test your selector: `document.querySelector('your-selector')`
3. If it returns an element, your selector is correct
4. If it returns `null`, try a more specific selector

For more detailed examples, see the [Extension README](firefox-extension/README.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Star History

If you find this extension helpful, please consider giving it a ⭐ star on GitHub!

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/gaberger/fireworks-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gaberger/fireworks-extension/discussions)

---

**Made with ❤️ and 🎆 fireworks**