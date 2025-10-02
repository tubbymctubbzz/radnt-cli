# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-10-02

### 🚀 Major Release - Complete CLI Overhaul

This is a major release with significant enhancements, new commands, and improved user experience. Radnt CLI v2.0 is now the ultimate tool for modern Next.js development.

### ✨ New Features

#### New Commands
- **`radnt deploy`** - deployment system with multi-platform support
  - Deploy to Vercel with automatic authentication and project linking
  - Deploy to Netlify with site initialization and configuration
  - Deploy to GitHub Pages with automated workflow setup
  - Comprehensive git integration and change management
  - Interactive platform selection with detailed descriptions

#### Enhanced Existing Commands

- **`radnt create`** - Improved project creation
  - Enhanced template selection with detailed descriptions
  - Better error handling and validation
  - Improved package manager detection
  - More robust project setup

- **`radnt add`** - Enhanced component management
  - Fuzzy matching for component names
  - Better error messages and suggestions
  - Improved component templates
  - Enhanced validation

- **`radnt dev`** - Advanced development server
  - Smart port detection and management
  - Enhanced hot reload capabilities
  - Better WebSocket integration
  - Improved process management

### 🎨 User Experience Improvements

#### Enhanced CLI Interface
- **Beautiful ASCII art banner** on startup
- **Update notifications** with boxed styling
- **Improved help system** with quick start examples
- **Better error messages** with actionable suggestions
- **Interactive prompts** for all major operations

#### Git Integration
- **Comprehensive git status checking**
- **Automatic git initialization** when needed
- **Uncommitted changes handling** with multiple options
- **Remote repository validation**
- **Automatic commit and push workflows**

#### Authentication Flows
- **Vercel CLI integration** with automatic login
- **Netlify authentication** with site linking
- **GitHub integration** for Pages deployment
- **Token management** and validation

### 🔧 Technical Improvements

#### Dependencies
- Added `figlet` for ASCII art banners
- Added `boxen` for beautiful CLI boxes
- Added `update-notifier` for version checking
- Added `open` for browser integration
- Added `clipboardy` for clipboard operations
- Added `listr2` for task management
- Added `degit` for template cloning
- Added `tar` for archive handling
- Updated all existing dependencies to latest versions

#### Code Quality
- **Enhanced TypeScript support** with better type definitions
- **Improved error handling** throughout the codebase
- **Better async/await patterns**
- **Comprehensive input validation**
- **Enhanced logging and debugging**

#### Platform Support
- **Cross-platform compatibility** improvements
- **Windows-specific optimizations**
- **Better process management** on all platforms
- **Enhanced file system operations**

### 📦 Deployment Enhancements

#### Vercel Integration
- **Automatic CLI installation** if not present
- **Authentication flow** with browser-based login
- **Project linking** and configuration
- **Production deployment** with URL extraction
- **Browser opening** after successful deployment

#### Netlify Integration
- **Site initialization** and linking
- **Automatic netlify.toml** configuration
- **Static export handling** for Next.js
- **Build optimization** for JAMstack deployment
- **Custom domain support**

#### GitHub Pages
- **GitHub Actions workflow** generation
- **Static export configuration**
- **Automated deployment pipeline**
- **Custom domain and CNAME support**

### 🛠️ Developer Experience

#### Enhanced Templates
- **Improved template structure** with better organization
- **Enhanced component library** with more examples
- **Better TypeScript integration**
- **Improved styling and theming**

#### Development Tools
- **Enhanced dev server** with better hot reload
- **Improved build process** with optimization
- **Better error reporting** and debugging
- **Enhanced logging** throughout the CLI

### 📚 Documentation

#### New Documentation
- **Comprehensive README** updates
- **Command reference** documentation
- **Deployment guides** for all platforms
- **Troubleshooting guides**
- **Best practices** documentation

#### Examples
- **Real-world examples** for all templates
- **Deployment examples** for each platform
- **Configuration examples**
- **Integration guides**

### 🐛 Bug Fixes

- Fixed Next.js config file compatibility issues
- Resolved port conflict detection on Windows
- Fixed component template generation errors
- Improved error handling in git operations
- Fixed package manager detection issues
- Resolved TypeScript compilation errors
- Fixed shadcn/ui component installation issues

### 🔄 Breaking Changes

- **Minimum Node.js version** is now 16.0.0
- **CLI interface changes** - some command flags have been updated
- **Template structure** has been reorganized
- **Configuration file format** updates for better compatibility

### 📈 Performance Improvements

- **Faster project creation** with optimized templates
- **Improved build times** with better caching
- **Enhanced dependency installation** speed
- **Better memory usage** during operations
- **Optimized file operations**

### 🔒 Security

- **Enhanced input validation** to prevent injection attacks
- **Better token handling** for deployment platforms
- **Secure credential storage**
- **Improved error message sanitization**

---

### New Features to Try
1. **Deploy your project**: `radnt deploy`

### Recommended Workflow
1. Update to v2.0: `npm install -g radnt-cli@2.0.0`
2. Try the new deploy command: `radnt deploy`

---

## Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/tubbymctubbzz/radnt-cli/issues)
- **Documentation**: [Full documentation](https://github.com/tubbymctubbzz/radnt-cli#readme)

---
