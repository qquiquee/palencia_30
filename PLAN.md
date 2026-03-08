# PLAN

## Goal

Close `palencia_30` as a stable local MVP for editing simple architectural layouts in 2D and 3D, with usable persistence and a coherent CAD-like workflow.

## Current state

Completed:
- Bun + SQLite backend for projects and snapshots.
- React editor with room, free wall, door, surface, and stair tools.
- Linked 3D scene.
- Undo, redo, autosave, import/export JSON.
- Project CRUD.
- Snapshot create/list/open flow.
- Multi-select, grouping, ungrouping, and snap.
- CAD-style ribbon UI, navigation widget, bottom status bar.
- JSON editor moved to a modal with validation.
- Millimeter precision for geometry (`0.001 m`).
- `bun run lint` and `bun run build` green.

Still open:
- Shrink and modularize [src/App.tsx](C:\Users\enriq\Desktop\palencia_30\src\App.tsx).
- Add automated tests.
- Decide whether snapshot rename/delete are in scope.
- Keep polishing the CAD layout so ribbon space and overlays feel intentional.

## Main risks

- Too much editor logic is still concentrated in one file.
- No regression suite protects geometry, normalization, or persistence.
- UI is evolving quickly, so layout regressions are easy to introduce.

## Recommended next steps

1. Split editor UI concerns from editor state in `App.tsx`.
2. Add tests for:
   - geometry helpers
   - import normalization
   - project API
   - snapshot API
3. Close the snapshot scope:
   - either add rename/delete
   - or explicitly freeze the current MVP scope
4. Polish navigation and ribbon details:
   - spacing
   - iconography
   - panel sizing
   - overlay placement

## Definition of done

- `bun run lint` passes.
- `bun run build` passes.
- A full manual flow works:
  - draw room
  - close room
  - add walls, doors, surfaces, stairs
  - group and ungroup
  - save, load, duplicate, rename, delete project
  - create and open snapshot
  - export and import JSON
  - verify in 3D
- README matches the real product.
- Precision stays stable at millimeter level in UI and JSON.
- Remaining scope is explicit and documented.
