# 🔥 Development Server

## Enhanced Dev Server Features

Radnt CLI includes an enhanced development server with advanced features beyond standard Next.js dev server.

### Key Features

- **🚀 Hot Reload** - Instant updates on file changes
- **🔌 WebSocket Integration** - Real-time development updates  
- **🎯 Smart Port Detection** - Automatically finds available ports
- **🛠️ Enhanced Error Overlay** - Clear, actionable error messages
- **🔄 Process Management** - Clean shutdown and restart
- **📊 DevTools Dashboard** - Development insights

## Starting the Dev Server

### Basic Usage
```bash
radnt dev
```
Server starts on `http://localhost:8000`

### Custom Port
```bash
radnt dev --port 3000
```

### Custom Host
```bash
radnt dev --host 0.0.0.0  # Bind to all interfaces
radnt dev --host 192.168.1.100  # Specific IP
```

### Kill Existing Servers
```bash
radnt dev --kill  # Kill existing servers first
```

## Port Management

### Automatic Port Detection
If port 8000 is busy, the server automatically finds the next available port:
- Primary: 8000
- Fallback: 8001, 8002, 8003, etc.

### DevTools Port
- **Main Server**: 8000
- **DevTools**: 8001 (or next available)

### Manual Port Selection
```bash
radnt dev --port 3000  # Main server on 3000, DevTools on 3001
```

## WebSocket Features

### Real-time Updates
The dev server uses WebSockets for:
- File change notifications
- Build status updates
- Error reporting
- Component hot reloading

### DevTools Dashboard
Access at `http://localhost:8001` (or DevTools port):
- Build status
- File watching status
- Component tree
- Performance metrics

## Process Management

### Clean Shutdown
Press `Ctrl+C` to gracefully shutdown:
- Closes WebSocket connections
- Terminates Next.js process
- Cleans up temporary files
- Releases ports

### Kill All Servers
```bash
radnt kill
```
Terminates all running development servers on common ports.

### Background Processes
The dev server manages multiple processes:
- Next.js development server
- WebSocket server for DevTools
- File watcher for hot reload
- TypeScript compiler (if enabled)

## Hot Reload Configuration

### File Watching
Automatically watches:
- `src/**/*` - Source files
- `public/**/*` - Static assets
- `*.config.js` - Configuration files
- `package.json` - Dependencies

### Ignore Patterns
Files ignored by hot reload:
- `node_modules/`
- `.next/`
- `.git/`
- `*.log`

### Custom Watch Patterns
```js
// next.config.js
module.exports = {
  webpack: (config) => {
    config.watchOptions = {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: 1000,
    }
    return config
  }
}
```

## Error Handling

### Enhanced Error Overlay
- **Syntax Errors** - Highlighted with line numbers
- **Type Errors** - TypeScript errors with context
- **Runtime Errors** - Stack traces with source maps
- **Build Errors** - Webpack compilation errors

### Error Recovery
- Automatic retry on file save
- Partial compilation for faster recovery
- Component-level error boundaries

## Performance Features

### Fast Refresh
- Preserves component state during updates
- Instant feedback on changes
- Selective re-rendering

### Build Optimization
- Incremental compilation
- Module caching
- Optimized bundle splitting

### Memory Management
- Automatic garbage collection
- Memory leak detection
- Process monitoring

## Development Tools Integration

### Browser DevTools
Enhanced integration with browser developer tools:
- React DevTools support
- Source map generation
- Performance profiling

### VS Code Integration
Works seamlessly with VS Code:
- Auto-restart on config changes
- Integrated terminal output
- Debug configuration

## Environment Configuration

### Development Environment Variables
```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_DEV_MODE=true
DEV_SERVER_PORT=8000
DEVTOOLS_PORT=8001
```

### Debug Mode
```bash
DEBUG=radnt* radnt dev
```
Enables verbose logging for troubleshooting.

## Network Configuration

### Local Network Access
```bash
radnt dev --host 0.0.0.0
```
Access from other devices on your network at:
- `http://YOUR_IP:8000`

### HTTPS Support
```bash
radnt dev --https
```
Enables HTTPS with self-signed certificates.

### Proxy Configuration
```js
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ]
  }
}
```

## Troubleshooting Dev Server

### Common Issues

#### Port Conflicts
```bash
# Check what's using the port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill specific process
kill -9 PID  # macOS/Linux
taskkill /PID PID /F  # Windows
```

#### Hot Reload Not Working
```bash
# Restart dev server
Ctrl+C
radnt dev

# Clear Next.js cache
rm -rf .next
radnt dev

# Check file permissions (Linux/macOS)
chmod -R 755 src/
```

#### WebSocket Connection Failed
```bash
# Check firewall settings
# Disable ad blockers
# Try different port
radnt dev --port 3000
```

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" radnt dev

# Monitor memory usage
ps aux | grep node  # macOS/Linux
tasklist | findstr node  # Windows
```

### Performance Optimization

#### Faster Startup
```js
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: false,  // Disable CSS optimization in dev
    optimizePackageImports: ['lucide-react'],
  }
}
```

#### Reduce Bundle Size
```js
// next.config.js
module.exports = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization.splitChunks = false
    }
    return config
  }
}
```

## Advanced Configuration

### Custom Dev Server
```js
// server.js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
```

### Docker Development
```dockerfile
# Dockerfile.dev
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

```bash
# Run in Docker
docker build -f Dockerfile.dev -t radnt-dev .
docker run -p 3000:3000 -v $(pwd):/app radnt-dev
```
