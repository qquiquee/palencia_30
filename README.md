# Palencia 30

Editor arquitectonico 2D/3D hecho con React, Bun y SQLite. Permite dibujar una estancia, añadir muros libres, puertas, superficies y escaleras, y guardar proyectos localmente.

## Stack
- React 19
- TypeScript
- Bun
- `@react-three/fiber` + `three` para la vista 3D
- SQLite mediante `bun:sqlite`

## Funcionalidades actuales
- Edicion en planta 2D y visualizacion 3D del mismo modelo.
- Herramientas para estancia, muro libre, puerta, superficie y escalera.
- Zoom y pan sobre el plano.
- Edicion por propiedades de muros libres, puertas, superficies y escaleras.
- Autosave del proyecto activo.
- Undo / redo.
- Gestion de proyectos: crear, abrir, renombrar, duplicar y borrar.
- Snapshots por proyecto: crear, listar y abrir.
- Exportacion e importacion JSON con validacion basica.
- Multiseleccion con `Ctrl/Cmd + click`.
- Agrupar y desagrupar muros libres, superficies y escaleras.
- Snap con `Ctrl/Cmd` al mover o dibujar.

## Arranque

### Requisitos
- Bun instalado

### Desarrollo
```powershell
bun install
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Checks
```powershell
bun run lint
bun run build
```

### Produccion local
```powershell
bun run build
bun run start
```

## Persistencia
- La aplicacion guarda datos en SQLite.
- La base se crea en [data/palencia_30.sqlite](C:\Users\enriq\Desktop\palencia_30\data\palencia_30.sqlite).
- El backend sirve:
  - proyectos
  - snapshots
  - HTML de la aplicacion

## Uso rapido
1. Arranca la app con `bun run dev`.
2. Crea una estancia en `Planta 2D` haciendo clic para colocar vertices.
3. Pulsa `Cerrar estancia`.
4. Añade superficies, escaleras, muros libres o puertas.
5. Cambia a `Volumen 3D` para revisar el resultado.
6. Guarda el proyecto o crea snapshots del estado actual.

## Atajos e interacciones
- `Ctrl/Cmd + click`: multiseleccion.
- `Ctrl/Cmd` al mover o dibujar: snap a puntos cercanos.
- `Delete` / `Backspace`: borrar seleccion.
- `Ctrl/Cmd + Z`: undo.
- `Ctrl/Cmd + Y` o `Ctrl/Cmd + Shift + Z`: redo.

## Estructura principal
- [src/App.tsx](C:\Users\enriq\Desktop\palencia_30\src\App.tsx): composicion de la UI y estado principal del editor.
- [src/editor/design.ts](C:\Users\enriq\Desktop\palencia_30\src\editor\design.ts): utilidades geometricas, normalizacion e inicializacion del diseño.
- [src/editor/types.ts](C:\Users\enriq\Desktop\palencia_30\src\editor\types.ts): tipos del dominio.
- [src/components/Scene3D.tsx](C:\Users\enriq\Desktop\palencia_30\src\components\Scene3D.tsx): render 3D.
- [server.ts](C:\Users\enriq\Desktop\palencia_30\server.ts): servidor Bun y API SQLite.

## Limitaciones actuales
- El editor sigue concentrando bastante logica en `App.tsx`.
- No hay tests automaticos todavia.
- La gestion de snapshots no incluye borrado ni renombrado.
- La importacion JSON valida una estructura basica, no un esquema formal completo.
