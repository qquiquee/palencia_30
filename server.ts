import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { Database } from 'bun:sqlite'
import index from './index.html'

const dataDir = join(process.cwd(), 'data')
mkdirSync(dataDir, { recursive: true })

const dbPath = join(dataDir, 'palencia_30.sqlite')
const db = new Database(dbPath, { create: true })

db.exec(`
  CREATE TABLE IF NOT EXISTS designs (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)

const getDesign = db.query<{ payload: string }, [string]>('SELECT payload FROM designs WHERE id = ?')
const upsertDesign = db.query(
  `INSERT INTO designs (id, payload, updated_at)
   VALUES (?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
)

const server = Bun.serve({
  port: Number(Bun.env.PORT ?? 3000),
  development: Bun.env.NODE_ENV !== 'production',
  routes: {
    '/api/design/default': {
      GET() {
        const row = getDesign.get('default')
        return Response.json({
          design: row ? JSON.parse(row.payload) : null,
        })
      },
      async PUT(request) {
        try {
          const design = await request.json()
          upsertDesign.run('default', JSON.stringify(design), new Date().toISOString())
          return Response.json({ ok: true })
        } catch {
          return Response.json({ ok: false, error: 'invalid-payload' }, { status: 400 })
        }
      },
    },
  },
  fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === '/favicon.ico') {
      return new Response(null, { status: 204 })
    }

    return new Response(index, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  },
})

console.log(`palencia_30 running on http://localhost:${server.port}`)
