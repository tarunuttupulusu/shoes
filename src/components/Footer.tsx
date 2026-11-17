import React from 'react'
import { ArrowUpRight, Terminal, Cpu } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-[#24363F]/15 px-4 md:px-8 py-16 flex flex-col justify-between font-sans">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#24363F]/10">
        {/* Left column statement */}
        <div className="md:col-span-6 flex flex-col justify-between">
          <div className="flex flex-col gap-4 max-w-lg">
            <span className="font-mono text-xs text-[#24363F]/50 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="size-3.5" />
              <span>RIOTTERS TECHNOLOGY LAB</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-[#24363F] leading-snug">
              Use our imagination to accelerate your brand, product or technology.
            </h2>
          </div>

          <div className="pt-8">
            <a
              href="https://riotters.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#24363F] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#24363F]/90 transition-all shadow-md group"
            >
              <span>Visit Riotters Studio</span>
              <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Right column services and tech */}
        <div className="md:col-span-6 grid grid-cols-2 gap-8 font-mono text-xs">
          <div>
            <div className="text-[#24363F]/40 uppercase tracking-widest text-[11px] mb-4">
              [ RIOTTERS SERVICES ]
            </div>
            <ul className="flex flex-col gap-2.5 text-[#24363F]/80">
              <li className="hover:text-[#24363F] transition-colors cursor-pointer">Motion Design</li>
              <li className="hover:text-[#24363F] transition-colors cursor-pointer">Marketing Design</li>
              <li className="hover:text-[#24363F] transition-colors cursor-pointer">Product Design</li>
              <li className="hover:text-[#24363F] transition-colors cursor-pointer">Creative Development</li>
              <li className="hover:text-[#24363F] transition-colors cursor-pointer">Real-time 3D Experiences</li>
            </ul>
          </div>

          <div>
            <div className="text-[#24363F]/40 uppercase tracking-widest text-[11px] mb-4">
              [ CORE STACK ]
            </div>
            <ul className="flex flex-col gap-2.5 text-[#24363F]/80">
              <li className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-emerald-500"></span>
                <span>Next.js 15 & React 19</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-emerald-500"></span>
                <span>Three.js / WebGL 2.0</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-emerald-500"></span>
                <span>Tailwind CSS</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-emerald-500"></span>
                <span>Payload CMS</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-emerald-500"></span>
                <span>Lenis Smooth Scroll</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#24363F]/50">
        <div className="flex items-center gap-4">
          <span className="font-bold text-[#24363F]">[ aevion ]</span>
          <span>© Riotters 2026. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-3">
          <span>HIGH-CONSEQUENCE INFRASTRUCTURE SURVEY</span>
          <span className="text-[#24363F]/30">|</span>
          <span className="text-[#24363F] font-semibold">[ D:02 M:CIF ]</span>
        </div>
      </div>
    </footer>
  )
}

