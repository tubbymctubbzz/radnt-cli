import chalk from 'chalk';
import semver from 'semver';
import fs from 'fs-extra';
import path from 'path';
import execa from 'execa';

interface PackageInfo {
  name: string;
  version: string;
}

export async function checkForUpdates(): Promise<void> {
  try {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson: PackageInfo = await fs.readJson(packageJsonPath);
    
    // Get latest version from npm
    const { stdout } = await execa('npm', ['view', packageJson.name, 'version'], {
      timeout: 5000
    });
    
    const latestVersion = stdout.trim();
    const currentVersion = packageJson.version;
    
    if (semver.gt(latestVersion, currentVersion)) {
      console.log(chalk.yellow('\n📦 Update available!'));
      console.log(chalk.gray(`Current version: ${currentVersion}`));
      console.log(chalk.green(`Latest version:  ${latestVersion}`));
      console.log(chalk.cyan('\nTo update, run:'));
      console.log(chalk.white(`  npm update -g ${packageJson.name}`));
      console.log(chalk.gray('or'));
      console.log(chalk.white(`  radnt update\n`));
    }
  } catch (error) {
    // Silently fail - don't interrupt user workflow
  }
}

export async function updateCLI(): Promise<void> {
  try {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson: PackageInfo = await fs.readJson(packageJsonPath);
    
    console.log(chalk.blue('🔄 Updating Radnt CLI...'));
    
    // First, get the current installed version
    let currentInstalledVersion = 'unknown';
    try {
      const { stdout } = await execa('npm', ['list', '-g', packageJson.name, '--depth=0'], {
        stdio: 'pipe'
      });
      const match = stdout.match(new RegExp(`${packageJson.name}@([\\d\\.]+)`));
      if (match) {
        currentInstalledVersion = match[1];
      }
    } catch (error) {
      // Ignore error, continue with update
    }
    
    // Get the latest version from npm with retry logic
    let latestVersion = '';
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts && !latestVersion) {
      try {
        console.log(chalk.gray(`Checking for latest version... (attempt ${attempts + 1}/${maxAttempts})`));
        const { stdout } = await execa('npm', ['view', packageJson.name, 'version'], {
          timeout: 10000
        });
        latestVersion = stdout.trim();
        break;
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          console.log(chalk.yellow('Retrying in 2 seconds...'));
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    if (!latestVersion) {
      console.log(chalk.yellow('⚠️  Could not check latest version from npm registry.'));
      console.log(chalk.gray('This might be due to npm registry propagation delay.'));
      console.log(chalk.cyan('Attempting to update anyway...'));
    } else {
      console.log(chalk.gray(`Current version: ${currentInstalledVersion}`));
      console.log(chalk.gray(`Latest version: ${latestVersion}`));
      
      if (currentInstalledVersion === latestVersion) {
        console.log(chalk.green('✅ You already have the latest version!'));
        return;
      }
    }
    
    // Update the package with specific version if available, otherwise use @latest
    const updateTarget = latestVersion ? `${packageJson.name}@${latestVersion}` : `${packageJson.name}@latest`;
    
    await execa('npm', ['install', '-g', updateTarget], {
      stdio: 'inherit'
    });
    
    console.log(chalk.green('✅ Radnt CLI updated successfully!'));
    console.log(chalk.gray('Run "radnt --version" to see the new version.'));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to update Radnt CLI:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    console.log(chalk.yellow('\nTry updating manually:'));
    console.log(chalk.white('  npm install -g radnt-cli@latest'));
    console.log(chalk.gray('or'));
    console.log(chalk.white('  npm update -g radnt-cli'));
    process.exit(1);
  }
}

export async function getCurrentVersion(): Promise<string> {
  try {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson: PackageInfo = await fs.readJson(packageJsonPath);
    return packageJson.version;
  } catch (error) {
    return 'unknown';
  }
}

export async function getLatestVersion(): Promise<string | null> {
  try {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson: PackageInfo = await fs.readJson(packageJsonPath);
    
    const { stdout } = await execa('npm', ['view', packageJson.name, 'version'], {
      timeout: 10000
    });
    
    return stdout.trim();
  } catch (error) {
    return null;
  }
}

export async function getInstalledVersion(): Promise<string> {
  try {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson: PackageInfo = await fs.readJson(packageJsonPath);
    
    const { stdout } = await execa('npm', ['list', '-g', packageJson.name, '--depth=0'], {
      stdio: 'pipe'
    });
    
    const match = stdout.match(new RegExp(`${packageJson.name}@([\\d\\.]+)`));
    return match ? match[1] : 'unknown';
  } catch (error) {
    return 'unknown';
  }
}
