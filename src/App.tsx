
import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useState, type WheelEvent } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'

type Point = { id: string; x: number; y: number }
type MeterPoint = { x: number; y: number }

type WallSegment = {
  id: string
  start: Point
  end: Point
  color: string
}

type Door = {
  id: string
  wallId: string
  offset: number
  width: number
  color: string
}

type Surface = {
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

type Stair = {
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

type SceneStyle = {
  roomWallColor: string
  floorColor: string
  roomFillColor: string
}

type Tool = 'select' | 'pan' | 'draw-room' | 'wall' | 'door' | 'surface' | 'stairs'
type ViewMode = '2d' | '3d'
type SelectedEntity =
  | { type: 'door'; id: string }
  | { type: 'surface'; id: string }
  | { type: 'stairs'; id: string }
  | { type: 'wall'; id: string }
  | null

type ViewBox = { x: number; y: number; width: number; height: number }
type DragDraft = { type: 'surface' | 'stairs'; start: MeterPoint; current: MeterPoint }

type WallDescriptor = {
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

type Interaction =
  | { type: 'pan'; originPointer: MeterPoint; originViewBox: ViewBox }
  | { type: 'room-point'; pointId: string }
  | { type: 'free-wall-start'; wallId: string }
  | { type: 'free-wall-end'; wallId: string }
  | { type: 'free-wall-move'; wallId: string; originPointer: MeterPoint; originStart: Point; originEnd: Point }
  | { type: 'surface-move'; id: string; originPointer: MeterPoint; originX: number; originY: number }
  | { type: 'stairs-move'; id: string; originPointer: MeterPoint; originX: number; originY: number }
  | null

type PersistedDesign = {
  roomPoints: Point[]
  freeWalls: WallSegment[]
  doors: Door[]
  surfaces: Surface[]
  stairs: Stair[]
  isRoomClosed: boolean
  wallHeight: number
  wallThickness: number
  viewBox: ViewBox
  sceneStyle: SceneStyle
}

const svgWidth = 960
const svgHeight = 680
const pixelsPerMeter = 120
const pointRadius = 8
const minViewWidth = 240
const maxViewWidth = 3200
const storageKey = 'palencia-30-design'

const defaultSceneStyle: SceneStyle = {
  roomWallColor: '#f7f2ea',
  floorColor: '#dcc4a5',
  roomFillColor: '#e3c698',
}

const sampleRoomPoints: Point[] = [
  { id: 'rp1', x: 0.6, y: 0.6 },
  { id: 'rp2', x: 4.06, y: 0.6 },
  { id: 'rp3', x: 4.06, y: 4.7 },
  { id: 'rp4', x: 2.45, y: 4.7 },
  { id: 'rp5', x: 2.45, y: 3.1 },
  { id: 'rp6', x: 1.65, y: 3.1 },
  { id: 'rp7', x: 1.65, y: 4.7 },
  { id: 'rp8', x: 0.6, y: 4.7 },
]

const sampleFreeWalls: WallSegment[] = [
  {
    id: 'fw1',
    start: { id: 'fws1', x: 4.7, y: 1.1 },
    end: { id: 'fwe1', x: 6.4, y: 1.1 },
    color: '#d8c3b0',
  },
]

const sampleDoors: Door[] = [
  { id: 'd1', wallId: 'room-6', offset: 0.75, width: 0.9, color: '#c5672f' },
  { id: 'd2', wallId: 'room-4', offset: 0.42, width: 0.8, color: '#c5672f' },
]

const sampleSurfaces: Surface[] = [
  {
    id: 's1',
    x: 4.6,
    y: 2.2,
    width: 1.8,
    depth: 1.4,
    elevation: 0.45,
    thickness: 0.18,
    label: 'Tarima',
    color: '#bd8b63',
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

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function roundToGrid(value: number, step = 0.1) {
  return Math.round(value / step) * step
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function metersToSvg(value: number) {
  return value * pixelsPerMeter
}

function toCanvas(point: MeterPoint) {
  return { x: metersToSvg(point.x), y: metersToSvg(point.y) }
}

function fromCanvas(x: number, y: number) {
  return { x: roundToGrid(x / pixelsPerMeter), y: roundToGrid(y / pixelsPerMeter) }
}

function normalizeRect(start: MeterPoint, current: MeterPoint) {
  return {
    x: roundToGrid(Math.min(start.x, current.x)),
    y: roundToGrid(Math.min(start.y, current.y)),
    width: roundToGrid(Math.abs(current.x - start.x)),
    depth: roundToGrid(Math.abs(current.y - start.y)),
  }
}

function polygonCentroid(points: Point[]) {
  if (points.length === 0) {
    return { x: 0, y: 0 }
  }

  const total = points.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 })
  return { x: total.x / points.length, y: total.y / points.length }
}

function describeWall(id: string, kind: 'room' | 'free', start: Point, end: Point, color: string): WallDescriptor {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy)

  return { id, kind, start, end, dx, dy, angle: Math.atan2(dy, dx), length, color }
}

function getRoomWalls(points: Point[], isClosed: boolean, color: string) {
  if (!isClosed || points.length < 3) {
    return []
  }

  return points.map((point, index) => describeWall(`room-${index}`, 'room', point, points[(index + 1) % points.length], color))
}

function getFreeWalls(walls: WallSegment[]) {
  return walls.map((wall) => describeWall(`free-${wall.id}`, 'free', wall.start, wall.end, wall.color))
}

function getDoorSegments(length: number, door: Door | undefined) {
  if (!door) {
    return [{ start: 0, end: length }]
  }

  const halfWidth = door.width / 2
  const gapStart = Math.max(0, door.offset - halfWidth)
  const gapEnd = Math.min(length, door.offset + halfWidth)
  return [{ start: 0, end: gapStart }, { start: gapEnd, end: length }].filter((segment) => segment.end - segment.start > 0.02)
}

function pointToViewBox(event: ReactPointerEvent<SVGSVGElement>, viewBox: ViewBox, bounds: DOMRect) {
  const localX = event.clientX - bounds.left
  const localY = event.clientY - bounds.top
  const svgX = viewBox.x + (localX / bounds.width) * viewBox.width
  const svgY = viewBox.y + (localY / bounds.height) * viewBox.height

  return { svgX, svgY, meters: fromCanvas(svgX, svgY) }
}

function createDefaultDesign(): PersistedDesign {
  return {
    roomPoints: sampleRoomPoints,
    freeWalls: sampleFreeWalls,
    doors: sampleDoors,
    surfaces: sampleSurfaces,
    stairs: sampleStairs,
    isRoomClosed: true,
    wallHeight: 3.3,
    wallThickness: 0.18,
    viewBox: { x: 0, y: 0, width: svgWidth, height: svgHeight },
    sceneStyle: defaultSceneStyle,
  }
}

function clampDoorToWall(door: Door, wall: WallDescriptor) {
  const maxWidth = Math.max(0.6, roundToGrid(wall.length - 0.2))
  const width = clamp(roundToGrid(door.width), 0.6, maxWidth)
  const half = width / 2
  const offset = clamp(roundToGrid(door.offset), half + 0.1, wall.length - half - 0.1)
  return { ...door, width, offset }
}

function Scene3D({
  roomPoints,
  isRoomClosed,
  freeWalls,
  doors,
  surfaces,
  stairs,
  wallThickness,
  wallHeight,
  sceneStyle,
}: PersistedDesign) {
  const roomShape = useMemo(() => {
    if (!isRoomClosed || roomPoints.length < 3) {
      return null
    }

    const shape = new THREE.Shape()
    shape.moveTo(roomPoints[0].x, roomPoints[0].y)
    roomPoints.slice(1).forEach((point) => shape.lineTo(point.x, point.y))
    shape.lineTo(roomPoints[0].x, roomPoints[0].y)
    return shape
  }, [isRoomClosed, roomPoints])

  const walls = useMemo(() => [...getRoomWalls(roomPoints, isRoomClosed, sceneStyle.roomWallColor), ...getFreeWalls(freeWalls)], [freeWalls, isRoomClosed, roomPoints, sceneStyle.roomWallColor])

  return (
    <Canvas camera={{ position: [7, 7, 8], fov: 42 }}>
      <color attach="background" args={['#efe6d6']} />
      <ambientLight intensity={1.45} />
      <directionalLight castShadow intensity={1.2} position={[10, 12, 5]} />
      <gridHelper args={[20, 40, '#ad9e8b', '#d7ccbb']} position={[3.5, 0, 3.5]} />

      {roomShape ? (
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh position={[0, -0.01, 0]} receiveShadow>
            <shapeGeometry args={[roomShape]} />
            <meshStandardMaterial color={sceneStyle.floorColor} />
          </mesh>
        </group>
      ) : null}

      {surfaces.map((surface) => (
        <mesh
          castShadow
          key={surface.id}
          position={[surface.x + surface.width / 2, surface.elevation + surface.thickness / 2, surface.y + surface.depth / 2]}
          receiveShadow
        >
          <boxGeometry args={[surface.width, surface.thickness, surface.depth]} />
          <meshStandardMaterial color={surface.color} />
        </mesh>
      ))}

      {stairs.map((stair) => {
        const horizontalIsWidth = stair.width >= stair.depth
        const stepRun = (horizontalIsWidth ? stair.width : stair.depth) / stair.steps
        const stepRise = (stair.toElevation - stair.fromElevation) / stair.steps

        return (
          <group key={stair.id}>
            {Array.from({ length: stair.steps }).map((_, index) => {
              const sizeX = horizontalIsWidth ? stepRun : stair.width
              const sizeZ = horizontalIsWidth ? stair.depth : stepRun
              const posX = horizontalIsWidth ? stair.x + stepRun * index + sizeX / 2 : stair.x + stair.width / 2
              const posZ = horizontalIsWidth ? stair.y + stair.depth / 2 : stair.y + stepRun * index + sizeZ / 2

              return (
                <mesh castShadow key={`${stair.id}-${index}`} position={[posX, stair.fromElevation + stepRise * (index + 1) / 2, posZ]} receiveShadow>
                  <boxGeometry args={[sizeX, stepRise * (index + 1), sizeZ]} />
                  <meshStandardMaterial color={stair.color} />
                </mesh>
              )
            })}
          </group>
        )
      })}

      {walls.map((wall) => {
        const door = doors.find((item) => item.wallId === wall.id)
        const segments = getDoorSegments(wall.length, door)

        return segments.map((segment) => {
          const segmentLength = segment.end - segment.start
          const offset = segment.start + segmentLength / 2
          const centerX = wall.start.x + (wall.dx / wall.length) * offset
          const centerZ = wall.start.y + (wall.dy / wall.length) * offset

          return (
            <mesh castShadow key={`${wall.id}-${segment.start}`} position={[centerX, wallHeight / 2, centerZ]} receiveShadow rotation={[0, -wall.angle, 0]}>
              <boxGeometry args={[segmentLength, wallHeight, wallThickness]} />
              <meshStandardMaterial color={wall.color} />
            </mesh>
          )
        })
      })}

      <OrbitControls makeDefault maxDistance={22} minDistance={3} />
    </Canvas>
  )
}

function App() {
  const initial = createDefaultDesign()
  const [roomPoints, setRoomPoints] = useState<Point[]>(initial.roomPoints)
  const [freeWalls, setFreeWalls] = useState<WallSegment[]>(initial.freeWalls)
  const [doors, setDoors] = useState<Door[]>(initial.doors)
  const [surfaces, setSurfaces] = useState<Surface[]>(initial.surfaces)
  const [stairs, setStairs] = useState<Stair[]>(initial.stairs)
  const [isRoomClosed, setIsRoomClosed] = useState(initial.isRoomClosed)
  const [tool, setTool] = useState<Tool>('select')
  const [viewMode, setViewMode] = useState<ViewMode>('2d')
  const [selected, setSelected] = useState<SelectedEntity>({ type: 'door', id: initial.doors[0].id })
  const [wallHeight, setWallHeight] = useState(initial.wallHeight)
  const [wallThickness, setWallThickness] = useState(initial.wallThickness)
  const [viewBox, setViewBox] = useState<ViewBox>(initial.viewBox)
  const [sceneStyle, setSceneStyle] = useState<SceneStyle>(initial.sceneStyle)
  const [draftWallStart, setDraftWallStart] = useState<Point | null>(null)
  const [dragDraft, setDragDraft] = useState<DragDraft | null>(null)
  const [interaction, setInteraction] = useState<Interaction>(null)
  const [saveMessage, setSaveMessage] = useState('')

  const roomWalls = useMemo(() => getRoomWalls(roomPoints, isRoomClosed, sceneStyle.roomWallColor), [isRoomClosed, roomPoints, sceneStyle.roomWallColor])
  const allWalls = useMemo(() => [...roomWalls, ...getFreeWalls(freeWalls)], [freeWalls, roomWalls])
  const centroid = useMemo(() => polygonCentroid(roomPoints), [roomPoints])

  const selectedDoor = selected?.type === 'door' ? doors.find((door) => door.id === selected.id) ?? null : null
  const selectedSurface = selected?.type === 'surface' ? surfaces.find((surface) => surface.id === selected.id) ?? null : null
  const selectedStair = selected?.type === 'stairs' ? stairs.find((stair) => stair.id === selected.id) ?? null : null
  const selectedWall = selected?.type === 'wall' ? freeWalls.find((wall) => wall.id === selected.id) ?? null : null

  useEffect(() => {
    const stopAll = () => {
      setInteraction(null)

      if (!dragDraft) {
        return
      }

      const rect = normalizeRect(dragDraft.start, dragDraft.current)
      if (rect.width >= 0.3 && rect.depth >= 0.3) {
        if (dragDraft.type === 'surface') {
          const surface: Surface = { id: uid('s'), label: 'Plataforma', elevation: 0.3, thickness: 0.18, color: '#bd8b63', ...rect }
          setSurfaces((current) => [...current, surface])
          setSelected({ type: 'surface', id: surface.id })
        } else {
          const stair: Stair = { id: uid('st'), label: 'Escalera', fromElevation: 0, toElevation: 0.45, steps: 4, color: '#76956f', ...rect }
          setStairs((current) => [...current, stair])
          setSelected({ type: 'stairs', id: stair.id })
        }
      }

      setDragDraft(null)
    }

    window.addEventListener('pointerup', stopAll)
    return () => window.removeEventListener('pointerup', stopAll)
  }, [dragDraft])

  useEffect(() => {
    if (!selected) {
      return
    }

    if (selected.type === 'door' && !doors.some((door) => door.id === selected.id)) {
      setSelected(null)
    }
    if (selected.type === 'surface' && !surfaces.some((surface) => surface.id === selected.id)) {
      setSelected(null)
    }
    if (selected.type === 'stairs' && !stairs.some((stair) => stair.id === selected.id)) {
      setSelected(null)
    }
    if (selected.type === 'wall' && !freeWalls.some((wall) => wall.id === selected.id)) {
      setSelected(null)
    }
  }, [doors, freeWalls, selected, stairs, surfaces])

  const persistableDesign: PersistedDesign = {
    roomPoints,
    freeWalls,
    doors,
    surfaces,
    stairs,
    isRoomClosed,
    wallHeight,
    wallThickness,
    viewBox,
    sceneStyle,
  }

  const saveDesign = () => {
    localStorage.setItem(storageKey, JSON.stringify(persistableDesign))
    setSaveMessage('Diseño guardado en este navegador.')
  }

  const loadSavedDesign = () => {
    const raw = localStorage.getItem(storageKey)
    if (!raw) {
      setSaveMessage('No hay diseño guardado todavía.')
      return
    }

    const saved = JSON.parse(raw) as PersistedDesign
    setRoomPoints(saved.roomPoints ?? [])
    setFreeWalls(saved.freeWalls ?? [])
    setDoors(saved.doors ?? [])
    setSurfaces(saved.surfaces ?? [])
    setStairs(saved.stairs ?? [])
    setIsRoomClosed(saved.isRoomClosed ?? false)
    setWallHeight(saved.wallHeight ?? 3.3)
    setWallThickness(saved.wallThickness ?? 0.18)
    setViewBox(saved.viewBox ?? { x: 0, y: 0, width: svgWidth, height: svgHeight })
    setSceneStyle(saved.sceneStyle ?? defaultSceneStyle)
    setSelected(null)
    setTool('select')
    setSaveMessage('Diseño cargado desde guardado local.')
  }

  const downloadDesign = () => {
    const blob = new Blob([JSON.stringify(persistableDesign, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'palencia-30-diseno.json'
    link.click()
    URL.revokeObjectURL(url)
    setSaveMessage('JSON descargado.')
  }

  const resetScene = () => {
    const clean = createDefaultDesign()
    setRoomPoints([])
    setFreeWalls([])
    setDoors([])
    setSurfaces([])
    setStairs([])
    setIsRoomClosed(false)
    setSelected(null)
    setDraftWallStart(null)
    setTool('draw-room')
    setViewBox(clean.viewBox)
    setSceneStyle(clean.sceneStyle)
    setSaveMessage('Lienzo reiniciado.')
  }

  const loadSample = () => {
    const sample = createDefaultDesign()
    setRoomPoints(sample.roomPoints)
    setFreeWalls(sample.freeWalls)
    setDoors(sample.doors)
    setSurfaces(sample.surfaces)
    setStairs(sample.stairs)
    setIsRoomClosed(sample.isRoomClosed)
    setSelected({ type: 'door', id: sample.doors[0].id })
    setDraftWallStart(null)
    setTool('select')
    setViewBox(sample.viewBox)
    setSceneStyle(sample.sceneStyle)
    setSaveMessage('Ejemplo cargado.')
  }

  const handleWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault()
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointer = pointToViewBox(event as unknown as ReactPointerEvent<SVGSVGElement>, viewBox, bounds)
    const zoomFactor = event.deltaY > 0 ? 1.12 : 0.88
    const nextWidth = clamp(viewBox.width * zoomFactor, minViewWidth, maxViewWidth)
    const nextHeight = (nextWidth / svgWidth) * svgHeight
    const relX = (pointer.svgX - viewBox.x) / viewBox.width
    const relY = (pointer.svgY - viewBox.y) / viewBox.height

    setViewBox({ x: pointer.svgX - relX * nextWidth, y: pointer.svgY - relY * nextHeight, width: nextWidth, height: nextHeight })
  }

  const handleCanvasPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button === 1 || tool === 'pan') {
      const bounds = event.currentTarget.getBoundingClientRect()
      const pointer = pointToViewBox(event, viewBox, bounds)
      setInteraction({ type: 'pan', originPointer: pointer.meters, originViewBox: viewBox })
      return
    }

    if (tool === 'surface' && event.button === 0) {
      const bounds = event.currentTarget.getBoundingClientRect()
      const pointer = pointToViewBox(event, viewBox, bounds)
      setDragDraft({ type: 'surface', start: pointer.meters, current: pointer.meters })
      return
    }

    if (tool === 'stairs' && event.button === 0) {
      const bounds = event.currentTarget.getBoundingClientRect()
      const pointer = pointToViewBox(event, viewBox, bounds)
      setDragDraft({ type: 'stairs', start: pointer.meters, current: pointer.meters })
    }
  }

  const handleCanvasPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointer = pointToViewBox(event, viewBox, bounds)

    if (interaction?.type === 'pan') {
      const dx = pointer.meters.x - interaction.originPointer.x
      const dy = pointer.meters.y - interaction.originPointer.y
      setViewBox({
        ...interaction.originViewBox,
        x: interaction.originViewBox.x - metersToSvg(dx),
        y: interaction.originViewBox.y - metersToSvg(dy),
      })
      return
    }

    if (interaction?.type === 'room-point') {
      setRoomPoints((current) => current.map((point) => (point.id === interaction.pointId ? { ...point, ...pointer.meters } : point)))
      return
    }

    if (interaction?.type === 'free-wall-start') {
      setFreeWalls((current) => current.map((wall) => (wall.id === interaction.wallId ? { ...wall, start: { ...wall.start, ...pointer.meters } } : wall)))
      return
    }

    if (interaction?.type === 'free-wall-end') {
      setFreeWalls((current) => current.map((wall) => (wall.id === interaction.wallId ? { ...wall, end: { ...wall.end, ...pointer.meters } } : wall)))
      return
    }

    if (interaction?.type === 'free-wall-move') {
      const dx = pointer.meters.x - interaction.originPointer.x
      const dy = pointer.meters.y - interaction.originPointer.y
      setFreeWalls((current) =>
        current.map((wall) =>
          wall.id === interaction.wallId
            ? {
                ...wall,
                start: { ...wall.start, x: roundToGrid(interaction.originStart.x + dx), y: roundToGrid(interaction.originStart.y + dy) },
                end: { ...wall.end, x: roundToGrid(interaction.originEnd.x + dx), y: roundToGrid(interaction.originEnd.y + dy) },
              }
            : wall,
        ),
      )
      return
    }

    if (interaction?.type === 'surface-move') {
      const dx = pointer.meters.x - interaction.originPointer.x
      const dy = pointer.meters.y - interaction.originPointer.y
      setSurfaces((current) => current.map((surface) => (surface.id === interaction.id ? { ...surface, x: roundToGrid(interaction.originX + dx), y: roundToGrid(interaction.originY + dy) } : surface)))
      return
    }

    if (interaction?.type === 'stairs-move') {
      const dx = pointer.meters.x - interaction.originPointer.x
      const dy = pointer.meters.y - interaction.originPointer.y
      setStairs((current) => current.map((stair) => (stair.id === interaction.id ? { ...stair, x: roundToGrid(interaction.originX + dx), y: roundToGrid(interaction.originY + dy) } : stair)))
      return
    }

    if (dragDraft) {
      setDragDraft((current) => (current ? { ...current, current: pointer.meters } : current))
    }
  }

  const handleCanvasClick = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (interaction || dragDraft) {
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    const pointer = pointToViewBox(event, viewBox, bounds)

    if (tool === 'draw-room' && !isRoomClosed) {
      setRoomPoints((current) => [...current, { id: uid('rp'), ...pointer.meters }])
      return
    }

    if (tool === 'wall') {
      if (!draftWallStart) {
        setDraftWallStart({ id: uid('fw-start'), ...pointer.meters })
        return
      }

      const wall: WallSegment = { id: uid('fw'), start: draftWallStart, end: { id: uid('fw-end'), ...pointer.meters }, color: '#d8c3b0' }
      setFreeWalls((current) => [...current, wall])
      setSelected({ type: 'wall', id: wall.id })
      setDraftWallStart(null)
    }
  }

  const handleCloseRoom = () => {
    if (roomPoints.length >= 3) {
      setIsRoomClosed(true)
      setTool('select')
    }
  }

  const createDoor = (wall: WallDescriptor) => {
    const door = clampDoorToWall({ id: uid('d'), wallId: wall.id, offset: wall.length / 2, width: Math.min(0.9, Math.max(0.7, roundToGrid(wall.length * 0.25))), color: '#c5672f' }, wall)
    setDoors((current) => [...current.filter((item) => item.wallId !== wall.id), door])
    setSelected({ type: 'door', id: door.id })
    setTool('select')
  }

  const updateSelectedDoor = (changes: Partial<Door>) => {
    if (!selectedDoor) {
      return
    }

    const wall = allWalls.find((item) => item.id === selectedDoor.wallId)
    if (!wall) {
      return
    }

    setDoors((current) => current.map((door) => (door.id === selectedDoor.id ? clampDoorToWall({ ...door, ...changes }, wall) : door)))
  }

  const updateSelectedSurface = (changes: Partial<Surface>) => {
    if (!selectedSurface) {
      return
    }

    setSurfaces((current) =>
      current.map((surface) =>
        surface.id === selectedSurface.id
          ? { ...surface, ...changes, x: roundToGrid(changes.x ?? surface.x), y: roundToGrid(changes.y ?? surface.y), width: Math.max(0.3, roundToGrid(changes.width ?? surface.width)), depth: Math.max(0.3, roundToGrid(changes.depth ?? surface.depth)), elevation: roundToGrid(changes.elevation ?? surface.elevation, 0.05), thickness: roundToGrid(changes.thickness ?? surface.thickness, 0.05) }
          : surface,
      ),
    )
  }

  const updateSelectedStair = (changes: Partial<Stair>) => {
    if (!selectedStair) {
      return
    }

    setStairs((current) =>
      current.map((stair) =>
        stair.id === selectedStair.id
          ? { ...stair, ...changes, x: roundToGrid(changes.x ?? stair.x), y: roundToGrid(changes.y ?? stair.y), width: Math.max(0.3, roundToGrid(changes.width ?? stair.width)), depth: Math.max(0.3, roundToGrid(changes.depth ?? stair.depth)), fromElevation: roundToGrid(changes.fromElevation ?? stair.fromElevation, 0.05), toElevation: roundToGrid(changes.toElevation ?? stair.toElevation, 0.05), steps: Math.max(2, Math.round(changes.steps ?? stair.steps)) }
          : stair,
      ),
    )
  }

  const updateSelectedWall = (changes: Partial<WallSegment>) => {
    if (!selectedWall) {
      return
    }

    setFreeWalls((current) => current.map((wall) => (wall.id === selectedWall.id ? { ...wall, ...changes } : wall)))
  }

  const deleteSelected = () => {
    if (!selected) {
      return
    }

    if (selected.type === 'door') {
      setDoors((current) => current.filter((door) => door.id !== selected.id))
    }
    if (selected.type === 'surface') {
      setSurfaces((current) => current.filter((surface) => surface.id !== selected.id))
    }
    if (selected.type === 'stairs') {
      setStairs((current) => current.filter((stair) => stair.id !== selected.id))
    }
    if (selected.type === 'wall') {
      setFreeWalls((current) => current.filter((wall) => wall.id !== selected.id))
      setDoors((current) => current.filter((door) => door.wallId !== `free-${selected.id}`))
    }

    setSelected(null)
  }

  const roomPolygon = roomPoints.map((point) => `${metersToSvg(point.x)},${metersToSvg(point.y)}`).join(' ')
  const draftRect = dragDraft ? normalizeRect(dragDraft.start, dragDraft.current) : null

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="panel">
          <p className="eyebrow">Palencia 30</p>
          <h1>Editor arquitectonico 2D/3D</h1>
          <p className="lede">Guarda el diseño, edita elementos existentes y ajusta colores de muros, suelos, superficies, escaleras y puertas.</p>
        </div>

        <div className="panel">
          <span className="section-label">Vista</span>
          <div className="segmented">
            <button className={viewMode === '2d' ? 'active' : ''} onClick={() => setViewMode('2d')} type="button">Planta 2D</button>
            <button className={viewMode === '3d' ? 'active' : ''} onClick={() => setViewMode('3d')} type="button">Volumen 3D</button>
          </div>
        </div>

        <div className="panel">
          <span className="section-label">Herramientas</span>
          <div className="tool-grid">
            <button className={tool === 'select' ? 'active' : ''} onClick={() => setTool('select')} type="button">Seleccionar</button>
            <button className={tool === 'pan' ? 'active' : ''} onClick={() => setTool('pan')} type="button">Pan</button>
            <button className={tool === 'draw-room' ? 'active' : ''} onClick={() => { if (isRoomClosed) { setRoomPoints([]); setIsRoomClosed(false) } setTool('draw-room') }} type="button">Estancia</button>
            <button className={tool === 'wall' ? 'active' : ''} onClick={() => setTool('wall')} type="button">Muro libre</button>
            <button className={tool === 'door' ? 'active' : ''} onClick={() => setTool('door')} type="button">Puerta</button>
            <button className={tool === 'surface' ? 'active' : ''} onClick={() => setTool('surface')} type="button">Superficie</button>
            <button className={tool === 'stairs' ? 'active' : ''} onClick={() => setTool('stairs')} type="button">Escalera</button>
          </div>
          <div className="button-stack">
            <button onClick={resetScene} type="button">Nuevo lienzo</button>
            <button disabled={roomPoints.length < 3 || isRoomClosed} onClick={handleCloseRoom} type="button">Cerrar estancia</button>
            <button onClick={loadSample} type="button">Cargar ejemplo</button>
          </div>
        </div>

        <div className="panel">
          <span className="section-label">Guardar</span>
          <div className="button-stack">
            <button onClick={saveDesign} type="button">Guardar diseño</button>
            <button onClick={loadSavedDesign} type="button">Cargar guardado</button>
            <button onClick={downloadDesign} type="button">Descargar JSON</button>
          </div>
          {saveMessage ? <p className="detail-text save-message">{saveMessage}</p> : null}
        </div>

        <div className="panel">
          <span className="section-label">Escena</span>
          <label>
            Altura de muros
            <div className="inline-field">
              <input max="4.5" min="2.2" onChange={(event) => setWallHeight(Number(event.target.value))} step="0.1" type="range" value={wallHeight} />
              <strong>{wallHeight.toFixed(2)} m</strong>
            </div>
          </label>
          <label>
            Grosor de muros
            <div className="inline-field">
              <input max="0.4" min="0.1" onChange={(event) => setWallThickness(Number(event.target.value))} step="0.01" type="range" value={wallThickness} />
              <strong>{wallThickness.toFixed(2)} m</strong>
            </div>
          </label>
          <label>
            Color muros de estancia
            <input onChange={(event) => setSceneStyle((current) => ({ ...current, roomWallColor: event.target.value }))} type="color" value={sceneStyle.roomWallColor} />
          </label>
          <label>
            Color suelo principal
            <input onChange={(event) => setSceneStyle((current) => ({ ...current, floorColor: event.target.value, roomFillColor: event.target.value }))} type="color" value={sceneStyle.floorColor} />
          </label>
        </div>

        <div className="panel">
          <span className="section-label">Seleccion</span>
          {selectedDoor ? (
            <>
              <p className="detail-text">Puerta en {selectedDoor.wallId}</p>
              <label>Offset <input className="small-input" min="0.4" onChange={(event) => updateSelectedDoor({ offset: Number(event.target.value) })} step="0.1" type="number" value={selectedDoor.offset} /></label>
              <label>Ancho <input className="small-input" min="0.6" onChange={(event) => updateSelectedDoor({ width: Number(event.target.value) })} step="0.1" type="number" value={selectedDoor.width} /></label>
              <label>Color <input onChange={(event) => updateSelectedDoor({ color: event.target.value })} type="color" value={selectedDoor.color} /></label>
              <button className="danger" onClick={deleteSelected} type="button">Eliminar puerta</button>
            </>
          ) : null}

          {selectedWall ? (
            <>
              <p className="detail-text">Muro libre</p>
              <label>Inicio X <input className="small-input" onChange={(event) => updateSelectedWall({ start: { ...selectedWall.start, x: Number(event.target.value) } })} step="0.1" type="number" value={selectedWall.start.x} /></label>
              <label>Inicio Y <input className="small-input" onChange={(event) => updateSelectedWall({ start: { ...selectedWall.start, y: Number(event.target.value) } })} step="0.1" type="number" value={selectedWall.start.y} /></label>
              <label>Fin X <input className="small-input" onChange={(event) => updateSelectedWall({ end: { ...selectedWall.end, x: Number(event.target.value) } })} step="0.1" type="number" value={selectedWall.end.x} /></label>
              <label>Fin Y <input className="small-input" onChange={(event) => updateSelectedWall({ end: { ...selectedWall.end, y: Number(event.target.value) } })} step="0.1" type="number" value={selectedWall.end.y} /></label>
              <label>Color <input onChange={(event) => updateSelectedWall({ color: event.target.value })} type="color" value={selectedWall.color} /></label>
              <button className="danger" onClick={deleteSelected} type="button">Eliminar muro</button>
            </>
          ) : null}

          {selectedSurface ? (
            <>
              <p className="detail-text">{selectedSurface.label}</p>
              <label>Nombre <input onChange={(event) => updateSelectedSurface({ label: event.target.value })} type="text" value={selectedSurface.label} /></label>
              <label>X <input className="small-input" onChange={(event) => updateSelectedSurface({ x: Number(event.target.value) })} step="0.1" type="number" value={selectedSurface.x} /></label>
              <label>Y <input className="small-input" onChange={(event) => updateSelectedSurface({ y: Number(event.target.value) })} step="0.1" type="number" value={selectedSurface.y} /></label>
              <label>Ancho <input className="small-input" onChange={(event) => updateSelectedSurface({ width: Number(event.target.value) })} step="0.1" type="number" value={selectedSurface.width} /></label>
              <label>Fondo <input className="small-input" onChange={(event) => updateSelectedSurface({ depth: Number(event.target.value) })} step="0.1" type="number" value={selectedSurface.depth} /></label>
              <label>Cota <input className="small-input" onChange={(event) => updateSelectedSurface({ elevation: Number(event.target.value) })} step="0.05" type="number" value={selectedSurface.elevation} /></label>
              <label>Espesor <input className="small-input" onChange={(event) => updateSelectedSurface({ thickness: Number(event.target.value) })} step="0.05" type="number" value={selectedSurface.thickness} /></label>
              <label>Color <input onChange={(event) => updateSelectedSurface({ color: event.target.value })} type="color" value={selectedSurface.color} /></label>
              <button className="danger" onClick={deleteSelected} type="button">Eliminar superficie</button>
            </>
          ) : null}

          {selectedStair ? (
            <>
              <p className="detail-text">{selectedStair.label}</p>
              <label>Nombre <input onChange={(event) => updateSelectedStair({ label: event.target.value })} type="text" value={selectedStair.label} /></label>
              <label>X <input className="small-input" onChange={(event) => updateSelectedStair({ x: Number(event.target.value) })} step="0.1" type="number" value={selectedStair.x} /></label>
              <label>Y <input className="small-input" onChange={(event) => updateSelectedStair({ y: Number(event.target.value) })} step="0.1" type="number" value={selectedStair.y} /></label>
              <label>Ancho <input className="small-input" onChange={(event) => updateSelectedStair({ width: Number(event.target.value) })} step="0.1" type="number" value={selectedStair.width} /></label>
              <label>Fondo <input className="small-input" onChange={(event) => updateSelectedStair({ depth: Number(event.target.value) })} step="0.1" type="number" value={selectedStair.depth} /></label>
              <label>Cota origen <input className="small-input" onChange={(event) => updateSelectedStair({ fromElevation: Number(event.target.value) })} step="0.05" type="number" value={selectedStair.fromElevation} /></label>
              <label>Cota destino <input className="small-input" onChange={(event) => updateSelectedStair({ toElevation: Number(event.target.value) })} step="0.05" type="number" value={selectedStair.toElevation} /></label>
              <label>Peldaños <input className="small-input" onChange={(event) => updateSelectedStair({ steps: Number(event.target.value) })} step="1" type="number" value={selectedStair.steps} /></label>
              <label>Color <input onChange={(event) => updateSelectedStair({ color: event.target.value })} type="color" value={selectedStair.color} /></label>
              <button className="danger" onClick={deleteSelected} type="button">Eliminar escalera</button>
            </>
          ) : null}

          {!selected ? <p className="detail-text">Selecciona un muro libre, puerta, superficie o escalera. Los muros libres, superficies y escaleras se pueden arrastrar en planta.</p> : null}
        </div>
      </aside>

      <main className="workspace">
        <div className="workspace-header">
          <div>
            <h2>{viewMode === '2d' ? 'Plano editable' : 'Modelo 3D'}</h2>
            <p>{viewMode === '2d' ? 'Rueda para zoom. Boton central o herramienta Pan para mover la vista. Arrastra muros libres, superficies y escaleras para recolocarlos.' : 'La vista 3D refleja el mismo diseño guardable y los colores configurados.'}</p>
          </div>
          <div className="stats">
            <span>{roomPoints.length} vertices</span>
            <span>{allWalls.length} muros</span>
            <span>{surfaces.length} superficies</span>
            <span>{stairs.length} escaleras</span>
          </div>
        </div>

        {viewMode === '2d' ? (
          <div className="canvas-card">
            <svg className="plan-canvas" onClick={handleCanvasClick} onContextMenu={(event) => event.preventDefault()} onPointerDown={handleCanvasPointerDown} onPointerMove={handleCanvasPointerMove} onWheel={handleWheel} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}>
              <defs>
                <pattern height="48" id="grid" patternUnits="userSpaceOnUse" width="48">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(90,67,38,0.12)" strokeWidth="1" />
                </pattern>
              </defs>

              <rect fill="url(#grid)" height={svgHeight * 4} width={svgWidth * 4} x={-svgWidth} y={-svgHeight} />
              <rect className="plan-border" height={svgHeight - 2} width={svgWidth - 2} x="1" y="1" />

              {isRoomClosed && roomPoints.length > 2 ? <polygon className="room-fill" points={roomPolygon} style={{ fill: `${sceneStyle.roomFillColor}44`, stroke: `${sceneStyle.roomFillColor}88` }} /> : null}

              {surfaces.map((surface) => (
                <g key={surface.id}>
                  <rect
                    className={`surface-rect ${selected?.type === 'surface' && selected.id === surface.id ? 'surface-rect--selected' : ''}`}
                    height={metersToSvg(surface.depth)}
                    onClick={() => setSelected({ type: 'surface', id: surface.id })}
                    onPointerDown={(event) => {
                      if (tool !== 'select') return
                      event.stopPropagation()
                      const bounds = event.currentTarget.ownerSVGElement!.getBoundingClientRect()
                      const pointer = pointToViewBox(event as unknown as ReactPointerEvent<SVGSVGElement>, viewBox, bounds)
                      setSelected({ type: 'surface', id: surface.id })
                      setInteraction({ type: 'surface-move', id: surface.id, originPointer: pointer.meters, originX: surface.x, originY: surface.y })
                    }}
                    style={{ fill: `${surface.color}44`, stroke: surface.color }}
                    width={metersToSvg(surface.width)}
                    x={metersToSvg(surface.x)}
                    y={metersToSvg(surface.y)}
                  />
                  <text className="surface-label" x={metersToSvg(surface.x + surface.width / 2)} y={metersToSvg(surface.y + surface.depth / 2)}>{surface.label} +{surface.elevation.toFixed(2)} m</text>
                </g>
              ))}

              {stairs.map((stair) => {
                const x = metersToSvg(stair.x)
                const y = metersToSvg(stair.y)
                const width = metersToSvg(stair.width)
                const depth = metersToSvg(stair.depth)
                const horizontal = stair.width >= stair.depth

                return (
                  <g key={stair.id}>
                    <rect
                      className={`stairs-rect ${selected?.type === 'stairs' && selected.id === stair.id ? 'stairs-rect--selected' : ''}`}
                      height={depth}
                      onClick={() => setSelected({ type: 'stairs', id: stair.id })}
                      onPointerDown={(event) => {
                        if (tool !== 'select') return
                        event.stopPropagation()
                        const bounds = event.currentTarget.ownerSVGElement!.getBoundingClientRect()
                        const pointer = pointToViewBox(event as unknown as ReactPointerEvent<SVGSVGElement>, viewBox, bounds)
                        setSelected({ type: 'stairs', id: stair.id })
                        setInteraction({ type: 'stairs-move', id: stair.id, originPointer: pointer.meters, originX: stair.x, originY: stair.y })
                      }}
                      style={{ fill: `${stair.color}33`, stroke: stair.color }}
                      width={width}
                      x={x}
                      y={y}
                    />
                    {Array.from({ length: stair.steps - 1 }).map((_, index) => {
                      if (horizontal) {
                        const stepX = x + ((index + 1) / stair.steps) * width
                        return <line className="stairs-step" key={`${stair.id}-h-${index}`} style={{ stroke: stair.color }} x1={stepX} x2={stepX} y1={y} y2={y + depth} />
                      }
                      const stepY = y + ((index + 1) / stair.steps) * depth
                      return <line className="stairs-step" key={`${stair.id}-v-${index}`} style={{ stroke: stair.color }} x1={x} x2={x + width} y1={stepY} y2={stepY} />
                    })}
                    <text className="surface-label" x={x + width / 2} y={y + depth / 2}>{stair.label} {stair.fromElevation.toFixed(2)}?{stair.toElevation.toFixed(2)} m</text>
                  </g>
                )
              })}

              {allWalls.map((wall) => {
                const start = toCanvas(wall.start)
                const end = toCanvas(wall.end)
                const isSelectedWall = selected?.type === 'wall' && selected.id === wall.id.replace('free-', '')

                return (
                  <g key={wall.id}>
                    <line
                      className={`wall-line ${tool === 'door' ? 'wall-line--interactive' : ''} ${isSelectedWall ? 'wall-line--selected' : ''}`}
                      onClick={() => {
                        if (tool === 'door') {
                          createDoor(wall)
                          return
                        }
                        if (wall.kind === 'free') {
                          setSelected({ type: 'wall', id: wall.id.replace('free-', '') })
                        }
                      }}
                      onPointerDown={(event) => {
                        if (tool !== 'select' || wall.kind !== 'free') return
                        event.stopPropagation()
                        const bounds = event.currentTarget.ownerSVGElement!.getBoundingClientRect()
                        const pointer = pointToViewBox(event as unknown as ReactPointerEvent<SVGSVGElement>, viewBox, bounds)
                        const rawWall = freeWalls.find((item) => item.id === wall.id.replace('free-', ''))
                        if (!rawWall) return
                        setSelected({ type: 'wall', id: rawWall.id })
                        setInteraction({ type: 'free-wall-move', wallId: rawWall.id, originPointer: pointer.meters, originStart: rawWall.start, originEnd: rawWall.end })
                      }}
                      style={{ stroke: wall.color }}
                      x1={start.x}
                      x2={end.x}
                      y1={start.y}
                      y2={end.y}
                    />
                    <text className="wall-label" x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 12}>{wall.length.toFixed(2)} m</text>
                  </g>
                )
              })}

              {!isRoomClosed && roomPoints.slice(1).map((point, index) => {
                const previous = toCanvas(roomPoints[index])
                const current = toCanvas(point)
                return <line className="draft-line" key={point.id} x1={previous.x} x2={current.x} y1={previous.y} y2={current.y} />
              })}

              {draftWallStart ? <circle className="draft-anchor" cx={metersToSvg(draftWallStart.x)} cy={metersToSvg(draftWallStart.y)} r="10" /> : null}

              {doors.map((door) => {
                const wall = allWalls.find((item) => item.id === door.wallId)
                if (!wall) return null
                const startFactor = (door.offset - door.width / 2) / wall.length
                const endFactor = (door.offset + door.width / 2) / wall.length
                const start = toCanvas({ x: wall.start.x + wall.dx * startFactor, y: wall.start.y + wall.dy * startFactor })
                const end = toCanvas({ x: wall.start.x + wall.dx * endFactor, y: wall.start.y + wall.dy * endFactor })
                return <line className={`door-line ${selected?.type === 'door' && selected.id === door.id ? 'door-line--selected' : ''}`} key={door.id} onClick={() => setSelected({ type: 'door', id: door.id })} style={{ stroke: door.color }} x1={start.x} x2={end.x} y1={start.y} y2={end.y} />
              })}

              {roomPoints.map((point) => {
                const canvasPoint = toCanvas(point)
                return (
                  <g key={point.id}>
                    <circle className="point-handle" cx={canvasPoint.x} cy={canvasPoint.y} onPointerDown={(event) => { event.stopPropagation(); setInteraction({ type: 'room-point', pointId: point.id }); setTool('select') }} r={pointRadius} />
                    <text className="point-label" x={canvasPoint.x + 12} y={canvasPoint.y - 12}>{point.x.toFixed(1)}, {point.y.toFixed(1)}</text>
                  </g>
                )
              })}

              {freeWalls.map((wall) => {
                const start = toCanvas(wall.start)
                const end = toCanvas(wall.end)
                return (
                  <g key={`handles-${wall.id}`}>
                    <circle className="endpoint-handle" cx={start.x} cy={start.y} onPointerDown={(event) => { if (tool !== 'select') return; event.stopPropagation(); setSelected({ type: 'wall', id: wall.id }); setInteraction({ type: 'free-wall-start', wallId: wall.id }) }} r="7" />
                    <circle className="endpoint-handle" cx={end.x} cy={end.y} onPointerDown={(event) => { if (tool !== 'select') return; event.stopPropagation(); setSelected({ type: 'wall', id: wall.id }); setInteraction({ type: 'free-wall-end', wallId: wall.id }) }} r="7" />
                  </g>
                )
              })}

              {isRoomClosed && roomPoints.length > 2 ? <text className="centroid-label" x={metersToSvg(centroid.x)} y={metersToSvg(centroid.y)}>Estancia</text> : null}
              {draftRect ? <rect className={dragDraft?.type === 'surface' ? 'draft-surface' : 'draft-stairs'} height={metersToSvg(draftRect.depth)} width={metersToSvg(draftRect.width)} x={metersToSvg(draftRect.x)} y={metersToSvg(draftRect.y)} /> : null}
            </svg>
          </div>
        ) : (
          <div className="canvas-card canvas-card--three">
            <Scene3D {...persistableDesign} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App

