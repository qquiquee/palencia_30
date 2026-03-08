# PLAN

## Objetivo
Cerrar `palencia_30` como editor arquitectonico 2D/3D usable, estable y documentado, con persistencia local en SQLite y una UX coherente para proyectos.

## Estado actual

### Ya existe
- Frontend React + TypeScript con editor 2D y vista 3D.
- Herramientas para estancia, muro libre, puerta, superficie y escalera.
- Undo/redo, autosave, export/import JSON validado y gestion de proyectos.
- UI compacta con secciones desplegables.
- Multiseleccion con `Ctrl/Cmd`, agrupacion/desagrupacion y snap con `Ctrl/Cmd`.
- Flujo visible de snapshots en UI: crear, listar y abrir por proyecto.
- Backend Bun + SQLite con endpoints para proyectos y snapshots.
- `bun run lint` y `bun run build` funcionando.

### Pendiente para darlo por terminado
- `README.md` sigue siendo el de plantilla Vite.
- No hay suite de tests ni checklist formal de QA.
- `src/App.tsx` sigue siendo demasiado grande y mezcla demasiadas responsabilidades.
- Quedan detalles de UX y cobertura funcional que conviene decidir:
  - borrar snapshots
  - renombrar snapshots
  - posible comparacion/restauracion mas rica

## Riesgos actuales
- `src/App.tsx` concentra casi toda la logica del producto.
- La persistencia funciona, pero no tiene tests de regresion.
- El modelo de grupos ya existe, pero todavia conviene endurecer casos limite con ediciones complejas.
- El producto ha crecido y la documentacion no acompaña todavia.

## Prioridades

### Fase 1. Base estable
1. Completada.
2. Mantener `bun run lint` y `bun run build` como checks obligatorios de cada entrega.

### Fase 2. Cerrar funcionalidad principal
1. Revisar interacciones limite:
   - borrado de muros con puertas asociadas
   - seleccion despues de cambios destructivos
   - consistencia de grupos tras importacion o cambios manuales
   - mensajes de error y estados vacios
2. Validar manualmente el flujo completo:
   - crear y cerrar estancia
   - editar geometria
   - anadir puertas, superficies y escaleras
   - agrupar y desagrupar
   - guardar/cargar proyecto
   - duplicar, renombrar y borrar proyecto
   - exportar/importar JSON
   - ver el mismo resultado en 3D

### Fase 3. Snapshots
1. Ya implementado:
   - listado por proyecto
   - crear snapshot manual
   - abrir snapshot
   - feedback visual de fecha y preview
2. Pendiente opcional:
   - borrar snapshots
   - renombrar snapshots
   - restauracion comparada o diff visual

### Fase 4. Reducir deuda tecnica
1. Partir `src/App.tsx` en modulos:
   - persistencia/proyectos/snapshots
   - editor 2D
   - vista 3D
   - paneles laterales
   - utilidades geometricas y tipos
2. Centralizar tipos compartidos entre frontend y backend.
3. Extraer constantes y mensajes para evitar duplicacion.
4. Revisar nomenclatura y textos visibles en castellano para consistencia.

### Fase 5. Documentacion y cierre
1. Reescribir `README.md` con:
   - que es el proyecto
   - stack
   - como arrancarlo
   - como construirlo
   - como se persiste la informacion
   - funcionalidades actuales
   - limitaciones conocidas
2. Añadir checklist manual de QA.
3. Dejar una base minima de tests:
   - utilidades geometricas
   - normalizacion/importacion de diseño
   - endpoints principales de proyectos
   - snapshots

## Orden recomendado de ejecucion
1. Corregir bugs funcionales residuales del editor.
2. Partir `src/App.tsx`.
3. Reescribir `README.md`.
4. Añadir checklist de QA.
5. Introducir tests minimos.
6. Hacer smoke test final con persistencia y snapshots.

## Definition of Done
- `bun run lint` pasa sin errores ni warnings relevantes.
- `bun run build` pasa.
- Crear, editar, agrupar, guardar, abrir, duplicar, renombrar y borrar proyectos funciona sin romper estado.
- Import/export JSON no rompe la aplicacion con entradas invalidas razonables.
- El flujo de snapshots elegido esta completo para el alcance del MVP.
- El editor 2D y la vista 3D reflejan el mismo modelo.
- `README.md` describe el proyecto real.
- Existe una checklist de QA ejecutable y usada en el cierre.

## Siguiente iteracion sugerida
- partir `src/App.tsx`
- reescribir `README.md`
- añadir checklist de QA
- introducir tests minimos de persistencia y normalizacion
