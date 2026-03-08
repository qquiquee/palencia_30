export type Point = { id: string; x: number; y: number }
export type MeterPoint = { x: number; y: number }

export type WallSegment = {
  id: string
  start: Point
  end: Point
  color: string
}

export type Door = {
  id: string
  wallId: string
  offset: number
  width: number
  color: string
}

export type Surface = {
  id: string
  x: number
  y: number
  width: number
  depth: number
  elevation: number
  thickness: number
  label: string
  color: string
}

export type Stair = {
  id: string
  x: number
  y: number
  width: number
  depth: number
  fromElevation: number
  toElevation: number
  steps: number
  label: string
  color: string
}

export type SceneStyle = {
  roomWallColor: string
  floorColor: string
  roomFillColor: string
}

export type Tool = 'select' | 'pan' | 'draw-room' | 'wall' | 'door' | 'surface' | 'stairs'
export type ViewMode = '2d' | '3d'
export type GroupableEntityType = 'surface' | 'stairs' | 'wall'
export type EntityType = GroupableEntityType | 'door'
export type EntityKey = `${EntityType}:${string}`
export type SelectedEntity =
  | { type: 'door'; id: string }
  | { type: 'surface'; id: string }
  | { type: 'stairs'; id: string }
  | { type: 'wall'; id: string }
  | null

export type Group = {
  id: string
  name: string
  itemKeys: EntityKey[]
}

export type ViewBox = { x: number; y: number; width: number; height: number }
export type DragDraft = { type: 'surface' | 'stairs'; start: MeterPoint; current: MeterPoint }

export type WallDescriptor = {
  id: string
  kind: 'room' | 'free'
  start: Point
  end: Point
  dx: number
  dy: number
  angle: number
  length: number
  color: string
}

export type GroupMoveMember =
  | { type: 'wall'; id: string; originStart: Point; originEnd: Point }
  | { type: 'surface'; id: string; originX: number; originY: number }
  | { type: 'stairs'; id: string; originX: number; originY: number }

export type Interaction =
  | { type: 'pan'; originPointer: MeterPoint; originViewBox: ViewBox }
  | { type: 'room-point'; pointId: string }
  | { type: 'free-wall-start'; wallId: string }
  | { type: 'free-wall-end'; wallId: string }
  | { type: 'free-wall-move'; entityKey: EntityKey; originPointer: MeterPoint; members: GroupMoveMember[] }
  | { type: 'surface-move'; entityKey: EntityKey; originPointer: MeterPoint; members: GroupMoveMember[] }
  | { type: 'stairs-move'; entityKey: EntityKey; originPointer: MeterPoint; members: GroupMoveMember[] }
  | null

export type PersistedDesign = {
  roomPoints: Point[]
  freeWalls: WallSegment[]
  doors: Door[]
  surfaces: Surface[]
  stairs: Stair[]
  groups: Group[]
  isRoomClosed: boolean
  wallHeight: number
  wallThickness: number
  sceneStyle: SceneStyle
}

export type ProjectSummary = {
  id: string
  name: string
  preview: string | null
  updated_at: string
}

export type SnapshotSummary = {
  id: string
  name: string
  preview: string | null
  created_at: string
}

export type OrbitState = {
  position: [number, number, number]
  target: [number, number, number]
}

export type ProjectSettings = {
  planViewBox: ViewBox
  preferredViewMode: ViewMode
  orbit: OrbitState
}
