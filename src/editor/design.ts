import type { PointerEvent as ReactPointerEvent } from 'react'
import type {
  Door,
  EntityKey,
  EntityType,
  Group,
  GroupableEntityType,
  MeterPoint,
  PersistedDesign,
  Point,
  ProjectSettings,
  SceneStyle,
  SelectedEntity,
  Stair,
  Surface,
  ViewBox,
  WallDescriptor,
  WallSegment,
} from './types'

export const svgWidth = 960
export const svgHeight = 680
export const pixelsPerMeter = 120
export const pointRadius = 8
export const minViewWidth = 240
export const maxViewWidth = 3200
export const millimeterStep = 0.001

export const defaultSceneStyle: SceneStyle = {
  roomWallColor: '#f7f2ea',
  floorColor: '#dcc4a5',
  roomFillColor: '#e3c698',
}

export const defaultProjectSettings: ProjectSettings = {
  planViewBox: { x: 0, y: 0, width: svgWidth, height: svgHeight },
  preferredViewMode: '2d',
  orbit: {
    position: [7, 7, 8],
    target: [2.5, 0, 2.5],
  },
}

const sampleRoomPoints: Point[] = [
  { id: 'rp1', x: 0.8, y: 0.7 },
  { id: 'rp2', x: 4.26, y: 0.7 },
  { id: 'rp3', x: 4.55, y: 2.2 },
  { id: 'rp4', x: 4.55, y: 5.05 },
  { id: 'rp5', x: 1.95, y: 5.05 },
  { id: 'rp6', x: 1.95, y: 4.1 },
  { id: 'rp7', x: 1.35, y: 4.1 },
  { id: 'rp8', x: 1.35, y: 3.35 },
  { id: 'rp9', x: 0.8, y: 3.35 },
]

const sampleFreeWalls: WallSegment[] = [
  {
    id: 'fw-bath-left',
    start: { id: 'fw-bath-left-s', x: 2.45, y: 3.35 },
    end: { id: 'fw-bath-left-e', x: 2.45, y: 5.05 },
    color: '#cab4a0',
  },
  {
    id: 'fw-bath-top',
    start: { id: 'fw-bath-top-s', x: 2.45, y: 3.35 },
    end: { id: 'fw-bath-top-e', x: 4.15, y: 3.35 },
    color: '#cab4a0',
  },
  {
    id: 'fw-kitchen-top',
    start: { id: 'fw-kitchen-top-s', x: 2.85, y: 2.55 },
    end: { id: 'fw-kitchen-top-e', x: 4.05, y: 2.55 },
    color: '#cab4a0',
  },
  {
    id: 'fw-kitchen-left',
    start: { id: 'fw-kitchen-left-s', x: 2.85, y: 2.05 },
    end: { id: 'fw-kitchen-left-e', x: 2.85, y: 2.55 },
    color: '#cab4a0',
  },
]

const sampleDoors: Door[] = [
  { id: 'd1', wallId: 'room-6', offset: 0.35, width: 0.8, color: '#c5672f' },
  { id: 'd2', wallId: 'free-fw-bath-left', offset: 0.9, width: 0.75, color: '#c5672f' },
]

const sampleSurfaces: Surface[] = [
  {
    id: 's-cocina',
    x: 3.1,
    y: 2.1,
    width: 0.9,
    depth: 0.55,
    elevation: 0,
    thickness: 0.9,
    label: 'Cocina',
    color: '#bd8b63',
  },
  {
    id: 's-bano',
    x: 2.75,
    y: 3.75,
    width: 1,
    depth: 0.8,
    elevation: 0,
    thickness: 0.45,
    label: 'Bano',
    color: '#9aafc7',
  },
]

const sampleStairs: Stair[] = [
  {
    id: 'st1',
    x: 4.7,
    y: 3.75,
    width: 1.2,
    depth: 1.6,
    fromElevation: 0,
    toElevation: 0.45,
    steps: 4,
    label: 'Peldaños',
    color: '#76956f',
  },
]

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

const samplePlanStairs: Stair[] = sampleStairs.slice(0, 0)

