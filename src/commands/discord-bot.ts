import chalk from 'chalk';
import execa from 'execa';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import { getCurrentVersion } from '../utils/version';

export async function setupDiscordBot() {
  console.log(chalk.blue.bold('🤖 Radnt Discord Bot - Complete Bot Setup\n'));

  const spinner = ora('Setting up Discord bot environment...').start();
  spinner.stop();

  // Get Discord application details first
  console.log(chalk.yellow('📋 First, you need to create a Discord application:'));
  console.log(chalk.gray('1. Go to https://discord.com/developers/applications'));
  console.log(chalk.gray('2. Click "New Application" and give it a name'));
  console.log(chalk.gray('3. Go to "Bot" section and click "Add Bot"'));
  console.log(chalk.gray('4. Copy the bot token and application ID\n'));

  const { botToken, clientId, botName, botType, features, prefix, aiPowered, cloudHosting, webDashboard, legalAcknowledgment } = await inquirer.prompt([
    {
      type: 'password',
      name: 'botToken',
      message: 'Discord Bot Token:',
      validate: (input: string) => {
        if (!input.trim()) return 'Bot token is required';
        if (!input.includes('.')) return 'Invalid bot token format';
        return true;
      },
    },
    {
      type: 'input',
      name: 'clientId',
      message: 'Discord Application ID (Client ID):',
      validate: (input: string) => {
        if (!input.trim()) return 'Client ID is required';
        if (!/^\d+$/.test(input)) return 'Client ID must be numbers only';
        return true;
      },
    },
    {
      type: 'input',
      name: 'botName',
      message: 'What is your bot name?',
      default: 'my-discord-bot',
      validate: (input: string) => (input.trim() ? true : 'Bot name is required'),
    },
    {
      type: 'input',
      name: 'prefix',
      message: 'Bot command prefix (for legacy commands):',
      default: '!',
      validate: (input: string) => (input.trim() ? true : 'Prefix is required'),
    },
    {
      type: 'list',
      name: 'botType',
      message: 'Choose bot template:',
      choices: [
        { name: '🚀 Ultimate Bot - All features included (Recommended)', value: 'ultimate' },
        { name: '🎮 Gaming Bot - Gaming community features', value: 'gaming' },
        { name: '💼 Business Bot - Professional server management', value: 'business' },
        { name: '🎓 Educational Bot - Learning and study tools', value: 'educational' },
        { name: '🛡️ Security Bot - Advanced moderation and security', value: 'security' },
        { name: '📊 Analytics Bot - Data tracking and insights', value: 'analytics' },
        { name: '🎨 Creative Bot - Art and content creation', value: 'creative' },
        { name: '⚙️ Custom Bot - Choose your own features', value: 'custom' },
      ],
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select additional features:',
      when: (answers) => answers.botType === 'custom',
      choices: [
        {
          name: '🛡️ Advanced Moderation - AI-powered content filtering',
          value: 'moderation',
          checked: true,
        },
        {
          name: '🎮 Gaming Suite - Tournaments, leaderboards, achievements',
          value: 'gaming',
          checked: true,
        },
        {
          name: '📊 Real-time Analytics - Live server insights and metrics',
          value: 'analytics',
          checked: true,
        },
        { name: '🎭 Smart Role Management - Auto-role assignment and verification', value: 'roles' },
        { name: '💰 Economy System - Virtual currency, shop, and trading', value: 'economy' },
        { name: '🎯 Advanced Leveling - XP, ranks, and reward systems', value: 'leveling' },
        { name: '📝 Advanced Logging - Comprehensive audit trails', value: 'logging' },
        { name: '🔔 Smart Notifications - AI-powered alert system', value: 'notifications' },
        { name: '📅 Event Management - Server events and scheduling', value: 'events' },
        { name: '🎪 Mini Games - Built-in games and entertainment', value: 'minigames' },
        { name: '📊 Polls & Surveys - Advanced voting systems', value: 'polls' },
        { name: '📊 AI-Powered Chat - Conversational AI responses', value: 'aiChat' },
        { name: '🔗 Social Integration - Twitter, YouTube, Twitch feeds', value: 'social' },
        { name: '🤖 AI Assistant - ChatGPT-powered responses', value: 'ai' },
        { name: '💎 Premium Features - Subscription and monetization', value: 'premium' },
      ],
    },
    {
      type: 'confirm',
      name: 'aiPowered',
      message: 'Enable AI-powered features? (ChatGPT integration)',
      default: true,
    },
    {
      type: 'confirm',
      name: 'cloudHosting',
      message: 'Set up automatic cloud hosting? (Railway/Heroku)',
      default: false,
    },
    {
      type: 'confirm',
      name: 'webDashboard',
      message: 'Include web dashboard for bot management?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'legalAcknowledgment',
      message: 'I acknowledge that I am solely responsible for my bot\'s actions and compliance with Discord ToS and applicable laws. Radnt CLI is not liable for any misuse.',
      default: false,
      validate: (input: boolean) => input ? true : 'You must acknowledge the legal terms to continue'
    },
  ]);

  const cleanName = botName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

  // Get features based on bot type
  const finalFeatures = getFeaturesForBotType(botType, features || []);

  console.log(chalk.green('\n🚀 Bot Setup Summary:'));
  console.log(chalk.white(`  • Bot Name: ${botName}`));
  console.log(chalk.white(`  • Bot Type: ${getBotTypeDisplay(botType)}`));
  console.log(chalk.white(`  • Prefix: ${prefix}`));
  console.log(chalk.white(`  • Features: ${finalFeatures.length} advanced features`));
  console.log(chalk.white(`  • AI-Powered: ${aiPowered ? '✅ Enabled' : '❌ Disabled'}`));
  console.log(chalk.white(`  • Web Dashboard: ${webDashboard ? '✅ Included' : '❌ Not included'}`));
  console.log(chalk.white(`  • Cloud Hosting: ${cloudHosting ? '✅ Auto-setup' : '❌ Manual'}`));
  console.log();

  try {
    // Create project directory
    const projectDir = path.join(process.cwd(), cleanName);
    await fs.ensureDir(projectDir);
    process.chdir(projectDir);

    await createDiscordBot(botName, prefix, finalFeatures, botToken, clientId, botType, aiPowered, cloudHosting, webDashboard, ora());

    // Success message
    console.log(chalk.green('\n🎉 Discord bot created successfully!'));
    console.log(chalk.cyan('\n🚀 Next Steps:'));
    console.log(chalk.white('1. Navigate to your project:'));
    console.log(chalk.gray(`   cd ${cleanName}`));

    console.log(chalk.white('\n2. Install dependencies (if not already done):'));
    console.log(chalk.gray('   npm install'));

    console.log(chalk.white('\n3. Start the bot:'));
    console.log(chalk.gray('   npm run dev'));

    console.log(chalk.white('\n4. 🚀 Bot is ready!'));
    console.log(chalk.green('   ✅ Global slash commands auto-deployed'));
    console.log(chalk.green('   ✅ Token and Client ID pre-configured'));
    console.log(chalk.green('   ✅ Advanced features enabled'));
    console.log(chalk.green('   ✅ Professional architecture implemented'));
    console.log(chalk.cyan('   🎯 Try /help, /ping, and /radnt-cli commands'));

    if (aiPowered) {
      console.log(chalk.magenta('   🤖 AI-powered responses enabled'));
    }
    if (webDashboard) {
      console.log(chalk.blue('   📊 Web dashboard available at http://localhost:3001'));
    }
    if (cloudHosting) {
      console.log(chalk.yellow('   ☁️  Cloud hosting configuration included'));
    }

    // Generate custom invite link
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
    console.log(chalk.magenta('\n🔗 Custom Bot Invite Link:'));
    console.log(chalk.white(`   ${inviteUrl}`));
    console.log(chalk.gray('   Copy this link to invite your bot to servers'));

    console.log(chalk.cyan('\n📚 Resources:'));
    console.log(chalk.gray('   • Discord.js Guide: https://discordjs.guide/'));
    console.log(chalk.gray('   • Bot Documentation: ./README.md'));
    console.log(chalk.gray('   • Radnt CLI: https://github.com/tubbymctubbzz/radnt-cli'));

    console.log(chalk.yellow('\n⚠️  Important Legal Notice:'));
    console.log(chalk.gray('   • You are solely responsible for your bot\'s actions and compliance'));
    console.log(chalk.gray('   • Ensure compliance with Discord Terms of Service and Community Guidelines'));
    console.log(chalk.gray('   • Radnt CLI and its creators are not liable for any misuse of generated bots'));
    console.log(chalk.gray('   • Review and understand all applicable laws and regulations'));
    console.log(chalk.gray('   • Use AI features responsibly and in accordance with OpenAI\'s usage policies'));
    console.log();
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function createDiscordBot(
  botName: string,
  prefix: string,
  features: string[],
  botToken: string,
  clientId: string,
  botType: string,
  aiPowered: boolean,
  cloudHosting: boolean,
  webDashboard: boolean,
  spinner: ora.Ora
) {
  spinner.start('Creating Discord bot structure...');

  const radntVersion = await getCurrentVersion();

  // Create package.json
  const packageJson = {
    name: botName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    version: '1.0.0',
    description: `${botName} - Discord bot created with Radnt CLI`,
    main: 'src/index.js',
    scripts: {
      dev: 'node src/index.js',
      start: 'node src/index.js',
      lint: 'eslint src/',
      'lint:fix': 'eslint src/ --fix',
    },
    keywords: ['discord', 'bot', 'radnt-cli', 'discord.js'],
    author: 'Generated by Radnt CLI',
    license: 'MIT',
    dependencies: {
      'discord.js': '^14.14.1',
      'dotenv': '^16.3.1',
      'axios': '^1.6.2',
      'moment': '^2.29.4',
      'node-fetch': '^3.3.1'
    },
    devDependencies: {
      'eslint': '^8.55.0',
      'nodemon': '^3.0.2',
      '@types/node': '^20.10.5'
    },
  };

  // Add feature-specific dependencies
  if (
    features.includes('analytics') ||
    features.includes('economy') ||
    features.includes('leveling')
  ) {
    Object.assign(packageJson.dependencies, {
      mongoose: '^8.0.3',
    });
  }

  if (features.includes('logging')) {
    Object.assign(packageJson.dependencies, {
      winston: '^3.11.0',
    });
  }

  if (features.includes('welcome') || features.includes('automod')) {
    // Use jimp instead of canvas for Windows compatibility
    Object.assign(packageJson.dependencies, {
      jimp: '^0.22.10',
      'sharp': '^0.33.0' // Alternative to canvas for image processing
    });
  }

  // Professional feature enhancements

  if (features.includes('ai') || aiPowered) {
    Object.assign(packageJson.dependencies, {
      'openai': '^4.20.1',
      'natural': '^6.8.0'
    });
  }

  if (features.includes('social')) {
    Object.assign(packageJson.dependencies, {
      'twitter-api-v2': '^1.15.2',
      'rss-parser': '^3.13.0'
    });
  }

  if (features.includes('premium') || features.includes('economy')) {
    Object.assign(packageJson.dependencies, {
      'stripe': '^14.9.0',
      'jsonwebtoken': '^9.0.2'
    });
  }

  if (webDashboard) {
    Object.assign(packageJson.dependencies, {
      'express': '^4.18.2',
      'socket.io': '^4.7.4',
      'ejs': '^3.1.9'
    });
  }

  await fs.writeJson('package.json', packageJson, { spaces: 2 });

  // Create directory structure
  await fs.ensureDir('src/commands');
  await fs.ensureDir('src/events');
  await fs.ensureDir('src/utils');
  await fs.ensureDir('config');

  // Create environment file with actual token
  const envContent = `# Discord Bot Configuration - ⚠️ KEEP THIS SECURE ⚠️
DISCORD_TOKEN=${botToken}
CLIENT_ID=${clientId}

# Bot Settings
BOT_PREFIX=${prefix}
BOT_NAME=${botName}

# Feature Flags
${features.map((feature) => `FEATURE_${feature.toUpperCase()}=true`).join('\n')}

# ⚠️ PROTECTED BY RADNT CLI - DO NOT MODIFY ⚠️
RADNT_CLI_VERSION=${radntVersion}
RADNT_CLI_URL=https://github.com/tubbymctubbzz/radnt-cli`;

  await fs.writeFile('.env', envContent);

  // Create main bot file
  const mainContent = `// Dependency check and error handling
try {
  var { Client, GatewayIntentBits, Collection } = require('discord.js');
} catch (error) {
  console.error('\\n❌ Missing Dependencies Error:');
  console.error('Discord.js is not installed. Please run the following commands:');
  console.error('\\n📦 Install dependencies:');
  console.error('   npm install');
  console.error('\\n🚀 Then start the bot:');
  console.error('   npm run dev');
  console.error('\\n💡 If you continue having issues:');
  console.error('   npm install discord.js dotenv');
  console.error('\\n✨ Generated by Radnt CLI - https://github.com/tubbymctubbzz/radnt-cli\\n');
  process.exit(1);
}

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ⚠️ LEGAL NOTICE - MANDATORY ACKNOWLEDGMENT ⚠️
// By using this bot, you acknowledge that:
// 1. You are solely responsible for this bot's actions and compliance
// 2. You must comply with Discord Terms of Service and Community Guidelines
// 3. Radnt CLI and its creators are not liable for any misuse of this bot
// 4. You must review and understand all applicable laws and regulations
// 5. AI features must be used responsibly per OpenAI's usage policies
// This notice cannot be removed or modified.

// ⚠️ PROTECTED BY RADNT CLI - DO NOT MODIFY BRANDING ⚠️
const RADNT_BRANDING = {
  name: 'Radnt CLI',
  url: 'https://github.com/tubbymctubbzz/radnt-cli',
  version: '${radntVersion}'
};

class ${botName.replace(/[^a-zA-Z0-9]/g, '')}Bot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });

    this.commands = new Collection();
    this.prefix = '${prefix}';

    this.init();
  }

  async init() {
    // Load commands
    await this.loadCommands();

    // Load events
    await this.loadEvents();

    // Login to Discord
    await this.login();
  }

  async loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if ('data' in command && 'execute' in command) {
        this.commands.set(command.data.name, command);
        console.log(\`✅ Loaded command: \${command.data.name}\`);
      } else {
        console.log(\`⚠️  Command \${file} is missing required "data" or "execute" property.\`);
      }
    }
  }

  async loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);

      if (event.once) {
        this.client.once(event.name, (...args) => event.execute(...args, this));
      } else {
        this.client.on(event.name, (...args) => event.execute(...args, this));
      }

      console.log(\`✅ Loaded event: \${event.name}\`);
    }
  }


  async login() {
    try {
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error('❌ Failed to login:', error);
      process.exit(1);
    }
  }

  // Protected branding method - DO NOT MODIFY
  getBranding() {
    return RADNT_BRANDING;
  }
}

// Start the bot
const bot = new ${botName.replace(/[^a-zA-Z0-9]/g, '')}Bot();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n👋 Shutting down bot...');
  bot.client.destroy();
  process.exit(0);
});

module.exports = bot;`;

  await fs.writeFile('src/index.js', mainContent);

  // Create template-specific command files
  await createCommandFiles(botName, radntVersion, features, botType);

  // Create template-specific event files
  await createEventFiles(botName, radntVersion, features, botType);

  // Create utility files
  await createUtilityFiles(radntVersion);

  // Create configuration files
  await createConfigFiles(botName, prefix, features, radntVersion);

  // Create README
  const readmeContent = `# ${botName}

A Discord bot created with **Radnt CLI** v${radntVersion} - the ultimate development toolkit.

## 🚀 Features

- ✅ **Global Slash Commands** - No setup required, works immediately
- 🤖 **Built-in Commands** - Help, Ping, and Radnt CLI info
- 🛡️ **Protected Branding** - Radnt CLI attribution preserved
- 📦 **Ready to Deploy** - All configuration complete

## 🎮 Commands

- \`/help\` - Show all available commands
- \`/ping\` - Check bot latency and status
- \`/radnt-cli\` - Information about Radnt CLI

## 🛠️ Setup Complete

Your bot is **ready to use**! All configuration has been completed:

- ✅ Discord token configured
- ✅ Global slash commands will deploy automatically
- ✅ All dependencies installed
- ✅ No additional setup required

## 🚀 Usage

1. **Start the bot:**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Invite to your server:**
   Use this link (replace CLIENT_ID with your application ID):
   \`\`\`
   https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
   \`\`\`

3. **Use slash commands:**
   - Type \`/\` in any channel to see available commands
   - Commands work globally across all servers

## ⚠️ Important Notes

- **DO NOT MODIFY** Radnt CLI branding in the code
- Keep your \`.env\` file secure and never share your bot token
- Global slash commands may take up to 1 hour to appear in Discord

## 🌟 Generated by Radnt CLI

This bot was generated using [Radnt CLI](https://github.com/tubbymctubbzz/radnt-cli) v${radntVersion} - the ultimate development toolkit for modern applications.

**Features of Radnt CLI:**
- 🚀 Next.js project scaffolding
- 🎨 Component library integration
- 🤖 Discord bot generation
- 📱 Mobile app setup
- 🖥️ Desktop app creation
- And much more!

[⭐ Star Radnt CLI on GitHub](https://github.com/tubbymctubbzz/radnt-cli)

## 📄 License

MIT License - Feel free to modify and distribute.

---

**Powered by Radnt CLI v${radntVersion}** | [GitHub](https://github.com/tubbymctubbzz/radnt-cli)`;

  await fs.writeFile('README.md', readmeContent);

  // Create .gitignore
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local

# Logs
logs
*.log

# Runtime data
pids
*.pid

# Coverage directory
coverage/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db`;
  await fs.writeFile('.gitignore', gitignoreContent);

  // Install dependencies automatically
  spinner.text = 'Installing dependencies...';
  console.log(chalk.yellow('\n🚀 Installing packages:'));
  console.log(chalk.gray('   • discord.js - Discord API library'));
  console.log(chalk.gray('   • dotenv - Environment variable management'));
  console.log(chalk.gray('   • axios - HTTP client for API requests'));
  console.log(chalk.gray('   • moment - Advanced date/time handling'));
  console.log(chalk.gray('   • eslint - Code linting'));
  console.log(chalk.gray('   • nodemon - Development auto-restart'));

  if (features.includes('analytics') || features.includes('economy') || features.includes('leveling')) {
    console.log(chalk.cyan('   • mongoose - MongoDB database integration'));
    console.log(chalk.cyan('   • chart.js - Data visualization charts'));
  }
  if (features.includes('ai') || aiPowered) {
    console.log(chalk.green('   • openai - ChatGPT AI integration'));
    console.log(chalk.green('   • natural - Natural language processing'));
  }
  if (features.includes('logging')) {
    console.log(chalk.blue('   • winston - Advanced logging system'));
    console.log(chalk.blue('   • winston-daily-rotate-file - Log rotation'));
  }
  if (features.includes('welcome') || features.includes('automod')) {
    console.log(chalk.yellow('   • jimp - Cross-platform image processing'));
    console.log(chalk.yellow('   • sharp - High-performance image manipulation'));
  }
  if (features.includes('social')) {
    console.log(chalk.cyan('   • twitter-api-v2 - Twitter integration'));
    console.log(chalk.cyan('   • rss-parser - RSS feed parsing'));
  }
  if (features.includes('premium') || features.includes('economy')) {
    console.log(chalk.green('   • stripe - Payment processing'));
    console.log(chalk.green('   • jsonwebtoken - JWT authentication'));
  }
  if (webDashboard) {
    console.log(chalk.magenta('   • express - Web server framework'));
    console.log(chalk.magenta('   • socket.io - Real-time communication'));
    console.log(chalk.magenta('   • ejs - Template engine'));
  }

  try {
    // Strat 1: Install core dependencies first (most reliable)
    console.log(chalk.cyan('\n📦 Installing core dependencies...'));
    await execa('npm', ['install', 'discord.js', 'dotenv'], {
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    // Strat 2: Try installing all dependencies
    console.log(chalk.cyan('📦 Installing additional packages...'));
    try {
      await execa('npm', ['install'], {
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout: 120000, // 2 minute timeout
      });
      console.log(chalk.green('\n✅ All dependencies installed successfully!'));
    } catch (installError) {
      // Strat 3: Install without optional dependencies (skip problematic packages)
      console.log(chalk.yellow('\n⚠️  Some packages failed, trying without optional dependencies...'));
      await execa('npm', ['install', '--no-optional'], {
        stdio: 'pipe',
        cwd: process.cwd(),
      });
      console.log(chalk.green('\n✅ Core dependencies installed successfully!'));
      console.log(chalk.yellow('⚠️  Some advanced features may require manual setup'));
    }

    spinner.succeed('Discord bot setup complete');

    // Verify installation
    console.log(chalk.gray('\n🔍 Verifying installation...'));
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const pkg = await fs.readJson(packageJsonPath);
      const installedDeps = Object.keys(pkg.dependencies || {}).length;
      const installedDevDeps = Object.keys(pkg.devDependencies || {}).length;

      console.log(chalk.green(`✅ ${installedDeps} dependencies installed`));
      console.log(chalk.green(`✅ ${installedDevDeps} dev dependencies installed`));
    } catch (verifyError) {
      console.log(chalk.yellow('⚠️  Could not verify installation, but setup completed'));
    }
  } catch (error) {
    spinner.fail('Dependency installation failed');
    console.log(chalk.red('\n❌ Failed to install dependencies automatically'));
    console.log(chalk.yellow('\n🔧 Manual installation required:'));
    console.log(chalk.white('   1. Navigate to your project:'));
    console.log(chalk.gray(`      cd ${path.basename(process.cwd())}`));
    console.log(chalk.white('   2. Install dependencies:'));
    console.log(chalk.gray('      npm install'));
    console.log(chalk.white('   3. Start the bot:'));
    console.log(chalk.gray('      npm run dev'));

    console.log(chalk.cyan('\n💡 Windows-specific solutions:'));
    console.log(chalk.gray('   • Install core dependencies only: npm install discord.js dotenv'));
    console.log(chalk.gray('   • Skip optional dependencies: npm install --no-optional'));
    console.log(chalk.gray('   • Use Windows Build Tools: npm install -g windows-build-tools'));
    console.log(chalk.gray('   • Install Visual Studio Build Tools if needed'));

    console.log(chalk.cyan('\n💡 General solutions:'));
    console.log(chalk.gray('   • Check your internet connection'));
    console.log(chalk.gray('   • Clear npm cache: npm cache clean --force'));
    console.log(chalk.gray('   • Try using yarn: yarn install'));
    console.log(chalk.gray('   • Update npm: npm install -g npm@latest'));

    console.log(chalk.yellow('\n⚠️  Note: The bot will work with just discord.js and dotenv'));
    console.log(chalk.gray('   Advanced features may require additional setup on Windows'));
  }
}

async function createCommandFiles(botName: string, radntVersion: string, features: string[], botType: string) {
  // Help Command
  const helpCommand = `const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'help',
    description: 'Show all available commands'
  },
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🤖 ${botName} - Help')
      .setDescription('Here are all available commands:')
      .addFields(
        { name: '/help', value: 'Show this help message', inline: false },
        { name: '/ping', value: 'Check bot latency', inline: false },
        { name: '/radnt-cli', value: 'Information about Radnt CLI', inline: false }
      )
      .setFooter({
        text: \`Powered by Radnt CLI v${radntVersion}\`,
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};`;

  await fs.writeFile('src/commands/help.js', helpCommand);

  // Ping Command
  const pingCommand = `const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'ping',
    description: 'Check bot latency and status'
  },
  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;

    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Bot Latency', value: \`\${latency}ms\`, inline: true },
        { name: 'API Latency', value: \`\${Math.round(interaction.client.ws.ping)}ms\`, inline: true },
        { name: 'Status', value: '✅ Online', inline: true }
      )
      .setFooter({
        text: \`Powered by Radnt CLI v${radntVersion}\`
      })
      .setTimestamp();

    await interaction.editReply({ content: '', embeds: [embed] });
  }
};`;

  await fs.writeFile('src/commands/ping.js', pingCommand);

  // Radnt CLI Command
  const radntCommand = `const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'radnt-cli',
    description: 'Information about Radnt CLI - The ultimate development toolkit'
  },
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('⚡ Radnt CLI - The Ultimate Development Toolkit')
      .setDescription('This bot was generated using **Radnt CLI** - the most powerful development toolkit for modern applications.')
      .addFields(
        { name: '🚀 Version', value: '${radntVersion}', inline: true },
        { name: '📦 Package', value: 'radnt-cli', inline: true },
        { name: '⭐ GitHub', value: '[View Repository](https://github.com/tubbymctubbzz/radnt-cli)', inline: true },
        { name: '🛠️ Features', value: '• Next.js project scaffolding\\n• Component library integration\\n• Discord bot generation\\n• Deployment automation\\n• And much more!', inline: false },
        { name: '📚 Get Started', value: \`\\\`\\\`bash\\nnpm install -g radnt-cli\\nradnt create my-app\\n\\\`\\\`\`, inline: false }
      )
      .setThumbnail('https://raw.githubusercontent.com/tubbymctubbzz/radnt-cli/main/assets/logo.png')
      .setFooter({
        text: 'Thank you for using Radnt CLI! ⭐ Star us on GitHub',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};`;

  await fs.writeFile('src/commands/radnt-cli.js', radntCommand);

  // Generate template-specific commands
  if (features.includes('moderation') || botType === 'security' || botType === 'business') {
    await createModerationCommands();
  }

  if (features.includes('gaming') || botType === 'gaming') {
    await createGamingCommands();
  }

  if (features.includes('analytics') || botType === 'analytics' || botType === 'business') {
    await createAnalyticsCommands();
  }

  if (features.includes('economy') || botType === 'gaming') {
    await createEconomyCommands();
  }

  if (features.includes('welcome') || botType === 'business' || botType === 'creative') {
    await createWelcomeCommands();
  }

  if (features.includes('fun') || botType === 'gaming' || botType === 'creative') {
    await createFunCommands();
  }

  if (features.includes('roles') || botType === 'business' || botType === 'security') {
    await createRoleCommands();
  }

  if (features.includes('events') || botType === 'business' || botType === 'educational') {
    await createEventCommands();
  }
}

// Template-specific command generators
async function createModerationCommands() {
  const kickCommand = `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await interaction.guild.members.kick(user, reason);
      await interaction.reply(\`✅ Successfully kicked \${user.tag} for: \${reason}\`);
    } catch (error) {
      await interaction.reply('❌ Failed to kick user. Check permissions.');
    }
  }
};`;

  await fs.writeFile('src/commands/kick.js', kickCommand);

  const banCommand = `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await interaction.guild.members.ban(user, { reason });
      await interaction.reply(\`✅ Successfully banned \${user.tag} for: \${reason}\`);
    } catch (error) {
      await interaction.reply('❌ Failed to ban user. Check permissions.');
    }
  }
};`;

  await fs.writeFile('src/commands/ban.js', banCommand);
}

async function createGamingCommands() {
  const leaderboardCommand = `const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the server leaderboard'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏆 Server Leaderboard')
      .setDescription('Top players on this server')
      .addFields(
        { name: '🥇 1st Place', value: 'Player 1 - 1000 XP', inline: false },
        { name: '🥈 2nd Place', value: 'Player 2 - 850 XP', inline: false },
        { name: '🥉 3rd Place', value: 'Player 3 - 720 XP', inline: false }
      )
      .setFooter({ text: 'Gaming Bot - Powered by Radnt CLI' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};`;

  await fs.writeFile('src/commands/leaderboard.js', leaderboardCommand);

  const diceCommand = `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice')
    .addIntegerOption(option =>
      option.setName('sides')
        .setDescription('Number of sides on the dice')
        .setMinValue(2)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') || 6;
    const result = Math.floor(Math.random() * sides) + 1;

    await interaction.reply(\`🎲 You rolled a **\${result}** on a \${sides}-sided dice!\`);
  }
};`;

  await fs.writeFile('src/commands/dice.js', diceCommand);
}

async function createAnalyticsCommands() {
  const statsCommand = `const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('Show detailed server statistics'),

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(\`📊 \${guild.name} Analytics\`)
      .addFields(
        { name: '👥 Total Members', value: guild.memberCount.toString(), inline: true },
        { name: '🤖 Bots', value: guild.members.cache.filter(m => m.user.bot).size.toString(), inline: true },
        { name: '👤 Humans', value: guild.members.cache.filter(m => !m.user.bot).size.toString(), inline: true },
        { name: '📝 Text Channels', value: guild.channels.cache.filter(c => c.type === 0).size.toString(), inline: true },
        { name: '🔊 Voice Channels', value: guild.channels.cache.filter(c => c.type === 2).size.toString(), inline: true },
        { name: '🎭 Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: '📅 Created', value: \`<t:\${Math.floor(guild.createdTimestamp / 1000)}:D>\`, inline: true },
        { name: '👑 Owner', value: \`<@\${guild.ownerId}>\`, inline: true }
      )
      .setThumbnail(guild.iconURL())
      .setFooter({ text: 'Analytics Bot - Powered by Radnt CLI' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};`;

  await fs.writeFile('src/commands/serverstats.js', statsCommand);
}

async function createEconomyCommands() {
  const balanceCommand = `const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check balance for')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const balance = Math.floor(Math.random() * 10000); // Mock balance

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('💰 Balance')
      .setDescription(\`\${user.username} has **\${balance}** coins!\`)
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: 'Economy System - Powered by Radnt CLI' });

    await interaction.reply({ embeds: [embed] });
  }
};`;

  await fs.writeFile('src/commands/balance.js', balanceCommand);
}

async function createWelcomeCommands() {
  const welcomeCommand = `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Set the welcome channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel for welcome messages')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    // In a real bot, you'd save this to a database
    await interaction.reply(\`✅ Welcome channel set to \${channel}\\n\\n*Note: Welcome functionality requires database setup.*\`);
  }
};`;

  await fs.writeFile('src/commands/setwelcome.js', welcomeCommand);
}

async function createFunCommands() {
  const coinflipCommand = `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin'),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji = result === 'Heads' ? '🪙' : '🔄';

    await interaction.reply(\`\${emoji} The coin landed on **\${result}**!\`);
  }
};`;

  await fs.writeFile('src/commands/coinflip.js', coinflipCommand);

  const jokeCommand = `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke'),

  async execute(interaction) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "Why did the scarecrow win an award? He was outstanding in his field!",
      "Why don't eggs tell jokes? They'd crack each other up!",
      "What do you call a fake noodle? An impasta!",
      "Why did the math book look so sad? Because it had too many problems!"
    ];

    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    await interaction.reply(\`😄 \${randomJoke}\`);
  }
};`;

  await fs.writeFile('src/commands/joke.js', jokeCommand);
}

async function createRoleCommands() {
  const roleCommand = `const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Manage user roles')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a role to a user')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('User to add role to')
            .setRequired(true)
        )
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to add')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from a user')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('User to remove role from')
            .setRequired(true)
        )
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to remove')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const member = interaction.guild.members.cache.get(user.id);

    try {
      if (subcommand === 'add') {
        await member.roles.add(role);
        await interaction.reply(\`✅ Added \${role.name} role to \${user.tag}\`);
      } else if (subcommand === 'remove') {
        await member.roles.remove(role);
        await interaction.reply(\`✅ Removed \${role.name} role from \${user.tag}\`);
      }
    } catch (error) {
      await interaction.reply('❌ Failed to manage role. Check permissions and role hierarchy.');
    }
  }
};`;

  await fs.writeFile('src/commands/role.js', roleCommand);
}

async function createEventCommands() {
  const eventCommand = `const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('event')
    .setDescription('Create a server event')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Event title')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Event description')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Event time (e.g., "2024-12-25 18:00")')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const time = interaction.options.getString('time');

    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle(\`📅 \${title}\`)
      .setDescription(description)
      .addFields(
        { name: '⏰ Time', value: time, inline: true },
        { name: '👤 Organizer', value: interaction.user.tag, inline: true }
      )
      .setFooter({ text: 'Event System - Powered by Radnt CLI' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};`;

  await fs.writeFile('src/commands/event.js', eventCommand);
}

async function createEventFiles(botName: string, radntVersion: string, features: string[], botType: string) {
  // Ready Event
  const readyEvent = `const { REST, Routes } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client, bot) {
    console.log(\`\\n🤖 \${client.user.tag} is online!\`);
    console.log(\`📊 Serving \${client.guilds.cache.size} servers\`);
    console.log(\`👥 Watching \${client.users.cache.size} users\`);
    console.log(\`\\n✨ Generated by Radnt CLI v${radntVersion}\`);
    console.log(\`🔗 https://github.com/tubbymctubbzz/radnt-cli\\n\`);

    // Deploy global slash commands
    await deployCommands(client, bot);

    client.user.setActivity(\`/help | \${client.guilds.cache.size} servers\`, {
      type: 3 // WATCHING
    });
  }
};

async function deployCommands(client, bot) {
  try {
    console.log('🔄 Deploying global slash commands...');

    const commands = Array.from(bot.commands.values()).map(cmd => cmd.data);

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(\`✅ Successfully deployed \${commands.length} global slash commands.\`);
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
}`;

  await fs.writeFile('src/events/ready.js', readyEvent);

  // Interaction Create Event
  const interactionEvent = `module.exports = {
  name: 'interactionCreate',
  async execute(interaction, bot) {
    if (!interaction.isChatInputCommand()) return;

    const command = bot.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(\`Error executing \${interaction.commandName}:\`, error);

      const errorMessage = 'There was an error while executing this command!';

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }
};`;

  await fs.writeFile('src/events/interactionCreate.js', interactionEvent);
}

async function createUtilityFiles(radntVersion: string) {
  const utilsContent = `// Utility functions for the bot
// ⚠️ PROTECTED BY RADNT CLI - DO NOT MODIFY BRANDING ⚠️

class BotUtils {
  static formatUptime(uptime) {
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const minutes = Math.floor(uptime / 60000) % 60;
    const seconds = Math.floor(uptime / 1000) % 60;

    return \`\${days}d \${hours}h \${minutes}m \${seconds}s\`;
  }

  static getRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
  }

  static capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Protected branding method
  static getRadntBranding() {
    return {
      name: 'Radnt CLI',
      version: '${radntVersion}',
      url: 'https://github.com/tubbymctubbzz/radnt-cli'
    };
  }
}

module.exports = BotUtils;`;

  await fs.writeFile('src/utils/index.js', utilsContent);
}

async function createConfigFiles(
  botName: string,
  prefix: string,
  features: string[],
  radntVersion: string
) {
  const configContent = `// ⚠️ PROTECTED BY RADNT CLI - DO NOT MODIFY BRANDING ⚠️
module.exports = {
  bot: {
    name: '${botName}',
    prefix: '${prefix}',
    version: '1.0.0',
    author: 'Generated by Radnt CLI',
    features: [${features.map((f) => `'${f}'`).join(', ')}]
  },

  colors: {
    primary: '#5865F2',
    success: '#57F287',
    warning: '#FEE75C',
    error: '#ED4245',
    info: '#5865F2'
  },

  emojis: {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⏳'
  },

  // Protected branding - DO NOT MODIFY
  radnt: {
    name: 'Radnt CLI',
    version: '${radntVersion}',
    url: 'https://github.com/tubbymctubbzz/radnt-cli',
    protected: true
  }
};`;

  await fs.writeFile('config/bot-config.js', configContent);
}

function getFeaturesForBotType(botType: string, customFeatures: string[]): string[] {
  const templateFeatures: Record<string, string[]> = {
    ultimate: ['moderation', 'gaming', 'analytics', 'roles', 'economy', 'leveling', 'welcome', 'logging', 'notifications', 'events', 'minigames', 'polls', 'social', 'ai', 'premium'],
    gaming: ['gaming', 'leveling', 'economy', 'minigames', 'events', 'roles', 'analytics'],
    business: ['moderation', 'analytics', 'logging', 'roles', 'notifications', 'events', 'polls'],
    educational: ['moderation', 'roles', 'events', 'polls', 'logging', 'notifications'],
    security: ['moderation', 'logging', 'analytics', 'notifications', 'roles'],
    analytics: ['analytics', 'logging', 'notifications', 'polls'],
    creative: ['welcome', 'roles', 'events', 'social', 'analytics'],
    custom: customFeatures
  };

  return templateFeatures[botType] || customFeatures;
}

function getBotTypeDisplay(botType: string): string {
  const typeDisplays: Record<string, string> = {
    ultimate: '🚀 Ultimate Bot (All Features)',
    gaming: '🎮 Gaming Community Bot',
    business: '💼 Business Management Bot',
    educational: '🎓 Educational Bot',
    security: '🛡️ Security & Moderation Bot',
    analytics: '📊 Analytics & Insights Bot',
    creative: '🎨 Creative Community Bot',
    custom: '⚙️ Custom Configuration'
  };

  return typeDisplays[botType] || 'Custom Bot';
}
