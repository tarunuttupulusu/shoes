import React, { useState } from 'react'
import { Zap, Building2, Factory, Globe2, CheckCircle2 } from 'lucide-react'

interface SolutionTab {
  id: string
  label: string
  icon: React.ReactNode
  title: string
  description: string
  tags: string[]
  stats: {
    scope: string
    scanModes: string
    coverage: string
    maxAltitude: string
    accuracy: string
    pointRate: string
  }
}

const solutions: SolutionTab[] = [
  {
    id: 'energy',
    label: 'Energy',
    icon: <Zap className="size-4" />,
    title: 'High-Voltage Corridors & Renewable Fields',
    description: 'Power grids, wind turbines, and solar arrays span thousands of acres of terrain that ground crews can no longer monitor at scale. LiDAR-equipped UAVs eliminate access risk while cutting inspection cycles from weeks to hours.',
    tags: ['Wind Turbines', 'Solar Farms', 'Power Lines', 'Substations'],
    stats: {
      scope: '360°',
      scanModes: '2',
      coverage: '100 km²/day',
      maxAltitude: '500 m',
      accuracy: '±2 cm',
      pointRate: '240 k/S'
    }
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: <Building2 className="size-4" />,
    title: 'Bridges, Highway Viaducts & Tunnels',
    description: 'Autonomous spatial mapping captures sub-centimeter sagging, concrete spalling, and bridge abutment shifting across critical transportation arteries without interrupting civilian traffic.',
    tags: ['Cable-Stayed Bridges', 'Railway Corridors', 'Highway Viaducts', 'Dam Retaining Walls'],
    stats: {
      scope: 'Full Hemisphere',
      scanModes: '3',
      coverage: '45 linear km/day',
      maxAltitude: '300 m',
      accuracy: '±1.5 cm',
      pointRate: '240 k/S'
    }
  },
  {
    id: 'industry',
    label: 'Industry',
    icon: <Factory className="size-4" />,
    title: 'Petrochemical Refineries & Heavy Plants',
    description: 'Inspect flare stacks, pressurized storage spheres, and inaccessible pipe racks in extreme hazardous environments, delivering volumetric thermal-LiDAR digital twins.',
    tags: ['Storage Spheres', 'Pipe Racks', 'Furnace Stacks', 'Offshore Platforms'],
    stats: {
      scope: 'Omnidirectional',
      scanModes: '4',
      coverage: '25 assets/day',
      maxAltitude: '150 m',
      accuracy: '±1.0 cm',
      pointRate: '240 k/S'
    }
  },
  {
    id: 'geospatial',
    label: 'Geospatial',
    icon: <Globe2 className="size-4" />,
    title: 'Topography & Dense Canopy Penetration',
    description: 'Multi-pulse LiDAR cuts through thick jungle and forest canopies to reveal true bare-earth digital elevation models (DEM) for flood modeling and geotechnical slope stability.',
    tags: ['Forestry Penetration', 'Digital Elevation (DEM)', 'Landslide Monitoring', 'Coastal Erosion'],
    stats: {
      scope: 'Wide Angle',
      scanModes: '2',
      coverage: '150 km²/day',
      maxAltitude: '800 m',
      accuracy: '±2.5 cm',
      pointRate: '240 k/S'
    }
  }
]

export const SolutionsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('energy')
  const current = solutions.find(s => s.id === activeTab) || solutions[0]

  return (
    <section id="solutions" className="relative bg-white px-4 md:px-8 py-20 flex flex-col justify-between border-t border-[#24363F]/20">
      {/* Massive Section Title "Solutions" + Badge 4 */}
      <div className="flex items-start justify-between pb-8 border-b border-[#24363F]/20 w-full">
        <h2 className="font-light text-[70px] sm:text-[130px] lg:text-[200px] leading-[0.85] tracking-[-0.05em] text-[#24363F] select-none">
          Solutions
        </h2>
        <div className="border border-[#24363F]/25 flex items-center justify-center px-4 h-9 rounded-full shrink-0 font-mono text-sm text-[#24363F]/70">
          4
        </div>
      </div>

      {/* Tabs Row */}
      <div className="pt-10 pb-6 flex flex-wrap gap-2 border-b border-[#24363F]/10 relative z-30 pointer-events-auto">
        {solutions.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${isActive
                  ? 'bg-[#24363F] text-white shadow-sm'
                  : 'bg-[#24363F]/5 text-[#24363F]/70 hover:bg-[#24363F]/10'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-12 items-start">
        <div className="lg:col-span-6 flex flex-col gap-6">
          <h3 className="text-3xl sm:text-4xl font-light text-[#24363F] leading-snug">
            {current.title}
          </h3>

          <p className="text-base sm:text-lg text-[#24363F]/75 font-light leading-relaxed">
            {current.description}
          </p>

          <div className="pt-4">
            <div className="font-mono text-[11px] uppercase text-[#24363F]/50 mb-3 tracking-wider">
              [ TARGET ASSET PROFILES ]
            </div>
            <div className="flex flex-wrap gap-2">
              {current.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FDFDFD] border border-[#24363F]/15 font-mono text-xs text-[#24363F]/80"
                >
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Matrix */}
        <div className="lg:col-span-6 bg-[#FDFDFD] p-6 sm:p-8 rounded-2xl border border-[#24363F]/15 shadow-xs">
          <div className="font-mono text-xs text-[#24363F]/60 pb-4 border-b border-[#24363F]/10 flex justify-between items-center">
            <span>FIELD PERFORMANCE METRICS</span>
            <span className="text-emerald-600 font-semibold">[ REALTIME BENCHMARK ]</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6">
            <div>
              <span className="font-mono text-[11px] text-[#24363F]/50 uppercase block mb-1">Scope</span>
              <span className="text-2xl font-light text-[#24363F]">{current.stats.scope}</span>
            </div>
            <div>
              <span className="font-mono text-[11px] text-[#24363F]/50 uppercase block mb-1">Scan Modes</span>
              <span className="text-2xl font-light text-[#24363F]">{current.stats.scanModes}</span>
            </div>
            <div>
              <span className="font-mono text-[11px] text-[#24363F]/50 uppercase block mb-1">Coverage</span>
              <span className="text-2xl font-light text-[#24363F]">{current.stats.coverage}</span>
            </div>
            <div>
              <span className="font-mono text-[11px] text-[#24363F]/50 uppercase block mb-1">Max Altitude</span>
              <span className="text-2xl font-light text-[#24363F]">{current.stats.maxAltitude}</span>
            </div>
            <div>
              <span className="font-mono text-[11px] text-[#24363F]/50 uppercase block mb-1">Accuracy</span>
              <span className="text-2xl font-light text-[#24363F]">{current.stats.accuracy}</span>
            </div>
            <div>
              <span className="font-mono text-[11px] text-[#24363F]/50 uppercase block mb-1">Point Rate</span>
              <span className="text-2xl font-light text-[#24363F]">{current.stats.pointRate}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
