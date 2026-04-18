import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
}

function servePrototype() {
  const protoDir = path.resolve(__dirname, '../prototype')
  return {
    name: 'serve-prototype',
    configureServer(server) {
      server.middlewares.use('/whiskyblender/prototype', (req, res, next) => {
        let urlPath = req.url || '/'
        if (urlPath === '' || urlPath === '/') urlPath = '/index.html'
        const filePath = path.join(protoDir, urlPath)
        if (!filePath.startsWith(protoDir)) return next()
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase()
          res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
          fs.createReadStream(filePath).pipe(res)
        } else {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), servePrototype()],
  base: process.env.VITE_BASE_PATH || '/whiskyblender/',
  server: {
    proxy: {
      '/whiskyblender/labels': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
    },
  },
})
