import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { Database } from 'bun:sqlite'
import index from './index.html'

type ProjectRow = {
  id: string
  name: string
  payload: string
  settings: string | null
  preview: string | null
  updated_at: string
}

type SnapshotRow = {
  id: string
  project_id: string
  name: string
  payload: string
  settings: string | null
  preview: string | null
  created_at: string
}

const dataDir = join(process.cwd(), 'data')
mkdirSync(dataDir, { recursive: true })

const db = new Database(join(dataDir, 'palencia_30.sqlite'), { create: true })

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    payload TEXT,
    settings TEXT,
    preview TEXT,
    updated_at TEXT NOT NULL
  )
`)
db.exec(`
  CREATE TABLE IF NOT EXISTS snapshots (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    payload TEXT NOT NULL,
    settings TEXT,
    preview TEXT,
    created_at TEXT NOT NULL
  )
`)
try {
  db.exec(`ALTER TABLE projects ADD COLUMN settings TEXT`)
} catch {
  // Existing databases may already contain this column.
}
try {
  db.exec(`ALTER TABLE projects ADD COLUMN preview TEXT`)
} catch {
  // Existing databases may already contain this column.
}

const listProjects = db.query<Pick<ProjectRow, 'id' | 'name' | 'updated_at' | 'preview'>, []>(
  'SELECT id, name, updated_at, preview FROM projects ORDER BY updated_at DESC',
)
const getProject = db.query<ProjectRow, [string]>(
  'SELECT id, name, payload, settings, preview, updated_at FROM projects WHERE id = ?',
)
const insertProject = db.query(
  'INSERT INTO projects (id, name, payload, settings, preview, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
)
const updateProjectPayload = db.query(
  'UPDATE projects SET payload = ?, settings = ?, preview = ?, updated_at = ? WHERE id = ?',
)
const updateProjectName = db.query(
  'UPDATE projects SET name = ?, updated_at = ? WHERE id = ?',
)
const deleteProject = db.query('DELETE FROM projects WHERE id = ?')
const listSnapshots = db.query<Pick<SnapshotRow, 'id' | 'name' | 'preview' | 'created_at'>, [string]>(
  'SELECT id, name, preview, created_at FROM snapshots WHERE project_id = ? ORDER BY created_at DESC',
)
const getSnapshot = db.query<SnapshotRow, [string, string]>(
  'SELECT id, project_id, name, payload, settings, preview, created_at FROM snapshots WHERE project_id = ? AND id = ?',
)
const insertSnapshot = db.query(
  'INSERT INTO snapshots (id, project_id, name, payload, settings, preview, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
)
const deleteSnapshotsForProject = db.query('DELETE FROM snapshots WHERE project_id = ?')

function nowIso() {
  return new Date().toISOString()
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init)
}

function ensureDefaultProject() {
  const existing = getProject.get('default')
  if (!existing) {
    insertProject.run('default', 'Proyecto principal', null, null, null, nowIso())
  }
}

ensureDefaultProject()

const server = Bun.serve({
  port: Number(Bun.env.PORT ?? 3000),
  development: Bun.env.NODE_ENV !== 'production',
  routes: {
    '/': index,
    '/api/projects': {
      GET() {
        return json({ projects: listProjects.all() })
      },
      async POST(req) {
        try {
          const body = (await req.json()) as { name?: string }
          const id = `project-${crypto.randomUUID()}`
          insertProject.run(id, body.name?.trim() || 'Proyecto sin nombre', null, null, null, nowIso())
          const project = getProject.get(id)
          return json({ project }, { status: 201 })
        } catch {
          return json({ error: 'invalid-payload' }, { status: 400 })
        }
      },
    },
    '/api/projects/:id': async (req) => {
      const { id } = req.params
      const project = getProject.get(id)

      if (!project) {
        return json({ error: 'not-found' }, { status: 404 })
      }

      if (req.method === 'GET') {
        return json({
          project: {
            ...project,
            payload: project.payload ? JSON.parse(project.payload) : null,
            settings: project.settings ? JSON.parse(project.settings) : null,
          },
        })
      }

      if (req.method === 'PUT') {
        try {
          const body = (await req.json()) as { design: unknown; settings?: unknown; preview?: string | null }
          updateProjectPayload.run(
            JSON.stringify(body.design),
            body.settings ? JSON.stringify(body.settings) : null,
            body.preview ?? null,
            nowIso(),
            id,
          )
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

      if (req.method === 'DELETE') {
        if (id === 'default') {
          return json({ error: 'cannot-delete-default' }, { status: 400 })
        }
        deleteSnapshotsForProject.run(id)
        deleteProject.run(id)
        ensureDefaultProject()
        return json({ ok: true })
      }

      return json({ error: 'method-not-allowed' }, { status: 405 })
    },
    '/api/projects/:projectId/snapshots': async (req) => {
      const { projectId } = req.params
      const project = getProject.get(projectId)

      if (!project) {
        return json({ error: 'not-found' }, { status: 404 })
      }

      if (req.method === 'GET') {
        return json({ snapshots: listSnapshots.all(projectId) })
      }

      if (req.method === 'POST') {
        try {
          const body = (await req.json()) as {
            name?: string
            design: unknown
            settings?: unknown
            preview?: string | null
          }
          const snapshotId = `snapshot-${crypto.randomUUID()}`
          insertSnapshot.run(
            snapshotId,
            projectId,
            body.name?.trim() || 'Snapshot',
            JSON.stringify(body.design),
            body.settings ? JSON.stringify(body.settings) : null,
            body.preview ?? null,
            nowIso(),
          )
          return json({ ok: true }, { status: 201 })
        } catch {
          return json({ error: 'invalid-payload' }, { status: 400 })
        }
      }

      return json({ error: 'method-not-allowed' }, { status: 405 })
    },
    '/api/projects/:projectId/snapshots/:snapshotId': (req) => {
      const { projectId, snapshotId } = req.params
      const snapshot = getSnapshot.get(projectId, snapshotId)
      if (!snapshot) {
        return json({ error: 'not-found' }, { status: 404 })
      }

      if (req.method === 'GET') {
        return json({
          snapshot: {
            ...snapshot,
            payload: JSON.parse(snapshot.payload),
            settings: snapshot.settings ? JSON.parse(snapshot.settings) : null,
          },
        })
      }

      return json({ error: 'method-not-allowed' }, { status: 405 })
    },
    '/favicon.ico': new Response(null, { status: 204 }),
  },
  fetch() {
    return new Response('Not Found', { status: 404 })
  },
})

console.log(`palencia_30 running on http://localhost:${server.port}`)
