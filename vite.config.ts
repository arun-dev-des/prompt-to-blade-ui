import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// `npm run dev` doesn't run Vercel functions, so serve api/generate.ts from the
// Vite dev server itself. The handler only uses plain Node req/res, so it runs
// unchanged — streaming included — and hot-reloads with the rest of the code.
// The key comes from the shell, else .env.local (an already-exported key wins).
const devApi = (mode: string): Plugin => ({
  name: 'dev-api-generate',
  apply: 'serve',
  configureServer(server) {
    const env = loadEnv(mode, process.cwd(), '')
    // Guard the assignment: process.env coerces undefined to the string "undefined".
    if (!process.env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY) {
      process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
    }

    server.middlewares.use('/api/generate', async (req, res) => {
      try {
        if (req.method === 'POST') {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          ;(req as { body?: unknown }).body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
        }
        const mod = await server.ssrLoadModule('/api/generate.ts')
        await mod.default(req, res)
      } catch (err) {
        server.config.logger.error(String(err))
        if (!res.headersSent) res.statusCode = 500
        res.end()
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), devApi(mode)],
}))
