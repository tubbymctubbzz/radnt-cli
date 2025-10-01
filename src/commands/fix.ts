import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import execa from 'execa';

export async function fixProject() {
  console.log(chalk.blue.bold('🔧 Fixing project issues...\n'));

  const spinner = ora('Analyzing project...').start();

  try {
    // Check if we're in a project directory
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      spinner.fail('No package.json found');
      console.error(chalk.red('❌ Not in a project directory.'));
      process.exit(1);
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const isNextProject = packageJson.dependencies?.next || packageJson.devDependencies?.next;

    if (!isNextProject) {
      spinner.fail('Not a Next.js project');
      console.error(chalk.red('❌ This doesn\'t appear to be a Next.js project.'));
      process.exit(1);
    }

    let fixesApplied = 0;

    // Fix 1: Update Next.js to latest version
    spinner.text = 'Checking Next.js version...';
    const currentNextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
    if (currentNextVersion && !currentNextVersion.includes('15.')) {
      spinner.text = 'Updating Next.js to latest version...';
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies.next = '^15.0.0';
      packageJson.dependencies.react = '^18.3.0';
      packageJson.dependencies['react-dom'] = '^18.3.0';
      
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      console.log(chalk.green('✅ Updated Next.js to v15.0.0'));
      fixesApplied++;
    }

    // Fix 2: Add missing tailwindcss-animate
    spinner.text = 'Checking Tailwind dependencies...';
    const hasTailwind = packageJson.dependencies?.tailwindcss || packageJson.devDependencies?.tailwindcss;
    const hasShadcn = packageJson.dependencies?.['class-variance-authority'];
    
    if (hasTailwind && hasShadcn && !packageJson.dependencies?.['tailwindcss-animate']) {
      packageJson.dependencies['tailwindcss-animate'] = '^1.0.7';
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      console.log(chalk.green('✅ Added missing tailwindcss-animate dependency'));
      fixesApplied++;
    }

    // Fix 3: Update other dependencies
    spinner.text = 'Updating other dependencies...';
    if (packageJson.dependencies?.['tailwind-merge'] && !packageJson.dependencies['tailwind-merge'].includes('2.')) {
      packageJson.dependencies['tailwind-merge'] = '^2.5.0';
      console.log(chalk.green('✅ Updated tailwind-merge to v2.5.0'));
      fixesApplied++;
    }

    if (packageJson.dependencies?.clsx && !packageJson.dependencies.clsx.includes('2.')) {
      packageJson.dependencies.clsx = '^2.1.0';
      console.log(chalk.green('✅ Updated clsx to v2.1.0'));
      fixesApplied++;
    }

    // Fix 4: Fix Next.js config
    spinner.text = 'Fixing Next.js configuration...';
    const nextConfigPaths = [
      path.join(process.cwd(), 'next.config.js'),
      path.join(process.cwd(), 'next.config.ts'),
      path.join(process.cwd(), 'next.config.mjs')
    ];

    for (const configPath of nextConfigPaths) {
      if (await fs.pathExists(configPath)) {
        const configContent = await fs.readFile(configPath, 'utf-8');
        
        // Check if it has the deprecated appDir option
        if (configContent.includes('appDir')) {
          const fixedContent = configContent
            .replace(/experimental:\s*{\s*appDir:\s*true\s*}/g, '// App Router is now stable in Next.js 15+')
            .replace(/experimental:\s*{\s*appDir:\s*false\s*}/g, '// App Router is now stable in Next.js 15+')
            .replace(/,\s*experimental:\s*{\s*appDir:\s*\w+\s*}/g, '')
            .replace(/experimental:\s*{\s*appDir:\s*\w+\s*},?/g, '// App Router is now stable in Next.js 15+');

          await fs.writeFile(configPath, fixedContent);
          console.log(chalk.green(`✅ Fixed deprecated appDir option in ${path.basename(configPath)}`));
          fixesApplied++;
        }
        break;
      }
    }

    // Fix 5: Update Tailwind config if needed
    spinner.text = 'Checking Tailwind configuration...';
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
    if (await fs.pathExists(tailwindConfigPath)) {
      const tailwindConfig = await fs.readFile(tailwindConfigPath, 'utf-8');
      
      // Check if it's missing tailwindcss-animate plugin
      if (hasShadcn && !tailwindConfig.includes('tailwindcss-animate')) {
        const updatedConfig = tailwindConfig.replace(
          /plugins:\s*\[(.*?)\]/s,
          'plugins: [$1require("tailwindcss-animate")]'
        ).replace('plugins: [require("tailwindcss-animate")]', 'plugins: [require("tailwindcss-animate")]')
         .replace('plugins: [,require("tailwindcss-animate")]', 'plugins: [require("tailwindcss-animate")]');

        await fs.writeFile(tailwindConfigPath, updatedConfig);
        console.log(chalk.green('✅ Added tailwindcss-animate to Tailwind config'));
        fixesApplied++;
      }
    }

    // Save updated package.json
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Install updated dependencies
    if (fixesApplied > 0) {
      spinner.text = 'Installing updated dependencies...';
      await execa('npm', ['install'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      console.log(chalk.green('✅ Dependencies updated successfully'));
    }

    spinner.succeed(`Fixed ${fixesApplied} issue(s) in your project!`);

    if (fixesApplied === 0) {
      console.log(chalk.green('🎉 Your project is already up to date!'));
    } else {
      console.log(chalk.green('\n🎉 Project fixes applied successfully!'));
      console.log(chalk.cyan('You can now run:'));
      console.log(chalk.white('  radnt dev'));
    }

  } catch (error) {
    spinner.fail('Failed to fix project');
    console.error(chalk.red('❌ Error fixing project:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}
