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
    
    // Update the package
    await execa('npm', ['install', '-g', `${packageJson.name}@latest`], {
      stdio: 'inherit'
    });
    
    console.log(chalk.green('✅ Radnt CLI updated successfully!'));
    console.log(chalk.gray('Run "radnt --version" to see the new version.'));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to update Radnt CLI:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    console.log(chalk.yellow('\nTry updating manually:'));
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
