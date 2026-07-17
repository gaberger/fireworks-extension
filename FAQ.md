# FAQ - Fireworks Extension

## ⚠️ Important v2.1 Changes

### Q: The extension doesn't work anymore! What happened?

**A:** Version 2.1 introduced a **breaking change** - the extension now requires explicit URL configuration:

**Solution:**
1. Open extension settings
2. Add your URL pattern (e.g., `https://example.com/*`)
3. Save settings
4. Refresh the page
5. Extension now works on configured URLs only

**Why this change?**
- Better security and control
- Prevents accidental activation on unwanted websites
- More precise control over where fireworks appear

### Q: Can I still use it on all websites?

**A:** No. The "All Sites" mode has been removed for security reasons. You must explicitly configure URL patterns.

## Common Questions & Solutions

### Q: I see "Extension has not been verified" error in Firefox. What do I do?

**A:** This is completely normal for development/unsigned extensions. Here's how to fix it:

**Recommended Solution:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select the extension folder (or any file inside)
4. Extension loads immediately - no verification needed!

**Alternative Solution:**
1. Go to `about:config`
2. Accept the risk warning
3. Search for: `xpinstall.signatures.required`
4. Set to: `false`
5. Try installation again
6. ⚠️ Warning: This reduces browser security

### Q: Do I need to do this every time?

**A:** For temporary loading:
- Extension loads when you use "Load Temporary Add-on..."
- Removed when Firefox restarts
- Need to reload after each Firefox restart

For permanent installation:
- Requires disabling verification (see alternative above)
- Persists across browser restarts
- Less secure but more convenient

### Q: Why does this verification issue exist?

**A:** Firefox requires extensions to be signed by Mozilla for security. Development extensions like this one aren't signed, which is normal. The temporary loading method is specifically designed for development extensions.

### Q: Is this extension safe to use?

**A:** Yes! The verification error doesn't mean it's malicious - it just means Mozilla hasn't reviewed and signed it. The source code is publicly available on GitHub for review.

### Q: Can I avoid this error entirely?

**A:** Yes! Use the temporary loading method (`about:debugging`) - it's designed to bypass verification for development extensions.

### Q: What about Chrome? Do I have the same issue?

**A:** No! Chrome doesn't require extension signing for development, so you won't see this error. Just enable "Developer mode" in `chrome://extensions/` and load unpacked.

### Q: The extension disappeared after restarting Firefox. What happened?

**A:** Temporary extensions are removed when Firefox restarts. This is expected behavior. Just reload it using the same method.

### Q: Can I make this extension permanent in Firefox?

**A:** Yes, but you'll need to either:
1. Disable verification (security risk)
2. Get the extension signed by Mozilla (requires review process)
3. Use Firefox Developer Edition (more permissive)

For most users, the temporary loading method is the best balance of convenience and security.

### Q: I'm having other installation issues. What should I do?

**A:** Check the [INSTALL.md](INSTALL.md) file for comprehensive troubleshooting, or open an issue on GitHub with:
- Your browser version
- The exact error message
- Steps you've already tried