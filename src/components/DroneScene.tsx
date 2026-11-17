import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface DroneSceneProps {
  scrollProgress: number // 0 to 1
  mousePos: { x: number; y: number }
}

const FPS = 30
const TOTAL_FRAMES = 1038
const REVEAL_START_FRAME = 184
const REVEAL_FRAMES = 196
const HERO_END_FRAME = 350
const CAP_SCAN_START_FRAME = 424
const CAP_SCAN_END_FRAME = 564
const LANDING_START_FRAME = 855
const LANDING_END_FRAME = 995
const PROPELLER_SPEED = 75.4
const GIMBAL_LERP = 0.08
const REVEAL_DURATION_S = 1.1

function DroneModelInstance({ scrollProgress, mousePos }: DroneSceneProps) {
  const { scene, animations, cameras } = useGLTF('/drone/drone.glb')
  const { camera: activeCamera, size } = useThree()
  
  const groupRef = useRef<THREE.Group>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const actionRef = useRef<THREE.AnimationAction | null>(null)
  
  const [revealDone, setRevealDone] = useState(false)
  const revealTimeRef = useRef(0)
  const smoothedProgressRef = useRef(REVEAL_START_FRAME / TOTAL_FRAMES)

  // Retrieve Camera.001 (camera index 0 in cameras array)
  const glbCam = useMemo(() => {
    if (cameras && cameras.length > 0) return cameras[0]
    let found: THREE.Camera | null = null
    scene.traverse((child) => {
      if (!found && child instanceof THREE.PerspectiveCamera) found = child
    })
    return found
  }, [cameras, scene])

  // Setup AnimationMixer
  useEffect(() => {
    if (animations && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(scene)
      
      // Linear interpolation on all tracks for silky smooth scrubbing
      animations.forEach((clip) => {
        clip.tracks.forEach((track) => {
          track.setInterpolation(THREE.InterpolateLinear)
        })
      })

      const clip = animations[0]
      const action = mixer.clipAction(clip)
      action.play()
      // Keep action enabled but scrub time directly
      action.time = (REVEAL_START_FRAME / FPS)
      mixer.update(0)
      
      mixerRef.current = mixer
      actionRef.current = action
    }
  }, [scene, animations])

  // Identify CW and CCW motors
  const motorNodes = useMemo(() => {
    const list: { node: THREE.Object3D; dir: number }[] = []
    const cwNames = ["FR_Motor_1", "FR_Motor", "RL_Motor", "FR_Propeller_1", "FR_Propeller_3", "RL_Propeller", "RL_Propeller_2"]
    const ccwNames = ["FL_Motor_1", "RR_Motor_1", "FL_Propeller", "FL_Propeller_2", "RR_Propeller", "RR_Propeller_2"]

    scene.traverse((child) => {
      const name = child.name
      if (cwNames.some((cw) => name.includes(cw))) {
        list.push({ node: child, dir: -1 })
      } else if (ccwNames.some((ccw) => name.includes(ccw))) {
        list.push({ node: child, dir: 1 })
      } else if (name.toLowerCase().includes('propeller')) {
        list.push({ node: child, dir: 1 })
      }
    })
    return list
  }, [scene])

  // Gimbal nodes
  const gimbalYawNode = useMemo(() => {
    let node: THREE.Object3D | null = null
    scene.traverse((c) => {
      if (c.name === 'Camera_leftRight') node = c
    })
    return node
  }, [scene])

  const gimbalPitchNode = useMemo(() => {
    let node: THREE.Object3D | null = null
    scene.traverse((c) => {
      if (c.name === 'Camera_ UPDOWN' || c.name.includes('UPDOWN')) node = c
    })
    return node
  }, [scene])

  // Enhance LEDs and materials
  useEffect(() => {
    scene.traverse((c) => {
      if (c instanceof THREE.Mesh) {
        if (c.name.includes('BatteryLightGreen')) {
          if (c.material) {
            c.material.emissive = new THREE.Color('#10b981')
            c.material.emissiveIntensity = 3.0
          }
        }
        if (c.material && c.material.name === 'DarkGlass') {
          c.material.roughness = 0.05
          c.material.metalness = 0.95
        }
      }
    })
  }, [scene])

  // Laser beam group
  const laserRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!actionRef.current || !mixerRef.current || animations.length === 0) return

    const totalDuration = animations[0].duration
    const p = Math.round(totalDuration * FPS) // 1038
    const v = REVEAL_START_FRAME / p // 0.1772
    const b = REVEAL_FRAMES / p      // 0.1888
    const y = HERO_END_FRAME / p     // 0.3371

    // 1. Initial Unfold Reveal on Load
    if (!revealDone) {
      revealTimeRef.current += Math.min(delta, 1 / 30)
      const t = Math.min(revealTimeRef.current / REVEAL_DURATION_S, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      smoothedProgressRef.current = v + (b - v) * ease
      if (t >= 1) {
        setRevealDone(true)
      }
    } else {
      // 2. Continuous Scroll Timeline Mapping
      const targetProgress = b + scrollProgress * (1 - b)
      const lerpSpeed = 1 - Math.pow(1 - 0.08, 60 * delta)
      smoothedProgressRef.current += (targetProgress - smoothedProgressRef.current) * lerpSpeed
    }

    // 3. Update Animation Action Time
    const currentSimTime = THREE.MathUtils.clamp(
      smoothedProgressRef.current * totalDuration,
      0,
      totalDuration - 0.001
    )
    actionRef.current.time = currentSimTime
    mixerRef.current.update(0)

    // 4. Synchronize Active Three.js Camera with GLB Camera.001
    if (glbCam && activeCamera) {
      glbCam.updateWorldMatrix(true, false)

      // Set world position and quaternion directly from glbCam's world matrix
      activeCamera.position.setFromMatrixPosition(glbCam.matrixWorld)
      activeCamera.quaternion.setFromRotationMatrix(glbCam.matrixWorld)

      if (glbCam instanceof THREE.PerspectiveCamera && activeCamera instanceof THREE.PerspectiveCamera) {
        activeCamera.near = 0.1
        activeCamera.far = 10000
        activeCamera.aspect = size.width / size.height

        // Responsive FOV based on aspect ratio
        const l = Math.min(size.height, size.width / 1.5)
        const u = window.innerWidth < 1024 ? 1.15 : 1
        const h = 2 * Math.atan(
          (size.height / (Math.min(l, window.innerWidth) * u)) *
          Math.tan(THREE.MathUtils.degToRad(glbCam.fov) / 2)
        )
        activeCamera.fov = THREE.MathUtils.radToDeg(h)
        activeCamera.updateProjectionMatrix()
      }
    }

    // 5. Motor and Propeller Rotation
    const isLanded = smoothedProgressRef.current >= (LANDING_END_FRAME / TOTAL_FRAMES)
    if (!isLanded) {
      motorNodes.forEach(({ node, dir }) => {
        node.rotation.y += PROPELLER_SPEED * delta * dir
      })
    }

    // 6. Gimbal Mouse Follow
    if (gimbalYawNode) {
      gimbalYawNode.rotation.y = THREE.MathUtils.lerp(
        gimbalYawNode.rotation.y,
        mousePos.x * 0.45,
        GIMBAL_LERP
      )
    }
    if (gimbalPitchNode) {
      gimbalPitchNode.rotation.x = THREE.MathUtils.lerp(
        gimbalPitchNode.rotation.x,
        mousePos.y * 0.3 - 0.15,
        GIMBAL_LERP
      )
    }

    // 7. LiDAR Scanning Beam Animation
    if (laserRef.current) {
      const currentFrame = smoothedProgressRef.current * TOTAL_FRAMES
      const isScanActive = currentFrame >= CAP_SCAN_START_FRAME && currentFrame <= CAP_SCAN_END_FRAME + 20
      laserRef.current.visible = isScanActive
      if (isScanActive) {
        laserRef.current.rotation.y += delta * 2.8
      }
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />

      {/* Holographic Green LiDAR Scan Cone */}
      <group ref={laserRef} position={[0, -0.2, 0.45]} visible={false}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[2.4, 4.0, 32, 1, true]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.18}
            wireframe
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[Math.PI, 0, 0]} position={[0, -2.0, 0]}>
          <cylinderGeometry args={[0.02, 2.0, 4.0, 16, 1, true]} />
          <meshBasicMaterial
            color="#34d399"
            transparent
            opacity={0.07}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  )
}

export const DroneScene: React.FC<DroneSceneProps> = (props) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      <Canvas
        dpr={[1, 2]}
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        className="w-full h-full pointer-events-none"
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[6, 10, 8]} intensity={2.4} />
        <directionalLight position={[-6, -4, -6]} intensity={0.9} color="#94a3b8" />
        <directionalLight position={[0, -5, 2]} intensity={0.5} color="#64748b" />
        <pointLight position={[0, 1.5, 2]} intensity={0.6} />

        <DroneModelInstance {...props} />
        <Environment files="/drone/drone-env.jpg" environmentIntensity={3.6} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/drone/drone.glb')
