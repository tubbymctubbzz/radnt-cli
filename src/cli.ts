#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createProject } from './commands/create';
import { addComponent } from './commands/add';
import { devServer } from './commands/dev';
import * as packageJson from '../package.json';

const program = new Command();

try {
  const updateNotifier = require('update-notifier');
  const boxen = require('boxen');
  const notifier = updateNotifier({ pkg: packageJson });
  if (notifier.update) {
    console.log(boxen(
      `Update available ${chalk.dim(notifier.update.current)} → ${chalk.green(notifier.update.latest)}\n` +
      `Run ${chalk.cyan('npm i -g radnt-cli')} to update`,
      { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'yellow' }
    ));
  }
} catch (error) {
  // Optional dependencies not available, continue without update check
}

program
  .version(packageJson.version);

program
  .command('create')
  .description('Create a new Next.js project with shadcn/ui')
  .option('-t, --template <template>', 'Template to use (basic, dashboard, ecommerce)', 'basic')
  .option('--typescript', 'Use TypeScript (default: true)', true)
  .option('--tailwind', 'Include Tailwind CSS (default: true)', true)
  .option('--eslint', 'Include ESLint (default: true)', true)
  .option('--app-router', 'Use App Router (default: true)', true)
  .option('--shadcn', 'Include shadcn/ui (default: true)', true)
  .action(createProject);

program
  .command('dev')
  .description('Start the development server with hot reload and enhanced features')
  .option('-p, --port <port>', 'Port to run the server on', '8000')
  .option('--host <host>', 'Host to bind the server to', 'localhost')
  .option('-k, --kill', 'Kill any existing dev servers before starting')
  .action(devServer);

program
  .command('kill')
  .description('Kill any running development servers')
  .action(async () => {
    const { killDevServers } = await import('./commands/dev');
    await killDevServers();
  });

program
  .command('add')
  .description('Add shadcn/ui components to your project')
  .argument('[component]', 'Component name to add')
  .option('-a, --all', 'Add all available components')
  .action(addComponent);

program
  .command('init')
  .description('Initialize shadcn/ui in an existing Next.js project')
  .action(async () => {
    const { initShadcn } = await import('./commands/init');
    await initShadcn();
  });

program
  .command('update')
  .description('Update Radnt CLI to the latest version')
  .action(async () => {
    const { updateCLI } = await import('./utils/version');
    await updateCLI();
  });

program
  .command('version')
  .description('Show version information and check for updates')
  .action(async () => {
    const { getCurrentVersion, getInstalledVersion, getLatestVersion } = await import('./utils/version');

    console.log(chalk.blue.bold('📦 Radnt CLI Version Information\n'));

    const currentVersion = await getCurrentVersion();
    const installedVersion = await getInstalledVersion();

    console.log(chalk.gray(`Package version: ${currentVersion}`));
    console.log(chalk.gray(`Installed version: ${installedVersion}`));

    console.log(chalk.gray('\nChecking for updates...'));
    const latestVersion = await getLatestVersion();

    if (latestVersion) {
      console.log(chalk.gray(`Latest version: ${latestVersion}`));

      if (installedVersion !== latestVersion) {
        console.log(chalk.yellow('\n📦 Update available!'));
        console.log(chalk.cyan('To update, run:'));
        console.log(chalk.white('  radnt update'));
      } else {
        console.log(chalk.green('\n✅ You have the latest version!'));
      }
    } else {
      console.log(chalk.yellow('\n⚠️  Could not check for updates (npm registry might be delayed)'));
      console.log(chalk.gray('Try running: radnt update'));
    }
  });

program
  .command('fix')
  .description('Fix common issues in existing projects (dependencies, config, etc.)')
  .action(async () => {
    const { fixProject } = await import('./commands/fix');
    await fixProject();
  });

program
  .command('upgrade')
  .description('Upgrade existing project to use latest Radnt templates and design')
  .action(async () => {
    const { upgradeProject } = await import('./commands/upgrade');
    await upgradeProject();
  });

program
  .command('deploy')
  .description('Deploy your project to various platforms (Vercel, Netlify, etc.)')
  .option('-p, --platform <platform>', 'Deployment platform (vercel, netlify, github)', 'vercel')
  .option('--build', 'Build before deploying', true)
  .action(async (options) => {
    const { deployProject } = await import('./commands/deploy');
    await deployProject(options);
  });

program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

// Show enhanced help if no command is provided
if (!process.argv.slice(2).length) {
  try {
    const figlet = require('figlet');
    console.log(figlet.textSync('Radnt CLI', {
      font: 'ANSI Shadow',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    }));
  } catch (error) {
    console.log(chalk.blue.bold('🚀 Radnt CLI'));
  }
  console.log(chalk.cyan.bold(`v${packageJson.version} - Build the future today\n`));
  program.outputHelp();
  console.log(chalk.gray('\nQuick start:'));
  console.log(chalk.white('  radnt create my-app    # Create a new project'));
  console.log(chalk.white('  radnt dev              # Start development server'));
  console.log(chalk.white('  radnt add button       # Add shadcn/ui components'));
  console.log(chalk.gray('\nFor more help: https://github.com/tubbymctubbzz/radnt-cli\n'));
  process.exit(0);
}

program.parse(process.argv);
