import React from 'react'

interface ProblemSectionProps {
  scrollProgress?: number
}

export const ProblemSection: React.FC<ProblemSectionProps> = ({ scrollProgress = 0 }) => {
  const sentence = "Detecting cracks, deformations and structural risks before they become failures."
  const words = sentence.split(" ")

  // Calculate reveal progress based on scroll (active roughly around 0.12 - 0.28)
  const activeStart = 0.10
  const activeEnd = 0.28
  const factor = Math.min(1, Math.max(0, (scrollProgress - activeStart) / (activeEnd - activeStart)))
  const activeWordCount = Math.floor(factor * (words.length + 2))

  return (
    <section id="intro-section" className="relative bg-[#FDFDFD] px-4 md:px-8 border-t border-[#24363F]/20">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen items-center">
        {/* Left Column: Kinetic Text Reveal */}
        <div className="lg:col-span-6 flex flex-col justify-center py-20 lg:py-48 lg:border-r lg:border-[#24363F]/20 lg:pr-16">
          <div className="font-mono text-xs uppercase tracking-widest text-[#24363F]/50 mb-8 flex items-center gap-2">
            <span className="size-1.5 bg-[#24363F]/50"></span>
            <span>CRITICAL RISK MITIGATION // DIRECTIVE 01</span>
          </div>

          <h2 className="flex flex-wrap gap-x-3.5 gap-y-2 font-light text-4xl sm:text-5xl lg:text-6xl tracking-[-0.04em] leading-[1.12]">
            {words.map((word, i) => {
              const isLit = i <= activeWordCount
              const isAccent = word.includes("cracks") || word.includes("deformations") || word.includes("risks") || word.includes("failures")
              return (
                <span
                  key={i}
                  className={`transition-colors duration-200 ${
                    isLit
                      ? isAccent
                        ? 'text-[#24363F] font-normal'
                        : 'text-[#24363F]'
                      : 'text-[#c7cccb]'
                  }`}
                >
                  {word}
                </span>
              )
            })}
          </h2>

          <div className="pt-12 flex flex-col gap-3 font-mono text-xs text-[#24363F]/60">
            <div className="flex items-center gap-3">
              <span className="text-[#24363F]/40">[ 01 ]</span>
              <span>SUB-MILLIMETER DIGITAL TWIN ACQUISITION</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#24363F]/40">[ 02 ]</span>
              <span>REAL-TIME MULTI-ECHO LIDAR ANOMALY CLASSIFICATION</span>
            </div>
          </div>
        </div>

        {/* Right Column: Intentionally open for the 3D drone camera view */}
        <div className="hidden lg:block lg:col-span-6 pointer-events-none" />
      </div>
    </section>
  )
}
