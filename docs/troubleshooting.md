# 🔧 Troubleshooting

## Common Issues

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::8000`

**Solutions:**
```bash
# Solution 1: Use different port
radnt dev --port 3000

# Solution 2: Kill existing servers
radnt kill
radnt dev

# Solution 3: Auto-find available port (default behavior)
radnt dev  # Will automatically use 8001, 8002, etc.
```

### Component Not Found

**Problem:** `Error: Cannot find module '@/components/ui/button'`

**Solutions:**
```bash
# Make sure you're in a Radnt project
radnt init

# Add the missing component
radnt add button

# Check available components
radnt add
```

### TypeScript Errors

**Problem:** Various TypeScript compilation errors

**Solutions:**
```bash
# Fix common issues automatically
radnt fix

# Check TypeScript configuration
npx tsc --noEmit

# Clear TypeScript cache
rm -rf .next
npm run dev
```

### Build Errors

**Problem:** `npm run build` fails

**Solutions:**
```bash
# Clean and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build

# Check for missing dependencies
npm install

# Fix common configuration issues
radnt fix
```

### Next.js Configuration Issues

**Problem:** `Invalid next.config.js options detected`

**Solutions:**
```bash
# Fix configuration automatically
radnt fix

# Or manually update next.config.js
# Remove deprecated options like experimental.appDir
```

### Missing Dependencies

**Problem:** `Module not found: Can't resolve 'tailwindcss-animate'`

**Solutions:**
```bash
# Fix missing dependencies
radnt fix

# Or manually install
npm install tailwindcss-animate

# Add to tailwind.config.js plugins array
plugins: [require("tailwindcss-animate")]
```

### Permission Errors

**Problem:** `EACCES: permission denied`

**Solutions:**
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

```

### Slow Installation

**Problem:** Installation takes too long

**Solutions:**
```bash
# Use faster package manager
npm install -g radnt-cli

# Or use yarn
yarn global add radnt-cli

# Clear npm cache
npm cache clean --force
```

## Development Server Issues

### Hot Reload Not Working

**Problem:** Changes not reflecting in browser

**Solutions:**
```bash
# Restart dev server
Ctrl+C
radnt dev

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# Check file watching limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### WebSocket Connection Failed

**Problem:** DevTools not connecting

**Solutions:**
```bash
# Check if port 8001 is blocked
radnt dev --port 8000  # This will use 8002 for DevTools

# Disable firewall temporarily to test
# Windows: Windows Defender Firewall
# macOS: System Preferences > Security & Privacy > Firewall
```

## Component Issues

### Styling Not Applied

**Problem:** Components look unstyled

**Solutions:**
```bash
# Check if Tailwind CSS is properly configured
# Verify globals.css imports Tailwind
@tailwind base;
@tailwind components;
@tailwind utilities;

# Rebuild styles
rm -rf .next
npm run dev
```

### Import Errors

**Problem:** `Cannot resolve '@/components/ui/...'`

**Solutions:**
```bash
# Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Verify component exists
ls src/components/ui/

# Re-add component if missing
radnt add button
```

## Installation Issues

### Command Not Found

**Problem:** `radnt: command not found`

**Solutions:**
```bash
# Check if globally installed
npm list -g radnt-cli

# Reinstall globally
npm install -g radnt-cli

# Check PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$PATH:$(npm config get prefix)/bin"

# Use npx as alternative
npx radnt-cli create my-app
```

### Version Mismatch

**Problem:** Old version being used

**Solutions:**
```bash
# Check current version
radnt --version

# Update to latest
radnt update
# or
npm update -g radnt-cli

# Clear npm cache
npm cache clean --force
```

## Environment Issues

### Node.js Version

**Problem:** Compatibility issues

**Requirements:**
- Node.js 16.0.0 or higher
- npm 7.0.0 or higher

**Solutions:**
```bash
# Check versions
node --version
npm --version

# Update Node.js
# Use nvm (recommended)
nvm install node
nvm use node

# Or download from nodejs.org
```

### Windows-Specific Issues

**Problem:** Path or permission issues on Windows

**Solutions:**
```bash
# Run PowerShell as Administrator
# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Use Windows Subsystem for Linux (WSL)
wsl --install
# Then use Linux commands
```

## Getting Help

### Debug Mode

Enable verbose logging:
```bash
DEBUG=radnt* radnt create my-app
```

### System Information

Gather system info for bug reports:
```bash
# Check versions
radnt --version
node --version
npm --version

# Operating system
# Windows: systeminfo
# macOS: system_profiler SPSoftwareDataType
# Linux: lsb_release -a
```

### Reset Configuration

Start fresh:
```bash
# Remove configuration
rm components.json
rm -rf src/components/ui/

# Reinitialize
radnt init
```

### Clean Installation

Complete reset:
```bash
# Remove global installation
npm uninstall -g radnt-cli

# Clear npm cache
npm cache clean --force

# Reinstall
npm install -g radnt-cli
```

## Still Having Issues?

1. **Check GitHub Issues**: [github.com/tubbymctubbzz/radnt-cli/issues](https://github.com/tubbymctubbzz/radnt-cli/issues)
2. **Create Bug Report**: Use the bug report template
3. **Join Discussions**: GitHub Discussions for questions
4. **Check Documentation**: Review all docs in this folder

### Bug Report Template

When reporting bugs, include:
- OS and Node.js version
- Radnt CLI version (`radnt --version`)
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs
- Project configuration (package.json, tsconfig.json)
