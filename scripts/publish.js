#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function publish() {
  console.log('🚀 Preparing Radnt CLI for production...');
  
  try {
    // Check if we're logged in to npm
    try {
      execSync('npm whoami', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ You must be logged in to npm. Run: npm login');
      process.exit(1);
    }
    
    // Clean and build
    console.log('🧹 Cleaning previous build...');
    await fs.remove('dist');
    
    console.log('📦 Building for production...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Verify build
    const cliPath = path.join('dist', 'cli.js');
    if (!await fs.pathExists(cliPath)) {
      throw new Error('Build failed - CLI file not found');
    }
    
    // Check package.json
    const packageJson = await fs.readJson('package.json');
    console.log(`📋 Package: ${packageJson.name}@${packageJson.version}`);
    
    // Run tests (when available)
    console.log('🧪 Running tests...');
    execSync('npm test', { stdio: 'inherit' });
    
    // Publish
    console.log('📤 Publishing to npm...');
    execSync('npm publish', { stdio: 'inherit' });
    
    console.log('✅ Successfully published to npm!');
    console.log(`🎉 Users can now install with: npm install -g ${packageJson.name}`);
    
  } catch (error) {
    console.error('❌ Publish failed:', error.message);
    process.exit(1);
  }
}

publish();