export function roundToGrid(value: number, step = millimeterStep) {
  const decimals = Math.max(0, Math.ceil(-Math.log10(step)))
  const rounded = Math.round((value + Number.EPSILON) / step) * step
  return Number(rounded.toFixed(decimals))
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function metersToSvg(value: number) {
  return value * pixelsPerMeter
}

export function toCanvas(point: MeterPoint) {
  return { x: metersToSvg(point.x), y: metersToSvg(point.y) }
}

export function fromCanvas(x: number, y: number) {
  return { x: roundToGrid(x / pixelsPerMeter), y: roundToGrid(y / pixelsPerMeter) }
}

export function normalizeRect(start: MeterPoint, current: MeterPoint) {
  return {
    x: roundToGrid(Math.min(start.x, current.x)),
    y: roundToGrid(Math.min(start.y, current.y)),
    width: roundToGrid(Math.abs(current.x - start.x)),
    depth: roundToGrid(Math.abs(current.y - start.y)),
  }
}

export function polygonCentroid(points: Point[]) {
  if (points.length === 0) {
    return { x: 0, y: 0 }
  }

  const total = points.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 })
  return { x: total.x / points.length, y: total.y / points.length }
}

export function describeWall(id: string, kind: 'room' | 'free', start: Point, end: Point, color: string): WallDescriptor {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy)

  return { id, kind, start, end, dx, dy, angle: Math.atan2(dy, dx), length, color }
}

export function getRoomWalls(points: Point[], isClosed: boolean, color: string) {
  if (!isClosed || points.length < 3) {
    return []
  }

  return points.map((point, index) => describeWall(`room-${index}`, 'room', point, points[(index + 1) % points.length], color))
}

export function getFreeWalls(walls: WallSegment[]) {
  return walls.map((wall) => describeWall(`free-${wall.id}`, 'free', wall.start, wall.end, wall.color))
}

export function getDoorSegments(length: number, door: Door | undefined) {
  if (!door) {
    return [{ start: 0, end: length }]
  }

  const halfWidth = door.width / 2
  const gapStart = Math.max(0, door.offset - halfWidth)
  const gapEnd = Math.min(length, door.offset + halfWidth)
  return [{ start: 0, end: gapStart }, { start: gapEnd, end: length }].filter((segment) => segment.end - segment.start > 0.02)
}

export function pointToViewBox(event: ReactPointerEvent<SVGSVGElement>, viewBox: ViewBox, bounds: DOMRect) {
  const localX = event.clientX - bounds.left
  const localY = event.clientY - bounds.top
  const svgX = viewBox.x + (localX / bounds.width) * viewBox.width
  const svgY = viewBox.y + (localY / bounds.height) * viewBox.height

  return { svgX, svgY, meters: fromCanvas(svgX, svgY) }
}

export function entityKeyOf(entity: Exclude<SelectedEntity, null>): EntityKey {
  return `${entity.type}:${entity.id}`
}

export function parseEntityKey(key: string): { type: EntityType; id: string } | null {
  const [type, ...rest] = key.split(':')
  const id = rest.join(':')

  if (!id || !['door', 'surface', 'stairs', 'wall'].includes(type)) {
    return null
  }

  return { type: type as EntityType, id }
}

export function entityFromKey(key: EntityKey): Exclude<SelectedEntity, null> | null {
  const parsed = parseEntityKey(key)
  if (!parsed) {
    return null
  }

  return { type: parsed.type as EntityType & Exclude<SelectedEntity, null>['type'], id: parsed.id }
}

export function isGroupableEntityType(type: EntityType): type is GroupableEntityType {
  return type === 'surface' || type === 'stairs' || type === 'wall'
}

