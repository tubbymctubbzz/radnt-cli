import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import execa from 'execa';
import validateNpmPackageName from 'validate-npm-package-name';
import { ProjectConfig, Template } from '../types';
import { createNextJsProject } from '../generators/nextjs';
import { setupShadcnUI } from '../generators/shadcn';
import { setupTailwind } from '../generators/tailwind';
import { createProjectStructure } from '../generators/structure';

export async function createProject(projectName?: string, options: any = {}) {
  console.log(chalk.blue.bold('🚀 Welcome to Radnt CLI!'));
  console.log(chalk.gray('Let\'s create your Next.js project with modern tools.\n'));

  // Check for updates in background
  const { checkForUpdates } = await import('../utils/version');
  checkForUpdates().catch(() => {}); // Silent fail

  let config: ProjectConfig;

  if (projectName && !isInteractiveMode()) {
    // Non-interactive mode
    config = {
      projectName,
      template: options.template || 'basic',
      typescript: options.typescript !== false,
      tailwind: options.tailwind !== false,
      eslint: options.eslint !== false,
      appRouter: options.appRouter !== false,
      shadcn: options.shadcn !== false,
      packageManager: 'npm'
    };
  } else {
    // Interactive mode
    config = await promptForConfig(projectName);
  }

  // Validate project name
  const validation = validateNpmPackageName(config.projectName);
  if (!validation.validForNewPackages) {
    console.error(chalk.red('❌ Invalid project name:'));
    validation.errors?.forEach(error => console.error(chalk.red(`  • ${error}`)));
    validation.warnings?.forEach(warning => console.error(chalk.yellow(`  • ${warning}`)));
    process.exit(1);
  }

  const projectPath = path.resolve(process.cwd(), config.projectName);

  // Check if directory already exists
  if (await fs.pathExists(projectPath)) {
    console.error(chalk.red(`❌ Directory "${config.projectName}" already exists.`));
    process.exit(1);
  }

  console.log(chalk.green(`\n✨ Creating project "${config.projectName}"...\n`));

  try {
    await createProjectWithConfig(config, projectPath);

    console.log(chalk.green.bold('\n🎉 Project created successfully!\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.white(`  cd ${config.projectName}`));
    console.log(chalk.white(`  npm run dev`));
    console.log(chalk.gray('\nHappy coding! 🚀'));

  } catch (error) {
    console.error(chalk.red('\n❌ Failed to create project:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));

    // Cleanup on failure
    if (await fs.pathExists(projectPath)) {
      await fs.remove(projectPath);
    }
    process.exit(1);
  }
}

async function promptForConfig(initialProjectName?: string): Promise<ProjectConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      default: initialProjectName || 'my-radnt-app',
      validate: (input: string) => {
        const validation = validateNpmPackageName(input);
        if (!validation.validForNewPackages) {
          return validation.errors?.[0] || 'Invalid project name';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'template',
      message: 'Which template would you like to use?',
      choices: [
        { name: '🏗️  Basic - Clean Next.js setup with shadcn/ui', value: 'basic' },
        { name: '📊 Dashboard - Admin dashboard with charts and tables', value: 'dashboard' },
        { name: '🛒 E-commerce - Online store with product catalog', value: 'ecommerce' },
        { name: '📝 Blog - Content-focused blog template', value: 'blog' },
        { name: '🎨 Portfolio - Personal portfolio showcase', value: 'portfolio' }
      ],
      default: 'basic'
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Would you like to use TypeScript?',
      default: true
    },
    {
      type: 'confirm',
      name: 'tailwind',
      message: 'Would you like to use Tailwind CSS?',
      default: true
    },
    {
      type: 'confirm',
      name: 'eslint',
      message: 'Would you like to use ESLint?',
      default: true
    },
    {
      type: 'confirm',
      name: 'appRouter',
      message: 'Would you like to use App Router? (recommended)',
      default: true
    },
    {
      type: 'confirm',
      name: 'shadcn',
      message: 'Would you like to include shadcn/ui components?',
      default: true
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'pnpm', value: 'pnpm' }
      ],
      default: 'npm'
    }
  ]);

  return answers as ProjectConfig;
}

async function createProjectWithConfig(config: ProjectConfig, projectPath: string) {
  const spinner = ora('Creating project structure...').start();

  try {
    // Create project directory
    await fs.ensureDir(projectPath);

    // Create Next.js project
    spinner.text = 'Setting up Next.js...';
    await createNextJsProject(config, projectPath);

    // Setup project structure based on template
    spinner.text = 'Creating project structure...';
    await createProjectStructure(config, projectPath);

    // Setup Tailwind CSS
    if (config.tailwind) {
      spinner.text = 'Setting up Tailwind CSS...';
      await setupTailwind(config, projectPath);
    }

    // Setup shadcn/ui
    if (config.shadcn) {
      spinner.text = 'Setting up shadcn/ui...';
      await setupShadcnUI(config, projectPath);
    }

    // Install dependencies
    spinner.text = 'Installing dependencies...';
    await installDependencies(config, projectPath);

    spinner.succeed('Project created successfully!');

  } catch (error) {
    spinner.fail('Failed to create project');
    throw error;
  }
}

async function installDependencies(config: ProjectConfig, projectPath: string) {
  const { packageManager } = config;

  try {
    await execa(packageManager, ['install'], {
      cwd: projectPath,
      stdio: 'pipe'
    });
  } catch (error) {
    throw new Error(`Failed to install dependencies with ${packageManager}`);
  }
}

function isInteractiveMode(): boolean {
  return process.stdin.isTTY === true;
}
