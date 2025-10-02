#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Dual Publishing: npm + GitHub Packages...\n');

// Read the original package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const originalPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Step 1: Publish to npm (regular)
console.log('📦 Step 1: Publishing to npm...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  execSync('npm publish --registry=https://registry.npmjs.org', { stdio: 'inherit' });
  console.log('✅ Successfully published to npm as: radnt-cli\n');
} catch (error) {
  console.error('❌ Failed to publish to npm:', error.message);
  process.exit(1);
}

// Step 2: Publish to GitHub Packages (scoped)
console.log('📦 Step 2: Publishing to GitHub Packages...');

// Create GitHub version with scoped name
const githubPackageJson = {
  ...originalPackageJson,
  name: '@tubbymctubbzz/radnt-cli',
  publishConfig: {
    registry: 'https://npm.pkg.github.com',
    access: 'public',
  },
};

// Temporarily update package.json for GitHub
fs.writeFileSync(packageJsonPath, JSON.stringify(githubPackageJson, null, 2));

try {
  execSync('npm publish --registry=https://npm.pkg.github.com', { stdio: 'inherit' });
  console.log('✅ Successfully published to GitHub Packages as: @tubbymctubbzz/radnt-cli\n');
} catch (error) {
  console.error('❌ Failed to publish to GitHub Packages:', error.message);
  console.log(
    "💡 Make sure you're authenticated with: npm login --registry=https://npm.pkg.github.com"
  );
} finally {
  // Always restore original package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(originalPackageJson, null, 2));
  console.log('🔄 Restored original package.json');
}

console.log('\n🎉 Dual publishing complete!');
console.log('📦 npm: npm install -g radnt-cli');
console.log(
  '📦 GitHub: npm install -g @tubbymctubbzz/radnt-cli --registry=https://npm.pkg.github.com'
);
