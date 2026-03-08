
import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState, type WheelEvent } from 'react'
import { Scene3D } from './components/Scene3D'
import {
  buildProjectPreview,
  clamp,
  clampDoorToWall,
  cloneDesign,
  createDefaultDesign,
  defaultProjectSettings,
  defaultSceneStyle,
  dedupeEntityKeys,
  entityFromKey,
  entityKeyOf,
  getFreeWalls,
  getRoomWalls,
  inspectImportedDesign,
  isGroupableEntityType,
  maxViewWidth,
  millimeterStep,
  metersToSvg,
  minViewWidth,
  normalizeImportedDesign,
  normalizeRect,
  parseEntityKey,
  pointRadius,
  pointToViewBox,
  polygonCentroid,
  roundToGrid,
  serializeForHistory,
  svgHeight,
  svgWidth,
  toCanvas,
  uid,
} from './editor/design'
import type {
  Door,
  DragDraft,
  EntityKey,
  EntityType,
  Group,
  GroupMoveMember,
  Interaction,
  MeterPoint,
  OrbitState,
  PersistedDesign,
  Point,
  ProjectSettings,
  ProjectSummary,
  SceneStyle,
  SelectedEntity,
  SnapshotSummary,
  Stair,
  Surface,
  Tool,
  ViewBox,
  ViewMode,
  WallDescriptor,
  WallSegment,
} from './editor/types'
import './App.css'

