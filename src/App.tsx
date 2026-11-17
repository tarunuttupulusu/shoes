import React, { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { Header } from './components/Header'
import { DroneScene } from './components/DroneScene'
import { Hero } from './components/Hero'
import { ProblemSection } from './components/ProblemSection'
import { GearSection } from './components/GearSection'
import { SolutionsSection } from './components/SolutionsSection'
import { CapabilitiesSection } from './components/CapabilitiesSection'
import { SoftwareSection } from './components/SoftwareSection'
import { Footer } from './components/Footer'

export function App() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const lenisRef = useRef<Lenis | null>(null)
  const problemRef = useRef<HTMLDivElement>(null)

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
    })

    lenisRef.current = lenis

    function onScroll() {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, scrollY / maxScroll)))
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      lenis.destroy()
    }
  }, [])

  // Mouse move handler for interactive drone attitude follow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const scrollToProblem = () => {
    if (problemRef.current && lenisRef.current) {
      lenisRef.current.scrollTo(problemRef.current, { offset: -60 })
    }
  }

  return (
    <div className="relative min-h-screen bg-[#FDFDFD] text-[#24363F] selection:bg-[#24363F] selection:text-white font-sans">
      {/* Background Architectural Grid Lines */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
        <div className="w-full h-full grid grid-cols-6 sm:grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-[#24363F] h-full" />
          ))}
        </div>
      </div>

      {/* Header */}
      <Header />

      {/* 3D Interactive Drone Scene */}
      <DroneScene scrollProgress={scrollProgress} mousePos={mousePos} />

      {/* Page Content */}
      <main className="relative z-10 flex flex-col">
        <Hero onScrollClick={scrollToProblem} />

        <div ref={problemRef}>
          <ProblemSection scrollProgress={scrollProgress} />
        </div>

        <GearSection />
        <SolutionsSection />
        <CapabilitiesSection />
        <SoftwareSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
