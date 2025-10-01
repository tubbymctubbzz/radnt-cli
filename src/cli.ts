#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createProject } from './commands/create';
import { addComponent } from './commands/add';
import { devServer } from './commands/dev';
import * as packageJson from '../package.json';

const program = new Command();

program
  .version(packageJson.version)
  .description('A powerful CLI tool for creating Next.js projects with shadcn/ui and modern development tools');

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
    const { getCurrentVersion, checkForUpdates } = await import('./utils/version');
    const version = await getCurrentVersion();
    console.log(chalk.blue.bold(`Radnt CLI v${version}`));
    await checkForUpdates();
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

program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
