import React from 'react'

interface HeaderProps {
  telemetryState?: string
  fps?: number
}

export const Header: React.FC<HeaderProps> = ({ 
  telemetryState = "ACTIVE",
  fps = 30
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 md:px-8 font-mono text-[11px] md:text-[12px] tracking-tight uppercase text-[#24363F]/80 backdrop-blur-md bg-[#FDFDFD]/75 border-b border-[#24363F]/10">
      {/* Brand / Title */}
      <div className="flex items-center gap-3">
        <a 
          href="#top" 
          className="font-bold text-[#24363F] hover:opacity-70 transition-opacity flex items-center gap-1.5"
        >
          <span className="text-[#24363F]/40">[</span>
          <span>aevion</span>
          <span className="text-[#24363F]/40">]</span>
        </a>
        <div className="hidden sm:flex items-center gap-2 text-[#24363F]/50 pl-2 border-l border-[#24363F]/20">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIDAR DRONE SCANNING</span>
        </div>
      </div>

      {/* Center meta info */}
      <div className="hidden lg:flex items-center gap-6 text-[#24363F]/60">
        <span className="text-[#24363F]/40">[</span>
        <span className="tracking-widest">AUTONOMOUS INFRASTRUCTURE SURVEY</span>
        <span className="text-[#24363F]/40">]</span>
      </div>

      {/* Right HUD status */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-[10px] text-[#24363F]/60">
          <span>STREAM: 4K 60FPS</span>
          <span className="text-[#24363F]/30">|</span>
          <span>SENSORS: 5-RETURN</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#24363F]/5 px-2.5 py-1 rounded border border-[#24363F]/10 font-mono">
          <span className="size-1.5 rounded-full bg-[#10b981]"></span>
          <span className="text-[#24363F] font-semibold text-[11px]">[ D:02 M:CIF ]</span>
        </div>
      </div>
    </header>
  )
}

