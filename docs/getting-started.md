# 🚀 Getting Started

## Installation

### Global Installation
```bash
npm install -g radnt-cli
```

### Verify Installation
```bash
radnt --version
```

### Update to Latest
```bash
radnt update
# or
npm update -g radnt-cli
```

## Quick Start

### Create Your First Project
```bash
# Interactive setup (recommended)
radnt create

# With project name
radnt create my-app

# With specific template
radnt create my-app --template dashboard
```

### Start Development
```bash
cd my-app
radnt dev
```

Your app will be available at `http://localhost:8000`

## What You Get

✅ **Next.js 15** - Latest version with App Router  
✅ **TypeScript** - Full type safety  
✅ **Tailwind CSS** - Utility-first styling  
✅ **shadcn/ui** - Beautiful, accessible components  
✅ **ESLint** - Code linting and formatting  
✅ **Enhanced Dev Server** - Hot reload with auto port detection  

## Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Homepage
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   └── lib/
│       └── utils.ts         # Utility functions
├── components.json          # shadcn/ui config
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind config
├── tsconfig.json           # TypeScript config
└── package.json
```

## Next Steps

1. **Add Components**: `radnt add button card input`
2. **Customize Styling**: Edit `src/app/globals.css`
3. **Build Pages**: Create new files in `src/app/`
4. **Deploy**: `npm run build` then deploy to Vercel/Netlify

## Need Help?

- 📖 [Commands Reference](./commands.md)
- 🧩 [Components Guide](./components.md)
- 🎨 [Templates Overview](./templates.md)
- 🐛 [Troubleshooting](./troubleshooting.md)