function App() {
  type TopMenu = 'project' | 'view' | 'tools' | 'save' | 'scene' | null
  const initial = createDefaultDesign()
  const initialSettings = defaultProjectSettings
  const [roomPoints, setRoomPoints] = useState<Point[]>(initial.roomPoints)
  const [freeWalls, setFreeWalls] = useState<WallSegment[]>(initial.freeWalls)
  const [doors, setDoors] = useState<Door[]>(initial.doors)
  const [surfaces, setSurfaces] = useState<Surface[]>(initial.surfaces)
  const [stairs, setStairs] = useState<Stair[]>(initial.stairs)
  const [isRoomClosed, setIsRoomClosed] = useState(initial.isRoomClosed)
  const [tool, setTool] = useState<Tool>('select')
  const [viewMode, setViewMode] = useState<ViewMode>(initialSettings.preferredViewMode)
  const [selected, setSelected] = useState<SelectedEntity>({ type: 'door', id: initial.doors[0].id })
  const [wallHeight, setWallHeight] = useState(initial.wallHeight)
  const [wallThickness, setWallThickness] = useState(initial.wallThickness)
  const [viewBox, setViewBox] = useState<ViewBox>(initialSettings.planViewBox)
  const [orbit, setOrbit] = useState<OrbitState>(initialSettings.orbit)
  const [sceneStyle, setSceneStyle] = useState<SceneStyle>(initial.sceneStyle)
  const [draftWallStart, setDraftWallStart] = useState<Point | null>(null)
  const [dragDraft, setDragDraft] = useState<DragDraft | null>(null)
  const [interaction, setInteraction] = useState<Interaction>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [autosaveState, setAutosaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [snapshots, setSnapshots] = useState<SnapshotSummary[]>([])
  const [activeProjectId, setActiveProjectId] = useState('default')
  const [activeProjectName, setActiveProjectName] = useState('Proyecto principal')
  const [history, setHistory] = useState<PersistedDesign[]>([])
  const [future, setFuture] = useState<PersistedDesign[]>([])
  const [propertiesOpen, setPropertiesOpen] = useState(true)
  const [activeTopMenu, setActiveTopMenu] = useState<TopMenu>('tools')
  const [selectedKeys, setSelectedKeys] = useState<EntityKey[]>(selected ? [entityKeyOf(selected)] : [])
  const [groups, setGroups] = useState<Group[]>(initial.groups ?? [])
  const [jsonEditorText, setJsonEditorText] = useState(() => JSON.stringify(initial, null, 2))
  const [jsonEditorError, setJsonEditorError] = useState('')
  const [jsonEditorOpen, setJsonEditorOpen] = useState(false)
  const lastSnapshotRef = useRef<string>('')
  const lastDesignRef = useRef<PersistedDesign>(cloneDesign(initial))
  const currentDesignRef = useRef<PersistedDesign>(cloneDesign(initial))
  const skipHistoryRef = useRef(false)
  const gestureSnapshotRef = useRef<PersistedDesign | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const autosaveTimeoutRef = useRef<Timer | null>(null)
  const skipAutosaveRef = useRef(true)

  const roomWalls = useMemo(() => getRoomWalls(roomPoints, isRoomClosed, sceneStyle.roomWallColor), [isRoomClosed, roomPoints, sceneStyle.roomWallColor])
  const allWalls = useMemo(() => [...roomWalls, ...getFreeWalls(freeWalls)], [freeWalls, roomWalls])
  const centroid = useMemo(() => polygonCentroid(roomPoints), [roomPoints])
  const persistableDesign = useMemo<PersistedDesign>(
    () => ({
      roomPoints,
      freeWalls,
      doors,
      surfaces,
      stairs,
      groups,
      isRoomClosed,
      wallHeight,
      wallThickness,
      sceneStyle,
    }),
    [doors, freeWalls, groups, isRoomClosed, roomPoints, sceneStyle, stairs, surfaces, wallHeight, wallThickness],
  )
  const projectSettings = useMemo<ProjectSettings>(
    () => ({
      planViewBox: viewBox,
      preferredViewMode: viewMode,
      orbit,
    }),
    [orbit, viewBox, viewMode],
  )
  const jsonInspection = useMemo(() => {
    try {
      return inspectImportedDesign(JSON.parse(jsonEditorText))
    } catch {
      return {
        normalized: null,
        errors: ['El JSON no es valido.'],
        warnings: [],
      }
    }
  }, [jsonEditorText])

  const selectedDoor = selected?.type === 'door' ? doors.find((door) => door.id === selected.id) ?? null : null
  const selectedSurface = selected?.type === 'surface' ? surfaces.find((surface) => surface.id === selected.id) ?? null : null
  const selectedStair = selected?.type === 'stairs' ? stairs.find((stair) => stair.id === selected.id) ?? null : null
  const selectedWall = selected?.type === 'wall' ? freeWalls.find((wall) => wall.id === selected.id) ?? null : null
  const selectedGroupableKeys = useMemo(
    () =>
      dedupeEntityKeys(selectedKeys).filter((key) => {
        const parsed = parseEntityKey(key)
        return parsed ? isGroupableEntityType(parsed.type) : false
      }),
    [selectedKeys],
  )
  const selectedGroups = useMemo(
    () => groups.filter((group) => group.itemKeys.some((key) => selectedGroupableKeys.includes(key))),
    [groups, selectedGroupableKeys],
  )

  const syncJsonEditorFromDesign = (design: PersistedDesign) => {
    setJsonEditorText(JSON.stringify(design, null, 2))
    setJsonEditorError('')
  }

  const syncCurrentDesignSnapshot = (design: PersistedDesign) => {
    const cloned = cloneDesign(design)
    lastDesignRef.current = cloned
    currentDesignRef.current = cloneDesign(design)
    lastSnapshotRef.current = serializeForHistory(cloned)
  }

  const applyDesign = (design: PersistedDesign) => {
    setRoomPoints(design.roomPoints ?? [])
    setFreeWalls(design.freeWalls ?? [])
    setDoors(design.doors ?? [])
    setSurfaces(design.surfaces ?? [])
    setStairs(design.stairs ?? [])
    setGroups(design.groups ?? [])
    setIsRoomClosed(design.isRoomClosed ?? false)
    setWallHeight(design.wallHeight ?? 3.3)
    setWallThickness(design.wallThickness ?? 0.18)
    setSceneStyle(design.sceneStyle ?? defaultSceneStyle)
  }

  const clearSelection = () => {
    setSelected(null)
    setSelectedKeys([])
  }

  const selectEntity = (entity: Exclude<SelectedEntity, null>, additive = false) => {
    const key = entityKeyOf(entity)

    if (!additive) {
      setSelected(entity)
      setSelectedKeys([key])
      return
    }

    if (selectedEntityKeys.includes(key)) {
      const next = selectedEntityKeys.filter((item) => item !== key)
      setSelectedKeys(next)
      setSelected(next[0] ? entityFromKey(next[0]) : null)
      return
    }

    setSelected(entity)
    setSelectedKeys(dedupeEntityKeys([...selectedEntityKeys, key]))
  }

  const selectedEntityKeys = selected ? dedupeEntityKeys([...selectedKeys, entityKeyOf(selected)]) : dedupeEntityKeys(selectedKeys)

  const applyProjectSettings = (settings?: ProjectSettings | null) => {
    setViewBox(settings?.planViewBox ?? defaultProjectSettings.planViewBox)
    setViewMode(settings?.preferredViewMode ?? defaultProjectSettings.preferredViewMode)
    setOrbit(settings?.orbit ?? defaultProjectSettings.orbit)
  }

  const removeDeletedKeysFromGroups = (deletedKeys: EntityKey[]) => {
    setGroups((current) =>
      current
        .map((group) => ({
          ...group,
          itemKeys: group.itemKeys.filter((key) => !deletedKeys.includes(key)),
        }))
        .filter((group) => group.itemKeys.length >= 2),
    )
  }

  const getGroupMoveMembers = (key: EntityKey): GroupMoveMember[] => {
    const activeGroup = groups.find((group) => group.itemKeys.includes(key))
    const keys = activeGroup ? activeGroup.itemKeys : [key]

    return keys
      .map((itemKey) => {
        const parsed = parseEntityKey(itemKey)
        if (!parsed) {
          return null
        }

        if (parsed.type === 'wall') {
          const wall = freeWalls.find((item) => item.id === parsed.id)
          return wall ? { type: 'wall' as const, id: wall.id, originStart: wall.start, originEnd: wall.end } : null
        }

        if (parsed.type === 'surface') {
          const surface = surfaces.find((item) => item.id === parsed.id)
          return surface ? { type: 'surface' as const, id: surface.id, originX: surface.x, originY: surface.y } : null
        }

        if (parsed.type === 'stairs') {
          const stair = stairs.find((item) => item.id === parsed.id)
          return stair ? { type: 'stairs' as const, id: stair.id, originX: stair.x, originY: stair.y } : null
        }

        return null
      })
      .filter((member): member is GroupMoveMember => member !== null)
  }

  const collectSnapTargets = (excludedKeys: EntityKey[] = []) => {
    const excluded = new Set(excludedKeys)
    const targets: MeterPoint[] = roomPoints.map(({ x, y }) => ({ x, y }))

    freeWalls.forEach((wall) => {
      if (!excluded.has(`wall:${wall.id}`)) {
        targets.push({ x: wall.start.x, y: wall.start.y }, { x: wall.end.x, y: wall.end.y })
      }
    })

    surfaces.forEach((surface) => {
      if (excluded.has(`surface:${surface.id}`)) {
        return
      }
      targets.push(
        { x: surface.x, y: surface.y },
        { x: surface.x + surface.width, y: surface.y },
        { x: surface.x, y: surface.y + surface.depth },
        { x: surface.x + surface.width, y: surface.y + surface.depth },
        { x: surface.x + surface.width / 2, y: surface.y + surface.depth / 2 },
      )
    })

    stairs.forEach((stair) => {
      if (excluded.has(`stairs:${stair.id}`)) {
        return
      }
      targets.push(
        { x: stair.x, y: stair.y },
        { x: stair.x + stair.width, y: stair.y },
        { x: stair.x, y: stair.y + stair.depth },
        { x: stair.x + stair.width, y: stair.y + stair.depth },
        { x: stair.x + stair.width / 2, y: stair.y + stair.depth / 2 },
      )
    })

    return targets
  }

  const snapPoint = (point: MeterPoint, active: boolean, excludedKeys: EntityKey[] = []) => {
    if (!active) {
      return point
    }

    const threshold = 0.35
    let best = point
    let bestDistance = Infinity

    collectSnapTargets(excludedKeys).forEach((target) => {
      const distance = Math.hypot(target.x - point.x, target.y - point.y)
      if (distance < bestDistance && distance <= threshold) {
        best = { x: roundToGrid(target.x), y: roundToGrid(target.y) }
        bestDistance = distance
      }
    })

    return best
  }

  const applyGroupMove = (members: GroupMoveMember[], dx: number, dy: number) => {
    const roundedDx = roundToGrid(dx)
    const roundedDy = roundToGrid(dy)

    setFreeWalls((current) =>
      current.map((wall) => {
        const member = members.find((item) => item.type === 'wall' && item.id === wall.id)
        if (!member || member.type !== 'wall') {
          return wall
        }

        return {
          ...wall,
          start: {
            ...wall.start,
            x: roundToGrid(member.originStart.x + roundedDx),
            y: roundToGrid(member.originStart.y + roundedDy),
          },
          end: {
            ...wall.end,
            x: roundToGrid(member.originEnd.x + roundedDx),
            y: roundToGrid(member.originEnd.y + roundedDy),
          },
        }
      }),
    )

    setSurfaces((current) =>
      current.map((surface) => {
        const member = members.find((item) => item.type === 'surface' && item.id === surface.id)
        if (!member || member.type !== 'surface') {
          return surface
        }

        return {
          ...surface,
          x: roundToGrid(member.originX + roundedDx),
          y: roundToGrid(member.originY + roundedDy),
        }
      }),
    )

    setStairs((current) =>
      current.map((stair) => {
        const member = members.find((item) => item.type === 'stairs' && item.id === stair.id)
        if (!member || member.type !== 'stairs') {
          return stair
        }

        return {
          ...stair,
          x: roundToGrid(member.originX + roundedDx),
          y: roundToGrid(member.originY + roundedDy),
        }
      }),
    )
  }

  const beginGestureHistory = () => {
    if (!gestureSnapshotRef.current) {
      gestureSnapshotRef.current = cloneDesign(persistableDesign)
    }
  }

  const commitGestureHistory = () => {
    if (!gestureSnapshotRef.current) {
      return
    }

    const before = gestureSnapshotRef.current
    const currentDesign = cloneDesign(currentDesignRef.current)
    const beforeSerialized = serializeForHistory(before)
    const afterSerialized = serializeForHistory(currentDesign)

    if (beforeSerialized !== afterSerialized) {
      setHistory((current) => [...current.slice(-59), before])
      setFuture([])
      lastSnapshotRef.current = afterSerialized
      lastDesignRef.current = currentDesign
    } else if (!lastSnapshotRef.current) {
      lastSnapshotRef.current = afterSerialized
      lastDesignRef.current = currentDesign
    }

    gestureSnapshotRef.current = null
  }

  const deleteSelected = () => {
    if (selectedEntityKeys.length === 0) {
      return
    }

    const parsed = selectedEntityKeys
      .map((key) => ({ key, parsed: parseEntityKey(key) }))
      .filter((item): item is { key: EntityKey; parsed: { type: EntityType; id: string } } => item.parsed !== null)

    const deletedWallIds = parsed.filter((item) => item.parsed.type === 'wall').map((item) => item.parsed.id)
    const deletedDoorIds = parsed.filter((item) => item.parsed.type === 'door').map((item) => item.parsed.id)
    const deletedSurfaceIds = parsed.filter((item) => item.parsed.type === 'surface').map((item) => item.parsed.id)
    const deletedStairIds = parsed.filter((item) => item.parsed.type === 'stairs').map((item) => item.parsed.id)

    setDoors((current) =>
      current.filter((door) => !deletedDoorIds.includes(door.id) && !deletedWallIds.some((wallId) => door.wallId === `free-${wallId}`)),
    )
    setSurfaces((current) => current.filter((surface) => !deletedSurfaceIds.includes(surface.id)))
    setStairs((current) => current.filter((stair) => !deletedStairIds.includes(stair.id)))
    setFreeWalls((current) => current.filter((wall) => !deletedWallIds.includes(wall.id)))
    removeDeletedKeysFromGroups(parsed.map((item) => item.key))
    clearSelection()
  }

  const groupSelected = () => {
    if (selectedGroupableKeys.length < 2) {
      return
    }

    setGroups((current) => {
      const stripped = current
        .map((group) => ({
          ...group,
          itemKeys: group.itemKeys.filter((key) => !selectedGroupableKeys.includes(key)),
        }))
        .filter((group) => group.itemKeys.length >= 2)

      return [
        {
          id: uid('group'),
          name: `Grupo ${stripped.length + 1}`,
          itemKeys: selectedGroupableKeys,
        },
        ...stripped,
      ]
    })
    setSaveMessage(`Grupo creado con ${selectedGroupableKeys.length} elementos.`)
  }

  const ungroupSelected = () => {
    if (selectedGroups.length === 0) {
      return
    }

    setGroups((current) =>
      current
        .map((group) =>
          selectedGroups.some((selectedGroup) => selectedGroup.id === group.id)
            ? {
                ...group,
                itemKeys: group.itemKeys.filter((key) => !selectedGroupableKeys.includes(key)),
              }
            : group,
        )
        .filter((group) => group.itemKeys.length >= 2),
    )
    setSaveMessage('Elementos desagrupados.')
  }

  const undo = () => {
    if (history.length === 0) {
      return
    }

    const previous = history[history.length - 1]
    skipHistoryRef.current = true
    setHistory((current) => current.slice(0, -1))
    setFuture((current) => [cloneDesign(persistableDesign), ...current])
    applyDesign(cloneDesign(previous))
    clearSelection()
    setSaveMessage('Undo aplicado.')
    lastDesignRef.current = cloneDesign(previous)
    lastSnapshotRef.current = serializeForHistory(previous)
  }

  const redo = () => {
    if (future.length === 0) {
      return
    }

    const [next, ...rest] = future
    skipHistoryRef.current = true
    setFuture(rest)
    setHistory((current) => [...current.slice(-59), cloneDesign(persistableDesign)])
    applyDesign(cloneDesign(next))
    clearSelection()
    setSaveMessage('Redo aplicado.')
    lastDesignRef.current = cloneDesign(next)
    lastSnapshotRef.current = serializeForHistory(next)
  }

  const saveProjectToServer = async (mode: 'manual' | 'auto' = 'manual') => {
    const preview = buildProjectPreview(persistableDesign)
    const response = await fetch(`/api/projects/${activeProjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        design: persistableDesign,
        settings: projectSettings,
        preview,
      }),
    })

    if (!response.ok) {
      setAutosaveState('error')
      if (mode === 'manual') {
        setSaveMessage('No se pudo guardar en SQLite.')
      }
      return
    }

    setProjects((current) =>
      current.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              updated_at: new Date().toISOString(),
              preview,
            }
          : project,
      ),
    )
    setAutosaveState('saved')
    if (mode === 'manual') {
      setSaveMessage(`Proyecto "${activeProjectName}" guardado en SQLite.`)
    }
  }

  const loadSnapshots = async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}/snapshots`)
    if (!response.ok) {
      setSnapshots([])
      return
    }

    const payload = (await response.json()) as { snapshots: SnapshotSummary[] }
    setSnapshots(payload.snapshots)
  }

  const openProject = async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`)
    if (!response.ok) {
      setSaveMessage('No se pudo abrir el proyecto.')
      return
    }

    const payload = (await response.json()) as {
      project: { id: string; name: string; payload: PersistedDesign | null; settings: ProjectSettings | null }
    }

    setActiveProjectId(payload.project.id)
    setActiveProjectName(payload.project.name)
    clearSelection()
    setTool('select')
    setHistory([])
    setFuture([])
    skipAutosaveRef.current = true

    if (payload.project.payload) {
      const normalized = normalizeImportedDesign(payload.project.payload)
      if (!normalized) {
        setSaveMessage(`Proyecto "${payload.project.name}" con diseño invalido.`)
        return
      }
      skipHistoryRef.current = true
      applyDesign(normalized)
      syncJsonEditorFromDesign(normalized)
      applyProjectSettings(payload.project.settings)
      syncCurrentDesignSnapshot(normalized)
      setAutosaveState('idle')
      await loadSnapshots(payload.project.id)
      setSaveMessage(`Proyecto "${payload.project.name}" abierto.`)
      return
    }

    const clean = createDefaultDesign()
    const emptyDesign = {
      ...clean,
      roomPoints: [],
      freeWalls: [],
      doors: [],
      surfaces: [],
      stairs: [],
      isRoomClosed: false,
    }
    skipHistoryRef.current = true
    applyDesign(emptyDesign)
    syncJsonEditorFromDesign(emptyDesign)
    applyProjectSettings(payload.project.settings ?? defaultProjectSettings)
    setTool('draw-room')
    syncCurrentDesignSnapshot(emptyDesign)
    setAutosaveState('idle')
    await loadSnapshots(payload.project.id)
    setSaveMessage(`Proyecto "${payload.project.name}" abierto sin diseño aún.`)
  }

  useEffect(() => {
    currentDesignRef.current = persistableDesign
  }, [persistableDesign])

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
          setSelectedKeys([`surface:${surface.id}`])
        } else {
          const stair: Stair = { id: uid('st'), label: 'Escalera', fromElevation: 0, toElevation: 0.45, steps: 4, color: '#76956f', ...rect }
          setStairs((current) => [...current, stair])
          setSelected({ type: 'stairs', id: stair.id })
          setSelectedKeys([`stairs:${stair.id}`])
        }
      }

      setDragDraft(null)
      queueMicrotask(() => commitGestureHistory())
    }

    window.addEventListener('pointerup', stopAll)
    return () => window.removeEventListener('pointerup', stopAll)
  }, [dragDraft])

  useEffect(() => {
    const loadProjects = async () => {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        return
      }

      const payload = (await response.json()) as { projects: ProjectSummary[] }
      setProjects(payload.projects)
      const active = payload.projects.find((project) => project.id === 'default') ?? payload.projects[0]
      if (!active) {
        return
      }

      const projectResponse = await fetch(`/api/projects/${active.id}`)
      if (!projectResponse.ok) {
        return
      }

      const projectPayload = (await projectResponse.json()) as {
        project: { id: string; name: string; payload: PersistedDesign | null; settings: ProjectSettings | null }
      }

      setActiveProjectId(projectPayload.project.id)
      setActiveProjectName(projectPayload.project.name)
      clearSelection()
      setTool('select')
      setHistory([])
      setFuture([])
      skipAutosaveRef.current = true

      if (projectPayload.project.payload) {
        const normalized = normalizeImportedDesign(projectPayload.project.payload)
        if (!normalized) {
          setSaveMessage(`Proyecto "${projectPayload.project.name}" con diseño invalido.`)
          return
        }
        skipHistoryRef.current = true
        applyDesign(normalized)
        syncJsonEditorFromDesign(normalized)
        applyProjectSettings(projectPayload.project.settings)
        syncCurrentDesignSnapshot(normalized)
        setAutosaveState('idle')
        setSaveMessage(`Proyecto "${projectPayload.project.name}" abierto.`)
        await loadSnapshots(projectPayload.project.id)
        return
      }

      const clean = createDefaultDesign()
      const emptyDesign = {
        ...clean,
        roomPoints: [],
        freeWalls: [],
        doors: [],
        surfaces: [],
        stairs: [],
        isRoomClosed: false,
      }
      skipHistoryRef.current = true
      applyDesign(emptyDesign)
      syncJsonEditorFromDesign(emptyDesign)
      applyProjectSettings(projectPayload.project.settings ?? defaultProjectSettings)
      setTool('draw-room')
      syncCurrentDesignSnapshot(emptyDesign)
      setAutosaveState('idle')
      setSaveMessage(`Proyecto "${projectPayload.project.name}" abierto sin diseño aún.`)
      await loadSnapshots(projectPayload.project.id)
    }

    void loadProjects()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      }

      if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') || ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'z')) {
        event.preventDefault()
        redo()
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && selected) {
        const target = event.target as HTMLElement | null
        if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
          return
        }
        event.preventDefault()
        deleteSelected()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  useEffect(() => {
    const snapshot = serializeForHistory(persistableDesign)

    if (!lastSnapshotRef.current) {
      lastSnapshotRef.current = snapshot
      lastDesignRef.current = cloneDesign(persistableDesign)
      return
    }

    if (snapshot === lastSnapshotRef.current) {
      return
    }

    if (skipHistoryRef.current) {
      lastSnapshotRef.current = snapshot
      lastDesignRef.current = cloneDesign(persistableDesign)
      skipHistoryRef.current = false
      return
    }

    if (interaction || dragDraft) {
      return
    }

    setHistory((current) => [...current.slice(-59), cloneDesign(lastDesignRef.current)])
    setFuture([])
    lastSnapshotRef.current = snapshot
    lastDesignRef.current = cloneDesign(persistableDesign)
  }, [dragDraft, interaction, persistableDesign])

  useEffect(() => {
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false
      return
    }

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current)
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      void (async () => {
        setAutosaveState('saving')
        const preview = buildProjectPreview(persistableDesign)
        const response = await fetch(`/api/projects/${activeProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            design: persistableDesign,
            settings: projectSettings,
            preview,
          }),
        })

        if (!response.ok) {
          setAutosaveState('error')
          return
        }

        setProjects((current) =>
          current.map((project) =>
            project.id === activeProjectId
              ? {
                  ...project,
                  updated_at: new Date().toISOString(),
                  preview,
                }
              : project,
          ),
        )
        setAutosaveState('saved')
      })()
    }, 1200)

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
      }
    }
  }, [activeProjectId, persistableDesign, projectSettings])

  const saveDesign = async () => {
    void saveProjectToServer('manual')
  }

  const createSnapshot = async () => {
    const name = window.prompt('Nombre del snapshot', `${activeProjectName} ${new Date().toLocaleString('es-ES')}`)
    if (!name) {
      return
    }

    const response = await fetch(`/api/projects/${activeProjectId}/snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        design: persistableDesign,
        settings: projectSettings,
        preview: buildProjectPreview(persistableDesign),
      }),
    })

    if (!response.ok) {
      setSaveMessage('No se pudo crear el snapshot.')
      return
    }

    await loadSnapshots(activeProjectId)
    setSaveMessage(`Snapshot "${name}" creado.`)
  }

  const openSnapshot = async (snapshotId: string) => {
    const response = await fetch(`/api/projects/${activeProjectId}/snapshots/${snapshotId}`)
    if (!response.ok) {
      setSaveMessage('No se pudo abrir el snapshot.')
      return
    }

    const payload = (await response.json()) as {
      snapshot: { id: string; name: string; payload: PersistedDesign; settings: ProjectSettings | null }
    }

    const saved = normalizeImportedDesign(payload.snapshot.payload)
    if (!saved) {
      setSaveMessage('El snapshot guardado no tiene un formato valido.')
      return
    }

    skipHistoryRef.current = true
    skipAutosaveRef.current = true
    applyDesign(saved)
    syncJsonEditorFromDesign(saved)
    applyProjectSettings(payload.snapshot.settings)
    clearSelection()
    setTool('select')
    setHistory([])
    setFuture([])
    syncCurrentDesignSnapshot(saved)
    setAutosaveState('idle')
    setSaveMessage(`Snapshot "${payload.snapshot.name}" cargado.`)
  }

  const loadSavedDesign = async () => {
    const response = await fetch(`/api/projects/${activeProjectId}`)
    if (!response.ok) {
      setSaveMessage('No se pudo cargar el diseño guardado.')
      return
    }

    const payload = (await response.json()) as { project: { id: string; name: string; payload: PersistedDesign | null; settings: ProjectSettings | null } }
    if (!payload.project.payload) {
      setSaveMessage('SQLite no tiene un diseño guardado todavía.')
      return
    }

    const saved = normalizeImportedDesign(payload.project.payload)
    if (!saved) {
      setSaveMessage('El diseño guardado no tiene un formato valido.')
      return
    }
    skipHistoryRef.current = true
    skipAutosaveRef.current = true
    applyDesign(saved)
    syncJsonEditorFromDesign(saved)
    applyProjectSettings(payload.project.settings)
    clearSelection()
    setTool('select')
    setHistory([])
    setFuture([])
    syncCurrentDesignSnapshot(saved)
    setActiveProjectName(payload.project.name)
    setAutosaveState('idle')
    setSaveMessage(`Proyecto "${payload.project.name}" cargado desde SQLite.`)
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

  const createProject = async () => {
    const name = window.prompt('Nombre del nuevo proyecto', `Proyecto ${projects.length + 1}`)
    if (!name) {
      return
    }

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      setSaveMessage('No se pudo crear el proyecto.')
      return
    }

    const payload = (await response.json()) as {
      project: { id: string; name: string; preview?: string | null }
    }
    setProjects((current) => [{ id: payload.project.id, name: payload.project.name, preview: payload.project.preview ?? null, updated_at: new Date().toISOString() }, ...current])
    setActiveProjectId(payload.project.id)
    setActiveProjectName(payload.project.name)
    skipAutosaveRef.current = true
    const clean = createDefaultDesign()
    const emptyDesign = {
      ...clean,
      roomPoints: [],
      freeWalls: [],
      doors: [],
      surfaces: [],
      stairs: [],
      isRoomClosed: false,
    }
    skipHistoryRef.current = true
    applyDesign(emptyDesign)
    syncJsonEditorFromDesign(emptyDesign)
    clearSelection()
    setTool('draw-room')
    setHistory([])
    setFuture([])
    syncCurrentDesignSnapshot(emptyDesign)
    applyProjectSettings(defaultProjectSettings)
    setAutosaveState('idle')
    setSaveMessage(`Proyecto "${payload.project.name}" creado.`)
  }

  const duplicateProject = async () => {
    const name = window.prompt('Nombre de la copia', `${activeProjectName} copia`)
    if (!name) {
      return
    }

    const createResponse = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (!createResponse.ok) {
      setSaveMessage('No se pudo duplicar el proyecto.')
      return
    }

    const created = (await createResponse.json()) as {
      project: { id: string; name: string; preview?: string | null }
    }

    await fetch(`/api/projects/${created.project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        design: persistableDesign,
        settings: projectSettings,
        preview: buildProjectPreview(persistableDesign),
      }),
    })

    setProjects((current) => [
      {
        id: created.project.id,
        name: created.project.name,
        preview: buildProjectPreview(persistableDesign),
        updated_at: new Date().toISOString(),
      },
      ...current,
    ])
    void openProject(created.project.id)
  }

  const renameProject = async () => {
    const name = window.prompt('Nuevo nombre del proyecto', activeProjectName)
    if (!name) {
      return
    }

    const response = await fetch(`/api/projects/${activeProjectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      setSaveMessage('No se pudo renombrar el proyecto.')
      return
    }

    const payload = (await response.json()) as {
      project: { id: string; name: string; updated_at: string; preview?: string | null }
    }
    setProjects((current) => current.map((project) => (project.id === payload.project.id ? payload.project : project)))
    setActiveProjectName(payload.project.name)
    skipAutosaveRef.current = true
    setAutosaveState('idle')
    setSaveMessage(`Proyecto renombrado a "${payload.project.name}".`)
  }

  const deleteActiveProject = async () => {
    if (activeProjectId === 'default') {
      setSaveMessage('El proyecto principal no se puede borrar.')
      return
    }

    const confirmed = window.confirm(`Borrar el proyecto "${activeProjectName}"?`)
    if (!confirmed) {
      return
    }

    const response = await fetch(`/api/projects/${activeProjectId}`, { method: 'DELETE' })
    if (!response.ok) {
      setSaveMessage('No se pudo borrar el proyecto.')
      return
    }

    const remaining = projects.filter((project) => project.id !== activeProjectId)
    setProjects(remaining)
    if (remaining[0]) {
      void openProject(remaining[0].id)
    } else {
      void openProject('default')
    }
  }

  const importDesignFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const saved = normalizeImportedDesign(JSON.parse(String(reader.result)))
        if (!saved) {
          setSaveMessage('El archivo JSON no tiene un formato compatible.')
          return
        }
        skipHistoryRef.current = true
        skipAutosaveRef.current = true
        applyDesign(saved)
        syncJsonEditorFromDesign(saved)
        clearSelection()
        setTool('select')
        setHistory([])
        setFuture([])
        syncCurrentDesignSnapshot(saved)
        setAutosaveState('idle')
        setSaveMessage(`JSON importado: ${file.name}`)
      } catch {
        setSaveMessage('El archivo JSON no tiene un formato valido.')
      }
    }
    reader.readAsText(file)
  }

  const resetScene = () => {
    const clean = createDefaultDesign()
    const emptyDesign = {
      ...clean,
      roomPoints: [],
      freeWalls: [],
      doors: [],
      surfaces: [],
      stairs: [],
      isRoomClosed: false,
    }
    setRoomPoints([])
    setFreeWalls([])
    setDoors([])
    setSurfaces([])
    setStairs([])
    setIsRoomClosed(false)
    clearSelection()
    setDraftWallStart(null)
    setTool('draw-room')
    skipAutosaveRef.current = true
    applyProjectSettings(defaultProjectSettings)
    setSceneStyle(clean.sceneStyle)
    syncJsonEditorFromDesign(emptyDesign)
    setHistory([])
    setFuture([])
    syncCurrentDesignSnapshot(emptyDesign)
    setAutosaveState('idle')
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
    selectEntity({ type: 'door', id: sample.doors[0].id })
    setDraftWallStart(null)
    setTool('select')
    skipAutosaveRef.current = true
    applyProjectSettings(defaultProjectSettings)
    setSceneStyle(sample.sceneStyle)
    syncJsonEditorFromDesign(sample)
    setHistory([])
    setFuture([])
    syncCurrentDesignSnapshot(sample)
    setAutosaveState('idle')
    setSaveMessage('Ejemplo cargado.')
  }

  const applyJsonEditor = () => {
    if (jsonInspection.errors.length > 0 || !jsonInspection.normalized) {
      setJsonEditorError(jsonInspection.errors[0] ?? 'El JSON no tiene un formato compatible con el editor.')
      return
    }

    skipHistoryRef.current = true
    skipAutosaveRef.current = true
    applyDesign(jsonInspection.normalized)
    syncJsonEditorFromDesign(jsonInspection.normalized)
    clearSelection()
    setTool('select')
    setHistory([])
    setFuture([])
    syncCurrentDesignSnapshot(jsonInspection.normalized)
    setAutosaveState('idle')
    setJsonEditorError('')
    setSaveMessage(
      jsonInspection.warnings.length > 0 ? 'JSON aplicado con ajustes de normalizacion.' : 'JSON aplicado al plano.',
    )
  }

  const zoomView = (factor: number) => {
    const nextWidth = clamp(viewBox.width * factor, minViewWidth, maxViewWidth)
    const nextHeight = (nextWidth / svgWidth) * svgHeight
    const centerX = viewBox.x + viewBox.width / 2
    const centerY = viewBox.y + viewBox.height / 2

    setViewBox({
      x: centerX - nextWidth / 2,
      y: centerY - nextHeight / 2,
      width: nextWidth,
      height: nextHeight,
    })
  }

  const resetNavigation = () => {
    setViewBox(defaultProjectSettings.planViewBox)
  }

  const panView = (direction: 'north' | 'south' | 'west' | 'east') => {
    const stepX = viewBox.width * 0.18
    const stepY = viewBox.height * 0.18

    setViewBox((current) => ({
      ...current,
      x: direction === 'west' ? current.x - stepX : direction === 'east' ? current.x + stepX : current.x,
      y: direction === 'north' ? current.y - stepY : direction === 'south' ? current.y + stepY : current.y,
    }))
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
      beginGestureHistory()
      setInteraction({ type: 'pan', originPointer: pointer.meters, originViewBox: viewBox })
      return
    }

    if (tool === 'surface' && event.button === 0) {
      const bounds = event.currentTarget.getBoundingClientRect()
      const pointer = pointToViewBox(event, viewBox, bounds)
      beginGestureHistory()
      const snapped = snapPoint(pointer.meters, event.ctrlKey || event.metaKey)
      setDragDraft({ type: 'surface', start: snapped, current: snapped })
      return
    }

    if (tool === 'stairs' && event.button === 0) {
      const bounds = event.currentTarget.getBoundingClientRect()
      const pointer = pointToViewBox(event, viewBox, bounds)
      beginGestureHistory()
      const snapped = snapPoint(pointer.meters, event.ctrlKey || event.metaKey)
      setDragDraft({ type: 'stairs', start: snapped, current: snapped })
    }
  }

  const handleCanvasPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointer = pointToViewBox(event, viewBox, bounds)
    const snapActive = event.ctrlKey || event.metaKey

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
      const snapped = snapPoint(pointer.meters, snapActive)
      setRoomPoints((current) => current.map((point) => (point.id === interaction.pointId ? { ...point, ...snapped } : point)))
      return
    }

    if (interaction?.type === 'free-wall-start') {
      const snapped = snapPoint(pointer.meters, snapActive, [`wall:${interaction.wallId}`])
      setFreeWalls((current) => current.map((wall) => (wall.id === interaction.wallId ? { ...wall, start: { ...wall.start, ...snapped } } : wall)))
      return
    }

    if (interaction?.type === 'free-wall-end') {
      const snapped = snapPoint(pointer.meters, snapActive, [`wall:${interaction.wallId}`])
      setFreeWalls((current) => current.map((wall) => (wall.id === interaction.wallId ? { ...wall, end: { ...wall.end, ...snapped } } : wall)))
      return
    }

    if (interaction?.type === 'free-wall-move') {
      const anchor = interaction.members.find((member) => member.type === 'wall')
      let dx = pointer.meters.x - interaction.originPointer.x
      let dy = pointer.meters.y - interaction.originPointer.y

      if (anchor?.type === 'wall') {
        const snapped = snapPoint(
          {
            x: anchor.originStart.x + dx,
            y: anchor.originStart.y + dy,
          },
          snapActive,
          interaction.members.map((member) => `${member.type}:${member.id}` as EntityKey),
        )
        dx = snapped.x - anchor.originStart.x
        dy = snapped.y - anchor.originStart.y
      }

      applyGroupMove(interaction.members, dx, dy)
      return
    }

    if (interaction?.type === 'surface-move') {
      const anchor = interaction.members.find((member) => member.type === 'surface')
      let dx = pointer.meters.x - interaction.originPointer.x
      let dy = pointer.meters.y - interaction.originPointer.y

      if (anchor?.type === 'surface') {
        const snapped = snapPoint(
          {
            x: anchor.originX + dx,
            y: anchor.originY + dy,
          },
          snapActive,
          interaction.members.map((member) => `${member.type}:${member.id}` as EntityKey),
        )
        dx = snapped.x - anchor.originX
        dy = snapped.y - anchor.originY
      }

      applyGroupMove(interaction.members, dx, dy)
      return
    }

    if (interaction?.type === 'stairs-move') {
      const anchor = interaction.members.find((member) => member.type === 'stairs')
      let dx = pointer.meters.x - interaction.originPointer.x
      let dy = pointer.meters.y - interaction.originPointer.y

      if (anchor?.type === 'stairs') {
        const snapped = snapPoint(
          {
            x: anchor.originX + dx,
            y: anchor.originY + dy,
          },
          snapActive,
          interaction.members.map((member) => `${member.type}:${member.id}` as EntityKey),
        )
        dx = snapped.x - anchor.originX
        dy = snapped.y - anchor.originY
      }

      applyGroupMove(interaction.members, dx, dy)
      return
    }

    if (dragDraft) {
      const snapped = snapPoint(pointer.meters, snapActive)
      setDragDraft((current) => (current ? { ...current, current: snapped } : current))
    }
  }

  const handleCanvasClick = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (interaction || dragDraft) {
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    const pointer = pointToViewBox(event, viewBox, bounds)
    const snapped = snapPoint(pointer.meters, event.ctrlKey || event.metaKey)

    if (tool === 'draw-room' && !isRoomClosed) {
      setRoomPoints((current) => [...current, { id: uid('rp'), ...snapped }])
      return
    }

    if (tool === 'wall') {
      if (!draftWallStart) {
        setDraftWallStart({ id: uid('fw-start'), ...snapped })
        return
      }

      const wall: WallSegment = { id: uid('fw'), start: draftWallStart, end: { id: uid('fw-end'), ...snapped }, color: '#d8c3b0' }
      setFreeWalls((current) => [...current, wall])
      selectEntity({ type: 'wall', id: wall.id })
      setDraftWallStart(null)
      return
    }

    if (tool === 'select') {
      clearSelection()
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
    selectEntity({ type: 'door', id: door.id })
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
          ? { ...surface, ...changes, x: roundToGrid(changes.x ?? surface.x), y: roundToGrid(changes.y ?? surface.y), width: Math.max(0.3, roundToGrid(changes.width ?? surface.width)), depth: Math.max(0.3, roundToGrid(changes.depth ?? surface.depth)), elevation: roundToGrid(changes.elevation ?? surface.elevation), thickness: roundToGrid(changes.thickness ?? surface.thickness) }
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
          ? { ...stair, ...changes, x: roundToGrid(changes.x ?? stair.x), y: roundToGrid(changes.y ?? stair.y), width: Math.max(0.3, roundToGrid(changes.width ?? stair.width)), depth: Math.max(0.3, roundToGrid(changes.depth ?? stair.depth)), fromElevation: roundToGrid(changes.fromElevation ?? stair.fromElevation), toElevation: roundToGrid(changes.toElevation ?? stair.toElevation), steps: Math.max(2, Math.round(changes.steps ?? stair.steps)) }
          : stair,
      ),
    )
  }

  const updateSelectedWall = (changes: Partial<WallSegment>) => {
    if (!selectedWall) {
      return
    }

    setFreeWalls((current) =>
      current.map((wall) =>
        wall.id === selectedWall.id
          ? {
              ...wall,
              ...changes,
              start: changes.start ? { ...changes.start, x: roundToGrid(changes.start.x), y: roundToGrid(changes.start.y) } : wall.start,
              end: changes.end ? { ...changes.end, x: roundToGrid(changes.end.x), y: roundToGrid(changes.end.y) } : wall.end,
            }
          : wall,
      ),
    )
  }

  const roomPolygon = roomPoints.map((point) => `${metersToSvg(point.x)},${metersToSvg(point.y)}`).join(' ')
  const draftRect = dragDraft ? normalizeRect(dragDraft.start, dragDraft.current) : null
  const viewZoomPercent = Math.round((svgWidth / viewBox.width) * 100)
  const ribbonSummary =
    activeTopMenu === 'project'
      ? activeProjectName
      : activeTopMenu === 'view'
        ? `${viewMode === '2d' ? 'Planta 2D' : 'Volumen 3D'} · zoom ${viewZoomPercent}%`
        : activeTopMenu === 'tools'
          ? `Herramienta ${tool}`
          : activeTopMenu === 'save'
            ? `Autosave ${autosaveState}`
            : `Muros ${wallHeight.toFixed(3)} m / ${wallThickness.toFixed(3)} m`

  return (
    <div className="app-shell">
      <nav className="cad-shell">
        <div className="cad-titlebar">
          <div className="cad-appbutton">P30</div>
          <div className="cad-titlemeta">
            <strong>Palencia 30</strong>
            <span>{ribbonSummary}</span>
          </div>
          <div className="cad-quicktools">
            <button className="cad-quickbutton" disabled={history.length === 0} onClick={undo} type="button">Undo</button>
            <button className="cad-quickbutton" disabled={future.length === 0} onClick={redo} type="button">Redo</button>
            <button className="cad-quickbutton" onClick={saveDesign} type="button">Guardar</button>
            <button className="cad-quickbutton" onClick={loadSample} type="button">Ejemplo</button>
          </div>
        </div>

        <div className="cad-tabs">
          <button className={`cad-tab ${activeTopMenu === 'project' ? 'cad-tab--active' : ''}`} onClick={() => setActiveTopMenu('project')} type="button">Proyecto</button>
          <button className={`cad-tab ${activeTopMenu === 'view' ? 'cad-tab--active' : ''}`} onClick={() => setActiveTopMenu('view')} type="button">Vista</button>
          <button className={`cad-tab ${activeTopMenu === 'tools' ? 'cad-tab--active' : ''}`} onClick={() => setActiveTopMenu('tools')} type="button">Dibujo</button>
          <button className={`cad-tab ${activeTopMenu === 'save' ? 'cad-tab--active' : ''}`} onClick={() => setActiveTopMenu('save')} type="button">Datos</button>
          <button className={`cad-tab ${activeTopMenu === 'scene' ? 'cad-tab--active' : ''}`} onClick={() => setActiveTopMenu('scene')} type="button">Escena</button>
        </div>

        <div className="cad-ribbon">
          {activeTopMenu === 'project' ? (
            <div className="cad-ribbon-panel">
              <section className="cad-group cad-group--wide">
                <span className="section-label">Proyecto activo</span>
                <label>
                  Activo
                  <select onChange={(event) => void openProject(event.target.value)} value={activeProjectId}>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="button-stack">
                  <button onClick={() => void createProject()} type="button">Nuevo proyecto</button>
                  <button onClick={() => void renameProject()} type="button">Renombrar</button>
                  <button onClick={() => void duplicateProject()} type="button">Duplicar</button>
                  <button className="danger" disabled={activeProjectId === 'default'} onClick={() => void deleteActiveProject()} type="button">Borrar</button>
                </div>
              </section>

              <section className="cad-group cad-group--wide">
                <span className="section-label">Proyectos</span>
                <div className="project-list">
                  {projects.map((project) => (
                    <button
                      className={`project-card ${project.id === activeProjectId ? 'project-card--active' : ''}`}
                      key={project.id}
                      onClick={() => void openProject(project.id)}
                      type="button"
                    >
                      {project.preview ? <img alt={project.name} className="project-preview" src={project.preview} /> : <div className="project-preview project-preview--empty">Sin preview</div>}
                      <span className="project-name">{project.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="cad-group cad-group--wide">
                <span className="section-label">Snapshots</span>
                <div className="button-stack">
                  <button onClick={() => void createSnapshot()} type="button">Crear snapshot</button>
                </div>
                <div className="snapshot-list">
                  {snapshots.length === 0 ? <p className="detail-text">Sin snapshots para este proyecto.</p> : null}
                  {snapshots.map((snapshot) => (
                    <button className="snapshot-card" key={snapshot.id} onClick={() => void openSnapshot(snapshot.id)} type="button">
                      {snapshot.preview ? <img alt={snapshot.name} className="project-preview" src={snapshot.preview} /> : <div className="project-preview project-preview--empty">Sin preview</div>}
                      <span className="project-name">{snapshot.name}</span>
                      <span className="snapshot-date">{new Date(snapshot.created_at).toLocaleString('es-ES')}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {activeTopMenu === 'view' ? (
            <div className="cad-ribbon-panel">
              <section className="cad-group">
                <span className="section-label">Vista</span>
                <div className="segmented">
                  <button className={viewMode === '2d' ? 'active' : ''} onClick={() => setViewMode('2d')} type="button">Planta 2D</button>
                  <button className={viewMode === '3d' ? 'active' : ''} onClick={() => setViewMode('3d')} type="button">Volumen 3D</button>
                </div>
              </section>

              <section className="cad-group">
                <span className="section-label">Navegacion</span>
                <div className="button-stack">
                  <button onClick={() => zoomView(0.85)} type="button">Zoom +</button>
                  <button onClick={() => zoomView(1.15)} type="button">Zoom -</button>
                  <button onClick={resetNavigation} type="button">Reencuadrar</button>
                </div>
                <p className="detail-text cad-mono">Zoom {viewZoomPercent}% · X {viewBox.x.toFixed(1)} · Y {viewBox.y.toFixed(1)}</p>
              </section>

              <section className="cad-group">
                <span className="section-label">Estado</span>
                <div className="stats">
                  <span>{roomPoints.length} vertices</span>
                  <span>{allWalls.length} muros</span>
                  <span>{surfaces.length} superficies</span>
                  <span>{stairs.length} escaleras</span>
                </div>
                <p className="detail-text">{activeProjectName} · {viewMode === '2d' ? 'Planta' : '3D'}</p>
              </section>

              <section className="cad-group">
                <span className="section-label">Paneles</span>
                <div className="button-stack">
                  <button className={propertiesOpen ? 'active' : ''} onClick={() => setPropertiesOpen((current) => !current)} type="button">
                    {propertiesOpen ? 'Ocultar propiedades' : 'Mostrar propiedades'}
                  </button>
                </div>
              </section>
            </div>
          ) : null}

          {activeTopMenu === 'tools' ? (
            <div className="cad-ribbon-panel">
              <section className="cad-group">
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
              </section>

              <section className="cad-group">
                <span className="section-label">Edicion</span>
                <div className="button-stack">
                  <button onClick={resetScene} type="button">Nuevo lienzo</button>
                  <button disabled={roomPoints.length < 3 || isRoomClosed} onClick={handleCloseRoom} type="button">Cerrar estancia</button>
                  <button disabled={selectedGroupableKeys.length < 2} onClick={groupSelected} type="button">Agrupar</button>
                  <button disabled={selectedGroups.length === 0} onClick={ungroupSelected} type="button">Desagrupar</button>
                </div>
              </section>
            </div>
          ) : null}

          {activeTopMenu === 'save' ? (
            <div className="cad-ribbon-panel">
              <section className="cad-group">
                <span className="section-label">Persistencia</span>
                <input accept="application/json" className="hidden-input" onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    importDesignFile(file)
                  }
                  event.currentTarget.value = ''
                }} ref={importInputRef} type="file" />
                <div className="button-stack">
                  <button onClick={saveDesign} type="button">Guardar diseño</button>
                  <button onClick={loadSavedDesign} type="button">Cargar guardado</button>
                  <button onClick={downloadDesign} type="button">Descargar JSON</button>
                  <button onClick={() => importInputRef.current?.click()} type="button">Importar JSON</button>
                  <button onClick={() => setJsonEditorOpen(true)} type="button">Editor JSON</button>
                </div>
                <div className="button-stack">
                  <button className="danger" disabled={selectedEntityKeys.length === 0} onClick={deleteSelected} type="button">Borrar seleccionado</button>
                </div>
                <p className="detail-text autosave-text">Autosave: {autosaveState}</p>
                <p className="detail-text">Ctrl/Cmd + click para multiseleccion. Ctrl/Cmd al mover o dibujar para enganchar.</p>
                {saveMessage ? <p className="detail-text save-message">{saveMessage}</p> : null}
              </section>
            </div>
          ) : null}

          {activeTopMenu === 'scene' ? (
            <div className="cad-ribbon-panel">
              <section className="cad-group">
                <span className="section-label">Escena</span>
                <label>
                  Altura de muros
                  <div className="inline-field">
                    <input max="4.5" min="2.2" onChange={(event) => setWallHeight(Number(event.target.value))} step={millimeterStep} type="range" value={wallHeight} />
                    <strong>{wallHeight.toFixed(3)} m</strong>
                  </div>
                </label>
                <label>
                  Grosor de muros
                  <div className="inline-field">
                    <input max="0.4" min="0.1" onChange={(event) => setWallThickness(Number(event.target.value))} step={millimeterStep} type="range" value={wallThickness} />
                    <strong>{wallThickness.toFixed(3)} m</strong>
                  </div>
                </label>
              </section>

              <section className="cad-group">
                <span className="section-label">Material</span>
                <label>
                  Color muros de estancia
                  <input onChange={(event) => setSceneStyle((current) => ({ ...current, roomWallColor: event.target.value }))} type="color" value={sceneStyle.roomWallColor} />
                </label>
                <label>
                  Color suelo principal
                  <input onChange={(event) => setSceneStyle((current) => ({ ...current, floorColor: event.target.value, roomFillColor: event.target.value }))} type="color" value={sceneStyle.floorColor} />
                </label>
              </section>
            </div>
          ) : null}
        </div>
      </nav>

      <main className="workspace">
        <div className={`properties-float ${propertiesOpen ? 'properties-float--open' : ''}`}>
          {propertiesOpen ? (
            <div className="properties-card">
              <span className="section-label">Seleccion</span>
              {selectedDoor ? (
                <>
                  <p className="detail-text">Puerta en {selectedDoor.wallId}</p>
                  <label>Offset <input className="small-input" min="0.4" onChange={(event) => updateSelectedDoor({ offset: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedDoor.offset} /></label>
                  <label>Ancho <input className="small-input" min="0.6" onChange={(event) => updateSelectedDoor({ width: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedDoor.width} /></label>
                  <label>Color <input onChange={(event) => updateSelectedDoor({ color: event.target.value })} type="color" value={selectedDoor.color} /></label>
                  <button className="danger" onClick={deleteSelected} type="button">Eliminar puerta</button>
                </>
              ) : null}
              {selectedWall ? (
                <>
                  <p className="detail-text">Muro libre</p>
                  <label>Inicio X <input className="small-input" onChange={(event) => updateSelectedWall({ start: { ...selectedWall.start, x: Number(event.target.value) } })} step={millimeterStep} type="number" value={selectedWall.start.x} /></label>
                  <label>Inicio Y <input className="small-input" onChange={(event) => updateSelectedWall({ start: { ...selectedWall.start, y: Number(event.target.value) } })} step={millimeterStep} type="number" value={selectedWall.start.y} /></label>
                  <label>Fin X <input className="small-input" onChange={(event) => updateSelectedWall({ end: { ...selectedWall.end, x: Number(event.target.value) } })} step={millimeterStep} type="number" value={selectedWall.end.x} /></label>
                  <label>Fin Y <input className="small-input" onChange={(event) => updateSelectedWall({ end: { ...selectedWall.end, y: Number(event.target.value) } })} step={millimeterStep} type="number" value={selectedWall.end.y} /></label>
                  <label>Color <input onChange={(event) => updateSelectedWall({ color: event.target.value })} type="color" value={selectedWall.color} /></label>
                  <button className="danger" onClick={deleteSelected} type="button">Eliminar muro</button>
                </>
              ) : null}
              {selectedSurface ? (
                <>
                  <p className="detail-text">{selectedSurface.label}</p>
                  <label>Nombre <input onChange={(event) => updateSelectedSurface({ label: event.target.value })} type="text" value={selectedSurface.label} /></label>
                  <label>X <input className="small-input" onChange={(event) => updateSelectedSurface({ x: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedSurface.x} /></label>
                  <label>Y <input className="small-input" onChange={(event) => updateSelectedSurface({ y: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedSurface.y} /></label>
                  <label>Ancho <input className="small-input" onChange={(event) => updateSelectedSurface({ width: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedSurface.width} /></label>
                  <label>Fondo <input className="small-input" onChange={(event) => updateSelectedSurface({ depth: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedSurface.depth} /></label>
                  <label>Cota <input className="small-input" onChange={(event) => updateSelectedSurface({ elevation: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedSurface.elevation} /></label>
                  <label>Espesor <input className="small-input" onChange={(event) => updateSelectedSurface({ thickness: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedSurface.thickness} /></label>
                  <label>Color <input onChange={(event) => updateSelectedSurface({ color: event.target.value })} type="color" value={selectedSurface.color} /></label>
                  <button className="danger" onClick={deleteSelected} type="button">Eliminar superficie</button>
                </>
              ) : null}
              {selectedStair ? (
                <>
                  <p className="detail-text">{selectedStair.label}</p>
                  <label>Nombre <input onChange={(event) => updateSelectedStair({ label: event.target.value })} type="text" value={selectedStair.label} /></label>
                  <label>X <input className="small-input" onChange={(event) => updateSelectedStair({ x: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedStair.x} /></label>
                  <label>Y <input className="small-input" onChange={(event) => updateSelectedStair({ y: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedStair.y} /></label>
                  <label>Ancho <input className="small-input" onChange={(event) => updateSelectedStair({ width: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedStair.width} /></label>
                  <label>Fondo <input className="small-input" onChange={(event) => updateSelectedStair({ depth: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedStair.depth} /></label>
                  <label>Cota origen <input className="small-input" onChange={(event) => updateSelectedStair({ fromElevation: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedStair.fromElevation} /></label>
                  <label>Cota destino <input className="small-input" onChange={(event) => updateSelectedStair({ toElevation: Number(event.target.value) })} step={millimeterStep} type="number" value={selectedStair.toElevation} /></label>
                  <label>Peldaños <input className="small-input" onChange={(event) => updateSelectedStair({ steps: Number(event.target.value) })} step="1" type="number" value={selectedStair.steps} /></label>
                  <label>Color <input onChange={(event) => updateSelectedStair({ color: event.target.value })} type="color" value={selectedStair.color} /></label>
                  <button className="danger" onClick={deleteSelected} type="button">Eliminar escalera</button>
                </>
              ) : null}
              {selectedEntityKeys.length === 0 ? <p className="detail-text">Selecciona un muro libre, puerta, superficie o escalera. Los muros libres, superficies y escaleras se pueden arrastrar en planta.</p> : null}
            </div>
          ) : null}
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
                    className={`surface-rect ${selectedEntityKeys.includes(`surface:${surface.id}`) ? 'surface-rect--selected' : ''}`}
                    height={metersToSvg(surface.depth)}
                    onClick={(event) => {
                      event.stopPropagation()
                      selectEntity({ type: 'surface', id: surface.id }, event.ctrlKey || event.metaKey)
                    }}
                    onPointerDown={(event) => {
                      if (tool !== 'select') return
                      event.stopPropagation()
                      const bounds = event.currentTarget.ownerSVGElement!.getBoundingClientRect()
                      const pointer = pointToViewBox(event as unknown as ReactPointerEvent<SVGSVGElement>, viewBox, bounds)
                      beginGestureHistory()
                      selectEntity({ type: 'surface', id: surface.id }, event.ctrlKey || event.metaKey)
                      setInteraction({ type: 'surface-move', entityKey: `surface:${surface.id}`, originPointer: pointer.meters, members: getGroupMoveMembers(`surface:${surface.id}`) })
                    }}
                    style={{ fill: `${surface.color}44`, stroke: surface.color }}
                    width={metersToSvg(surface.width)}
                    x={metersToSvg(surface.x)}
                    y={metersToSvg(surface.y)}
                  />
                  <text className="surface-label" x={metersToSvg(surface.x + surface.width / 2)} y={metersToSvg(surface.y + surface.depth / 2)}>{surface.label} +{surface.elevation.toFixed(3)} m</text>
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
                      className={`stairs-rect ${selectedEntityKeys.includes(`stairs:${stair.id}`) ? 'stairs-rect--selected' : ''}`}
                      height={depth}
                      onClick={(event) => {
                        event.stopPropagation()
                        selectEntity({ type: 'stairs', id: stair.id }, event.ctrlKey || event.metaKey)
                      }}
                      onPointerDown={(event) => {
                        if (tool !== 'select') return
                        event.stopPropagation()
                        const bounds = event.currentTarget.ownerSVGElement!.getBoundingClientRect()
                        const pointer = pointToViewBox(event as unknown as ReactPointerEvent<SVGSVGElement>, viewBox, bounds)
                        beginGestureHistory()
                        selectEntity({ type: 'stairs', id: stair.id }, event.ctrlKey || event.metaKey)
                        setInteraction({ type: 'stairs-move', entityKey: `stairs:${stair.id}`, originPointer: pointer.meters, members: getGroupMoveMembers(`stairs:${stair.id}`) })
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
                    <text className="surface-label" x={x + width / 2} y={y + depth / 2}>{stair.label} {stair.fromElevation.toFixed(3)}?{stair.toElevation.toFixed(3)} m</text>
                  </g>
                )
              })}

              {allWalls.map((wall) => {
                const start = toCanvas(wall.start)
                const end = toCanvas(wall.end)
                const isSelectedWall = selectedEntityKeys.includes(`wall:${wall.id.replace('free-', '')}`)

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
                          selectEntity({ type: 'wall', id: wall.id.replace('free-', '') })
                        }
                      }}
                      onPointerDown={(event) => {
                        if (tool !== 'select' || wall.kind !== 'free') return
                        event.stopPropagation()
                        const bounds = event.currentTarget.ownerSVGElement!.getBoundingClientRect()
                        const pointer = pointToViewBox(event as unknown as ReactPointerEvent<SVGSVGElement>, viewBox, bounds)
                        const rawWall = freeWalls.find((item) => item.id === wall.id.replace('free-', ''))
                        if (!rawWall) return
                        beginGestureHistory()
                        selectEntity({ type: 'wall', id: rawWall.id }, event.ctrlKey || event.metaKey)
                        setInteraction({ type: 'free-wall-move', entityKey: `wall:${rawWall.id}`, originPointer: pointer.meters, members: getGroupMoveMembers(`wall:${rawWall.id}`) })
                      }}
                      style={{ stroke: wall.color }}
                      x1={start.x}
                      x2={end.x}
                      y1={start.y}
                      y2={end.y}
                    />
                    <text className="wall-label" x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 12}>{wall.length.toFixed(3)} m</text>
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
                return <line className={`door-line ${selectedEntityKeys.includes(`door:${door.id}`) ? 'door-line--selected' : ''}`} key={door.id} onClick={(event) => { event.stopPropagation(); selectEntity({ type: 'door', id: door.id }, event.ctrlKey || event.metaKey) }} style={{ stroke: door.color }} x1={start.x} x2={end.x} y1={start.y} y2={end.y} />
              })}

              {roomPoints.map((point) => {
                const canvasPoint = toCanvas(point)
                return (
                  <g key={point.id}>
                    <circle className="point-handle" cx={canvasPoint.x} cy={canvasPoint.y} onPointerDown={(event) => { event.stopPropagation(); beginGestureHistory(); setInteraction({ type: 'room-point', pointId: point.id }); setTool('select') }} r={pointRadius} />
                    <text className="point-label" x={canvasPoint.x + 12} y={canvasPoint.y - 12}>{point.x.toFixed(3)}, {point.y.toFixed(3)}</text>
                  </g>
                )
              })}

              {freeWalls.map((wall) => {
                const start = toCanvas(wall.start)
                const end = toCanvas(wall.end)
                return (
                  <g key={`handles-${wall.id}`}>
                    <circle className="endpoint-handle" cx={start.x} cy={start.y} onPointerDown={(event) => { if (tool !== 'select') return; event.stopPropagation(); beginGestureHistory(); selectEntity({ type: 'wall', id: wall.id }, event.ctrlKey || event.metaKey); setInteraction({ type: 'free-wall-start', wallId: wall.id }) }} r="7" />
                    <circle className="endpoint-handle" cx={end.x} cy={end.y} onPointerDown={(event) => { if (tool !== 'select') return; event.stopPropagation(); beginGestureHistory(); selectEntity({ type: 'wall', id: wall.id }, event.ctrlKey || event.metaKey); setInteraction({ type: 'free-wall-end', wallId: wall.id }) }} r="7" />
                  </g>
                )
              })}

              {isRoomClosed && roomPoints.length > 2 ? <text className="centroid-label" x={metersToSvg(centroid.x)} y={metersToSvg(centroid.y)}>Estancia</text> : null}
              {draftRect ? <rect className={dragDraft?.type === 'surface' ? 'draft-surface' : 'draft-stairs'} height={metersToSvg(draftRect.depth)} width={metersToSvg(draftRect.width)} x={metersToSvg(draftRect.x)} y={metersToSvg(draftRect.y)} /> : null}
            </svg>
          </div>
        ) : (
          <div className="canvas-card canvas-card--three">
            <Scene3D {...persistableDesign} onOrbitChange={setOrbit} orbit={orbit} />
          </div>
        )}

        {viewMode === '2d' ? (
          <>
            <div className="navigation-widget">
              <div className="navigation-compass">
                <button className="navigation-direction navigation-north" onClick={() => panView('north')} type="button">N</button>
                <button className="navigation-direction navigation-west" onClick={() => panView('west')} type="button">O</button>
                <button className="navigation-direction navigation-east" onClick={() => panView('east')} type="button">E</button>
                <button className="navigation-direction navigation-south" onClick={() => panView('south')} type="button">S</button>
                <button className="navigation-compass-center" onClick={resetNavigation} type="button">TOP</button>
              </div>
              <div className="navigation-dock">
                <button onClick={() => zoomView(0.85)} type="button">+</button>
                <button onClick={() => zoomView(1.15)} type="button">-</button>
                <button onClick={resetNavigation} type="button">Home</button>
              </div>
            </div>

            <div className="axis-widget">
              <span className="axis-widget__y">Y</span>
              <span className="axis-widget__x">X</span>
            </div>
          </>
        ) : null}

        <div className="workspace-statusbar">
          <span>MODELO</span>
          <span>{viewMode === '2d' ? '2D' : '3D'}</span>
          <span>{tool}</span>
          <span>{activeProjectName}</span>
          <span>{viewMode === '2d' ? `Zoom ${viewZoomPercent}%` : `Orbit ${orbit.position.map((value) => value.toFixed(1)).join(', ')}`}</span>
          <span>{autosaveState}</span>
        </div>

        {jsonEditorOpen ? (
          <div className="modal-backdrop" onClick={() => setJsonEditorOpen(false)} role="presentation">
            <div
              className="modal-panel"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Editor JSON"
            >
              <div className="modal-header">
                <div>
                  <strong>Editor JSON</strong>
                  <p className="detail-text">Edicion numerica del plano y validacion antes de aplicar.</p>
                </div>
                <button onClick={() => setJsonEditorOpen(false)} type="button">Cerrar</button>
              </div>

              <div className="json-editor json-editor--modal">
                <div className="json-editor-header">
                  <span className="section-label">Diseño</span>
                  <div className="button-stack json-editor-actions">
                    <button onClick={() => syncJsonEditorFromDesign(persistableDesign)} type="button">Volcar actual</button>
                    <button onClick={() => {
                      try {
                        const formatted = JSON.stringify(JSON.parse(jsonEditorText), null, 2)
                        setJsonEditorText(formatted)
                        setJsonEditorError('')
                      } catch {
                        setJsonEditorError('No se puede formatear un JSON invalido.')
                      }
                    }} type="button">Formatear</button>
                    <button disabled={jsonInspection.errors.length > 0 || !jsonInspection.normalized} onClick={applyJsonEditor} type="button">Aplicar JSON</button>
                  </div>
                </div>
                <textarea
                  onChange={(event) => {
                    setJsonEditorText(event.target.value)
                    if (jsonEditorError) {
                      setJsonEditorError('')
                    }
                  }}
                  spellCheck={false}
                  value={jsonEditorText}
                />
                <div className="json-editor-status">
                  <p className="detail-text json-editor-summary">
                    {jsonInspection.errors.length > 0
                      ? `Errores: ${jsonInspection.errors.length}`
                      : jsonInspection.warnings.length > 0
                        ? `Listo para aplicar con ${jsonInspection.warnings.length} ajustes`
                        : 'Listo para aplicar sin cambios forzados'}
                  </p>
                  {jsonInspection.errors.length > 0 ? (
                    <ul className="json-editor-list json-editor-list--error">
                      {jsonInspection.errors.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  ) : null}
                  {jsonInspection.warnings.length > 0 ? (
                    <ul className="json-editor-list json-editor-list--warning">
                      {jsonInspection.warnings.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {jsonEditorError ? <p className="detail-text json-editor-error">{jsonEditorError}</p> : null}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default App

