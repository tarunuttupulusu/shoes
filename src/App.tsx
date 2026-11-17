import React, { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './auth/AuthContext'
import { AuthModal } from './auth/AuthModal'
import { Header } from './components/Header'
import { DroneScene } from './components/DroneScene'
import { Hero } from './components/Hero'
import { ProblemSection } from './components/ProblemSection'
import { GearSection } from './components/GearSection'
import { ShoeShowcase } from './components/ShoeShowcase'
import { MensSection } from './components/mens'
import { WomensSection } from './components/womens'
import { SolutionsSection } from './components/SolutionsSection'
import { CapabilitiesSection } from './components/CapabilitiesSection'
import { SoftwareSection } from './components/SoftwareSection'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { AdminLayout } from './admin'

function Storefront() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isAuthOpen, setIsAuthOpen] = useState(false)
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
      <Header onOpenAuth={() => setIsAuthOpen(true)} />

      {/* 3D Interactive Drone Scene */}
      <DroneScene scrollProgress={scrollProgress} mousePos={mousePos} />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Page Content */}
      <main className="relative z-10 flex flex-col">
        <Hero onScrollClick={scrollToProblem} />

        <div ref={problemRef}>
          <ProblemSection scrollProgress={scrollProgress} />
        </div>

        <GearSection />

        {/* Flagship & Children's Footwear Showcase */}
        <section id="footwear">
          <ShoeShowcase />
        </section>

        {/* Dedicated Men's Footwear Section */}
        <section id="mens" className="border-t border-[#24363F]/10">
          <MensSection />
        </section>

        {/* Dedicated Women's Footwear Section */}
        <section id="womens" className="border-t border-[#24363F]/10">
          <WomensSection />
        </section>

        <SolutionsSection />
        <CapabilitiesSection />
        <SoftwareSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.startsWith('#admin')
    }
    return false
  })

  useEffect(() => {
    const handleHash = () => {
      setIsAdmin(window.location.hash.startsWith('#admin'))
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
        {isAdmin ? (
          <AdminLayout onExit={() => { window.location.hash = '' }} />
        ) : (
          <Storefront />
        )}
      </CartProvider>
    </AuthProvider>
  )
}

export default App
