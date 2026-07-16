# Fireworks Extension - Installation Guide

## Package Contents
- **Version**: 2.0 (Fixed Logo Rendering)
- **Package**: `fireworks-extension-v2.0.zip` (20KB)
- **Date**: July 16, 2026

## Features
✅ Fireworks animation on button clicks
✅ Transparent Forward Networks logo overlay
✅ Configurable URL whitelisting
✅ Custom button selector support
✅ Sound effects
✅ Cross-browser compatible (Chrome/Firefox)

## Installation (Firefox)

### Method 1: Temporary Installation (Recommended for Testing)
1. Open Firefox
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Select the unzipped folder OR extract the zip and select any file inside
5. Extension will load immediately

### Method 2: Permanent Installation
1. Extract the zip file to a folder
2. Open Firefox
3. Navigate to `about:addons`
4. Click the gear icon → "Install Add-on From File..."
5. Select the `manifest.json` file from the extracted folder
6. Confirm installation

## Installation (Chrome)

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the unzipped extension folder
6. Extension will load immediately

## Configuration
1. Click the extension icon in your browser toolbar
2. Configure URL settings:
   - **All Sites**: Fireworks on all websites
   - **Whitelist**: Only on specified URLs
3. Configure trigger settings:
   - **All Buttons**: Standard button elements
   - **Custom Selector**: Specific CSS selector
4. Click "Save Settings"
5. Test with the "Click to Test Fireworks!" button

## Testing
- Open any website (or use the test button in settings)
- Click any button element
- Enjoy the fireworks animation with transparent Forward Networks logo!

## Debugging
- Open browser console (F12)
- Look for console logs prefixed with 🎆
- Use `testLogo()` in console to test logo rendering directly
- Check extension permissions in browser settings

## Recent Fixes (v2.0)
- ✅ Fixed logo rendering issues
- ✅ Made logo background transparent
- ✅ Resolved blank screen moments
- ✅ Improved canvas layering
- ✅ Enhanced visual effects

## Uninstallation
### Firefox
- Go to `about:addons`
- Find "Fireworks Extension"
- Click "Remove" or the three-dot menu → "Remove"

### Chrome
- Go to `chrome://extensions/`
- Find "Fireworks Extension"
- Click "Remove"

## Support
For issues or questions, check the console logs or review the source code comments in `fireworks.js`.