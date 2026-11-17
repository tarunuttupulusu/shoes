import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  RotateCcw,
  Compass,
  X,
  Check,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react'
import { MensFilters } from './MensFilters'
import { MensProductCard } from './MensProductCard'
import { MENS_PERFORMANCE_SHOES } from './mensData'
import {
  MensSectionProps,
  MensShoe,
  MensShoeSize,
  MensTerrain,
  MensCushioning,
} from './types'
import { useCart } from '../../context/CartContext'
import { Product, ShoeSize } from '../../types'

export const MensSection: React.FC<MensSectionProps> = ({
  id = 'mens-footwear',
  className = '',
  initialShoes = MENS_PERFORMANCE_SHOES,
}) => {
  const { addToCart } = useCart()

  // Filter states
  const [selectedSize, setSelectedSize] = useState<MensShoeSize | null>(null)
  const [selectedTerrain, setSelectedTerrain] = useState<MensTerrain | 'All'>('All')
  const [selectedCushioning, setSelectedCushioning] = useState<MensCushioning | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'weight'>('featured')

  // Quick View Modal state
  const [quickViewShoe, setQuickViewShoe] = useState<MensShoe | null>(null)
  const [modalSize, setModalSize] = useState<MensShoeSize>(9)
  const [modalAdded, setModalAdded] = useState(false)

  // Open Quick View
  const handleOpenQuickView = (shoe: MensShoe) => {
    setQuickViewShoe(shoe)
    setModalSize(shoe.sizes.includes(9) ? 9 : shoe.sizes[0] || 9)
    setModalAdded(false)
  }

  // Close Quick View
  const handleCloseQuickView = () => {
    setQuickViewShoe(null)
    setModalAdded(false)
  }

  // Quick View Add to Cart
  const handleModalAddToCart = () => {
    if (!quickViewShoe) return

    const cartProduct: Product = {
      id: quickViewShoe.id,
      name: quickViewShoe.name,
      tagline: quickViewShoe.tagline,
      description: quickViewShoe.description,
      price: quickViewShoe.price,
      category: `Men's ${quickViewShoe.category}`,
      sizes: quickViewShoe.sizes.map((s) => (s > 12 ? 12 : s) as ShoeSize),
      image: quickViewShoe.image,
      badge: quickViewShoe.badge,
      features: quickViewShoe.features,
    }

    addToCart(cartProduct, modalSize as unknown as ShoeSize)
    setModalAdded(true)
    setTimeout(() => {
      setModalAdded(false)
    }, 1800)
  }

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedSize(null)
    setSelectedTerrain('All')
    setSelectedCushioning('All')
    setSearchQuery('')
    setSortBy('featured')
  }

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedSize !== null) count++
    if (selectedTerrain !== 'All') count++
    if (selectedCushioning !== 'All') count++
    if (searchQuery.trim().length > 0) count++
    return count
  }, [selectedSize, selectedTerrain, selectedCushioning, searchQuery])

  // Filter and sort shoes
  const filteredShoes = useMemo(() => {
    let result = [...initialShoes]

    // Filter by size
    if (selectedSize !== null) {
      result = result.filter((shoe) => shoe.sizes.includes(selectedSize))
    }

    // Filter by terrain
    if (selectedTerrain !== 'All') {
      result = result.filter((shoe) => shoe.terrain === selectedTerrain)
    }

    // Filter by cushioning
    if (selectedCushioning !== 'All') {
      result = result.filter((shoe) => shoe.cushioning === selectedCushioning)
    }

    // Filter by text search
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (shoe) =>
          shoe.name.toLowerCase().includes(q) ||
          shoe.tagline.toLowerCase().includes(q) ||
          shoe.description.toLowerCase().includes(q) ||
          shoe.category.toLowerCase().includes(q) ||
          shoe.features.some((f) => f.toLowerCase().includes(q))
      )
    }

    // Sort shoes
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'weight') {
      result.sort((a, b) => {
        const weightA = parseInt(a.weight, 10) || 0
        const weightB = parseInt(b.weight, 10) || 0
        return weightA - weightB
      })
    }

    return result
  }, [initialShoes, selectedSize, selectedTerrain, selectedCushioning, searchQuery, sortBy])

  return (
    <section
      id={id}
      aria-label="Men's Performance Footwear"
      className={`relative bg-[#FDFDFD] px-4 md:px-8 py-16 sm:py-24 border-b border-[#24363F]/20 flex flex-col justify-between ${className}`}
    >
      {/* Massive Architectural Section Header */}
      <div className="flex items-start justify-between pb-8 border-b border-[#24363F]/20 w-full">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-widest text-[#24363F]/60">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>MENS PERFORMANCE DIVISION · SIZES 7-13</span>
          </div>
          <h2 className="font-light text-[60px] sm:text-[100px] lg:text-[140px] leading-[0.88] tracking-[-0.04em] text-[#24363F] select-none">
            Men's Footwear
          </h2>
        </div>
        <div className="border border-[#24363F]/25 flex items-center justify-center px-4 h-9 rounded-full shrink-0 font-mono text-sm text-[#24363F]/70">
          M
        </div>
      </div>

      {/* Subhead and Architectural Description */}
      <div className="py-10 border-b border-[#24363F]/10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-widest text-[#24363F]/60 mb-2">
            [ PRECISION CALIBRATED FOR MEN'S BIOMECHANICS ]
          </p>
          <h3 className="text-2xl sm:text-3xl font-light text-[#24363F] leading-snug">
            High-torque carbon plates, supercritical nitrogen foam, and all-terrain traction across standard men's sizes 7 through 13.
          </h3>
          <p className="mt-3 text-[#24363F]/70 font-light text-sm sm:text-base leading-relaxed">
            Every shoe in the Men's Performance Footwear collection undergoes finite element analysis to optimize impact dissipation and kinetic energy return under high load and demanding trail, road, and track conditions.
          </p>
        </div>

        {/* Quick Specs Badges */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 font-mono text-xs">
          <div className="px-4 py-3 rounded-2xl bg-[#24363F]/5 border border-[#24363F]/10">
            <div className="text-[10px] text-[#24363F]/50 uppercase">SIZE RANGE</div>
            <div className="font-bold text-[#24363F] mt-0.5">UK/US 7 – 13</div>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-[#24363F]/5 border border-[#24363F]/10">
            <div className="text-[10px] text-[#24363F]/50 uppercase">ENERGY RETURN</div>
            <div className="font-bold text-[#24363F] mt-0.5">Up to 94%</div>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-[#24363F]/5 border border-[#24363F]/10">
            <div className="text-[10px] text-[#24363F]/50 uppercase">PLATING</div>
            <div className="font-bold text-[#24363F] mt-0.5">Dual-Density 3K</div>
          </div>
        </div>
      </div>

      {/* Interactive Filters Panel */}
      <div className="py-8">
        <MensFilters
          selectedSize={selectedSize}
          onSizeChange={setSelectedSize}
          selectedTerrain={selectedTerrain}
          onTerrainChange={setSelectedTerrain}
          selectedCushioning={selectedCushioning}
          onCushioningChange={setSelectedCushioning}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
          totalResults={filteredShoes.length}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Active Filter Chips Strip */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-6 font-mono text-xs text-[#24363F]">
          <span className="text-[#24363F]/50 uppercase tracking-wider text-[11px]">Applied Filters:</span>
          {selectedSize !== null && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#24363F] text-white">
              Size: UK {selectedSize}
              <button
                type="button"
                onClick={() => setSelectedSize(null)}
                className="hover:opacity-75 cursor-pointer ml-1"
                aria-label="Remove size filter"
              >
                ×
              </button>
            </span>
          )}
          {selectedTerrain !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#24363F] text-white">
              Terrain: {selectedTerrain}
              <button
                type="button"
                onClick={() => setSelectedTerrain('All')}
                className="hover:opacity-75 cursor-pointer ml-1"
                aria-label="Remove terrain filter"
              >
                ×
              </button>
            </span>
          )}
          {selectedCushioning !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#24363F] text-white">
              Cushioning: {selectedCushioning}
              <button
                type="button"
                onClick={() => setSelectedCushioning('All')}
                className="hover:opacity-75 cursor-pointer ml-1"
                aria-label="Remove cushioning filter"
              >
                ×
              </button>
            </span>
          )}
          {searchQuery.trim().length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#24363F] text-white">
              Query: "{searchQuery}"
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="hover:opacity-75 cursor-pointer ml-1"
                aria-label="Remove search query"
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-red-600 hover:text-red-700 underline text-[11px] ml-2 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Product Showcase Grid or Empty State */}
      {filteredShoes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 pt-4">
          {filteredShoes.map((shoe) => (
            <MensProductCard
              key={shoe.id}
              product={shoe}
              onQuickView={handleOpenQuickView}
            />
          ))}
        </div>
      ) : (
        /* Empty Results State */
        <div className="py-20 text-center rounded-3xl border border-[#24363F]/15 bg-[#24363F]/5 flex flex-col items-center justify-center p-8">
          <div className="size-16 rounded-2xl bg-white border border-[#24363F]/10 flex items-center justify-center text-[#24363F]/40 mb-4 shadow-xs">
            <Compass className="size-8 stroke-[1.5]" />
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-[#24363F]/50 mb-2">
            [ NO CALIBRATED MATCHES ]
          </div>
          <h4 className="text-2xl font-light text-[#24363F] mb-2">
            No Men's Shoes Found
          </h4>
          <p className="text-sm text-[#24363F]/70 max-w-md font-light mb-6">
            No footwear matches your selected size, terrain, or cushioning criteria. Try broadening your parameters to view available models.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#24363F] text-white hover:bg-[#1a2830] transition-colors font-mono text-xs uppercase tracking-wider cursor-pointer shadow-sm"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

      {/* Quick View Telemetry Modal */}
      {quickViewShoe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleCloseQuickView}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-3xl bg-[#FDFDFD] rounded-3xl border border-[#24363F]/20 shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#24363F]/10">
              <div className="flex items-center gap-2 font-mono text-xs text-[#24363F]/60">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>TELEMETRY OVERVIEW · {quickViewShoe.category}</span>
              </div>
              <button
                type="button"
                onClick={handleCloseQuickView}
                className="size-8 rounded-full border border-[#24363F]/15 flex items-center justify-center text-[#24363F]/60 hover:text-[#24363F] hover:bg-[#24363F]/5 cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 items-center">
              {/* Modal Image */}
              <div className="relative aspect-4/3 rounded-2xl bg-neutral-100 overflow-hidden border border-[#24363F]/10 p-4 flex items-center justify-center">
                <img
                  src={quickViewShoe.image}
                  alt={quickViewShoe.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/apple-icon.png'
                  }}
                />
                {quickViewShoe.badge && (
                  <span className="absolute top-3 left-3 bg-[#24363F] text-white font-mono text-[10px] px-2.5 py-1 rounded-full uppercase font-semibold">
                    {quickViewShoe.badge}
                  </span>
                )}
              </div>

              {/* Modal Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-medium text-[#24363F] tracking-tight">
                    {quickViewShoe.name}
                  </h3>
                  <p className="font-mono text-xs text-[#24363F]/60 mt-0.5">
                    {quickViewShoe.tagline}
                  </p>
                </div>

                <div className="font-mono text-2xl font-bold text-[#24363F]">
                  ₹{quickViewShoe.price.toLocaleString('en-IN')}
                </div>

                <p className="text-xs text-[#24363F]/80 leading-relaxed font-light">
                  {quickViewShoe.description}
                </p>

                {/* Specs Strip */}
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                  <div className="bg-[#24363F]/5 p-2 rounded-lg border border-[#24363F]/10 text-center">
                    <div className="text-[#24363F]/50 uppercase text-[9px]">Weight</div>
                    <div className="font-semibold text-[#24363F]">{quickViewShoe.weight}</div>
                  </div>
                  <div className="bg-[#24363F]/5 p-2 rounded-lg border border-[#24363F]/10 text-center">
                    <div className="text-[#24363F]/50 uppercase text-[9px]">Return</div>
                    <div className="font-semibold text-[#24363F]">{quickViewShoe.energyReturn}</div>
                  </div>
                  <div className="bg-[#24363F]/5 p-2 rounded-lg border border-[#24363F]/10 text-center">
                    <div className="text-[#24363F]/50 uppercase text-[9px]">Offset</div>
                    <div className="font-semibold text-[#24363F]">{quickViewShoe.drop}</div>
                  </div>
                </div>

                {/* Modal Size Selector */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-semibold text-[#24363F]">Select Size:</span>
                    <span className="text-[#24363F]/60">UK/US {modalSize}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {([7, 8, 9, 10, 11, 12, 13] as MensShoeSize[]).map((size) => {
                      const isAvailable = quickViewShoe.sizes.includes(size)
                      const isSelected = modalSize === size
                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setModalSize(size)}
                          className={`h-9 rounded-lg font-mono text-xs transition-all flex items-center justify-center cursor-pointer ${
                            !isAvailable
                              ? 'opacity-25 bg-[#24363F]/5 cursor-not-allowed border border-[#24363F]/10'
                              : isSelected
                              ? 'bg-[#24363F] text-white font-bold shadow-xs scale-105'
                              : 'bg-white border border-[#24363F]/20 text-[#24363F] hover:bg-[#24363F]/5'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Modal Add to Bag Button */}
                <button
                  type="button"
                  onClick={handleModalAddToCart}
                  className={`w-full py-3 px-4 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer font-semibold shadow-xs ${
                    modalAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#24363F] text-white hover:bg-[#1a2830]'
                  }`}
                >
                  {modalAdded ? (
                    <>
                      <Check className="size-4" />
                      <span>Added to Bag (Size {modalSize})</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="size-4" />
                      <span>Add to Bag · ₹{quickViewShoe.price.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Telemetry Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#24363F]/20 mt-16 pt-8 gap-8 md:gap-0">
        <div className="flex flex-col md:pr-6 md:border-r md:border-[#24363F]/15">
          <div className="font-mono text-xs text-[#24363F]/60 mb-2">[ SIZING STANDARD ]</div>
          <div className="text-2xl sm:text-3xl font-light text-[#24363F] tracking-tight">
            Men's UK 7 to 13
          </div>
          <p className="text-xs text-[#24363F]/60 mt-2 font-light leading-relaxed">
            True-to-size performance fit with widened anatomical toe box and secure heel counter.
          </p>
        </div>

        <div className="flex flex-col md:px-6 md:border-r md:border-[#24363F]/15">
          <div className="font-mono text-xs text-[#24363F]/60 mb-2">[ LAB CALIBRATION ]</div>
          <div className="text-2xl sm:text-3xl font-light text-[#24363F] tracking-tight">
            Biomechanic Testing
          </div>
          <p className="text-xs text-[#24363F]/60 mt-2 font-light leading-relaxed">
            Tested across dynamic force plates to guarantee continuous energy return and lateral stability.
          </p>
        </div>

        <div className="flex flex-col md:pl-6">
          <div className="font-mono text-xs text-[#24363F]/60 mb-2">[ COMPATIBILITY ]</div>
          <div className="text-2xl sm:text-3xl font-light text-[#24363F] tracking-tight">
            Cart & Logistics Sync
          </div>
          <p className="text-xs text-[#24363F]/60 mt-2 font-light leading-relaxed">
            Directly connected to CartContext with size selection and automated checkout pipeline.
          </p>
        </div>
      </div>
    </section>
  )
}
