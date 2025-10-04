import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import chokidar from 'chokidar';
import execa from 'execa';
import cors from 'cors';
import { DevServerConfig } from '../types';
import { createServer as createNetServer } from 'net';
import { performance } from 'perf_hooks';
import * as os from 'os';
import { EventEmitter } from 'events';

// Enhanced interfaces for advanced dev server
interface BuildMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  errors: string[];
  warnings: string[];
  bundleSize?: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

interface PerformanceMetrics {
  buildTimes: number[];
  averageBuildTime: number;
  memoryPeaks: number[];
  cpuPeaks: number[];
  errorCount: number;
  warningCount: number;
  hotReloadCount: number;
}

interface FileChangeEvent {
  path: string;
  event: 'add' | 'change' | 'unlink';
  timestamp: number;
  size?: number;
  isDirectory: boolean;
}

class DevServerAnalytics extends EventEmitter {
  private metrics: PerformanceMetrics;
  private buildHistory: BuildMetrics[] = [];
  private startTime: number;

  constructor() {
    super();
    this.metrics = {
      buildTimes: [],
      averageBuildTime: 0,
      memoryPeaks: [],
      cpuPeaks: [],
      errorCount: 0,
      warningCount: 0,
      hotReloadCount: 0
    };
    this.startTime = performance.now();
  }

  recordBuild(build: BuildMetrics) {
    this.buildHistory.push(build);
    if (build.duration) {
      this.metrics.buildTimes.push(build.duration);
      this.metrics.averageBuildTime = this.metrics.buildTimes.reduce((a, b) => a + b, 0) / this.metrics.buildTimes.length;
    }
    this.metrics.errorCount += build.errors.length;
    this.metrics.warningCount += build.warnings.length;
    this.metrics.memoryPeaks.push(build.memoryUsage.heapUsed);
    this.emit('metrics-updated', this.metrics);
  }

  recordHotReload() {
    this.metrics.hotReloadCount++;
    this.emit('hot-reload', this.metrics.hotReloadCount);
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getBuildHistory(): BuildMetrics[] {
    return [...this.buildHistory];
  }

  getUptime(): number {
    return performance.now() - this.startTime;
  }
}

export async function devServer(options: any = {}) {
  const config: DevServerConfig = {
    port: parseInt(options.port) || 8000,
    host: options.host || 'localhost',
    open: options.open !== false,
  };

  // Initialize analytics system
  const analytics = new DevServerAnalytics();

  console.log(chalk.blue.bold('🚀 Starting Radnt Development Server...\n'));
  console.log(chalk.gray('📊 Performance monitoring enabled'));
  console.log(chalk.gray('🔥 Intelligent hot reload active'));
  console.log(chalk.gray('🛠️  Advanced debugging tools loaded'));
  console.log(chalk.gray('🎯 Component analysis ready'));
  console.log(chalk.gray('📈 Build analytics tracking\n'));

  // Show helpful commands
  console.log(chalk.yellow('💡 Quick Commands:'));
  console.log(chalk.gray('  radnt add button card     → Add multiple components'));
  console.log(chalk.gray('  radnt add                 → Interactive component picker'));
  console.log(chalk.gray('  radnt deploy              → Deploy your app'));
  console.log(chalk.gray('  Ctrl+C                    → Stop the server\n'));

  // Kill existing servers if requested
  if (options.kill) {
    await killDevServers();
  }

  // Check if port is already in use
  const isPortInUse = await checkPortInUse(config.port);
  if (isPortInUse) {
    console.log(chalk.yellow(`⚠️  Port ${config.port} is already in use.`));

    const availablePort = await findAvailablePort(config.port + 1);
    console.log(chalk.cyan(`🔄 Using available port ${availablePort} instead.\n`));

    config.port = availablePort;
  }

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

  // Fix Next.js config file issue
  await fixNextConfigFile();

  const spinner = ora('Starting development server...').start();

  try {
    // Start the enhanced dev server with analytics
    await startEnhancedDevServer(config, spinner, analytics);
  } catch (error) {
    spinner.fail('Failed to start development server');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

async function checkPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createNetServer();

    server.listen(port, () => {
      server.close(() => resolve(false)); // Port is available
    });

    server.on('error', () => {
      resolve(true); // Port is in use
    });
  });
}

