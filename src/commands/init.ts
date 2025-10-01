import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { ShadcnConfig } from '../types';

export async function initShadcn() {
  console.log(chalk.blue.bold('🎨 Initializing shadcn/ui in your project...\n'));

  // Check if we're in a Next.js project
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!await fs.pathExists(packageJsonPath)) {
    console.error(chalk.red('❌ No package.json found. Make sure you\'re in a project directory.'));
    process.exit(1);
  }

  const packageJson = await fs.readJson(packageJsonPath);
  const isNextProject = packageJson.dependencies?.next || packageJson.devDependencies?.next;

  if (!isNextProject) {
    console.error(chalk.red('❌ This doesn\'t appear to be a Next.js project.'));
    console.log(chalk.yellow('Run "radnt create" to create a new project.'));
    process.exit(1);
  }

  // Check if already initialized
  const componentsJsonPath = path.join(process.cwd(), 'components.json');
  if (await fs.pathExists(componentsJsonPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'components.json already exists. Do you want to overwrite it?',
        default: false
      }
    ]);

    if (!overwrite) {
      console.log(chalk.yellow('Initialization cancelled.'));
      return;
    }
  }

  // Detect project structure
  const hasAppDir = await fs.pathExists(path.join(process.cwd(), 'app'));
  const hasSrcDir = await fs.pathExists(path.join(process.cwd(), 'src'));
  const hasTypeScript = await fs.pathExists(path.join(process.cwd(), 'tsconfig.json'));

  console.log(chalk.gray('Detected project configuration:'));
  console.log(chalk.gray(`  • ${hasTypeScript ? 'TypeScript' : 'JavaScript'}`));
  console.log(chalk.gray(`  • ${hasAppDir ? 'App Router' : 'Pages Router'}`));
  console.log(chalk.gray(`  • ${hasSrcDir ? 'src/ directory' : 'root directory'}\n`));

  // Get configuration from user
  const config = await promptForShadcnConfig(hasAppDir, hasSrcDir, hasTypeScript);

  const spinner = ora('Setting up shadcn/ui...').start();

  try {
    // Create components.json
    await fs.writeJson(componentsJsonPath, config, { spaces: 2 });
    
    // Create necessary directories
    const componentsDir = path.join(process.cwd(), config.aliases.components.replace('@/', hasSrcDir ? 'src/' : ''));
    const libDir = path.join(process.cwd(), config.aliases.utils.replace('@/', hasSrcDir ? 'src/' : '').replace('/utils', ''));
    
    await fs.ensureDir(path.join(componentsDir, 'ui'));
    await fs.ensureDir(libDir);

    // Create utils file
    const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;

    const utilsPath = path.join(process.cwd(), config.aliases.utils.replace('@/', hasSrcDir ? 'src/' : '') + (hasTypeScript ? '.ts' : '.js'));
    await fs.writeFile(utilsPath, utilsContent);

    // Update or create Tailwind config if needed
    await setupTailwindConfig(config);

    // Update globals.css if needed
    await setupGlobalStyles(config, hasAppDir, hasSrcDir);

    spinner.succeed('shadcn/ui initialized successfully!');

    console.log(chalk.green('\n✨ shadcn/ui has been initialized!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.white('  • Add components: radnt add button'));
    console.log(chalk.white('  • Add multiple components: radnt add button card alert'));
    console.log(chalk.white('  • Add all components: radnt add --all'));
    console.log(chalk.gray('\nHappy coding! 🚀'));

  } catch (error) {
    spinner.fail('Failed to initialize shadcn/ui');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

async function promptForShadcnConfig(hasAppDir: boolean, hasSrcDir: boolean, hasTypeScript: boolean): Promise<ShadcnConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'style',
      message: 'Which style would you like to use?',
      choices: [
        { name: 'Default', value: 'default' },
        { name: 'New York', value: 'new-york' }
      ],
      default: 'default'
    },
    {
      type: 'list',
      name: 'baseColor',
      message: 'Which color would you like to use as base color?',
      choices: [
        { name: 'Slate', value: 'slate' },
        { name: 'Gray', value: 'gray' },
        { name: 'Zinc', value: 'zinc' },
        { name: 'Neutral', value: 'neutral' },
        { name: 'Stone', value: 'stone' }
      ],
      default: 'slate'
    },
    {
      type: 'confirm',
      name: 'cssVariables',
      message: 'Would you like to use CSS variables for colors?',
      default: true
    }
  ]);

  const componentsPath = hasSrcDir ? '@/components' : '@/components';
  const utilsPath = hasSrcDir ? '@/lib/utils' : '@/lib/utils';
  const cssPath = hasAppDir 
    ? (hasSrcDir ? 'src/app/globals.css' : 'app/globals.css')
    : (hasSrcDir ? 'src/styles/globals.css' : 'styles/globals.css');

  return {
    style: answers.style,
    baseColor: answers.baseColor,
    cssVariables: answers.cssVariables,
    rsc: hasAppDir,
    tsx: hasTypeScript,
    tailwind: {
      config: 'tailwind.config.js',
      css: cssPath,
      baseColor: answers.baseColor,
      cssVariables: answers.cssVariables
    },
    aliases: {
      components: componentsPath,
      utils: utilsPath
    }
  };
}

async function setupTailwindConfig(config: ShadcnConfig) {
  const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
  
  if (!await fs.pathExists(tailwindConfigPath)) {
    // Create new Tailwind config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{${config.tsx ? 'ts,tsx' : 'js,jsx'}}',
    './components/**/*.{${config.tsx ? 'ts,tsx' : 'js,jsx'}}',
    './app/**/*.{${config.tsx ? 'ts,tsx' : 'js,jsx'}}',
    './src/**/*.{${config.tsx ? 'ts,tsx' : 'js,jsx'}}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`;

    await fs.writeFile(tailwindConfigPath, tailwindConfig);
  }
}

async function setupGlobalStyles(config: ShadcnConfig, hasAppDir: boolean, hasSrcDir: boolean) {
  const cssPath = path.join(process.cwd(), config.tailwind.css);
  
  const globalStyles = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;

  // Ensure directory exists
  await fs.ensureDir(path.dirname(cssPath));
  
  if (await fs.pathExists(cssPath)) {
    // Read existing content and check if it already has our styles
    const existingContent = await fs.readFile(cssPath, 'utf-8');
    if (!existingContent.includes('--background:')) {
      // Append our styles
      await fs.writeFile(cssPath, existingContent + '\n\n' + globalStyles);
    }
  } else {
    // Create new file
    await fs.writeFile(cssPath, globalStyles);
  }
}
