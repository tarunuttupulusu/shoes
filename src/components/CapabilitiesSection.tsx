import React, { useState } from 'react'
import { Radar, Wifi, Minimize2 } from 'lucide-react'

export const CapabilitiesSection: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'scan' | 'connection' | 'compactness'>('scan')

  return (
    <section id="capabilities" className="relative bg-white px-4 md:px-8 py-20 flex flex-col justify-between border-t border-[#24363F]/20">
      {/* Massive Section Title "Capabilities" + Badge 5 */}
      <div className="flex items-start justify-between pb-8 border-b border-[#24363F]/20 w-full">
        <h2 className="font-light text-[56px] sm:text-[110px] lg:text-[180px] leading-[0.85] tracking-[-0.05em] text-[#24363F] select-none">
          Capabilities
        </h2>
        <div className="border border-[#24363F]/25 flex items-center justify-center px-4 h-9 rounded-full shrink-0 font-mono text-sm text-[#24363F]/70">
          5
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 items-center">
        {/* Left Side: Mode Selection */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="font-mono text-xs text-[#24363F]/60 flex items-center gap-2">
            <span className="text-[#24363F]/40">[</span>
            <span>AIRFRAME & SENSOR MODALITIES</span>
            <span className="text-[#24363F]/40">]</span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-light text-[#24363F] leading-tight">
            High-density sensing. <br />
            <span className="font-semibold text-[#24363F]">Zero compromise.</span>
          </h3>

          <div className="flex flex-col gap-3 pt-4 relative z-30 pointer-events-auto">
            <button
              onClick={() => setActiveMode('scan')}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer ${
                activeMode === 'scan'
                  ? 'bg-[#FDFDFD] border-[#24363F]/30 shadow-md translate-x-2'
                  : 'bg-transparent border-transparent hover:bg-[#FDFDFD]'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="font-semibold text-[#24363F] flex items-center gap-2">
                  <Radar className="size-4 text-emerald-600" />
                  01 // SCAN
                </span>
                <span className="text-emerald-600 font-mono">ACTIVE</span>
              </div>
              <p className="text-xs text-[#24363F]/70 font-light">
                Full-hemisphere point acquisition at 240,000 pts/s across vegetation and terrain.
              </p>
            </button>

            <button
              onClick={() => setActiveMode('connection')}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer ${
                activeMode === 'connection'
                  ? 'bg-[#FDFDFD] border-[#24363F]/30 shadow-md translate-x-2'
                  : 'bg-transparent border-transparent hover:bg-[#FDFDFD]'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="font-semibold text-[#24363F] flex items-center gap-2">
                  <Wifi className="size-4 text-sky-600" />
                  02 // CONNECTION
                </span>
                <span className="text-sky-600 font-mono">ENCRYPTED</span>
              </div>
              <p className="text-xs text-[#24363F]/70 font-light">
                Low-latency encrypted telemetry uplink with 20 km line-of-sight.
              </p>
            </button>

            <button
              onClick={() => setActiveMode('compactness')}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer ${
                activeMode === 'compactness'
                  ? 'bg-[#FDFDFD] border-[#24363F]/30 shadow-md translate-x-2'
                  : 'bg-transparent border-transparent hover:bg-[#FDFDFD]'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="font-semibold text-[#24363F] flex items-center gap-2">
                  <Minimize2 className="size-4 text-indigo-600" />
                  03 // COMPACTNESS
                </span>
                <span className="text-indigo-600 font-mono">PORTABLE</span>
              </div>
              <p className="text-xs text-[#24363F]/70 font-light">
                Carbon-composite airframe folding to 42 cm for one-operator setup.
              </p>
            </button>
          </div>
        </div>

        {/* Right Side: Mode Preview */}
        <div className="lg:col-span-7 bg-[#FDFDFD] p-8 sm:p-12 rounded-2xl border border-[#24363F]/15 shadow-sm min-h-[380px] flex flex-col justify-between">
          {activeMode === 'scan' && (
            <div className="flex flex-col justify-between h-full gap-8">
              <div className="flex justify-between items-start font-mono text-xs text-[#24363F]/60 border-b border-[#24363F]/10 pb-4">
                <span>[ SPATIAL LASER SCANNER ]</span>
                <span className="text-emerald-600 font-semibold">STATUS: EMITTING</span>
              </div>

              <div>
                <div className="text-6xl sm:text-7xl font-light text-[#24363F] tracking-tight mb-2">
                  360°
                </div>
                <div className="font-mono text-xs text-emerald-600 uppercase tracking-widest mb-4">
                  FULL-HEMISPHERE POINT CLOUD
                </div>
                <p className="text-lg text-[#24363F]/80 font-light leading-relaxed max-w-lg">
                  Full-hemisphere LiDAR capture at 240,000 points per second across terrain, structures and vegetation in a single pass.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#24363F]/10 font-mono text-xs">
                <div>
                  <span className="text-[#24363F]/40 block text-[10px]">WAVELENGTH</span>
                  <span className="text-[#24363F] font-semibold">905 nm</span>
                </div>
                <div>
                  <span className="text-[#24363F]/40 block text-[10px]">PULSE FREQ</span>
                  <span className="text-[#24363F] font-semibold">240 kHz</span>
                </div>
                <div>
                  <span className="text-[#24363F]/40 block text-[10px]">BEAM DIVERGENCE</span>
                  <span className="text-[#24363F] font-semibold">0.28 × 0.03 mrad</span>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'connection' && (
            <div className="flex flex-col justify-between h-full gap-8">
              <div className="flex justify-between items-start font-mono text-xs text-[#24363F]/60 border-b border-[#24363F]/10 pb-4">
                <span>[ SECURE TELEMETRY UPLINK ]</span>
                <span className="text-sky-600 font-semibold">STATUS: LINKED</span>
              </div>

              <div>
                <div className="text-6xl sm:text-7xl font-light text-[#24363F] tracking-tight mb-2">
                  20 km
                </div>
                <div className="font-mono text-xs text-sky-600 uppercase tracking-widest mb-4">
                  OCUSYNC 4.0 + 5G CELLULAR REDUNDANCY
                </div>
                <p className="text-lg text-[#24363F]/80 font-light leading-relaxed max-w-lg">
                  Direct encrypted point cloud and 4K radiometric video feed streaming to cloud processing servers with automatic failover.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#24363F]/10 font-mono text-xs">
                <div>
                  <span className="text-[#24363F]/40 block text-[10px]">ENCRYPTION</span>
                  <span className="text-[#24363F] font-semibold">AES-256</span>
                </div>
                <div>
                  <span className="text-[#24363F]/40 block text-[10px]">LATENCY</span>
                  <span className="text-[#24363F] font-semibold">&lt; 120 ms</span>
                </div>
                <div>
                  <span className="text-[#24363F]/40 block text-[10px]">BANDWIDTH</span>
                  <span className="text-[#24363F] font-semibold">15 MB/s Live</span>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'compactness' && (
            <div className="flex flex-col justify-between h-full gap-8">
              <div className="flex justify-between items-start font-mono text-xs text-[#24363F]/60 border-b border-[#24363F]/10 pb-4">
                <span>[ ULTRA-COMPACT FORM FACTOR ]</span>
                <span className="text-indigo-600 font-semibold">FOLD STATUS: LOCKED</span>
              </div>

              <div>
                <div className="text-6xl sm:text-7xl font-light text-[#24363F] tracking-tight mb-2">
                  42 cm
                </div>
                <div className="font-mono text-xs text-indigo-600 uppercase tracking-widest mb-4">
                  FOLDED FOOTPRINT
                </div>
                <p className="text-lg text-[#24363F]/80 font-light leading-relaxed max-w-lg">
                  Carbon-fiber folding airframe engineered for backcountry transport and instant deployment by a single field engineer.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#24363F]/10 font-mono text-xs">
                <div>
                  <span className="text-[#24363F]/40 block text-[10px]">DEPLOY TIME</span>
                  <span className="text-[#24363F] font-semibold">&lt; 90 sec</span>
                </div>
                <div>
                  <span className="text-[#24363F]/40 block text-[10px]">AIRFRAME MTOW</span>
                  <span className="text-[#24363F] font-semibold">6.3 kg</span>
                </div>
                <div>
                  <span className="text-[#24363F]/40 block text-[10px]">CASE VOLUME</span>
                  <span className="text-[#24363F] font-semibold">PELICAN AIR 1615</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
