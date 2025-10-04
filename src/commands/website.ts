import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function openWebsite(options: { print?: boolean } = {}) {
      const websiteUrl = 'https://radnt.netlify.app/';

      console.log(chalk.blue.bold('🌐 Radnt Official Website\n'));

      if (options.print) {
        console.log(chalk.cyan('Website URL:'));
        console.log(chalk.white(websiteUrl));
        console.log();
        return;
      }

      try {
        console.log(chalk.yellow('🚀 Opening Radnt website in your default browser...'));
        console.log(chalk.gray(`   ${websiteUrl}`));

        // Cross-platform browser opening
        const platform = process.platform;
        let command: string;

        switch (platform) {
          case 'darwin': // macOS
            command = `open "${websiteUrl}"`;
            break;
          case 'win32': // Windows
            command = `start "" "${websiteUrl}"`;
            break;
          default: // Linux and others
            command = `xdg-open "${websiteUrl}"`;
            break;
        }

        await execAsync(command);

        console.log(chalk.green('\n✅ Website opened successfully!'));
        console.log(chalk.cyan('\n📚 What you\'ll find on the website:'));
        console.log(chalk.gray('   • Complete documentation'));
        console.log(chalk.gray('   • Interactive tutorials'));
        console.log(chalk.gray('   • Component showcase'));
        console.log(chalk.gray('   • Latest updates and news'));
        console.log(chalk.gray('   • Community resources'));

        console.log(chalk.yellow('\n⭐ Don\'t forget to star us on GitHub!'));
        console.log(chalk.gray('   https://github.com/tubbymctubbzz/radnt-cli'));

      } catch (error) {
        console.log(chalk.red('\n❌ Failed to open website automatically'));
        console.log(chalk.yellow('\n🔗 Please visit manually:'));
        console.log(chalk.white(`   ${websiteUrl}`));

        console.log(chalk.cyan('\n💡 You can also use:'));
        console.log(chalk.gray('   radnt website --print  # Just show the URL'));
      }

      console.log();
}
