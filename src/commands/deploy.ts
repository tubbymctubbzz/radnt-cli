import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import execa from 'execa';
import open from 'open';
import chalk from 'chalk';

interface DeployOptions {
  platform?: 'vercel' | 'netlify' | 'github';
  build: boolean;
  force?: boolean;
  production?: boolean;
}

interface GitStatus {
  hasGit: boolean;
  hasRemote: boolean;
  hasUncommitted: boolean;
  currentBranch: string;
  remoteUrl?: string;
  remoteName?: string;
}

interface ProjectValidation {
  isValid: boolean;
  error?: string;
  packageJson?: any;
}

export async function deployProject(options: DeployOptions) {
  console.log(chalk.blue.bold('🚀 Radnt Deployment System\n'));

  // Comprehensive project validation
  const validation = await validateProject();
  if (!validation.isValid) {
    console.error(chalk.red(`❌ ${validation.error}`));
    process.exit(1);
  }

  // Git status check
  const gitStatus = await checkGitStatus();

  // Show git status information
  console.log(chalk.cyan('📋 Project Status:'));
  console.log(chalk.gray(`  • Git repository: ${gitStatus.hasGit ? '✅' : '❌'}`));
  if (gitStatus.hasGit) {
    console.log(chalk.gray(`  • Current branch: ${gitStatus.currentBranch}`));
    console.log(chalk.gray(`  • Remote repository: ${gitStatus.hasRemote ? '✅' : '❌'}`));
    console.log(chalk.gray(`  • Uncommitted changes: ${gitStatus.hasUncommitted ? '⚠️  Yes' : '✅ None'}`));
    if (gitStatus.remoteUrl) {
      console.log(chalk.gray(`  • Remote URL: ${gitStatus.remoteUrl}`));
    }
    
    // Show git user information
    const userInfo = await getGitUserInfo();
    if (userInfo.name || userInfo.email) {
      console.log(chalk.gray(`  • Git user: ${userInfo.name || 'Unknown'} <${userInfo.email || 'no-email'}>`));
    } else {
      console.log(chalk.yellow(`  • ⚠️  Git user not configured. Run: git config --global user.name "Your Name"`));
      console.log(chalk.yellow(`    and: git config --global user.email "your.email@example.com"`));
    }
  }
  console.log();

  // Handle git requirements
  if (!gitStatus.hasGit && !options.force) {
    console.error(chalk.red('❌ Git repository required for deployment.'));
    const { initGit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'initGit',
        message: 'Would you like to initialize a git repository?',
        default: true
      }
    ]);

    if (initGit) {
      await initializeGitRepository();
    } else {
      console.log(chalk.yellow('Deployment cancelled. Git repository is required.'));
      process.exit(1);
    }
  }

  // Handle uncommitted changes
  if (gitStatus.hasUncommitted && !options.force) {
    console.warn(chalk.yellow('⚠️  You have uncommitted changes.'));
    const { handleChanges } = await inquirer.prompt([
      {
        type: 'list',
        name: 'handleChanges',
        message: 'How would you like to handle uncommitted changes?',
        choices: [
          { name: 'Commit and push changes', value: 'commit' },
          { name: 'Stash changes temporarily', value: 'stash' },
          { name: 'Continue anyway (not recommended)', value: 'continue' },
          { name: 'Cancel deployment', value: 'cancel' }
        ]
      }
    ]);

    switch (handleChanges) {
      case 'commit':
        await commitAndPushChanges();
        break;
      case 'stash':
        await stashChanges();
        break;
      case 'cancel':
        console.log(chalk.yellow('Deployment cancelled.'));
        process.exit(0);
        break;
      // 'continue' falls through
    }
  }

  // Interactive platform selection with enhanced options
  let platform = options.platform;
  if (!platform) {
    const { selectedPlatform } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedPlatform',
        message: 'Choose your deployment platform:',
        choices: [
          {
            name: '▲ Vercel - Zero-config Next.js deployment with edge functions',
            value: 'vercel',
            short: 'Vercel'
          },
          {
            name: '🌐 Netlify - JAMstack platform with forms and functions',
            value: 'netlify',
            short: 'Netlify'
          },
          {
            name: '🐙 GitHub Pages - Free static hosting with custom domains',
            value: 'github',
            short: 'GitHub Pages'
          }
        ]
      }
    ]);
    platform = selectedPlatform;
  }

  const spinner = ora('Preparing deployment...').start();

  try {
    // Build project if requested
    if (options.build) {
      spinner.text = 'Building project for production...';
      await buildProjectWithDependencyCheck(spinner);
    }

    switch (platform) {
      case 'vercel':
        await deployToVercel(spinner);
        break;
      case 'netlify':
        await deployToNetlify(spinner);
        break;
      case 'github':
        await deployToGitHub(spinner);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    spinner.succeed('Deployment completed successfully!');
    console.log(chalk.green('\n🎉 Your project has been deployed!'));

  } catch (error) {
    spinner.fail('Deployment failed');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

async function deployToVercel(spinner: ora.Ora) {
  spinner.text = 'Setting up Vercel deployment...';

  // Check if Vercel CLI is installed
  try {
    await execa('vercel', ['--version'], { stdio: 'pipe' });
  } catch (error) {
    spinner.info('Installing Vercel CLI...');
    await execa('npm', ['install', '-g', 'vercel'], { stdio: 'inherit' });
  }

  // Ensure Next.js configuration is correct for Vercel
  await ensureVercelCompatibility(spinner);

  // Check if user is logged in
  try {
    await execa('vercel', ['whoami'], { stdio: 'pipe' });
  } catch (error) {
    spinner.info('Please log in to Vercel...');
    console.log(chalk.yellow('\n🔐 You need to authenticate with Vercel first.'));
    console.log(chalk.gray('This will open your browser to complete the login process.\n'));
    
    const { proceedLogin } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceedLogin',
        message: 'Proceed with Vercel login?',
        default: true
      }
    ]);

    if (!proceedLogin) {
      throw new Error('Vercel authentication required for deployment');
    }

    await execa('vercel', ['login'], { stdio: 'inherit' });
    console.log(chalk.green('✅ Successfully authenticated with Vercel!\n'));
  }

  // Check if project needs to be linked
  const vercelJsonPath = path.join(process.cwd(), '.vercel', 'project.json');
  if (!await fs.pathExists(vercelJsonPath)) {
    spinner.info('Linking project to Vercel...');
    
    const { linkProject } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'linkProject',
        message: 'This project is not linked to Vercel. Link it now?',
        default: true
      }
    ]);

    if (linkProject) {
      await execa('vercel', ['link'], { stdio: 'inherit' });
    } else {
      throw new Error('Project must be linked to Vercel for deployment');
    }
  }

  // Deploy to Vercel
  spinner.text = 'Deploying to Vercel...';
  const { stdout } = await execa('vercel', ['--prod'], {
    stdio: 'pipe',
    cwd: process.cwd()
  });

  // Extract deployment URL
  const urlMatch = stdout.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    const deploymentUrl = urlMatch[0];
    console.log(chalk.cyan(`\n🌐 Deployment URL: ${deploymentUrl}`));
    console.log(chalk.green('✅ Successfully deployed to Vercel!'));

    const { openBrowser } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'openBrowser',
        message: 'Would you like to open the deployment in your browser?',
        default: true
      }
    ]);

    if (openBrowser) {
      await open(deploymentUrl);
    }
  }
}