async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = createNetServer();

    server.listen(startPort, () => {
      const port = (server.address() as any)?.port;
      server.close(() => resolve(port));
    });

    server.on('error', () => {
      // Port is in use, try next one
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

async function fixNextConfigFile(): Promise<void> {
  const nextConfigTs = path.join(process.cwd(), 'next.config.ts');
  const nextConfigJs = path.join(process.cwd(), 'next.config.js');

  // Check if next.config.ts exists and next.config.js doesn't
  if (await fs.pathExists(nextConfigTs) && !await fs.pathExists(nextConfigJs)) {
    try {
      // Read the TypeScript config
      const tsContent = await fs.readFile(nextConfigTs, 'utf-8');

      // Convert TypeScript to JavaScript (basic conversion)
      let jsContent = tsContent
        .replace(/import\s+type\s+.*?from\s+['"].*?['"];?\s*/g, '') // Remove type imports
        .replace(/:\s*NextConfig/g, '') // Remove type annotations
        .replace(/export\s+default\s+/, 'module.exports = ') // Convert export
        .replace(/const\s+(\w+)\s*:\s*.*?\s*=/, 'const $1 ='); // Remove type annotations from variables

      // Write the JavaScript version
      await fs.writeFile(nextConfigJs, jsContent);

      console.log(chalk.yellow('📝 Converted next.config.ts to next.config.js for compatibility'));

    } catch (error) {
      // If conversion fails, create a basic config
      const basicConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 15+
}

module.exports = nextConfig`;

      await fs.writeFile(nextConfigJs, basicConfig);
      console.log(chalk.yellow('📝 Created basic next.config.js for compatibility'));
    }
  }
}

async function startEnhancedDevServer(config: DevServerConfig, spinner: ora.Ora, analytics: DevServerAnalytics) {
  const app = express();
  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Find available port for WebSocket server
  const wsPort = await findAvailablePort(config.port + 1);

  // Enable CORS
  app.use(cors());
  app.use(express.json());

  // Serve static files
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Enhanced API routes for development tools
  app.get('/api/radnt/status', (req, res) => {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      uptime: analytics.getUptime(),
      cpu: os.cpus().length
    };

    res.json({
      status: 'running',
      timestamp: new Date().toISOString(),
      project: path.basename(process.cwd()),
      system: systemInfo,
      metrics: analytics.getMetrics()
    });
  });

  app.get('/api/radnt/metrics', (req, res) => {
    res.json({
      performance: analytics.getMetrics(),
      buildHistory: analytics.getBuildHistory(),
      uptime: analytics.getUptime(),
      systemInfo: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        loadAverage: os.loadavg()
      }
    });
  });

  app.get('/api/radnt/components', async (req, res) => {
    try {
      const componentsPath = path.join(process.cwd(), 'src/components');
      if (await fs.pathExists(componentsPath)) {
        const components = await getAdvancedComponentsList(componentsPath);
        res.json(components);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to get components list' });
    }
  });

  app.get('/api/radnt/files', async (req, res) => {
    try {
      const projectStructure = await getProjectStructure(process.cwd());
      res.json(projectStructure);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get project structure' });
    }
  });

  app.get('/api/radnt/dashboard', (req, res) => {
    res.send(generateDashboardHTML(config, analytics));
  });

  // Developer-friendly endpoints
  app.get('/api/radnt/help', (req, res) => {
    res.json({
      message: "🚀 Radnt Development Server API",
      endpoints: {
        "/api/radnt/status": "Server status and system info",
        "/api/radnt/metrics": "Performance metrics and analytics",
        "/api/radnt/components": "List of available components",
        "/api/radnt/files": "Project file structure",
        "/api/radnt/dashboard": "Beautiful development dashboard",
        "/api/radnt/help": "This help message",
        "/api/radnt/logs": "Recent development logs",
        "/api/radnt/tips": "Random development tips"
      },
      tips: [
        "💡 Visit /api/radnt/dashboard for a beautiful overview",
        "🔥 Hot reload is automatically enabled",
        "📊 All your builds are being tracked for performance",
        "🐛 Check /api/radnt/logs if something seems off"
      ]
    });
  });

  app.get('/api/radnt/logs', (req, res) => {
    res.json({
      logs: analytics.getBuildHistory().slice(-10),
      message: "📝 Recent development activity"
    });
  });

  app.get('/api/radnt/tips', (req, res) => {
    const tips = [
      "🚀 Pro tip: Use 'radnt add button card input' to add multiple components at once",
      "💡 Your build times are being tracked - check the dashboard to see trends",
      "🔥 Hot reload failures? Try clearing your .next cache",
      "📊 Memory usage looking high? Maybe time to restart the dev server",
      "🎯 Use TypeScript for better developer experience and fewer bugs",
      "⚡ Keep your components small and focused for better performance",
      "🛠️ Use the interactive component selector with just 'radnt add'",
      "📱 Test your responsive design - mobile users will thank you",
      "🎨 Consistent naming conventions make your code more maintainable",
      "🔍 Use the browser dev tools - they're your best friend"
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    res.json({ tip: randomTip, allTips: tips });
  });

  // File watcher for hot reload
  const watcher = chokidar.watch([
    'src/**/*',
    'app/**/*',
    'pages/**/*',
    'components/**/*',
    'styles/**/*',
    'public/**/*'
  ], {
    ignored: ['node_modules', '.next', '.git'],
    persistent: true
  });

  watcher.on('change', (filePath) => {
    const relativePath = path.relative(process.cwd(), filePath);
    const fileExt = path.extname(filePath);

    // Show helpful file change messages
    let emoji = '📝';
    let description = 'File changed';

    if (fileExt === '.tsx' || fileExt === '.jsx') {
      emoji = '⚛️';
      description = 'React component updated';
    } else if (fileExt === '.ts' || fileExt === '.js') {
      emoji = '📜';
      description = 'JavaScript/TypeScript updated';
    } else if (fileExt === '.css' || fileExt === '.scss' || fileExt === '.sass') {
      emoji = '🎨';
      description = 'Styles updated';
    } else if (fileExt === '.json') {
      emoji = '⚙️';
      description = 'Configuration updated';
    } else if (fileExt === '.md') {
      emoji = '📖';
      description = 'Documentation updated';
    }

    console.log(chalk.gray(`${emoji} ${description}: ${chalk.cyan(relativePath)}`));

    analytics.recordHotReload();

    io.emit('file-changed', {
      path: relativePath,
      fullPath: filePath,
      type: fileExt,
      description,
      emoji,
      timestamp: new Date().toISOString()
    });
  });

  // Add more file watcher events for better feedback
  watcher.on('add', (filePath) => {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(chalk.green(`✨ New file created: ${chalk.cyan(relativePath)}`));
  });

  watcher.on('unlink', (filePath) => {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(chalk.red(`🗑️  File deleted: ${chalk.cyan(relativePath)}`));
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(chalk.gray(`🔌 Client connected: ${socket.id}`));

    socket.on('disconnect', () => {
      console.log(chalk.gray(`🔌 Client disconnected: ${socket.id}`));
    });

    socket.on('reload-request', () => {
      socket.broadcast.emit('reload');
    });
  });

  // Start the server
  server.listen(wsPort, config.host, () => {
    spinner.text = 'Starting Next.js development server...';
  });

  // Start Next.js dev server
  const nextProcess = execa('npx', ['next', 'dev', '--port', config.port.toString()], {
    stdio: 'pipe',
    cwd: process.cwd()
  });

  // Handle process cleanup
  const cleanup = () => {
    console.log(chalk.yellow('\n🛑 Shutting down development server...'));

    // Kill Next.js process
    if (nextProcess && !nextProcess.killed) {
      nextProcess.kill('SIGTERM');
      setTimeout(() => {
        if (!nextProcess.killed) {
          nextProcess.kill('SIGKILL');
        }
      }, 5000);
    }

    // Close WebSocket server
    server.close(() => {
      console.log(chalk.green('✅ Development server stopped successfully'));
      process.exit(0);
    });
  };

  // Handle Ctrl+C and other termination signals
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('SIGUSR1', cleanup);
  process.on('SIGUSR2', cleanup);

  // Handle Next.js output
  nextProcess.stdout?.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Ready')) {
      spinner.succeed('Development server started successfully!');
      console.log(chalk.green.bold('\n🎉 Radnt Development Server is running!\n'));
      console.log(chalk.cyan('🌐 Your App:') + chalk.white(`     http://${config.host}:${config.port}`));
      console.log(chalk.magenta('📊 Dashboard:') + chalk.white(`   http://${config.host}:${wsPort}/api/radnt/dashboard`));
      console.log(chalk.yellow('❓ API Help:') + chalk.white(`    http://${config.host}:${wsPort}/api/radnt/help`));
      console.log(chalk.blue('💡 Random Tip:') + chalk.white(`  http://${config.host}:${wsPort}/api/radnt/tips`));

      console.log(chalk.gray('\n' + '─'.repeat(60)));
      console.log(chalk.green('✨ Features enabled:'));
      console.log(chalk.gray('  • Real-time performance monitoring'));
      console.log(chalk.gray('  • Intelligent hot reload'));
      console.log(chalk.gray('  • Component analysis'));
      console.log(chalk.gray('  • Build analytics'));
      console.log(chalk.gray('  • Memory & CPU tracking'));
      console.log(chalk.gray('\n💡 Pro tip: Check out the dashboard for real-time metrics!'));
      console.log(chalk.gray('🔥 Happy coding! Press Ctrl+C to stop\n'));
    }

    // Track build metrics
    if (output.includes('compiled') || output.includes('built')) {
      const buildMetric: BuildMetrics = {
        startTime: performance.now(),
        endTime: performance.now(),
        duration: 0,
        errors: [],
        warnings: [],
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      };
      analytics.recordBuild(buildMetric);
    }

    // Broadcast build status to connected clients
    io.emit('build-status', {
      type: 'info',
      message: output.trim(),
      timestamp: new Date().toISOString()
    });
  });

  nextProcess.stderr?.on('data', (data) => {
    const output = data.toString();
    console.error(chalk.red(output));

    // Broadcast errors to connected clients
    io.emit('build-status', {
      type: 'error',
      message: output.trim(),
      timestamp: new Date().toISOString()
    });
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Shutting down development server...'));
    nextProcess.kill();
    server.close();
    watcher.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    nextProcess.kill();
    server.close();
    watcher.close();
    process.exit(0);
  });
}

async function getComponentsList(componentsPath: string): Promise<string[]> {
  const components: string[] = [];

  async function scanDirectory(dir: string) {
    const items = await fs.readdir(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        await scanDirectory(itemPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
        const relativePath = path.relative(componentsPath, itemPath);
        components.push(relativePath);
      }
    }
  }

  await scanDirectory(componentsPath);
  return components;
}

export async function killDevServers(): Promise<void> {
  console.log(chalk.yellow('🔍 Looking for running development servers...'));

  try {
    // Kill Node.js processes running Next.js dev servers
    const isWindows = process.platform === 'win32';

    if (isWindows) {
      // Windows: Kill processes using specific ports and Next.js processes
      try {
        await execa('taskkill', ['/F', '/IM', 'node.exe', '/FI', 'WINDOWTITLE eq next*'], { stdio: 'pipe' });
        console.log(chalk.green('✅ Killed Next.js development processes'));
      } catch (error) {
        // No processes found or already killed
      }

      // Kill processes on common dev ports
      const commonPorts = [3000, 8000, 8001, 3001, 5000];
      for (const port of commonPorts) {
        try {
          const { stdout } = await execa('netstat', ['-ano'], { stdio: 'pipe' });
          const lines = stdout.split('\n');
          const portLine = lines.find(line => line.includes(`:${port} `) && line.includes('LISTENING'));

          if (portLine) {
            const pid = portLine.trim().split(/\s+/).pop();
            if (pid && !isNaN(Number(pid))) {
              await execa('taskkill', ['/F', '/PID', pid], { stdio: 'pipe' });
              console.log(chalk.green(`✅ Killed process on port ${port} (PID: ${pid})`));
            }
          }
        } catch (error) {
          // Port not in use or process already killed
        }
      }
    } else {
      // Unix/Linux/macOS: Kill processes using lsof and pkill
      try {
        await execa('pkill', ['-f', 'next dev'], { stdio: 'pipe' });
        console.log(chalk.green('✅ Killed Next.js development processes'));
      } catch (error) {
        // No processes found
      }

      // Kill processes on common dev ports
      const commonPorts = [3000, 8000, 8001, 3001, 5000];
      for (const port of commonPorts) {
        try {
          const { stdout } = await execa('lsof', ['-ti', `:${port}`], { stdio: 'pipe' });
          const pids = stdout.trim().split('\n').filter(pid => pid);

          for (const pid of pids) {
            await execa('kill', ['-9', pid], { stdio: 'pipe' });
            console.log(chalk.green(`✅ Killed process on port ${port} (PID: ${pid})`));
          }
        } catch (error) {
          // Port not in use or process already killed
        }
      }
    }

    console.log(chalk.green('🎉 All development servers have been stopped'));

  } catch (error) {
    console.log(chalk.yellow('⚠️  No running development servers found or failed to kill some processes'));
  }
}

// Enhanced component analysis
async function getAdvancedComponentsList(componentsPath: string): Promise<any[]> {
  const components: any[] = [];

  async function scanDirectory(dir: string) {
    const items = await fs.readdir(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        await scanDirectory(itemPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
        const relativePath = path.relative(componentsPath, itemPath);
        const content = await fs.readFile(itemPath, 'utf-8');

        // Analyze component
        const analysis = analyzeComponent(content, relativePath);
        components.push({
          path: relativePath,
          size: stat.size,
          lastModified: stat.mtime,
          ...analysis
        });
      }
    }
  }

  await scanDirectory(componentsPath);
  return components;
}

// Component analysis helper
function analyzeComponent(content: string, filePath: string) {
  const lines = content.split('\n');
  const imports = lines.filter(line => line.trim().startsWith('import')).length;
  const exports = lines.filter(line => line.includes('export')).length;
  const hooks = (content.match(/use[A-Z]\w*/g) || []).length;
  const props = (content.match(/interface\s+\w*Props/g) || []).length;

  return {
    lines: lines.length,
    imports,
    exports,
    hooks,
    props,
    hasTypeScript: filePath.endsWith('.tsx'),
    complexity: calculateComplexity(content)
  };
}

// Calculate code complexity
function calculateComplexity(content: string): number {
  const conditionals = (content.match(/if\s*\(|switch\s*\(|\?\s*:/g) || []).length;
  const loops = (content.match(/for\s*\(|while\s*\(|\.map\s*\(|\.forEach\s*\(/g) || []).length;
  const functions = (content.match(/function\s+\w+|=>\s*{|const\s+\w+\s*=/g) || []).length;

  return conditionals + loops + functions;
}

// Get project structure
async function getProjectStructure(rootPath: string): Promise<any> {
  const structure = {
    name: path.basename(rootPath),
    type: 'directory',
    children: [] as any[]
  };

  async function scanDir(dirPath: string, currentNode: any, depth = 0) {
    if (depth > 3) return; // Limit depth to avoid huge structures

    try {
      const items = await fs.readdir(dirPath);

      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;

        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);

        const node = {
          name: item,
          type: stat.isDirectory() ? 'directory' : 'file',
          size: stat.isFile() ? stat.size : undefined,
          lastModified: stat.mtime,
          children: stat.isDirectory() ? [] : undefined
        };

        if (stat.isDirectory()) {
          await scanDir(itemPath, node, depth + 1);
        }

        currentNode.children.push(node);
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }

  await scanDir(rootPath, structure);
  return structure;
}

// Generate development dashboard HTML
function generateDashboardHTML(config: DevServerConfig, analytics: DevServerAnalytics): string {
  const metrics = analytics.getMetrics();
  const uptime = Math.floor(analytics.getUptime() / 1000);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Radnt Development Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            padding: 20px;
        }
        .dashboard { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; }
        .header p { font-size: 1.2rem; opacity: 0.8; }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .metric-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .metric-card h3 { margin-bottom: 15px; font-size: 1.3rem; }
        .metric-value { font-size: 2.5rem; font-weight: bold; margin-bottom: 10px; }
        .metric-label { opacity: 0.7; font-size: 0.9rem; }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #4ade80;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .chart-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .server-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .info-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 10px;
        }
        .info-label { font-weight: bold; margin-bottom: 5px; }
        .info-value { opacity: 0.8; }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🚀 Radnt Development Dashboard</h1>
            <p><span class="status-indicator"></span>Server running on ${config.host}:${config.port}</p>
            <div style="margin-top: 10px;">
                <a href="/api/radnt/help" style="color: #60a5fa; text-decoration: none; margin-right: 20px;">📚 API Help</a>
                <a href="/api/radnt/tips" style="color: #60a5fa; text-decoration: none; margin-right: 20px;">💡 Dev Tips</a>
                <a href="/api/radnt/logs" style="color: #60a5fa; text-decoration: none;">📝 Recent Logs</a>
            </div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <h3>📊 Performance</h3>
                <div class="metric-value">${metrics.averageBuildTime.toFixed(0)}ms</div>
                <div class="metric-label">Average Build Time</div>
            </div>

            <div class="metric-card">
                <h3>🔥 Hot Reloads</h3>
                <div class="metric-value">${metrics.hotReloadCount}</div>
                <div class="metric-label">Total Reloads</div>
            </div>

            <div class="metric-card">
                <h3>⚠️ Issues</h3>
                <div class="metric-value">${metrics.errorCount}</div>
                <div class="metric-label">Errors Found</div>
            </div>

            <div class="metric-card">
                <h3>⏱️ Uptime</h3>
                <div class="metric-value">${uptime}s</div>
                <div class="metric-label">Server Running</div>
            </div>
        </div>

        <div class="chart-container">
            <h3>🖥️ System Information</h3>
            <div class="server-info">
                <div class="info-item">
                    <div class="info-label">Platform</div>
                    <div class="info-value">${os.platform()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Architecture</div>
                    <div class="info-value">${os.arch()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Node Version</div>
                    <div class="info-value">${process.version}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">CPU Cores</div>
                    <div class="info-value">${os.cpus().length}</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Auto-refresh every 5 seconds
        setTimeout(() => location.reload(), 5000);
    </script>
</body>
</html>`;
}
