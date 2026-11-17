import React from 'react'

export const GearSection: React.FC = () => {
  return (
    <section id="gear" className="relative bg-[#FDFDFD] px-4 md:px-8 flex flex-col justify-between">
      {/* Massive Section Title "Gear" + Badge 3 */}
      <div className="flex items-start justify-between pt-12 pb-8 border-b border-[#24363F]/20 w-full">
        <h2 className="font-light text-[80px] sm:text-[140px] lg:text-[220px] leading-[0.85] tracking-[-0.05em] text-[#24363F] select-none">
          Gear
        </h2>
        <div className="border border-[#24363F]/25 flex items-center justify-center px-4 h-9 rounded-full shrink-0 font-mono text-sm text-[#24363F]/70">
          3
        </div>
      </div>

      {/* Payload info row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 lg:py-24 items-center">
        {/* Left Column: Payload Description */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <div className="size-1 shrink-0 bg-[#24363F]/50"></div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#24363F]/60">
              PAYLOAD
            </span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-light text-[#24363F] leading-tight">
            Engineered around the <br />
            <span className="font-semibold">DJI Zenmuse L2</span> LiDAR payload.
          </h3>

          <p className="text-base sm:text-lg text-[#24363F]/75 font-light leading-relaxed max-w-xl">
            Our system delivers frame-based point cloud acquisition with up to 240,000 pts/s and five simultaneous returns per pulse, penetrating dense vegetation and high-voltage transmission structures in a single autonomous flight.
          </p>

          <div className="flex flex-wrap gap-3 font-mono text-xs text-[#24363F]/80 pt-2">
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#24363F]/15 shadow-xs">
              Frame-Based LiDAR
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#24363F]/15 shadow-xs">
              4/3 CMOS RGB Mapping
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#24363F]/15 shadow-xs">
              High-Accuracy IMU
            </span>
          </div>
        </div>

        {/* Right Column: Open space for 3D drone camera zoom onto payload */}
        <div className="hidden lg:block lg:col-span-6 h-[400px] pointer-events-none" />
      </div>

      {/* Sticky Telemetry Bar with LiDAR Dome Arc SVG */}
      <div className="relative w-full pt-16 pb-12">
        {/* Radar Dome Arc SVG */}
        <div className="relative w-full flex justify-center">
          <svg
            aria-hidden="true"
            className="pointer-events-none w-[clamp(420px,50vw,840px)] h-auto overflow-visible select-none"
            viewBox="0 0 954 477"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.5 477 A 476.5 476.5 0 0 1 477 0.5"
              stroke="#24363F"
              strokeOpacity="0.25"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <path
              d="M953.5 477 A 476.5 476.5 0 0 0 477 0.5"
              stroke="#24363F"
              strokeOpacity="0.25"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <circle
              cx="477"
              cy="477"
              r="340"
              stroke="#24363F"
              strokeOpacity="0.15"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
            <line x1="477" y1="20" x2="477" y2="40" stroke="#10b981" strokeWidth="2" />
          </svg>
        </div>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-y border-[#24363F]/20 py-8 gap-8 md:gap-0 bg-[#FDFDFD]">
          <div className="flex flex-col md:px-6 md:border-r md:border-[#24363F]/15">
            <div className="font-mono text-xs text-[#24363F]/60 mb-2">[ MAX RETURNS ]</div>
            <div className="text-4xl sm:text-6xl font-light text-[#24363F] tracking-tight">
              5 <span className="text-base sm:text-lg font-mono font-normal text-[#24363F]/60">returns</span>
            </div>
            <p className="text-xs text-[#24363F]/60 mt-3 font-light leading-relaxed">
              Differentiates canopy strata, power conductors, and terrain surface in a single laser pulse.
            </p>
          </div>

          <div className="flex flex-col md:px-6 md:border-r md:border-[#24363F]/15">
            <div className="font-mono text-xs text-[#24363F]/60 mb-2">[ DETECTION ACCURACY ]</div>
            <div className="text-4xl sm:text-6xl font-light text-[#24363F] tracking-tight">
              ±2 <span className="text-base sm:text-lg font-mono font-normal text-[#24363F]/60">cm</span>
            </div>
            <p className="text-xs text-[#24363F]/60 mt-3 font-light leading-relaxed">
              Survey-grade vertical and horizontal absolute accuracy without Ground Control Points (GCPs).
            </p>
          </div>

          <div className="flex flex-col md:px-6">
            <div className="font-mono text-xs text-[#24363F]/60 mb-2">[ MAX RANGE ]</div>
            <div className="text-4xl sm:text-6xl font-light text-[#24363F] tracking-tight">
              450 <span className="text-base sm:text-lg font-mono font-normal text-[#24363F]/60">m</span>
            </div>
            <p className="text-xs text-[#24363F]/60 mt-3 font-light leading-relaxed">
              Extended standoff range at 90% reflectivity, maintaining safety clearances from energized infrastructure.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