export function dedupeEntityKeys(keys: EntityKey[]) {
  return Array.from(new Set(keys))
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export type ImportedDesignInspection = {
  normalized: PersistedDesign | null
  errors: string[]
  warnings: string[]
}

export function normalizeImportedDesign(input: unknown): PersistedDesign | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<PersistedDesign>

  if (!Array.isArray(candidate.roomPoints) || !Array.isArray(candidate.freeWalls) || !Array.isArray(candidate.doors) || !Array.isArray(candidate.surfaces) || !Array.isArray(candidate.stairs)) {
    return null
  }

  const roomPoints = candidate.roomPoints
    .filter((point): point is Point => typeof point?.id === 'string' && isFiniteNumber(point.x) && isFiniteNumber(point.y))
    .map((point) => ({ id: point.id, x: roundToGrid(point.x), y: roundToGrid(point.y) }))

  const freeWalls = candidate.freeWalls
    .filter(
      (wall): wall is WallSegment =>
        typeof wall?.id === 'string' &&
        typeof wall.color === 'string' &&
        typeof wall.start?.id === 'string' &&
        isFiniteNumber(wall.start.x) &&
        isFiniteNumber(wall.start.y) &&
        typeof wall.end?.id === 'string' &&
        isFiniteNumber(wall.end.x) &&
        isFiniteNumber(wall.end.y),
    )
    .map((wall) => ({
      id: wall.id,
      color: wall.color,
      start: { id: wall.start.id, x: roundToGrid(wall.start.x), y: roundToGrid(wall.start.y) },
      end: { id: wall.end.id, x: roundToGrid(wall.end.x), y: roundToGrid(wall.end.y) },
    }))

  const validWallIds = new Set([
    ...freeWalls.map((wall) => `free-${wall.id}`),
    ...roomPoints.map((_, index, array) => (array.length >= 3 ? `room-${index}` : '')).filter(Boolean),
  ])

  const doors = candidate.doors
    .filter(
      (door): door is Door =>
        typeof door?.id === 'string' &&
        typeof door.wallId === 'string' &&
        validWallIds.has(door.wallId) &&
        isFiniteNumber(door.offset) &&
        isFiniteNumber(door.width) &&
        typeof door.color === 'string',
    )
    .map((door) => ({
      id: door.id,
      wallId: door.wallId,
      offset: roundToGrid(door.offset),
      width: Math.max(0.6, roundToGrid(door.width)),
      color: door.color,
    }))

  const surfaces = candidate.surfaces
    .filter(
      (surface): surface is Surface =>
        typeof surface?.id === 'string' &&
        isFiniteNumber(surface.x) &&
        isFiniteNumber(surface.y) &&
        isFiniteNumber(surface.width) &&
        isFiniteNumber(surface.depth) &&
        isFiniteNumber(surface.elevation) &&
        isFiniteNumber(surface.thickness) &&
        typeof surface.label === 'string' &&
        typeof surface.color === 'string',
    )
    .map((surface) => ({
      ...surface,
      x: roundToGrid(surface.x),
      y: roundToGrid(surface.y),
      width: Math.max(0.3, roundToGrid(surface.width)),
      depth: Math.max(0.3, roundToGrid(surface.depth)),
      elevation: roundToGrid(surface.elevation),
      thickness: Math.max(0.05, roundToGrid(surface.thickness)),
    }))

  const stairs = candidate.stairs
    .filter(
      (stair): stair is Stair =>
        typeof stair?.id === 'string' &&
        isFiniteNumber(stair.x) &&
        isFiniteNumber(stair.y) &&
        isFiniteNumber(stair.width) &&
        isFiniteNumber(stair.depth) &&
        isFiniteNumber(stair.fromElevation) &&
        isFiniteNumber(stair.toElevation) &&
        isFiniteNumber(stair.steps) &&
        typeof stair.label === 'string' &&
        typeof stair.color === 'string',
    )
    .map((stair) => ({
      ...stair,
      x: roundToGrid(stair.x),
      y: roundToGrid(stair.y),
      width: Math.max(0.3, roundToGrid(stair.width)),
      depth: Math.max(0.3, roundToGrid(stair.depth)),
      fromElevation: roundToGrid(stair.fromElevation),
      toElevation: roundToGrid(stair.toElevation),
      steps: Math.max(2, Math.round(stair.steps)),
    }))

  const groups = Array.isArray(candidate.groups)
    ? candidate.groups
        .filter(
          (group): group is Group =>
            typeof group?.id === 'string' &&
            typeof group.name === 'string' &&
            Array.isArray(group.itemKeys) &&
            group.itemKeys.every((itemKey) => typeof itemKey === 'string'),
        )
        .map((group) => ({
          id: group.id,
          name: group.name,
          itemKeys: dedupeEntityKeys(
            group.itemKeys.filter((itemKey): itemKey is EntityKey => {
              const parsed = parseEntityKey(itemKey)
              return parsed !== null && parsed.type !== 'door'
            }),
          ),
        }))
        .filter((group) => group.itemKeys.length >= 2)
    : []

  return {
    roomPoints,
    freeWalls,
    doors,
    surfaces,
    stairs,
    groups,
    isRoomClosed: Boolean(candidate.isRoomClosed) && roomPoints.length >= 3,
    wallHeight: isFiniteNumber(candidate.wallHeight) ? clamp(candidate.wallHeight, 2.2, 4.5) : 3.3,
    wallThickness: isFiniteNumber(candidate.wallThickness) ? clamp(candidate.wallThickness, 0.1, 0.4) : 0.18,
    sceneStyle: {
      roomWallColor: typeof candidate.sceneStyle?.roomWallColor === 'string' ? candidate.sceneStyle.roomWallColor : defaultSceneStyle.roomWallColor,
      floorColor: typeof candidate.sceneStyle?.floorColor === 'string' ? candidate.sceneStyle.floorColor : defaultSceneStyle.floorColor,
      roomFillColor: typeof candidate.sceneStyle?.roomFillColor === 'string' ? candidate.sceneStyle.roomFillColor : defaultSceneStyle.roomFillColor,
    },
  }
}

