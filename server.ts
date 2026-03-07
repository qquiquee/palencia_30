import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { Database } from 'bun:sqlite'
import index from './index.html'

type ProjectRow = {
  id: string
  name: string
  payload: string
  updated_at: string
}

const dataDir = join(process.cwd(), 'data')
mkdirSync(dataDir, { recursive: true })

const db = new Database(join(dataDir, 'palencia_30.sqlite'), { create: true })

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    payload TEXT,
    updated_at TEXT NOT NULL
  )
`)

const listProjects = db.query<Pick<ProjectRow, 'id' | 'name' | 'updated_at'>, []>(
  'SELECT id, name, updated_at FROM projects ORDER BY updated_at DESC',
)
const getProject = db.query<ProjectRow, [string]>(
  'SELECT id, name, payload, updated_at FROM projects WHERE id = ?',
)
const insertProject = db.query(
  'INSERT INTO projects (id, name, payload, updated_at) VALUES (?, ?, ?, ?)',
)
const updateProjectPayload = db.query(
  'UPDATE projects SET payload = ?, updated_at = ? WHERE id = ?',
)
const updateProjectName = db.query(
  'UPDATE projects SET name = ?, updated_at = ? WHERE id = ?',
)

function nowIso() {
  return new Date().toISOString()
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init)
}

function ensureDefaultProject() {
  const existing = getProject.get('default')
  if (!existing) {
    insertProject.run('default', 'Proyecto principal', null, nowIso())
  }
}

ensureDefaultProject()

const server = Bun.serve({
  port: Number(Bun.env.PORT ?? 3000),
  development: Bun.env.NODE_ENV !== 'production',
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === '/api/projects' && req.method === 'GET') {
      return json({ projects: listProjects.all() })
    }

    if (url.pathname === '/api/projects' && req.method === 'POST') {
      try {
        const body = (await req.json()) as { name?: string }
        const id = `project-${crypto.randomUUID()}`
        insertProject.run(id, body.name?.trim() || 'Proyecto sin nombre', null, nowIso())
        const project = getProject.get(id)
        return json({ project }, { status: 201 })
      } catch {
        return json({ error: 'invalid-payload' }, { status: 400 })
      }
    }

    if (url.pathname.startsWith('/api/projects/')) {
      const id = url.pathname.replace('/api/projects/', '')
      const project = getProject.get(id)

      if (!project) {
        return json({ error: 'not-found' }, { status: 404 })
      }

      if (req.method === 'GET') {
        return json({
          project: {
            ...project,
            payload: project.payload ? JSON.parse(project.payload) : null,
          },
        })
      }

      if (req.method === 'PUT') {
        try {
          const body = (await req.json()) as { design: unknown }
          updateProjectPayload.run(JSON.stringify(body.design), nowIso(), id)
          return json({ ok: true })
        } catch {
          return json({ error: 'invalid-payload' }, { status: 400 })
        }
      }

      if (req.method === 'PATCH') {
        try {
          const body = (await req.json()) as { name?: string }
          updateProjectName.run(body.name?.trim() || project.name, nowIso(), id)
          const updated = getProject.get(id)
          return json({ project: updated })
        } catch {
          return json({ error: 'invalid-payload' }, { status: 400 })
        }
      }
    }

    if (url.pathname === '/favicon.ico') {
      return new Response(null, { status: 204 })
    }

    return new Response(index, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  },
})

console.log(`palencia_30 running on http://localhost:${server.port}`)
