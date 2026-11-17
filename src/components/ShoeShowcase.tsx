import React, { useState, useEffect, useRef } from 'react'
import { Check, ShoppingBag, ArrowRight, Sparkles, Layers, ShieldCheck, Zap, Play, Pause, RotateCw } from 'lucide-react'
import { INITIAL_PRODUCTS } from '../data/products'
import { Product, ShoeSize } from '../types'
import { useCart } from '../context/CartContext'

// Performance telemetry data per shoe
const SHOE_SPECS: Record<
  string,
  {
    weight: string
    energyReturn: string
    stackHeight: string
    drop: string
    colorways: string[]
  }
> = {
  'shoe-strata-01': {
    weight: '215g (Size 9)',
    energyReturn: '86% Kinetic Return',
    stackHeight: '36mm Heel / 28mm Toe',
    drop: '8mm Differential',
    colorways: ['Obsidian Black', 'Titanium Grey', 'Neon Ember'],
  },
  'shoe-vector-02': {
    weight: '188g (Size 9)',
    energyReturn: '91% Kinetic Return',
    stackHeight: '32mm Heel / 26mm Toe',
    drop: '6mm Differential',
    colorways: ['Chrono Silver', 'Speed Cyan', 'Pure Carbon'],
  },
  'shoe-terra-03': {
    weight: '245g (Size 9)',
    energyReturn: '84% Kinetic Return',
    stackHeight: '38mm Heel / 30mm Toe',
    drop: '8mm Differential',
    colorways: ['Alpine Moss', 'Dune Ochre', 'Stealth Night'],
  },
}

