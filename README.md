# Palencia 30

Palencia 30 is a local architectural editor built with React, Bun, and SQLite. It combines a 2D floor-plan editor, a linked 3D view, project persistence, snapshots, grouping, snapping, and a JSON editor for numeric editing.

## Current product

- CAD-style ribbon UI with fixed-height tabs.
- 2D plan editor for room outlines, free walls, doors, surfaces, and stairs.
- Linked 3D scene rendered from the same design model.
- Project management backed by SQLite.
- Manual snapshots per project with previews.
- Undo and redo.
- Multi-select with `Ctrl/Cmd + click`.
- Group and ungroup for free walls, surfaces, and stairs.
- Snap while drawing or moving with `Ctrl/Cmd`.
- JSON import/export plus a validated JSON modal editor.
- Millimeter precision (`0.001 m`) for geometry values.

## Stack

- React 19
- TypeScript
- Bun
- `@react-three/fiber` and `three`
- SQLite via `bun:sqlite`

## Run

Requirements:
- Bun installed

Development:

```powershell
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Checks:

```powershell
bun run lint
bun run build
```

Local production build:

```powershell
bun run build
bun run start
```

## Persistence

- Data is stored in [data/palencia_30.sqlite](C:\Users\enriq\Desktop\palencia_30\data\palencia_30.sqlite).
- The Bun server in [server.ts](C:\Users\enriq\Desktop\palencia_30\server.ts) serves the SPA and the SQLite-backed API.
- Projects store both the design payload and view settings.

## Main interactions

- Left click in `Estancia` to place room vertices.
- `Cerrar estancia` closes the room when at least 3 vertices exist.
- `Puerta` places a door onto a wall.
- `Ctrl/Cmd + click` adds or removes items from selection.
- `Delete` or `Backspace` removes the current selection.
- `Ctrl/Cmd + Z` runs undo.
- `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z` runs redo.
- `Ctrl/Cmd` while drawing or moving enables snapping.

## JSON workflow

- `Datos > Editor JSON` opens the JSON modal.
- The modal validates the payload before apply.
- Invalid structures are blocked with explicit errors.
- Recoverable issues are shown as warnings before normalization.

## Project structure

- [src/App.tsx](C:\Users\enriq\Desktop\palencia_30\src\App.tsx): main editor state and UI composition.
- [src/App.css](C:\Users\enriq\Desktop\palencia_30\src\App.css): CAD-style editor layout and visual system.
- [src/editor/design.ts](C:\Users\enriq\Desktop\palencia_30\src\editor\design.ts): geometry helpers, normalization, precision rules, and sample design.
- [src/editor/types.ts](C:\Users\enriq\Desktop\palencia_30\src\editor\types.ts): domain types.
- [src/components/Scene3D.tsx](C:\Users\enriq\Desktop\palencia_30\src\components\Scene3D.tsx): 3D scene rendering.
- [PLAN.md](C:\Users\enriq\Desktop\palencia_30\PLAN.md): project close-out plan and remaining work.

## Known gaps

- `src/App.tsx` is still too large and should keep shrinking.
- There is no automated test suite yet.
- Snapshot deletion and rename are still pending.
- Import validation is practical but not a formal JSON schema.
