import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'

interface TerrainViewerProps {
  activePoint: number
  onSelectPoint: (idx: number) => void
}

function TerrainModel({ activePoint, onSelectPoint }: TerrainViewerProps) {
  const { scene } = useGLTF('/software/NewTerreain_006.glb')
  const groupRef = useRef<THREE.Group>(null)

  // Gentle subtle rotation for cinematic effect
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05
    }
  })

  // Three telemetry coordinates located on the terrain model
  const hotspots = [
    { id: 0, label: '01', title: 'Structural Fault', pos: [-1.2, 0.4, 0.8], color: '#f59e0b' },
    { id: 1, label: '02', title: 'Sediment Drift', pos: [1.1, -0.2, -0.6], color: '#10b981' },
    { id: 2, label: '03', title: 'Erosion Scarp', pos: [0.3, 0.8, -1.2], color: '#ef4444' }
  ]

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]} position={[0, -0.2, 0]}>
      <primitive object={scene} />

      {/* Telemetry Hotspot HTML Pins */}
      {hotspots.map((spot) => {
        const isSelected = activePoint === spot.id
        return (
          <group key={spot.id} position={spot.pos as [number, number, number]}>
            <Html center distanceFactor={8}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectPoint(spot.id)
                }}
                className={`group flex items-center gap-1.5 px-2 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[#24363F] text-white border-white/40 scale-110 shadow-lg'
                    : 'bg-white/80 text-[#24363F] border-[#24363F]/20 hover:bg-white hover:scale-105'
                }`}
              >
                <span
                  className="size-1.5 rounded-full animate-ping"
                  style={{ backgroundColor: spot.color }}
                />
                <span className="font-bold">{spot.label}</span>
                <span className="hidden sm:inline opacity-80">{spot.title}</span>
              </button>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

export const TerrainViewer: React.FC<TerrainViewerProps> = (props) => {
  return (
    <div className="w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden bg-[#f4f7f8] border border-[#24363F]/15 relative">
      {/* Top HUD overlay */}
      <div className="absolute top-4 left-4 z-10 font-mono text-[11px] text-[#24363F]/70 flex items-center gap-2 bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded border border-[#24363F]/10">
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>POINT CLOUD TERRAIN RECONSTRUCTION // 3D VIEWER</span>
      </div>

      <div className="absolute top-4 right-4 z-10 font-mono text-[10px] text-[#24363F]/50 hidden sm:block">
        DRAG TO ORBIT // SCROLL TO ZOOM
      </div>

      <Canvas
        camera={{ position: [2.5, 2.2, 3.5], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#8F979B" />
        <TerrainModel {...props} />
        <OrbitControls
          enablePan={false}
          minDistance={1.8}
          maxDistance={6.0}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/software/NewTerreain_006.glb')

