# Button Fireworks Extension v2.0

A fun Firefox extension that displays colorful fireworks animation when you click buttons on webpages. Now with configurable URL targeting and custom button selectors!

## 🎆 New Features (v2.0)

- **URL Whitelist Mode**: Configure specific websites or pages where fireworks should appear
- **Custom Button Selectors**: Target specific buttons using CSS selectors
- **Options Page**: Beautiful settings UI to configure all options
- **Storage Persistence**: Settings are saved and persist across browser sessions

## Features

- 🎆 Colorful particle fireworks animation
- 🎯 Works on all websites (configurable)
- 🎪 Custom button targeting with CSS selectors
- 🌈 10 different vibrant colors
- ⚡ Smooth physics-based animation with gravity and friction
- 🎇 Trail effect for beautiful visuals
- ⚙️ Easy configuration through options page

## Installation

### Step-by-Step: How to Load Extension into Firefox

#### Method 1: Temporary Installation (Recommended for Development)

1. **Navigate to Firefox Debugger**
   - Open Firefox
   - Type `about:debugging` in the address bar and press Enter
   - On the left sidebar, click "This Firefox"

2. **Load the Extension**
   - Click the "Load Temporary Add-on..." button (usually a folder icon)
   - A file picker dialog will appear
   - Navigate to: `/Users/gb/Working/fireworks/firefox-extension/`
   - Select the `manifest.json` file
   - Click "Open"

3. **Verify Installation**
   - You should see "Button Fireworks" listed under "Temporary Extensions"
   - The extension is now active!

4. **Important Notes**
   - Temporary extensions are removed when you restart Firefox
   - Perfect for testing and development
   - Changes to files require reloading (see "Development" section below)

#### Method 2: Permanent Installation

1. **Package the Extension**
   - Open a terminal
   - Navigate to the extension directory:
     ```bash
     cd /Users/gb/Working/fireworks/firefox-extension
     ```
   - Create a zip file:
     ```bash
     zip -r button-fireworks.zip * -x "*.DS_Store" "*.git*"
     ```

2. **Install the Package**
   - Open Firefox
   - Type `about:addons` in the address bar and press Enter
   - Click the gear icon (⚙️) in the top-right corner
   - Select "Install Add-on From File..."
   - Navigate to the zip file you created
   - Select `button-fireworks.zip`
   - Click "Add"

3. **Verify Installation**
   - The extension should appear in your extensions list
   - It will persist across browser restarts

#### Method 3: Using Firefox Menu

1. Open Firefox
2. Click the menu button (≡) in the top-right
3. Select "Add-ons and themes"
4. Click the gear icon (⚙️)
5. Select "Install Add-on From File..."
6. Follow steps from Method 2 above

### Quick Installation Commands

If you're in the extension directory:

```bash
# For temporary installation
# Just navigate to about:debugging and select manifest.json

# For permanent installation
zip -r button-fireworks.zip * -x "*.DS_Store" "*.git*"
```

### After Installation

1. **Open Settings**
   - Go to `about:addons`
   - Find "Button Fireworks" in the list
   - Click the "Preferences" button (three dots → Preferences)

2. **Configure Your Settings**
   - See "Configuration" section below

## Configuration

After installation, configure the extension:

1. Go to `about:addons`
2. Find "Button Fireworks" and click "Preferences"
3. Configure:
   - **URL Configuration**: Choose "All Sites" or "Whitelist" mode
   - **Allowed URLs** (if whitelist mode): Add URL patterns like:
     - `https://example.com/*` - All pages on example.com
     - `https://example.com/dashboard` - Specific page only
   - **Button Configuration**: Choose "All Buttons" or "Custom Selector"
   - **Custom Button Selector** (if custom mode): Enter CSS selector like:
     - `button.btn.primary` - Buttons with class "btn" and "primary"
     - `button.btn:nth-child(2)` - Second button with class "btn"
     - `.submit-btn` - Elements with class "submit-btn"
     - `[data-testid='submit']` - Elements with specific data attribute
4. Click "Save Settings"

### Your Specific Configuration

Based on your requirements, configure like this:

**URL Mode**: Whitelist
- Add your site URL: `https://your-site.com/*`

**Button Mode**: Custom Selector
- Enter: `button.btn:nth-child(2)`

This will only show fireworks on the second button with class "btn" on your whitelisted site.

## How It Works

The extension uses:
- **Manifest V3**: Modern Firefox extension format
- **Content Script**: Listens for button clicks on configured pages
- **HTML5 Canvas**: Renders particle-based fireworks
- **requestAnimationFrame**: Smooth 60fps animation
- **CSS Pointer Events**: Canvas doesn't interfere with page interactions
- **browser.storage API**: Persists configuration settings
- **URL Pattern Matching**: Supports wildcard `*` in URL patterns

## Button Detection

### Default Mode (All Buttons)
- `<button>` elements
- Elements with `[role="button"]` attribute
- `<input type="button">`
- `<input type="submit">`

### Custom Mode
Any CSS selector you specify:
- Class selectors: `.my-button`
- ID selectors: `#submit-btn`
- Attribute selectors: `[data-action="submit"]`
- Combinators: `button.btn.primary`
- Pseudo-classes: `button.btn:nth-child(2)`

## Files

- `manifest.json` - Extension configuration
- `fireworks.js` - Main content script with particle system
- `options.html` - Settings UI
- `options.js` - Settings logic
- `icons/` - SVG icons for the extension

## Customization

### Adjust Fireworks Size

Edit the `particleCount` variable in `fireworks.js`:
```javascript
const particleCount = 50; // Increase for more particles
```

### Change Colors

Modify the `colors` array in `fireworks.js`:
```javascript
const colors = [
  '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
  '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5a24'
];
```

### Adjust Physics

Modify particle properties in the `Particle` class:
- `gravity`: How fast particles fall (default: 0.1)
- `friction`: Air resistance (default: 0.98)
- `decay`: How fast particles fade (default: 0.01-0.03)

## Getting CSS Selectors

To find the exact selector for your button:

1. Right-click the button on your webpage
2. Select "Inspect" or "Inspect Element"
3. In the DevTools panel:
   - Right-click the highlighted element
   - Select "Copy" → "Copy selector"
4. Paste into the "Custom Button Selector" field

## Troubleshooting

- **Fireworks not appearing**: Check browser console (F12) for errors, verify settings
- **Only works on some sites**: Check URL whitelist configuration
- **Specific button not working**: Verify the CSS selector is correct using DevTools
- **Performance issues**: Reduce `particleCount` in the code
- **Settings not applying**: Click "Save Settings" and reload the page

## Development

To test changes:
1. Uninstall the temporary extension in `about:debugging`
2. Reload the extension with updated files
3. Configure settings in options page
4. Visit your configured URL to test

## License

MIT License - feel free to modify and share!

## Credits

Built with vanilla JavaScript and HTML5 Canvas.