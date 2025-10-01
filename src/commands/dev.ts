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

export async function devServer(options: any = {}) {
  const config: DevServerConfig = {
    port: parseInt(options.port) || 8000,
    host: options.host || 'localhost',
    open: options.open !== false,
    https: options.https || false
  };

  console.log(chalk.blue.bold('🚀 Starting Radnt Development Server...\n'));

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
    // Start the enhanced dev server
    await startEnhancedDevServer(config, spinner);
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

async function startEnhancedDevServer(config: DevServerConfig, spinner: ora.Ora) {
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

  // API routes for development tools
  app.get('/api/radnt/status', (req, res) => {
    res.json({
      status: 'running',
      timestamp: new Date().toISOString(),
      project: path.basename(process.cwd())
    });
  });

  app.get('/api/radnt/components', async (req, res) => {
    try {
      const componentsPath = path.join(process.cwd(), 'src/components');
      if (await fs.pathExists(componentsPath)) {
        const components = await getComponentsList(componentsPath);
        res.json(components);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to get components list' });
    }
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
    io.emit('file-changed', {
      path: filePath,
      timestamp: new Date().toISOString()
    });
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
      console.log(chalk.cyan('Local:') + chalk.white(`    http://${config.host}:${config.port}`));
      console.log(chalk.cyan('DevTools:') + chalk.white(` http://${config.host}:${wsPort}`));
      console.log(chalk.gray('\nPress Ctrl+C to stop the server\n'));
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