export function inspectImportedDesign(input: unknown): ImportedDesignInspection {
  const errors: string[] = []
  const warnings: string[] = []

  if (!input || typeof input !== 'object') {
    return {
      normalized: null,
      errors: ['La raiz del JSON debe ser un objeto.'],
      warnings,
    }
  }

  const candidate = input as Partial<PersistedDesign>
  const requiredArrays: Array<keyof Pick<PersistedDesign, 'roomPoints' | 'freeWalls' | 'doors' | 'surfaces' | 'stairs'>> = [
    'roomPoints',
    'freeWalls',
    'doors',
    'surfaces',
    'stairs',
  ]

  for (const key of requiredArrays) {
    if (!Array.isArray(candidate[key])) {
      errors.push(`Falta la coleccion "${key}" o no es un array.`)
    }
  }

  const normalized = normalizeImportedDesign(input)
  if (!normalized) {
    return { normalized: null, errors, warnings }
  }

  if (Array.isArray(candidate.roomPoints) && candidate.roomPoints.length !== normalized.roomPoints.length) {
    warnings.push(`Se descartaran ${candidate.roomPoints.length - normalized.roomPoints.length} vertices invalidos.`)
  }

  if (Array.isArray(candidate.freeWalls) && candidate.freeWalls.length !== normalized.freeWalls.length) {
    warnings.push(`Se descartaran ${candidate.freeWalls.length - normalized.freeWalls.length} muros libres invalidos.`)
  }

  const validWallIds = new Set([
    ...normalized.freeWalls.map((wall) => `free-${wall.id}`),
    ...normalized.roomPoints.map((_, index, array) => (array.length >= 3 ? `room-${index}` : '')).filter(Boolean),
  ])

  if (Array.isArray(candidate.doors)) {
    const invalidDoors = candidate.doors.filter(
      (door) =>
        typeof door?.id !== 'string' ||
        typeof door.wallId !== 'string' ||
        !validWallIds.has(door.wallId) ||
        !isFiniteNumber(door.offset) ||
        !isFiniteNumber(door.width) ||
        typeof door.color !== 'string',
    )

    if (invalidDoors.length > 0) {
      warnings.push(`Se descartaran ${invalidDoors.length} puertas invalidas o conectadas a muros inexistentes.`)
    }
  }

  if (Array.isArray(candidate.surfaces) && candidate.surfaces.length !== normalized.surfaces.length) {
    warnings.push(`Se descartaran ${candidate.surfaces.length - normalized.surfaces.length} superficies invalidas.`)
  }

  if (Array.isArray(candidate.stairs) && candidate.stairs.length !== normalized.stairs.length) {
    warnings.push(`Se descartaran ${candidate.stairs.length - normalized.stairs.length} escaleras invalidas.`)
  }

  if (Array.isArray(candidate.groups)) {
    const rawDoorKeys = candidate.groups.flatMap((group) => (Array.isArray(group?.itemKeys) ? group.itemKeys : [])).filter((itemKey) => typeof itemKey === 'string' && itemKey.startsWith('door:'))
    if (rawDoorKeys.length > 0) {
      warnings.push('Las puertas no se pueden agrupar y se eliminaran de los grupos.')
    }

    if (candidate.groups.length !== normalized.groups.length) {
      warnings.push(`Se descartaran ${candidate.groups.length - normalized.groups.length} grupos invalidos o vacios.`)
    }
  }

  if (candidate.isRoomClosed && normalized.roomPoints.length < 3) {
    warnings.push('No se puede cerrar la estancia con menos de 3 vertices.')
  }

  if (isFiniteNumber(candidate.wallHeight) && (candidate.wallHeight < 2.2 || candidate.wallHeight > 4.5)) {
    warnings.push('La altura de muros se ajustara al rango permitido (2.2 m a 4.5 m).')
  }

  if (isFiniteNumber(candidate.wallThickness) && (candidate.wallThickness < 0.1 || candidate.wallThickness > 0.4)) {
    warnings.push('El grosor de muros se ajustara al rango permitido (0.1 m a 0.4 m).')
  }

  return { normalized, errors, warnings }
}