async function deployToNetlify(spinner: ora.Ora) {
  spinner.text = 'Setting up Netlify deployment...';

  // Check if Netlify CLI is installed
  try {
    await execa('netlify', ['--version'], { stdio: 'pipe' });
  } catch (error) {
    spinner.info('Installing Netlify CLI...');
    await execa('npm', ['install', '-g', 'netlify-cli'], { stdio: 'inherit' });
  }

  // Check if user is logged in
  try {
    await execa('netlify', ['status'], { stdio: 'pipe' });
  } catch (error) {
    spinner.info('Please log in to Netlify...');
    console.log(chalk.yellow('\n🔐 You need to authenticate with Netlify first.'));
    console.log(chalk.gray('This will open your browser to complete the login process.\n'));
    
    const { proceedLogin } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceedLogin',
        message: 'Proceed with Netlify login?',
        default: true
      }
    ]);

    if (!proceedLogin) {
      throw new Error('Netlify authentication required for deployment');
    }

    await execa('netlify', ['login'], { stdio: 'inherit' });
    console.log(chalk.green('✅ Successfully authenticated with Netlify!\n'));
  }

  // Check if site needs to be initialized
  const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml');
  const netlifyConfigPath = path.join(process.cwd(), '.netlify', 'state.json');
  
  if (!await fs.pathExists(netlifyConfigPath)) {
    spinner.info('Initializing Netlify site...');
    
    const { initSite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'initSite',
        message: 'This project is not linked to a Netlify site. Initialize it now?',
        default: true
      }
    ]);

    if (initSite) {
      await execa('netlify', ['init'], { stdio: 'inherit' });
    } else {
      throw new Error('Site must be initialized for Netlify deployment');
    }
  }

  // Create netlify.toml if it doesn't exist
  if (!await fs.pathExists(netlifyTomlPath)) {
    const netlifyConfig = `[build]
  publish = "out"
  command = "npm run build && npm run export"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;

    await fs.writeFile(netlifyTomlPath, netlifyConfig);
    console.log(chalk.green('✅ Created netlify.toml configuration file'));
  }

  // Build for static export
  spinner.text = 'Building project for Netlify...';
  await execa('npm', ['run', 'build'], { cwd: process.cwd() });
  
  // Check if export script exists
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  
  if (!packageJson.scripts.export) {
    packageJson.scripts.export = 'next export';
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
  
  await execa('npm', ['run', 'export'], { cwd: process.cwd() });

  // Deploy to Netlify
  spinner.text = 'Deploying to Netlify...';
  const { stdout } = await execa('netlify', ['deploy', '--prod', '--dir', 'out'], {
    stdio: 'pipe',
    cwd: process.cwd()
  });

  // Extract deployment URL
  const urlMatch = stdout.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    const deploymentUrl = urlMatch[0];
    console.log(chalk.cyan(`\n🌐 Deployment URL: ${deploymentUrl}`));
    console.log(chalk.green('✅ Successfully deployed to Netlify!'));

    const { openBrowser } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'openBrowser',
        message: 'Would you like to open the deployment in your browser?',
        default: true
      }
    ]);

    if (openBrowser) {
      await open(deploymentUrl);
    }
  }
}

async function deployToGitHub(spinner: ora.Ora) {
  spinner.text = 'Preparing GitHub Pages deployment...';

  // Check if we're in a git repository
  try {
    await execa('git', ['status'], { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Not in a git repository. Initialize git first with: git init');
  }

  // Create GitHub Actions workflow for deployment
  const workflowDir = path.join(process.cwd(), '.github', 'workflows');
  await fs.ensureDir(workflowDir);

  const workflowContent = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Export static files
      run: npm run export

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
`;

  await fs.writeFile(path.join(workflowDir, 'deploy.yml'), workflowContent);

  // Update package.json with export script
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  if (!packageJson.scripts.export) {
    packageJson.scripts.export = 'next export';
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  // Update next.config.js for static export
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (await fs.pathExists(nextConfigPath)) {
    let configContent = await fs.readFile(nextConfigPath, 'utf-8');
    if (!configContent.includes('output:')) {
      configContent = configContent.replace(
        'const nextConfig = {',
        'const nextConfig = {\n  output: \'export\','
      );
      await fs.writeFile(nextConfigPath, configContent);
    }
  }

  spinner.succeed('GitHub Pages deployment configured!');
  console.log(chalk.cyan('\n📝 GitHub Actions workflow created at .github/workflows/deploy.yml'));
  console.log(chalk.yellow('Next steps:'));
  console.log(chalk.white('1. Commit and push your changes'));
  console.log(chalk.white('2. Enable GitHub Pages in your repository settings'));
  console.log(chalk.white('3. Set source to "GitHub Actions"'));
}
async function validateProject(): Promise<ProjectValidation> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!await fs.pathExists(packageJsonPath)) {
    return { isValid: false, error: 'No package.json found. Make sure you\'re in a project directory.' };
  }

  const packageJson = await fs.readJson(packageJsonPath);
  const isNextProject = packageJson.dependencies?.next || packageJson.devDependencies?.next;

  if (!isNextProject) {
    return { isValid: false, error: 'This doesn\'t appear to be a Next.js project.' };
  }

  return { isValid: true, packageJson };
}

