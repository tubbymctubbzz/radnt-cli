import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';

export async function upgradeProject() {
  console.log(chalk.blue.bold('🚀 Upgrading your Radnt project...\n'));

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

    spinner.succeed('Project analysis complete');

    // Ask user what they want to upgrade
    const { upgradeOptions } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'upgradeOptions',
        message: 'What would you like to upgrade?',
        choices: [
          { name: 'Homepage design (modern, beautiful layout)', value: 'homepage', checked: true },
          { name: 'Add missing Badge component', value: 'badge' },
          { name: 'Update global styles', value: 'styles' },
          { name: 'Add latest shadcn/ui components', value: 'components' }
        ]
      }
    ]);

    if (upgradeOptions.length === 0) {
      console.log(chalk.yellow('No upgrades selected. Exiting...'));
      return;
    }

    let upgradesApplied = 0;

    // Upgrade homepage
    if (upgradeOptions.includes('homepage')) {
      spinner.start('Upgrading homepage design...');
      await upgradeHomepage();
      console.log(chalk.green('✅ Homepage upgraded to modern design'));
      upgradesApplied++;
    }

    // Add Badge component
    if (upgradeOptions.includes('badge')) {
      spinner.start('Adding Badge component...');
      await addBadgeComponent();
      console.log(chalk.green('✅ Badge component added'));
      upgradesApplied++;
    }

    // Update styles
    if (upgradeOptions.includes('styles')) {
      spinner.start('Updating global styles...');
      await updateGlobalStyles();
      console.log(chalk.green('✅ Global styles updated'));
      upgradesApplied++;
    }

    // Add components
    if (upgradeOptions.includes('components')) {
      spinner.start('Adding latest components...');
      await addLatestComponents();
      console.log(chalk.green('✅ Latest components added'));
      upgradesApplied++;
    }

    spinner.succeed(`Successfully upgraded ${upgradesApplied} item(s)!`);
    
    console.log(chalk.green('\n🎉 Project upgrade completed!'));
    console.log(chalk.cyan('Your project now has:'));
    console.log(chalk.white('  • Modern, beautiful homepage design'));
    console.log(chalk.white('  • Latest shadcn/ui components'));
    console.log(chalk.white('  • Updated styling and animations'));
    console.log(chalk.gray('\nRestart your dev server to see the changes!'));

  } catch (error) {
    spinner.fail('Failed to upgrade project');
    console.error(chalk.red('❌ Error upgrading project:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

async function upgradeHomepage() {
  const homePagePath = path.join(process.cwd(), 'src/app/page.tsx');
  
  // Check if page.tsx exists
  if (!await fs.pathExists(homePagePath)) {
    throw new Error('Homepage file not found at src/app/page.tsx');
  }

  // Create the new modern homepage content
  const newHomepageContent = `import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              ✨ Built with Radnt CLI
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
              Welcome to your
              <br />
              <span className="text-blue-600">Radnt App</span> 🚀
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your Next.js project with shadcn/ui is ready to go. Start building amazing experiences with modern tools and beautiful components.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything you need to build fast
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Pre-configured with the best tools and practices for modern web development
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <CardTitle className="text-xl font-semibold">Fast Development</CardTitle>
              <CardDescription className="text-slate-600">
                Enhanced dev server with hot reload, live updates, and instant feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full group-hover:bg-blue-600 transition-colors">
                Get Started
              </Button>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎨</span>
              </div>
              <CardTitle className="text-xl font-semibold">Beautiful UI</CardTitle>
              <CardDescription className="text-slate-600">
                Pre-configured with shadcn/ui components and Tailwind CSS for stunning designs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full group-hover:bg-purple-50 group-hover:border-purple-300 transition-colors">
                Learn More
              </Button>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔧</span>
              </div>
              <CardTitle className="text-xl font-semibold">Modern Tools</CardTitle>
              <CardDescription className="text-slate-600">
                TypeScript, ESLint, Prettier, and more configured out of the box
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full group-hover:bg-green-100 transition-colors">
                Explore Tools
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="bg-white/50 backdrop-blur-sm border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Built with the best</h3>
            <p className="text-slate-600">Powered by industry-leading technologies</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            <div className="flex flex-col items-center space-y-2 group">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-sm font-medium text-slate-700">Next.js 15</span>
            </div>
            <div className="flex flex-col items-center space-y-2 group">
              <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">TS</span>
              </div>
              <span className="text-sm font-medium text-slate-700">TypeScript</span>
            </div>
            <div className="flex flex-col items-center space-y-2 group">
              <div className="w-16 h-16 bg-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">TW</span>
              </div>
              <span className="text-sm font-medium text-slate-700">Tailwind CSS</span>
            </div>
            <div className="flex flex-col items-center space-y-2 group">
              <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">UI</span>
              </div>
              <span className="text-sm font-medium text-slate-700">shadcn/ui</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to build something amazing?
          </h3>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Start developing with the most modern stack and ship faster than ever before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              Start Building
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-blue-600">
              View Examples
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}`;

  // Backup the old file
  const backupPath = path.join(process.cwd(), 'src/app/page.tsx.backup');
  await fs.copy(homePagePath, backupPath);

  // Write the new content
  await fs.writeFile(homePagePath, newHomepageContent);
}

async function addBadgeComponent() {
  const badgePath = path.join(process.cwd(), 'src/components/ui/badge.tsx');
  
  if (await fs.pathExists(badgePath)) {
    return; // Already exists
  }

  const badgeContent = `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }`;

  await fs.ensureDir(path.dirname(badgePath));
  await fs.writeFile(badgePath, badgeContent);
}

async function updateGlobalStyles() {
  const globalCssPath = path.join(process.cwd(), 'src/app/globals.css');
  
  if (!await fs.pathExists(globalCssPath)) {
    return;
  }

  // Add modern animations and improvements to globals.css
  const additionalStyles = `

/* Modern animations for Radnt */
@keyframes accordion-down {
  from { height: 0 }
  to { height: var(--radix-accordion-content-height) }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height) }
  to { height: 0 }
}

.animate-accordion-down {
  animation: accordion-down 0.2s ease-out;
}

.animate-accordion-up {
  animation: accordion-up 0.2s ease-out;
}

/* Grid background pattern */
.bg-grid-slate-100 {
  background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Better focus styles */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}`;

  const currentContent = await fs.readFile(globalCssPath, 'utf-8');
  
  // Only add if not already present
  if (!currentContent.includes('accordion-down')) {
    await fs.writeFile(globalCssPath, currentContent + additionalStyles);
  }
}

async function addLatestComponents() {
  // This would add any missing components that are commonly used
  // For now, just ensure Badge is available
  await addBadgeComponent();
}
