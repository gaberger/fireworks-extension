# Fireworks Extension - Installation Guide

## Quick Start

### Clone and Install

1. **Download the Extension**
   ```bash
   git clone https://github.com/gaberger/fireworks-extension.git
   cd fireworks-extension/firefox-extension
   ```

2. **Install in Browser**
   - **Firefox**: Go to `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on..." → Select `manifest.json`
   - **Chrome**: Go to `chrome://extensions/` → Enable "Developer mode" → "Load unpacked" → Select the folder
   - **DuckDuckGo**: Similar to Chrome - enable developer mode and load unpacked extension

## Detailed Installation Instructions

### Firefox Installation

#### Temporary Installation (For Testing)
1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Select the `firefox-extension` folder
5. Choose any file inside (or select `manifest.json` directly)
6. Extension loads immediately

**Note**: Temporary extensions are removed when Firefox restarts.

### Chrome/Chromium Installation

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `firefox-extension` folder
5. Extension loads immediately

### DuckDuckGo Browser Installation

DuckDuckGo Browser is Chromium-based, so follow Chrome instructions:
1. Open browser settings → Extensions
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `firefox-extension` folder

## Configuration

After installation, configure the extension:

1. Click the extension icon in your browser toolbar
2. Configure URL settings:
   - **All Sites**: Fireworks on all websites
   - **Whitelist**: Only on specified URLs
3. Configure trigger settings:
   - **All Buttons**: Standard button elements
   - **Custom Selector**: Specific CSS selector
4. Click "Save Settings"
5. Test with the "Click to Test Fireworks!" button

## Features

✅ **Colorful fireworks animations** on web pages
✅ **Transparent logo overlay** with Forward Networks branding
✅ **Configurable URL whitelisting** for targeted sites
✅ **Custom element selectors** for precise control
✅ **Sound effects** for enhanced experience
✅ **Cross-browser compatible** (Chrome/Firefox/DuckDuckGo)
✅ **Smooth 60fps animations** with physics-based particles

## Testing

- Open any website or use the test button in settings
- Click any button element (or custom selector)
- Enjoy the fireworks animation with transparent logo!
- Use browser console (F12) and type `testLogo()` to test logo rendering

## Troubleshooting

**Fireworks not appearing:**
- Check browser console (F12) for errors
- Verify settings are saved
- Check URL whitelist configuration
- Ensure extension has proper permissions

**Performance issues:**
- Reduce particle count in `fireworks.js`
- Disable sound effects if needed

**Logo not showing:**
- Check console for loading errors
- Ensure SVG blob is created correctly
- Try `testLogo()` in console for debugging

## Development

To modify and test the extension:

1. Make changes to files in `firefox-extension/`
2. Reload extension in browser
3. Test on configured websites
4. For permanent changes, update version in `manifest.json`

## File Structure

```
fireworks-extension/
├── firefox-extension/          # Main extension directory
│   ├── manifest.json          # Extension configuration
│   ├── fireworks.js           # Main content script
│   ├── fireworks.css          # Styles
│   ├── options.html           # Settings UI
│   ├── options.js             # Settings logic
│   ├── icons/                 # Extension icons
│   ├── README.md              # Detailed documentation
│   └── INSTALL.md             # Extension-specific installation
├── .gitignore                 # Git ignore rules
└── INSTALL.md                 # This installation guide
```

## Building for Distribution

To create a distributable package:

```bash
cd firefox-extension
zip -r fireworks-extension-v2.0.zip . -x "*.DS_Store" "*.git*"
```

This creates a clean package ready for distribution.

## Support

For issues or questions:
- Check browser console (F12) for errors
- Review source code comments in `fireworks.js`
- Open an issue on GitHub: https://github.com/gaberger/fireworks-extension/issues

## License

MIT License - feel free to modify and share!

## Version

Current version: **2.0**
- Fixed logo rendering with transparent background
- Improved canvas layering
- Enhanced visual effects
- Generic branding for wider use