export const ShoeShowcase: React.FC = () => {
  const { addToCart } = useCart()

  // Active highlighted shoe index in the spotlight
  const [selectedProductIndex, setSelectedProductIndex] = useState(0)
  
  // Auto card cycle toggle state
  const [isAutoCardOn, setIsAutoCardOn] = useState(false)
  const [isPausedOnHover, setIsPausedOnHover] = useState(false)
  const autoCardTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const addTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Selected sizes for each product (keyed by product.id)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, ShoeSize>>({
    'shoe-strata-01': 9,
    'shoe-vector-02': 9,
    'shoe-terra-03': 10,
  })

  // Added animation state for instant feedback
  const [justAddedId, setJustAddedId] = useState<string | null>(null)

  // Smooth Auto Card cycling when turned on
  useEffect(() => {
    if (!isAutoCardOn || isPausedOnHover) {
      if (autoCardTimerRef.current) {
        clearInterval(autoCardTimerRef.current)
        autoCardTimerRef.current = null
      }
      return
    }

    autoCardTimerRef.current = setInterval(() => {
      setSelectedProductIndex((prev) => (prev + 1) % INITIAL_PRODUCTS.length)
    }, 3500)

    return () => {
      if (autoCardTimerRef.current) {
        clearInterval(autoCardTimerRef.current)
        autoCardTimerRef.current = null
      }
    }
  }, [isAutoCardOn, isPausedOnHover])

  const activeProduct: Product = INITIAL_PRODUCTS[selectedProductIndex]
  const activeSpecs = SHOE_SPECS[activeProduct.id] || {
    weight: '210g',
    energyReturn: '87%',
    stackHeight: '34mm / 26mm',
    drop: '8mm',
    colorways: ['Standard Onyx', 'Lunar Frost'],
  }

  const handleSelectSize = (productId: string, size: ShoeSize) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }))
  }

  const handleAddToCart = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0]
    addToCart(product, size)

    setJustAddedId(product.id)
    if (addTimeoutRef.current) {
      clearTimeout(addTimeoutRef.current)
    }
    addTimeoutRef.current = setTimeout(() => {
      setJustAddedId(null)
    }, 1800)
  }

  return (
    <section
      id="footwear"
      className="relative bg-[#FDFDFD] px-4 md:px-8 py-16 sm:py-24 border-b border-[#24363F]/20 flex flex-col justify-between"
    >
      {/* Massive Section Header: Architectural Apple/Bauhaus style */}
      <div className="flex items-start justify-between pb-8 border-b border-[#24363F]/20 w-full">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#24363F]/60">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>KINETIC PROPULSION DIVISION</span>
          </div>
          <h2 className="font-light text-[64px] sm:text-[110px] lg:text-[160px] leading-[0.88] tracking-[-0.04em] text-[#24363F] select-none">
            Footwear
          </h2>
        </div>
        <div className="border border-[#24363F]/25 flex items-center justify-center px-4 h-9 rounded-full shrink-0 font-mono text-sm text-[#24363F]/70">
          4
        </div>
      </div>

      {/* Subhead and Product Switcher Tabs */}
      <div className="py-12 border-b border-[#24363F]/10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-[#24363F]/60 mb-2">
            [ AEROSPACE COMPOSITE RUNNING GEAR ]
          </p>
          <h3 className="text-2xl sm:text-4xl font-light text-[#24363F] leading-snug">
            Engineered around dual-density carbon geometry and biomechanical feedback.
          </h3>
          <p className="mt-3 text-[#24363F]/70 font-light text-base leading-relaxed">
            Every millimeter of the AEVION kinetic system translates impact shock into forward thrust. Hand-calibrated fit, monomesh ventilation, and ultra-high traction lugs.
          </p>
        </div>

        {/* Apple-style Model Selector Pills & Auto Card Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap sm:flex-nowrap gap-2 bg-[#24363F]/5 p-1.5 rounded-2xl border border-[#24363F]/10 font-mono text-xs">
            {INITIAL_PRODUCTS.map((prod, idx) => {
              const isActive = idx === selectedProductIndex
              return (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProductIndex(idx)}
                  className={`px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-left sm:text-center whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#24363F] text-white shadow-sm font-medium'
                      : 'text-[#24363F]/70 hover:text-[#24363F] hover:bg-[#24363F]/5'
                  }`}
                >
                  <span className="opacity-50 text-[10px]">0{idx + 1}</span>
                  <span>{prod.name.replace('AEVION ', '')}</span>
                </button>
              )
            })}
          </div>

          {/* Auto Card Toggle Button */}
          <button
            type="button"
            onClick={() => setIsAutoCardOn((prev) => !prev)}
            aria-pressed={isAutoCardOn}
            title={isAutoCardOn ? "Auto Card is ON (Click to pause/turn off)" : "Auto Card is OFF (Click to turn on automatic rotation)"}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
              isAutoCardOn
                ? 'bg-[#24363F] text-white border-[#24363F] shadow-md scale-[1.02]'
                : 'bg-white border-[#24363F]/20 text-[#24363F]/70 hover:text-[#24363F] hover:border-[#24363F]/50 shadow-xs'
            }`}
          >
            {isAutoCardOn ? (
              <>
                <Pause className="size-3.5 fill-current text-emerald-400" />
                <span className="font-semibold text-white">Auto Card: ON</span>
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                <span>Auto Card: OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Spotlight Feature Showcase */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 items-center"
        onMouseEnter={() => setIsPausedOnHover(true)}
        onMouseLeave={() => setIsPausedOnHover(false)}
      >
        {/* Left Column: Visual Presentation with HUD Telemetry */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative rounded-3xl border border-[#24363F]/15 bg-gradient-to-br from-neutral-100/80 via-white to-neutral-50 overflow-hidden p-8 sm:p-12 shadow-sm min-h-[380px] sm:min-h-[460px] flex flex-col justify-between group">
            {/* Top HUD Row */}
            <div className="flex items-center justify-between text-xs font-mono text-[#24363F]/60">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="uppercase tracking-widest">{activeProduct.category}</span>
              </div>
              {activeProduct.badge && (
                <span className="px-3 py-1 rounded-full bg-[#24363F] text-white text-[10px] font-semibold tracking-wider uppercase">
                  {activeProduct.badge}
                </span>
              )}
            </div>

            {/* Product Centerpiece */}
            <div className="relative my-8 flex items-center justify-center">
              {/* Architectural Grid Circle in Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="size-64 sm:size-80 rounded-full border border-[#24363F]/10 border-dashed animate-[spin_60s_linear_infinite]" />
                <div className="absolute size-44 sm:size-56 rounded-full border border-[#24363F]/5" />
              </div>

              {/* Showcase Image with Apple-level presentation */}
              <div className="relative z-10 w-full max-w-[420px] aspect-4/3 rounded-2xl overflow-hidden border border-[#24363F]/10 bg-white/70 shadow-lg backdrop-blur-xs flex items-center justify-center p-4">
                <img
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/apple-icon.png'
                  }}
                />
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#24363F]/10 font-mono text-[10px] text-[#24363F]">
                  ID: {activeProduct.id}
                </div>
              </div>
            </div>

            {/* Bottom Colorways & View indicators */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#24363F]/10 font-mono text-xs text-[#24363F]/70">
              <div className="flex items-center gap-2">
                <span className="text-[#24363F]/50">COLORWAY:</span>
                <span className="font-medium text-[#24363F]">{activeSpecs.colorways[0]}</span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>Lab Certified</span>
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="size-3.5 text-amber-500" />
                  <span>Carbon Spring</span>
                </span>
              </div>
            </div>
          </div>

          {/* Telemetry Strip below image */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 font-mono text-xs">
            <div className="p-3.5 rounded-xl border border-[#24363F]/15 bg-white">
              <div className="text-[#24363F]/50 text-[10px] uppercase">[ WEIGHT ]</div>
              <div className="text-sm font-semibold text-[#24363F] mt-1">{activeSpecs.weight}</div>
            </div>
            <div className="p-3.5 rounded-xl border border-[#24363F]/15 bg-white">
              <div className="text-[#24363F]/50 text-[10px] uppercase">[ ENERGY RETURN ]</div>
              <div className="text-sm font-semibold text-[#24363F] mt-1">{activeSpecs.energyReturn}</div>
            </div>
            <div className="p-3.5 rounded-xl border border-[#24363F]/15 bg-white">
              <div className="text-[#24363F]/50 text-[10px] uppercase">[ STACK HEIGHT ]</div>
              <div className="text-sm font-semibold text-[#24363F] mt-1">{activeSpecs.stackHeight}</div>
            </div>
            <div className="p-3.5 rounded-xl border border-[#24363F]/15 bg-white">
              <div className="text-[#24363F]/50 text-[10px] uppercase">[ OFFSET ]</div>
              <div className="text-sm font-semibold text-[#24363F] mt-1">{activeSpecs.drop}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Details, Size Selector & Purchase Controls */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#24363F]/60">
                <span>0{selectedProductIndex + 1} / 03</span>
                <span>•</span>
                <span>{activeProduct.category}</span>
              </div>
              <h3 className="text-3xl sm:text-5xl font-light text-[#24363F] tracking-tight">
                {activeProduct.name}
              </h3>
              <p className="font-mono text-xs text-[#24363F]/70 mt-1 uppercase tracking-wider">
                {activeProduct.tagline}
              </p>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#24363F]/15">
              <span className="font-mono text-3xl sm:text-4xl font-semibold text-[#24363F]">
                ₹{activeProduct.price.toLocaleString('en-IN')}
              </span>
              <span className="font-mono text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Express Air Freight Included
              </span>
            </div>

            {/* Description */}
            <p className="text-base text-[#24363F]/80 font-light leading-relaxed">
              {activeProduct.description}
            </p>

            {/* Aerospace Engineering Specs Chips */}
            <div className="space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#24363F]/60 block">
                [ INTEGRATED ARCHITECTURE ]
              </span>
              <div className="flex flex-wrap gap-2">
                {activeProduct.features.map((feat, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#24363F]/5 border border-[#24363F]/10 font-mono text-xs text-[#24363F]/90"
                  >
                    <Layers className="size-3 text-[#24363F]/50" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Smooth Size Selector */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-[#24363F] font-semibold">
                  SELECT SIZE (UK/US):
                </span>
                <span className="font-mono text-[11px] text-[#24363F]/50">
                  Standard Precision Fit
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {([7, 8, 9, 10, 11, 12] as ShoeSize[]).map((size) => {
                  const isAvailable = activeProduct.sizes.includes(size)
                  const isSelected = selectedSizes[activeProduct.id] === size

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleSelectSize(activeProduct.id, size)}
                      className={`h-12 rounded-xl font-mono text-sm transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer ${
                        !isAvailable
                          ? 'opacity-30 bg-[#24363F]/5 cursor-not-allowed border border-[#24363F]/10'
                          : isSelected
                          ? 'bg-[#24363F] text-white shadow-md font-bold scale-[1.03]'
                          : 'bg-white border border-[#24363F]/20 text-[#24363F] hover:border-[#24363F]/60 hover:bg-[#24363F]/5'
                      }`}
                    >
                      <span>{size}</span>
                      <span className="text-[9px] opacity-70">UK</span>
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 font-mono text-[11px] text-[#24363F]/50">
                Selected: UK {selectedSizes[activeProduct.id] || activeProduct.sizes[0]} · Free size exchange within 30 days.
              </p>
            </div>

            {/* Add to Cart CTA */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => handleAddToCart(activeProduct)}
                className={`flex-1 py-4 px-8 rounded-2xl font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-md cursor-pointer ${
                  justAddedId === activeProduct.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#24363F] text-white hover:bg-[#1a2830] active:scale-[0.99]'
                }`}
              >
                {justAddedId === activeProduct.id ? (
                  <>
                    <Check className="size-4 stroke-[3]" />
                    <span>Added to Bag (Size {selectedSizes[activeProduct.id] || activeProduct.sizes[0]})</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4" />
                    <span>Add to Bag · ₹{activeProduct.price.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Showcase of the Entire Line-Up */}
      <div className="pt-20 border-t border-[#24363F]/20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#24363F]/50 block mb-1">
              [ COMPLETE PERFORMANCE MATRIX ]
            </span>
            <h3 className="text-3xl font-light text-[#24363F]">
              All Propulsion Models
            </h3>
          </div>
          <span className="font-mono text-xs text-[#24363F]/60">
            3 Models Available · Ready for Dispatch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {INITIAL_PRODUCTS.map((product, idx) => {
            const currentSize = selectedSizes[product.id] || product.sizes[0]
            const isAdded = justAddedId === product.id
            const specs = SHOE_SPECS[product.id]

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between rounded-3xl border border-[#24363F]/15 bg-white p-6 shadow-xs hover:shadow-xl hover:border-[#24363F]/35 transition-all duration-500"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between font-mono text-xs mb-4">
                    <span className="text-[#24363F]/50">0{idx + 1}</span>
                    {product.badge && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#24363F]/10 text-[#24363F] text-[10px] font-semibold uppercase">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail / Image */}
                  <div className="aspect-4/3 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 border border-[#24363F]/10 overflow-hidden relative mb-6 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/apple-icon.png'
                      }}
                    />
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-[#24363F] border border-[#24363F]/10">
                      {specs ? specs.weight : 'Ultralight'}
                    </div>
                  </div>

                  {/* Product Info */}
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#24363F]/60 block mb-1">
                    {product.category}
                  </span>
                  <h4 className="text-xl font-medium text-[#24363F] mb-1 group-hover:text-black transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-[#24363F]/70 font-light line-clamp-2 mb-4 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Features list */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {product.features.slice(0, 2).map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 bg-[#24363F]/5 rounded border border-[#24363F]/10 text-[#24363F]/70"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom interactive controls */}
                <div className="pt-4 border-t border-[#24363F]/10 space-y-4">
                  {/* Size buttons */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#24363F]/60 mb-2">
                      <span>SIZE: UK {currentSize}</span>
                      <span>IN STOCK</span>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleSelectSize(product.id, sz)}
                          className={`size-8 rounded-lg font-mono text-xs flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                            currentSize === sz
                              ? 'bg-[#24363F] text-white font-bold'
                              : 'bg-white border border-[#24363F]/20 text-[#24363F]/80 hover:border-[#24363F]/60'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price and Add button */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="font-mono text-xs text-[#24363F]/50">PRICE</div>
                      <div className="font-mono text-lg font-bold text-[#24363F]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className={`px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#24363F] text-white hover:bg-[#1a2830] active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="size-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="size-3.5" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