export function createDefaultDesign(): PersistedDesign {
  return {
    roomPoints: sampleRoomPoints,
    freeWalls: sampleFreeWalls,
    doors: sampleDoors,
    surfaces: sampleSurfaces,
    stairs: samplePlanStairs,
    groups: [],
    isRoomClosed: true,
    wallHeight: 3.3,
    wallThickness: 0.18,
    sceneStyle: defaultSceneStyle,
  }
}

export function cloneDesign(design: PersistedDesign): PersistedDesign {
  return JSON.parse(JSON.stringify(design)) as PersistedDesign
}

export function serializeForHistory(design: PersistedDesign) {
  return JSON.stringify(design)
}

export function clampDoorToWall(door: Door, wall: WallDescriptor) {
  const maxWidth = Math.max(0.6, roundToGrid(wall.length - 0.2))
  const width = clamp(roundToGrid(door.width), 0.6, maxWidth)
  const half = width / 2
  const offset = clamp(roundToGrid(door.offset), half + 0.1, wall.length - half - 0.1)
  return { ...door, width, offset }
}

export function buildProjectPreview(design: PersistedDesign) {
  const lines = [
    ...getRoomWalls(design.roomPoints, design.isRoomClosed, design.sceneStyle.roomWallColor),
    ...getFreeWalls(design.freeWalls),
  ]

  const svgLines = lines
    .map((wall) => {
      const start = toCanvas(wall.start)
      const end = toCanvas(wall.end)
      return `<line x1="${start.x / 6}" y1="${start.y / 6}" x2="${end.x / 6}" y2="${end.y / 6}" stroke="${wall.color}" stroke-width="3" stroke-linecap="round" />`
    })
    .join('')

  const surfaceRects = design.surfaces
    .map(
      (surface) =>
        `<rect x="${metersToSvg(surface.x) / 6}" y="${metersToSvg(surface.y) / 6}" width="${metersToSvg(surface.width) / 6}" height="${metersToSvg(surface.depth) / 6}" fill="${surface.color}" fill-opacity="0.35" stroke="${surface.color}" stroke-width="1.5" />`,
    )
    .join('')

  const stairRects = design.stairs
    .map(
      (stair) =>
        `<rect x="${metersToSvg(stair.x) / 6}" y="${metersToSvg(stair.y) / 6}" width="${metersToSvg(stair.width) / 6}" height="${metersToSvg(stair.depth) / 6}" fill="${stair.color}" fill-opacity="0.22" stroke="${stair.color}" stroke-width="1.5" />`,
    )
    .join('')

  const doorLines = design.doors
    .map((door) => {
      const wall = lines.find((item) => item.id === door.wallId)
      if (!wall) {
        return ''
      }

      const startFactor = (door.offset - door.width / 2) / wall.length
      const endFactor = (door.offset + door.width / 2) / wall.length
      const start = toCanvas({ x: wall.start.x + wall.dx * startFactor, y: wall.start.y + wall.dy * startFactor })
      const end = toCanvas({ x: wall.start.x + wall.dx * endFactor, y: wall.start.y + wall.dy * endFactor })
      return `<line x1="${start.x / 6}" y1="${start.y / 6}" x2="${end.x / 6}" y2="${end.y / 6}" stroke="${door.color}" stroke-width="3" stroke-linecap="round" />`
    })
    .join('')

  const roomPolygon =
    design.isRoomClosed && design.roomPoints.length > 2
      ? `<polygon points="${design.roomPoints.map((point) => `${metersToSvg(point.x) / 6},${metersToSvg(point.y) / 6}`).join(' ')}" fill="${design.sceneStyle.roomFillColor}" fill-opacity="0.15" stroke="${design.sceneStyle.roomFillColor}" stroke-opacity="0.45" stroke-width="1" />`
      : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 136"><rect width="192" height="136" rx="14" fill="#f7f1e8" />${roomPolygon}${surfaceRects}${stairRects}${svgLines}${doorLines}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
