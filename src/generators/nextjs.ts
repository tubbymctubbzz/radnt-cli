import fs from 'fs-extra';
import path from 'path';
import { ProjectConfig } from '../types';

export async function createNextJsProject(config: ProjectConfig, projectPath: string) {
  // Create package.json
  const packageJson = {
    name: config.projectName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "radnt dev",
      build: "next build",
      start: "next start",
      lint: config.eslint ? "next lint" : undefined,
      "type-check": config.typescript ? "tsc --noEmit" : undefined
    },
    dependencies: {
      next: "^15.0.0",
      react: "^18.3.0",
      "react-dom": "^18.3.0",
      ...(config.tailwind && {
        "tailwindcss": "^3.4.0",
        "autoprefixer": "^10.4.20",
        "postcss": "^8.4.47"
      }),
      ...(config.shadcn && {
        "@radix-ui/react-slot": "^1.1.0",
        "class-variance-authority": "^0.7.0",
        "clsx": "^2.1.0",
        "tailwind-merge": "^2.5.0",
        "lucide-react": "^0.400.0",
        "tailwindcss-animate": "^1.0.7"
      })
    },
    devDependencies: {
      ...(config.typescript && {
        typescript: "^5.2.2",
        "@types/node": "^20.8.0",
        "@types/react": "^18.2.25",
        "@types/react-dom": "^18.2.11"
      }),
      ...(config.eslint && {
        eslint: "^8.50.0",
        "eslint-config-next": "^14.0.0"
      })
    }
  };

  // Remove undefined values
  Object.keys(packageJson.scripts).forEach(key => {
    if (packageJson.scripts[key as keyof typeof packageJson.scripts] === undefined) {
      delete packageJson.scripts[key as keyof typeof packageJson.scripts];
    }
  });

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  // Create Next.js config
  const nextConfigContent = config.typescript
    ? `/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 15+
}

module.exports = nextConfig`
    : `/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 15+
}

module.exports = nextConfig`;

  await fs.writeFile(
    path.join(projectPath, config.typescript ? 'next.config.ts' : 'next.config.js'),
    nextConfigContent
  );

  // Create TypeScript config if needed
  if (config.typescript) {
    const tsConfig = {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "es6"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [
          {
            name: "next"
          }
        ],
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"],
          "@/components/*": ["./src/components/*"],
          "@/lib/*": ["./src/lib/*"]
        }
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"]
    };

    await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });
  }

  // Create ESLint config if needed
  if (config.eslint) {
    const eslintConfig = {
      extends: config.typescript ? "next/core-web-vitals" : "next"
    };

    await fs.writeJson(path.join(projectPath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }

  // Create .gitignore
  const gitignoreContent = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`;

  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);

  // Create README.md
  const readmeContent = `# ${config.projectName}

This is a [Next.js](https://nextjs.org/) project bootstrapped with [\`radnt-cli\`](https://github.com/yourusername/radnt-cli).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying \`${config.appRouter ? 'app/page' : 'pages/index'}.${config.typescript ? 'tsx' : 'js'}\`. The page auto-updates as you edit the file.

## Features

- ⚡ Next.js ${config.appRouter ? 'with App Router' : 'with Pages Router'}
${config.typescript ? '- 🔷 TypeScript support' : ''}
${config.tailwind ? '- 🎨 Tailwind CSS for styling' : ''}
${config.shadcn ? '- 🧩 shadcn/ui components' : ''}
${config.eslint ? '- 📏 ESLint for code quality' : ''}
- 🔥 Enhanced development server with hot reload

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent);
}
