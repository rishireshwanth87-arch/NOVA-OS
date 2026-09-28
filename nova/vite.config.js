import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function asterProxyPlugin() {
  return {
    name: 'aster-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req, res) => {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost')
          const targetUrl = parsedUrl.searchParams.get('url')
          if (!targetUrl) {
            res.statusCode = 400
            res.end('Missing url parameter')
            return
          }

          const target = new URL(targetUrl)

          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            redirect: 'follow',
          })

          const contentType = response.headers.get('content-type') || 'text/html'
          res.setHeader('Content-Type', contentType)
          res.setHeader('Access-Control-Allow-Origin', '*')

          // Strip headers that block iframe embedding
          res.removeHeader('X-Frame-Options')
          res.removeHeader('Content-Security-Policy')
          res.removeHeader('Cross-Origin-Opener-Policy')
          res.removeHeader('Cross-Origin-Embedder-Policy')

          if (contentType.includes('text/html')) {
            let html = await response.text()
            const baseTag = `<base href="${target.origin}/">`

            const injectScript = `
              <script>
                document.addEventListener('click', function(e) {
                  const a = e.target.closest('a');
                  if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
                    if (!a.href.includes('/api/proxy?url=')) {
                      a.href = '/api/proxy?url=' + encodeURIComponent(a.href);
                    }
                  }
                }, true);
                document.addEventListener('submit', function(e) {
                  const form = e.target;
                  if (form && form.action && !form.action.includes('/api/proxy?url=')) {
                    if ((form.method || 'GET').toUpperCase() === 'GET') {
                      e.preventDefault();
                      const url = new URL(form.action, window.location.href);
                      const fd = new FormData(form);
                      for (const [k, v] of fd.entries()) {
                        url.searchParams.set(k, v);
                      }
                      window.location.href = '/api/proxy?url=' + encodeURIComponent(url.toString());
                    }
                  }
                }, true);
              </script>
            `

            if (html.includes('<head>')) {
              html = html.replace('<head>', `<head>${baseTag}${injectScript}`)
            } else if (html.includes('<HEAD>')) {
              html = html.replace('<HEAD>', `<HEAD>${baseTag}${injectScript}`)
            } else {
              html = baseTag + injectScript + html
            }

            res.statusCode = response.status
            res.end(html)
          } else {
            const buffer = Buffer.from(await response.arrayBuffer())
            res.statusCode = response.status
            res.end(buffer)
          }
        } catch (err) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          const rawUrl = req.url.split('url=')[1] ? decodeURIComponent(req.url.split('url=')[1]) : '#'
          res.end(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; background: #0a0b12; color: #cbd5e1; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                  .card { text-align: center; max-width: 480px; padding: 2.5rem; background: #141622; border-radius: 16px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                  h1 { color: #00f0ff; font-size: 1.25rem; margin-top: 0; margin-bottom: 0.75rem; }
                  p { font-size: 0.875rem; color: #94a3b8; line-height: 1.6; margin-bottom: 1.5rem; }
                  .btn { display: inline-block; padding: 0.65rem 1.25rem; background: #00f0ff; color: #000; font-weight: 600; text-decoration: none; border-radius: 10px; font-size: 0.85rem; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>Unable to Connect via ASTER Proxy</h1>
                  <p>${err.message || 'The destination host could not be reached.'}</p>
                  <a class="btn" href="${rawUrl}" target="_blank" rel="noreferrer">Open in Host Browser Tab</a>
                </div>
              </body>
            </html>
          `)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), asterProxyPlugin()],
  server: {
    fs: {
      allow: [
        '..',
        'C:/Users/Admin/.gemini/antigravity-ide/brain/0bc499a6-a088-4cc3-8eb8-fdd188c015c2',
      ],
    },
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
})
