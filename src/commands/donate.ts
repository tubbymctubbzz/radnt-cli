import chalk from 'chalk';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function showDonateInfo() {
  console.log(chalk.blue.bold('🌟 Support Radnt CLI Community\n'));

  console.log(chalk.cyan('Thank you for considering supporting Radnt CLI!'));
  console.log(chalk.gray('Your community support helps this project grow and reach more developers.\n'));

  console.log(chalk.yellow('🚀 How you can help:'));
  console.log(chalk.white('  • Share the project with other developers'));
  console.log(chalk.white('  • Star the repository on GitHub'));
  console.log(chalk.white('  • Report bugs and suggest features'));
  console.log(chalk.white('  • Write tutorials and blog posts'));
  console.log(chalk.white('  • Contribute code and documentation\n'));

  const { supportMethod } = await inquirer.prompt([
    {
      type: 'list',
      name: 'supportMethod',
      message: 'How would you like to support the project?',
      choices: [
        { name: '📢 Share on social media', value: 'share' },
        { name: '🌟 Star the repository', value: 'star' },
        { name: '🐛 Report issues or suggest features', value: 'contribute' },
        { name: '📝 Write about Radnt CLI', value: 'write' },
        { name: '👍 Just using it is enough!', value: 'thanks' }
      ]
    }
  ]);

  switch (supportMethod) {
    case 'star':
      console.log(chalk.green('\n🌟 Opening GitHub repository...'));
      console.log(chalk.gray('Please star the repository: https://github.com/tubbymctubbzz/radnt-cli'));
      console.log(chalk.cyan('⭐ Starring helps other developers discover Radnt CLI!'));
      await openUrl('https://github.com/tubbymctubbzz/radnt-cli');
      break;

    case 'share':
      console.log(chalk.green('\n📢 Thank you for spreading the word!'));
      console.log(chalk.cyan('Share Radnt CLI with your network:'));
      console.log(chalk.white('  • Share on Twitter, LinkedIn, Discord, or Reddit'));
      console.log(chalk.white('  • Tell your developer friends'));
      console.log(chalk.white('  • Write a blog post or tutorial'));
      console.log(chalk.white('  • Create YouTube videos or tutorials\n'));

      const { shareAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'shareAction',
          message: 'Quick share action:',
          choices: [
            { name: '🐦 Open Twitter/X to share', value: 'twitter' },
            { name: '📋 Copy share message', value: 'copy' },
            { name: '🔗 Copy project URL', value: 'url' },
            { name: '👍 I\'ll share manually', value: 'manual' }
          ]
        }
      ]);

      if (shareAction === 'twitter') {
        const twitterText = encodeURIComponent(`🚀 Radnt CLI - Next.js development made easy!

⚡ Instant projects with templates
🎨 Built-in shadcn/ui + Tailwind
🌐 Deploy to Vercel/Netlify
🔧 Auto dependency management

Perfect for modern React development!

github.com/tubbymctubbzz/radnt-cli`);

        const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}`;

        console.log(chalk.green('\n🐦 Opening Twitter/X to share...'));
        await openUrl(twitterUrl);
      } else if (shareAction === 'copy') {
        const shareMessage = `🚀 Check out Radnt CLI - a powerful Next.js development tool!

✨ Features:
⚡ Instant project creation with multiple templates
🎨 Built-in shadcn/ui components and Tailwind CSS
🌐 One-click deployment to Vercel, Netlify, GitHub Pages
🔧 Smart dependency management and auto-installation
🛠️ Enhanced dev server with hot reload and live updates
📱 Responsive templates (Dashboard, E-commerce, Blog, Portfolio)

Excellent for modern React/Next.js development!

🔗 GitHub: https://github.com/tubbymctubbzz/radnt-cli
📦 NPM: npm install -g radnt-cli

#NextJS #React #WebDev #CLI #shadcnui #TailwindCSS #TypeScript #OpenSource`;

        console.log(chalk.green('\n📋 Share message (copy this):'));
        console.log(chalk.white('─'.repeat(60)));
        console.log(shareMessage);
        console.log(chalk.white('─'.repeat(60)));
      } else if (shareAction === 'url') {
        console.log(chalk.green('\n🔗 Project URLs (copy these):'));
        console.log(chalk.white('GitHub: https://github.com/tubbymctubbzz/radnt-cli'));
        console.log(chalk.white('NPM: https://www.npmjs.com/package/radnt-cli'));
      }
      break;

    case 'contribute':
      console.log(chalk.green('\n🐛 Contributing to the project!'));
      console.log(chalk.cyan('Ways to contribute:'));
      console.log(chalk.white('  • Report bugs: https://github.com/tubbymctubbzz/radnt-cli/issues'));
      console.log(chalk.white('  • Suggest features: https://github.com/tubbymctubbzz/radnt-cli/issues'));
      console.log(chalk.white('  • Submit pull requests'));
      console.log(chalk.white('  • Improve documentation'));
      console.log(chalk.gray('\nOpening GitHub issues page...'));
      await openUrl('https://github.com/tubbymctubbzz/radnt-cli/issues');
      break;

    case 'write':
      console.log(chalk.green('\n📝 Writing about Radnt CLI!'));
      console.log(chalk.cyan('Content ideas:'));
      console.log(chalk.white('  • Tutorial: "Getting started with Radnt CLI"'));
      console.log(chalk.white('  • Blog post: "Building Next.js apps faster"'));
      console.log(chalk.white('  • Video: "Radnt CLI vs other tools"'));
      console.log(chalk.white('  • Review: "My experience with Radnt CLI"'));
      console.log(chalk.gray('\nFeel free to tag us when you publish!'));
      break;

    case 'thanks':
      console.log(chalk.green('\n👍 Thank you for using Radnt CLI!'));
      console.log(chalk.cyan('Just using the tool and giving feedback helps us improve.'));
      console.log(chalk.gray('Every user makes the project better! 🚀'));
      break;
  }

  if (supportMethod !== 'thanks') {
    console.log(chalk.green('\n🙏 Thank you for supporting the community!'));
    console.log(chalk.cyan('Your support helps Radnt CLI reach more developers.'));
    console.log(chalk.gray('Happy coding with Radnt CLI! 🚀\n'));
  }
}

async function openUrl(url: string) {
  try {
    const platform = process.platform;
    let command = '';

    if (platform === 'darwin') {
      command = `open "${url}"`;
    } else if (platform === 'win32') {
      command = `start "" "${url}"`;
    } else {
      command = `xdg-open "${url}"`;
    }

    await execAsync(command);
    console.log(chalk.gray('Opening in your default browser...\n'));
  } catch (error) {
    console.log(chalk.yellow('Could not open browser automatically.'));
    console.log(chalk.gray(`Please visit: ${url}\n`));
  }
}
