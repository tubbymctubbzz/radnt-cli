#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function build() {
  console.log('🔨 Building Radnt CLI...');
  
  try {
    // Clean dist directory
    await fs.remove('dist');
    
    // Build TypeScript
    console.log('📦 Compiling TypeScript...');
    execSync('tsc', { stdio: 'inherit' });
    
    // Make CLI executable
    const cliPath = path.join('dist', 'cli.js');
    if (await fs.pathExists(cliPath)) {
      let content = await fs.readFile(cliPath, 'utf-8');
      if (!content.startsWith('#!/usr/bin/env node')) {
        content = '#!/usr/bin/env node\n' + content;
        await fs.writeFile(cliPath, content);
      }
      
      // Make executable on Unix systems
      if (process.platform !== 'win32') {
        await fs.chmod(cliPath, '755');
      }
    }
    
    console.log('✅ Build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();