async function checkGitStatus(): Promise<GitStatus> {
  try {
    // Check if git is initialized
    await execa('git', ['status'], { stdio: 'pipe' });
    
    // Get current branch
    const { stdout: branch } = await execa('git', ['branch', '--show-current'], { stdio: 'pipe' });
    
    // Check for uncommitted changes
    const { stdout: status } = await execa('git', ['status', '--porcelain'], { stdio: 'pipe' });
    const hasUncommitted = status.trim().length > 0;
    
    // Check for remote
    let hasRemote = false;
    let remoteUrl = '';
    let remoteName = '';
    
    try {
      const { stdout: remotes } = await execa('git', ['remote', '-v'], { stdio: 'pipe' });
      if (remotes.trim()) {
        hasRemote = true;
        const remoteLines = remotes.split('\n');
        const originLine = remoteLines.find(line => line.startsWith('origin'));
        if (originLine) {
          const parts = originLine.split('\t');
          remoteName = parts[0];
          remoteUrl = parts[1].split(' ')[0];
        }
      }
    } catch (error) {
      // No remote configured
    }

    return {
      hasGit: true,
      hasRemote,
      hasUncommitted,
      currentBranch: branch.trim(),
      remoteUrl,
      remoteName
    };
  } catch (error) {
    return {
      hasGit: false,
      hasRemote: false,
      hasUncommitted: false,
      currentBranch: '',
    };
  }
}

