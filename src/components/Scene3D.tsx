import { useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { getDoorSegments, getFreeWalls, getRoomWalls } from '../editor/design'
import type { OrbitState, PersistedDesign } from '../editor/types'

type OrbitControlsImplLike = {
  target: { x: number; y: number; z: number; set: (x: number, y: number, z: number) => void }
  update: () => void
}

function OrbitSync({ orbit }: { orbit: OrbitState }) {
  const { camera, controls } = useThree()

  useEffect(() => {
    camera.position.set(...orbit.position)
    if (controls && 'target' in controls) {
      ;(controls as OrbitControlsImplLike).target.set(...orbit.target)
      ;(controls as OrbitControlsImplLike).update()
    }
  }, [camera, controls, orbit])

  return null
}

type Scene3DProps = PersistedDesign & {
  orbit: OrbitState
  onOrbitChange: (orbit: OrbitState) => void
}

export function Scene3D({
  roomPoints,
  isRoomClosed,
  freeWalls,
  doors,
  surfaces,
  stairs,
  wallThickness,
  wallHeight,
  sceneStyle,
  orbit,
  onOrbitChange,
}: Scene3DProps) {
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

  const walls = useMemo(
    () => [...getRoomWalls(roomPoints, isRoomClosed, sceneStyle.roomWallColor), ...getFreeWalls(freeWalls)],
    [freeWalls, isRoomClosed, roomPoints, sceneStyle.roomWallColor],
  )

  return (
    <Canvas camera={{ position: orbit.position, fov: 42 }}>
      <color attach="background" args={['#efe6d6']} />
      <OrbitSync orbit={orbit} />
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

      <OrbitControls
        makeDefault
        maxDistance={22}
        minDistance={3}
        onEnd={(event) => {
          const control = event.target as OrbitControlsImplLike & {
            object: { position: { x: number; y: number; z: number } }
          }
          onOrbitChange({
            position: [control.object.position.x, control.object.position.y, control.object.position.z],
            target: [(control.target as { x: number }).x, (control.target as { y: number }).y, (control.target as { z: number }).z],
          })
        }}
      />
      <GizmoHelper alignment="bottom-right" margin={[84, 84]}>
        <GizmoViewport axisColors={['#d06a35', '#3f6a52', '#7a4034']} labelColor="#f8f1e5" />
      </GizmoHelper>
    </Canvas>
  )
}
