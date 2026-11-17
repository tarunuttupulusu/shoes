import React, { useState } from 'react'
import { TerrainViewer } from './TerrainViewer'
import { Database } from 'lucide-react'

interface HotspotDetail {
  id: number
  code: string
  title: string
  body: string
  risk: 'moderate' | 'low' | 'high'
  action: string
  stats: {
    sector: string
    confidence: string
    deltaRate: string
  }
}

const points: HotspotDetail[] = [
  {
    id: 0,
    code: '01',
    title: 'Structural Fault Zone',
    body: 'Surface deformation detected across 42 m² sector. Confidence threshold exceeded at 87%. Lateral shear displacement identified along fractured bedrock interface.',
    risk: 'moderate',
    action: 'Caution advised',
    stats: {
      sector: '42 m²',
      confidence: '87%',
      deltaRate: '+1.4 mm/mo'
    }
  },
  {
    id: 1,
    code: '02',
    title: 'Sediment Drift',
    body: 'Gradual displacement of loose alluvial material along the drainage channel. Within expected seasonal range; no immediate hydrological risk to substructure footing.',
    risk: 'low',
    action: 'Monitoring only',
    stats: {
      sector: '128 m²',
      confidence: '94%',
      deltaRate: '+0.3 mm/mo'
    }
  },
  {
    id: 2,
    code: '03',
    title: 'Erosion Scarp',
    body: 'Exposed cut face retreating along the upper ridge line. Material loss tracked at 3 cm per week. Risk of localized talus slip encroaching lower access easement.',
    risk: 'high',
    action: 'Re-survey in 14 days',
    stats: {
      sector: '64 m²',
      confidence: '98%',
      deltaRate: '3.0 cm/wk'
    }
  }
]

export const SoftwareSection: React.FC = () => {
  const [activePoint, setActivePoint] = useState<number>(0)
  const current = points[activePoint]

  return (
    <section id="software" className="relative bg-white px-4 md:px-8 py-20 flex flex-col justify-between border-t border-[#24363F]/20">
      {/* Massive Section Title "Software" + Badge 6 */}
      <div className="flex items-start justify-between pb-8 border-b border-[#24363F]/20 w-full">
        <h2 className="font-light text-[60px] sm:text-[120px] lg:text-[200px] leading-[0.85] tracking-[-0.05em] text-[#24363F] select-none">
          Software
        </h2>
        <div className="border border-[#24363F]/25 flex items-center justify-center px-4 h-9 rounded-full shrink-0 font-mono text-sm text-[#24363F]/70">
          6
        </div>
      </div>

      <div className="py-12 flex flex-col gap-10">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 font-mono text-xs px-3 py-1 rounded bg-[#24363F]/5 border border-[#24363F]/10 w-fit text-[#24363F]/80 mb-4">
            <Database className="size-3.5 text-emerald-600" />
            <span>PLATFORM PIPELINE</span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-light text-[#24363F] leading-[1.1] mb-6">
            From raw flight telemetry to georeferenced deliverable in{' '}
            <span className="font-semibold text-[#24363F]">under 20 minutes</span>.
          </h3>

          <p className="text-base sm:text-lg text-[#24363F]/75 font-light leading-relaxed">
            Our processing pipeline integrates directly with DJI Terra for automated point cloud generation, quality reporting, and georeferenced CAD/BIM output — empowering structural engineers with actionable anomaly detection.
          </p>
        </div>

        {/* 3D Terrain Interactive Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-30 pointer-events-auto">
          <div className="lg:col-span-7">
            <TerrainViewer activePoint={activePoint} onSelectPoint={setActivePoint} />
          </div>

          {/* Interactive Telemetry Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="font-mono text-xs text-[#24363F]/60 flex items-center justify-between">
              <span>DETECTED GEOTECHNICAL ANOMALIES</span>
              <span>SELECT TARGET PIN</span>
            </div>

            {points.map((pt) => {
              const isSelected = pt.id === activePoint
              return (
                <div
                  key={pt.id}
                  onClick={() => setActivePoint(pt.id)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#24363F]/40 shadow-md ring-1 ring-[#24363F]/10'
                      : 'bg-[#FDFDFD] border-[#24363F]/10 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs mb-2">
                    <span className="font-bold text-[#24363F] flex items-center gap-2">
                      <span className="text-[#24363F]/40">[{pt.code}]</span>
                      {pt.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        pt.risk === 'low'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : pt.risk === 'moderate'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {pt.action}
                    </span>
                  </div>

                  <p className="text-xs text-[#24363F]/75 font-light leading-relaxed mb-3">
                    {pt.body}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#24363F]/10 font-mono text-[11px] text-[#24363F]/60">
                    <div>
                      <span className="text-[#24363F]/40 block text-[9px]">SECTOR</span>
                      <span>{pt.stats.sector}</span>
                    </div>
                    <div>
                      <span className="text-[#24363F]/40 block text-[9px]">CONFIDENCE</span>
                      <span>{pt.stats.confidence}</span>
                    </div>
                    <div>
                      <span className="text-[#24363F]/40 block text-[9px]">DISPLACEMENT</span>
                      <span className="text-[#24363F] font-medium">{pt.stats.deltaRate}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