async function initializeGitRepository() {
  const spinner = ora('Initializing git repository...').start();
  
  try {
    await execa('git', ['init'], { cwd: process.cwd() });
    
    // Check and setup git user if not configured
    const userInfo = await getGitUserInfo();
    if (!userInfo.name || !userInfo.email) {
      spinner.info('Setting up git user configuration...');
      
      const { name, email } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter your git username:',
          default: userInfo.name || '',
          validate: (input: string) => input.trim() ? true : 'Name is required'
        },
        {
          type: 'input',
          name: 'email',
          message: 'Enter your git email:',
          default: userInfo.email || '',
          validate: (input: string) => {
            if (!input.trim()) return 'Email is required';
            if (!input.includes('@')) return 'Please enter a valid email address';
            return true;
          }
        }
      ]);

      await execa('git', ['config', 'user.name', name], { cwd: process.cwd() });
      await execa('git', ['config', 'user.email', email], { cwd: process.cwd() });
      console.log(chalk.green(`✅ Git user configured: ${name} <${email}>`));
    }
    
    await execa('git', ['add', '.'], { cwd: process.cwd() });
    await execa('git', ['commit', '-m', 'Initial commit'], { cwd: process.cwd() });
    
    spinner.succeed('Git repository initialized!');
    
    const { addRemote } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addRemote',
        message: 'Would you like to add a remote repository?',
        default: true
      }
    ]);

    if (addRemote) {
      const { remoteUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'remoteUrl',
          message: 'Enter your remote repository URL:',
          validate: (input: string) => {
            if (!input.trim()) return 'Remote URL is required';
            if (!input.includes('github.com') && !input.includes('gitlab.com') && !input.includes('bitbucket.org')) {
              return 'Please enter a valid git repository URL';
            }
            return true;
          }
        }
      ]);

      await execa('git', ['remote', 'add', 'origin', remoteUrl], { cwd: process.cwd() });
      
      // Try to push to main first, then master if that fails
      try {
        await execa('git', ['push', '-u', 'origin', 'main'], { cwd: process.cwd() });
      } catch (error) {
        await execa('git', ['push', '-u', 'origin', 'master'], { cwd: process.cwd() });
      }
      
      console.log(chalk.green('✅ Remote repository added and code pushed!'));
    }
  } catch (error) {
    spinner.fail('Failed to initialize git repository');
    throw error;
  }
}

async function commitAndPushChanges() {
  const spinner = ora('Committing and pushing changes...').start();
  
  try {
    const { commitMessage } = await inquirer.prompt([
      {
        type: 'input',
        name: 'commitMessage',
        message: 'Enter commit message:',
        default: 'Deploy: Update project for deployment'
      }
    ]);

    await execa('git', ['add', '.'], { cwd: process.cwd() });
    await execa('git', ['commit', '-m', commitMessage], { cwd: process.cwd() });
    
    // Try to push
    try {
      await execa('git', ['push'], { cwd: process.cwd() });
      spinner.succeed('Changes committed and pushed!');
    } catch (pushError) {
      // Try to push with upstream
      const { stdout: branch } = await execa('git', ['branch', '--show-current'], { stdio: 'pipe' });
      await execa('git', ['push', '-u', 'origin', branch.trim()], { cwd: process.cwd() });
      spinner.succeed('Changes committed and pushed!');
    }
  } catch (error) {
    spinner.fail('Failed to commit and push changes');
    throw error;
  }
}

async function stashChanges() {
  const spinner = ora('Stashing changes...').start();
  
  try {
    await execa('git', ['stash', 'push', '-m', 'Stashed before deployment'], { cwd: process.cwd() });
    spinner.succeed('Changes stashed!');
    console.log(chalk.yellow('💡 Remember to run "git stash pop" after deployment to restore your changes.'));
  } catch (error) {
    spinner.fail('Failed to stash changes');
    throw error;
  }
}

