# 🔧 Commands Reference

## `radnt create [project-name]`

Creates a new Next.js project with shadcn/ui.

### Options
- `-t, --template <template>` - Template to use (basic, dashboard, ecommerce, blog, portfolio)
- `--typescript` - Use TypeScript (default: true)
- `--tailwind` - Include Tailwind CSS (default: true)
- `--eslint` - Include ESLint (default: true)
- `--app-router` - Use App Router (default: true)
- `--shadcn` - Include shadcn/ui (default: true)

### Examples
```bash
radnt create my-store --template ecommerce
radnt create blog --template blog --no-typescript
radnt create dashboard --template dashboard
```

## `radnt dev [options]`

Starts the enhanced development server.

### Options
- `-p, --port <port>` - Port to run on (default: 8000)
- `--host <host>` - Host to bind to (default: localhost)
- `-k, --kill` - Kill existing dev servers first

### Examples
```bash
radnt dev                    # Start on port 8000
radnt dev --port 3000        # Start on port 3000
```

## `radnt add [component]`

Adds shadcn/ui components to your project.

### Options
- `-a, --all` - Add all available components

### Examples
```bash
radnt add                    # Interactive selection
radnt add button             # Add button component
radnt add button card input  # Add multiple components
radnt add --all              # Add all components
```

## `radnt init`

Initializes shadcn/ui in an existing Next.js project.

### Example
```bash
cd existing-nextjs-project
radnt init
```

## `radnt fix`

Fixes common issues in existing projects.

### What it fixes
- Updates Next.js to latest version
- Adds missing dependencies
- Fixes configuration files
- Updates component versions

### Example
```bash
radnt fix
```

## `radnt upgrade`

Upgrades existing project to latest Radnt templates and design.

### What it upgrades
- Homepage design to modern layout
- Adds missing Badge component
- Updates global styles
- Adds latest shadcn/ui components

### Example
```bash
radnt upgrade
```

## `radnt kill`

Kills all running development servers.

### Example
```bash
radnt kill
```

## `radnt version`

Shows current version and checks for updates.

### Example
```bash
radnt version
```

## `radnt update`

Updates Radnt CLI to the latest version.

### Example
```bash
radnt update
```
