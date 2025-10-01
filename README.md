# Radnt CLI 🚀

[![npm version](https://badge.fury.io/js/radnt-cli.svg)](https://badge.fury.io/js/radnt-cli)
[![npm downloads](https://img.shields.io/npm/dm/radnt-cli.svg)](https://npmjs.com/package/radnt-cli)
[![GitHub stars](https://img.shields.io/github/stars/tubbymctubbzz/radnt-cli.svg)](https://github.com/tubbymctubbzz/radnt-cli/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful CLI tool for creating Next.js projects with shadcn/ui and modern development tools. Get up and running with a beautiful, production-ready Next.js application in seconds.

## Features

- ⚡ **Interactive Project Setup** - Choose from multiple templates and configurations
- 🎨 **shadcn/ui Integration** - Beautiful, accessible components out of the box
- 🔥 **Enhanced Dev Server** - Hot reload with WebSocket-based live updates
- 📱 **Multiple Templates** - Basic, Dashboard, E-commerce, Blog, and Portfolio templates
- 🛠️ **Modern Stack** - Next.js 14, TypeScript, Tailwind CSS, ESLint
- 📦 **Component Management** - Easy installation and management of UI components
- 🎯 **Zero Configuration** - Sensible defaults with full customization options

## Quick Start

```bash
# Install globally
npm install -g radnt-cli

# Create a new project
radnt create my-app

# Navigate to your project
cd my-app

# Start development server
npm run dev
```

## Installation

### Global Installation (Recommended)

```bash
npm install -g radnt-cli
```

### Use with npx (No Installation Required)

```bash
npx radnt-cli create my-app
```

## Commands

### `radnt create [project-name]`

Create a new Next.js project with interactive setup.

```bash
# Interactive mode
radnt create

# With project name
radnt create my-awesome-app

# Non-interactive with options
radnt create my-app --template dashboard --typescript --tailwind
```

**Options:**
- `-t, --template <template>` - Template to use (basic, dashboard, ecommerce, blog, portfolio)
- `--tailwind` - Include Tailwind CSS (default: true)
- `--eslint` - Include ESLint (default: true)
- `--app-router` - Use App Router (default: true)
- `--shadcn` - Include shadcn/ui (default: true)

### `radnt dev [options]`

Start the enhanced development server with hot reload and live updates.

```bash
# Start on default port (8000)
radnt dev

# Start on custom port
radnt dev --port 8080

# Start on custom host
radnt dev --host 0.0.0.0

# Kill existing servers and start fresh
radnt dev --kill

# If port is in use, automatically finds next available port
radnt dev  # Will use 8001, 8002, etc. if 8000 is busy
```

### `radnt kill`

Kill any running development servers.

```bash
# Stop all development servers
radnt kill
```

**Options:**
- `-p, --port <port>` - Port to run the server on (default: 8000)
- `--host <host>` - Host to bind the server to (default: localhost)
- `-k, --kill` - Kill any existing dev servers before starting

### `radnt add [component]`

Add shadcn/ui components to your project.

```bash
# Interactive component selection
radnt add

# Add specific component
radnt add button

# Add multiple components
radnt add button card alert

# Add all available components
radnt add --all
```

### `radnt init`

Initialize shadcn/ui in an existing Next.js project.

```bash
radnt init
```

### `radnt update`

Update Radnt CLI to the latest version.

```bash
radnt update
```

### `radnt version`

Show current version and check for available updates.

```bash
radnt version
```

## Templates

### 🏗️ Basic
Clean Next.js setup with shadcn/ui components, perfect for getting started.

### 📊 Dashboard
Admin dashboard template with:
- Statistics cards
- Data visualization ready
- Responsive sidebar layout
- Modern UI components

### 🛒 E-commerce
Online store template featuring:
- Product catalog layout
- Shopping cart ready
- Payment integration ready
- Responsive design

### 📝 Blog
Content-focused blog template with:
- Article listing
- Reading time estimates
- Newsletter subscription
- SEO optimized

### 🎨 Portfolio
Personal portfolio template including:
- Project showcase
- About section
- Contact forms
- Professional design

## Available Components

The CLI includes 30+ shadcn/ui components:

- **Layout**: Card, Separator, Sheet, Tabs
- **Forms**: Button, Input, Label, Checkbox, Radio Group, Select, Textarea, Form
- **Navigation**: Breadcrumb, Navigation Menu, Menubar
- **Feedback**: Alert, Toast, Progress, Skeleton
- **Overlay**: Dialog, Popover, Tooltip, Hover Card, Context Menu, Dropdown Menu
- **Data Display**: Avatar, Badge, Table, Data Table, Calendar, Date Picker
- **Interactive**: Accordion, Collapsible, Command, Combobox, Slider, Switch, Toggle

## Project Structure

```
my-radnt-app/
├── src/
│   ├── app/                 # Next.js App Router (if selected)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/             # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   └── lib/
│       └── utils.ts        # Utility functions
├── public/                 # Static assets
├── components.json         # shadcn/ui configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

## Configuration

### components.json

The `components.json` file configures shadcn/ui for your project:

```json
{
  "style": "default",
  "baseColor": "slate",
  "cssVariables": true,
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Custom Dev Server

The enhanced development server provides:

- **Hot Reload**: Automatic browser refresh on file changes
- **WebSocket Connection**: Real-time updates and build status
- **Development Tools**: API endpoints for project information
- **File Watching**: Monitors all relevant project files
- **Error Handling**: Better error reporting and recovery

## Examples

### Creating a Dashboard App

```bash
# Create with dashboard template
radnt create my-dashboard --template dashboard

cd my-dashboard

# Add additional components
radnt add data-table chart

# Start development
npm run dev
```

### Adding Components to Existing Project

```bash
# Initialize shadcn/ui in existing Next.js project
radnt init

# Add form components
radnt add form input label button

# Add navigation components
radnt add navigation-menu breadcrumb
```

### Custom Development Workflow

```bash
# Start dev server on custom port
radnt dev --port 4000

# In another terminal, add components as needed
radnt add dialog popover tooltip
```

## Requirements

- **Node.js**: 16.0.0 or higher
- **Package Manager**: npm, yarn, or pnpm
- **Operating System**: Windows, macOS, or Linux

## Troubleshooting

### Common Issues

**Command not found: radnt**
```bash
# Make sure it's installed globally
npm install -g radnt-cli

# Or use npx
npx radnt-cli create my-app
```

**TypeScript errors after adding components**
```bash
# Make sure TypeScript is properly configured
npm run type-check
```

**Tailwind styles not working**
```bash
# Ensure Tailwind is properly configured
npm run build
```

### Getting Help

- Check the [GitHub Issues](https://github.com/yourusername/radnt-cli/issues)
- Run `radnt --help` for command information
- Use `radnt [command] --help` for specific command help

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful and accessible component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Low-level UI primitives

---

**Happy coding with Radnt CLI! 🚀**

For more information, visit our [documentation](https://github.com/yourusername/radnt-cli) or follow us on [Twitter](https://twitter.com/radnt-cli).
