import React from 'react'
import { ChevronDown, Radio, ShieldCheck } from 'lucide-react'

interface HeroProps {
  onScrollClick: () => void
}

export const Hero: React.FC<HeroProps> = ({ onScrollClick }) => {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between pt-24 pb-12 px-4 md:px-8 pointer-events-none select-none overflow-hidden">
      {/* Giant Aevion SVG background watermark */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl opacity-25 pointer-events-none z-0">
        <img
          src="/hero/aevion.svg"
          alt="aevion watermark"
          className="w-full h-auto select-none"
        />
      </div>

      {/* Top telemetry grid info */}
      <div className="w-full flex justify-between items-start pt-4 text-[11px] font-mono text-[#24363F]/60 z-10">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-[#24363F]/90 font-medium">
            <Radio className="size-3 text-emerald-600 animate-pulse" />
            SYS.STATUS: READY / AIRBORNE
          </span>
          <span className="text-[#24363F]/50">LAT: 36.5785° N // LON: 118.2923° W</span>
          <span className="text-[#24363F]/50">ELEV: +1,240M MSL // HDOP: 0.8</span>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1 text-right">
          <span className="flex items-center gap-1 text-[#24363F]/90 font-medium">
            <ShieldCheck className="size-3 text-emerald-600" />
            FAILSAFE: RTH ENGAGED
          </span>
          <span className="text-[#24363F]/50">PAYLOAD: ZENMUSE L2 LIDAR</span>
          <span className="text-[#24363F]/50">LINK: OCUSYNC 4.0 [AES-256]</span>
        </div>
      </div>

      {/* Main Headline */}
      <div className="my-auto max-w-4xl flex flex-col gap-4 z-10 pointer-events-auto">
        <div className="inline-flex items-center gap-2 font-mono text-xs text-[#24363F]/70 tracking-wider">
          <span className="size-1.5 bg-[#24363F]"></span>
          <span>TECH DEMO BY RIOTTERS</span>
          <span className="text-[#24363F]/30">—</span>
          <span className="text-[#24363F]/50">3D LIDAR SURVEILLANCE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-[-0.04em] text-[#24363F] leading-[0.95]">
          Autonomous <br className="hidden sm:inline" />
          <span className="font-semibold italic">LIDAR</span> inspection systems.
        </h1>

        <p className="text-lg sm:text-2xl font-light text-[#24363F]/75 max-w-xl leading-relaxed pt-2">
          Precision that secures critical infrastructure.
        </p>
      </div>

      {/* Bottom controls / Scroll prompt */}
      <div className="w-full flex justify-between items-end border-t border-[#24363F]/15 pt-6 pointer-events-auto z-10">
        <div className="flex items-center gap-6 font-mono text-[11px] text-[#24363F]/60">
          <div>
            <span className="text-[#24363F]/40">[</span>
            <span className="text-[#24363F]/90 font-medium"> POINT DENSITY </span>
            <span className="text-[#24363F]/40">]</span>
            <div className="text-[#24363F] text-sm font-semibold tracking-tight">240,000 pts/sec</div>
          </div>
          <div className="hidden sm:block">
            <span className="text-[#24363F]/40">[</span>
            <span className="text-[#24363F]/90 font-medium"> RANGE ACCURACY </span>
            <span className="text-[#24363F]/40">]</span>
            <div className="text-[#24363F] text-sm font-semibold tracking-tight">±2 cm @ 150m</div>
          </div>
        </div>

        <button
          onClick={onScrollClick}
          className="group flex items-center gap-3 px-5 py-3 rounded-full bg-[#24363F] text-white hover:bg-[#24363F]/90 transition-all font-mono text-xs tracking-wider uppercase cursor-pointer shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px]"
        >
          <span>Scroll Down</span>
          <ChevronDown className="size-4 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </section>
  )
}