async function buildProjectWithDependencyCheck(spinner: ora.Ora) {
  try {
    // Clean any previous builds
    spinner.text = 'Cleaning previous builds...';
    await execa('npm', ['run', 'clean'], { cwd: process.cwd() }).catch(() => {
      // Ignore if clean script doesn't exist
    });
    
    spinner.text = 'Building project...';
    await execa('npm', ['run', 'build'], { cwd: process.cwd() });
  } catch (error: any) {
    const errorOutput = error.stderr || error.stdout || '';
    
    // Check for missing dependencies
    const missingDependencies = extractMissingDependencies(errorOutput);
    
    if (missingDependencies.length > 0) {
      spinner.info(`Installing missing dependencies: ${missingDependencies.join(', ')}`);
      
      for (const dep of missingDependencies) {
        spinner.text = `Installing ${dep}...`;
        await execa('npm', ['install', dep], { cwd: process.cwd() });
      }
      
      spinner.text = 'Retrying build after installing dependencies...';
      await execa('npm', ['run', 'build'], { cwd: process.cwd() });
    } else {
      // Check for Next.js specific errors
      if (errorOutput.includes('routes-manifest.json') || errorOutput.includes('static export')) {
        spinner.info('Detected Next.js configuration issue, attempting to fix...');
        await fixNextJsConfiguration();
        
        spinner.text = 'Retrying build after configuration fix...';
        await execa('npm', ['run', 'build'], { cwd: process.cwd() });
      } else {
        throw error;
      }
    }
  }
}

function extractMissingDependencies(errorOutput: string): string[] {
  const dependencies: string[] = [];
  
  // Match patterns like "Cannot find module '@radix-ui/react-label'"
  const moduleNotFoundRegex = /Cannot find module '([^']+)'/g;
  let match;
  
  while ((match = moduleNotFoundRegex.exec(errorOutput)) !== null) {
    const moduleName = match[1];
    if (!dependencies.includes(moduleName)) {
      dependencies.push(moduleName);
    }
  }
  
  return dependencies;
}

async function getGitUserInfo(): Promise<{ name?: string; email?: string }> {
  try {
    const { stdout: name } = await execa('git', ['config', 'user.name'], { stdio: 'pipe' });
    const { stdout: email } = await execa('git', ['config', 'user.email'], { stdio: 'pipe' });
    
    return {
      name: name.trim() || undefined,
      email: email.trim() || undefined
    };
  } catch (error) {
    return {};
  }
}

async function fixNextJsConfiguration() {
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  const nextConfigMjsPath = path.join(process.cwd(), 'next.config.mjs');
  
  // Check if next.config.js exists and has problematic settings
  let configPath = nextConfigPath;
  if (!await fs.pathExists(nextConfigPath) && await fs.pathExists(nextConfigMjsPath)) {
    configPath = nextConfigMjsPath;
  }
  
  if (await fs.pathExists(configPath)) {
    let configContent = await fs.readFile(configPath, 'utf-8');
    
    // Remove static export configuration that causes routes-manifest issues
    if (configContent.includes('output:') && configContent.includes('export')) {
      // Remove output: 'export' line
      configContent = configContent.replace(/output:\s*['"`]export['"`],?\s*\n?/g, '');
      
      // Clean up empty objects
      configContent = configContent.replace(/const nextConfig = {\s*}/g, 'const nextConfig = {}');
      
      await fs.writeFile(configPath, configContent);
      console.log(chalk.green('✅ Removed static export configuration'));
    }
  } else {
    // Create a basic next.config.js if it doesn't exist
    const basicConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
`;
    await fs.writeFile(nextConfigPath, basicConfig);
    console.log(chalk.green('✅ Created basic next.config.js'));
  }
}

async function ensureVercelCompatibility(spinner: ora.Ora) {
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  const nextConfigMjsPath = path.join(process.cwd(), 'next.config.mjs');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  spinner.text = 'Checking Next.js configuration for Vercel compatibility...';
  
  // Fix Next.js configuration
  await fixNextJsConfiguration();
  
  // Ensure package.json has correct build script
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    
    if (!packageJson.scripts?.build || packageJson.scripts.build !== 'next build') {
      spinner.info('Updating build script for Vercel...');
      
      if (!packageJson.scripts) packageJson.scripts = {};
      packageJson.scripts.build = 'next build';
      
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      console.log(chalk.green('✅ Updated build script in package.json'));
    }
  }
  
  // Create or update vercel.json for better configuration
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  if (!await fs.pathExists(vercelJsonPath)) {
    const vercelConfig = {
      "buildCommand": "npm run build",
      "devCommand": "npm run dev",
      "installCommand": "npm install"
    };
    
    await fs.writeJson(vercelJsonPath, vercelConfig, { spaces: 2 });
    console.log(chalk.green('✅ Created vercel.json configuration'));
  }
}

