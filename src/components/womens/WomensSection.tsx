import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  ArrowUpDown,
  X,
  RotateCcw,
  ShoppingBag,
  Check,
  Info,
} from 'lucide-react'
import { WomensProduct, WomensFilterState, WomensShoeSize } from './types'
import { WOMENS_PRODUCTS, ALL_WOMENS_SIZES } from './womensData'
import { WomensFilters } from './WomensFilters'
import { WomensProductCard } from './WomensProductCard'
import { useCart } from '../../context/CartContext'
import { Product, ShoeSize } from '../../types'

export const WomensSection: React.FC = () => {
  const { addToCart } = useCart()

  // Filter state
  const [filters, setFilters] = useState<WomensFilterState>({
    category: 'All',
    sizes: [],
    archSupport: [],
    cushioning: [],
    searchQuery: '',
    sortBy: 'featured',
  })

  // Quick view modal state
  const [quickViewProduct, setQuickViewProduct] = useState<WomensProduct | null>(null)
  const [modalColorwayIndex, setModalColorwayIndex] = useState(0)
  const [modalSelectedSize, setModalSelectedSize] = useState<WomensShoeSize>(7)
  const [modalAdded, setModalAdded] = useState(false)

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return WOMENS_PRODUCTS.filter((product) => {
      // Category filter
      if (filters.category !== 'All' && product.category !== filters.category) {
        return false
      }

      // Sizes filter (shoe must contain AT LEAST ONE of the selected sizes)
      if (filters.sizes.length > 0) {
        const hasMatchingSize = filters.sizes.some((size) =>
          product.sizes.includes(size)
        )
        if (!hasMatchingSize) return false
      }

      // Arch Support filter
      if (
        filters.archSupport.length > 0 &&
        !filters.archSupport.includes(product.archSupport)
      ) {
        return false
      }

      // Cushioning filter
      if (
        filters.cushioning.length > 0 &&
        !filters.cushioning.includes(product.cushioning)
      ) {
        return false
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesTagline = product.tagline.toLowerCase().includes(query)
        const matchesActivity = product.activity.toLowerCase().includes(query)
        const matchesFeature = product.features.some((f) =>
          f.toLowerCase().includes(query)
        )
        if (!matchesName && !matchesTagline && !matchesActivity && !matchesFeature) {
          return false
        }
      }

      return true
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price
      if (filters.sortBy === 'price-desc') return b.price - a.price
      if (filters.sortBy === 'name') return a.name.localeCompare(b.name)
      return 0 // 'featured' retains natural order
    })
  }, [filters])

  // Count by category for tab badges
  const athleticCount = WOMENS_PRODUCTS.filter((p) => p.category === 'Athletic').length
  const lifestyleCount = WOMENS_PRODUCTS.filter((p) => p.category === 'Lifestyle').length

  const handleOpenQuickView = (product: WomensProduct) => {
    setQuickViewProduct(product)
    setModalColorwayIndex(0)
    setModalSelectedSize(product.sizes[0] || 7)
    setModalAdded(false)
  }

  const handleModalAddToCart = () => {
    if (!quickViewProduct) return
    const cw = quickViewProduct.colorways[modalColorwayIndex] || quickViewProduct.colorways[0]

    const cartProduct: Product = {
      id: `${quickViewProduct.id}-${cw.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `${quickViewProduct.name} - ${cw.name}`,
      tagline: quickViewProduct.tagline,
      description: quickViewProduct.description,
      price: quickViewProduct.price,
      category: `Women's ${quickViewProduct.category}`,
      sizes: quickViewProduct.sizes as unknown as ShoeSize[],
      image: cw.image,
      badge: cw.badge || quickViewProduct.badge,
      features: quickViewProduct.features,
    }

    addToCart(cartProduct, modalSelectedSize as unknown as ShoeSize)
    setModalAdded(true)
    setTimeout(() => {
      setModalAdded(false)
    }, 1800)
  }

  return (
    <section
      id="womens-footwear"
      className="relative bg-[#FDFDFD] px-4 md:px-8 py-16 sm:py-24 border-b border-[#24363F]/20 flex flex-col justify-between"
    >
      {/* Massive Section Header: Architectural Apple/Bauhaus style */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-10 border-b border-[#24363F]/20 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-widest text-[#24363F]/60">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>KINETIC PROPULSION // WOMEN'S DIVISION</span>
            <span className="text-[#24363F]/30">•</span>
            <span>SIZES 5-11</span>
          </div>

          <h2 className="font-light text-[56px] sm:text-[96px] lg:text-[140px] leading-[0.88] tracking-[-0.04em] text-[#24363F] select-none">
            Women's
          </h2>
          <div className="text-2xl sm:text-4xl font-light text-[#24363F]/60 tracking-tight mt-1">
            Athletic & Lifestyle Footwear
          </div>
        </div>

        {/* Division Badge & Short Manifesto */}
        <div className="lg:max-w-md flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="border border-[#24363F]/25 flex items-center justify-center px-4 h-9 rounded-full shrink-0 font-mono text-sm text-[#24363F]/80">
              05
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#24363F]/50">
              [ ANATOMICAL LAST TUNING ]
            </span>
          </div>

          <p className="text-sm sm:text-base text-[#24363F]/75 font-light leading-relaxed">
            Engineered exclusively around female foot morphology. Featuring narrower heel dimensions, elevated instep contouring, and adaptive carbon deflection calibrated for maximum kinetic efficiency.
          </p>
        </div>
      </div>

      {/* Biomechanical Engineering Telemetry Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-[#24363F]/15 bg-[#24363F]/2 px-6 my-8 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-xl bg-white border border-[#24363F]/15 flex items-center justify-center text-[#24363F] shrink-0">
            <Layers className="size-4" />
          </div>
          <div>
            <div className="font-mono text-xs font-semibold text-[#24363F] uppercase tracking-wider">
              Female Anatomical Last
            </div>
            <p className="text-xs text-[#24363F]/65 font-light mt-0.5 leading-relaxed">
              14% narrower heel-to-ball proportion to prevent heel lift and friction hotspots.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="size-8 rounded-xl bg-white border border-[#24363F]/15 flex items-center justify-center text-[#24363F] shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <div className="font-mono text-xs font-semibold text-[#24363F] uppercase tracking-wider">
              Adaptive Arch Contouring
            </div>
            <p className="text-xs text-[#24363F]/65 font-light mt-0.5 leading-relaxed">
              Dynamic plantar support across Neutral, Medium, High, and Stability profiles.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="size-8 rounded-xl bg-white border border-[#24363F]/15 flex items-center justify-center text-[#24363F] shrink-0">
            <Zap className="size-4" />
          </div>
          <div>
            <div className="font-mono text-xs font-semibold text-[#24363F] uppercase tracking-wider">
              Tuned Carbon Plate
            </div>
            <p className="text-xs text-[#24363F]/65 font-light mt-0.5 leading-relaxed">
              Re-engineered carbon deflection rate optimized for lighter loading and explosive snap.
            </p>
          </div>
        </div>
      </div>

      {/* Main Catalog View: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Filters Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 sticky top-24 z-30">
          <WomensFilters
            filters={filters}
            onFilterChange={setFilters}
            totalCount={WOMENS_PRODUCTS.length}
            filteredCount={filteredProducts.length}
          />
        </aside>

        {/* Right Column: Catalog Grid & Controls */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
          {/* Top Sort & Category Quick Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#24363F]/10">
            {/* Category Quick Pills */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setFilters({ ...filters, category: 'All' })}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  filters.category === 'All'
                    ? 'bg-[#24363F] text-white font-medium shadow-xs'
                    : 'bg-[#24363F]/5 text-[#24363F]/70 hover:bg-[#24363F]/10'
                }`}
              >
                All Footwear ({WOMENS_PRODUCTS.length})
              </button>

              <button
                type="button"
                onClick={() => setFilters({ ...filters, category: 'Athletic' })}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  filters.category === 'Athletic'
                    ? 'bg-[#24363F] text-white font-medium shadow-xs'
                    : 'bg-[#24363F]/5 text-[#24363F]/70 hover:bg-[#24363F]/10'
                }`}
              >
                Athletic ({athleticCount})
              </button>

              <button
                type="button"
                onClick={() => setFilters({ ...filters, category: 'Lifestyle' })}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  filters.category === 'Lifestyle'
                    ? 'bg-[#24363F] text-white font-medium shadow-xs'
                    : 'bg-[#24363F]/5 text-[#24363F]/70 hover:bg-[#24363F]/10'
                }`}
              >
                Lifestyle ({lifestyleCount})
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 font-mono text-xs text-[#24363F]/70">
              <ArrowUpDown className="size-3.5" />
              <span>SORT:</span>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as WomensFilterState['sortBy'],
                  })
                }
                className="bg-transparent font-semibold text-[#24363F] focus:outline-none cursor-pointer border-b border-[#24363F]/20 pb-0.5"
              >
                <option value="featured">Featured Collection</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Model Name</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-16 text-center bg-[#24363F]/2 rounded-2xl border border-dashed border-[#24363F]/20">
              <div className="size-16 rounded-2xl bg-[#24363F]/5 flex items-center justify-center text-[#24363F]/40 mb-4">
                <Sparkles className="size-8" />
              </div>
              <h3 className="text-xl font-light text-[#24363F] mb-2">
                No Matching Footwear Models Found
              </h3>
              <p className="text-xs text-[#24363F]/60 max-w-sm mb-6 font-light">
                No shoes match the current combination of size, arch support, or cushioning filters. Try adjusting your parameters.
              </p>
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    category: 'All',
                    sizes: [],
                    archSupport: [],
                    cushioning: [],
                    searchQuery: '',
                    sortBy: 'featured',
                  })
                }
                className="flex items-center gap-2 px-5 py-2.5 bg-[#24363F] text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-[#1b2930] transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <WomensProductCard
                  key={product.id}
                  product={product}
                  initialSelectedSize={filters.sizes[0]}
                  onQuickView={handleOpenQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24363F]/40 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-3xl border border-[#24363F]/20 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-30 size-9 rounded-full bg-white/80 backdrop-blur-sm border border-[#24363F]/15 flex items-center justify-center text-[#24363F] hover:bg-white cursor-pointer shadow-xs"
            >
              <X className="size-4" />
            </button>

            {/* Left: Modal Image */}
            <div className="md:w-1/2 bg-[#F8F9FA] relative flex items-center justify-center p-8">
              <img
                src={
                  quickViewProduct.colorways[modalColorwayIndex]?.image ||
                  '/apple-icon.png'
                }
                alt={quickViewProduct.name}
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 border border-[#24363F]/10">
                {quickViewProduct.category} • {quickViewProduct.activity}
              </div>
            </div>

            {/* Right: Modal Details */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <h3 className="text-2xl font-light text-[#24363F] mb-1">
                  {quickViewProduct.name}
                </h3>
                <div className="font-mono text-lg font-semibold text-[#24363F] mb-3">
                  ₹{quickViewProduct.price.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-[#24363F]/70 font-light leading-relaxed mb-6">
                  {quickViewProduct.description}
                </p>

                {/* Colorway selector in modal */}
                <div className="mb-5">
                  <div className="flex justify-between font-mono text-xs mb-2">
                    <span className="text-[#24363F]/60">COLORWAY:</span>
                    <span className="font-medium text-[#24363F]">
                      {quickViewProduct.colorways[modalColorwayIndex]?.name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {quickViewProduct.colorways.map((cw, i) => (
                      <button
                        key={cw.name}
                        type="button"
                        onClick={() => setModalColorwayIndex(i)}
                        className={`size-7 rounded-full border-2 p-0.5 cursor-pointer ${
                          i === modalColorwayIndex
                            ? 'border-[#24363F]'
                            : 'border-transparent'
                        }`}
                      >
                        <span
                          className="block w-full h-full rounded-full border border-black/10"
                          style={{ backgroundColor: cw.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size selector in modal */}
                <div className="mb-5">
                  <div className="flex justify-between font-mono text-xs mb-2">
                    <span className="text-[#24363F]/60">SELECT US WOMEN'S SIZE:</span>
                    <span className="font-bold text-[#24363F]">
                      US {modalSelectedSize}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickViewProduct.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setModalSelectedSize(s)}
                        className={`h-8 px-2.5 rounded-lg font-mono text-xs border cursor-pointer ${
                          s === modalSelectedSize
                            ? 'bg-[#24363F] text-white border-[#24363F]'
                            : 'bg-white border-[#24363F]/20 text-[#24363F]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Telemetry Specs */}
                <div className="grid grid-cols-2 gap-2 bg-[#24363F]/5 p-3 rounded-xl font-mono text-[11px] mb-6">
                  <div>
                    <span className="text-[#24363F]/60">ARCH: </span>
                    <span className="font-semibold">{quickViewProduct.archSupport}</span>
                  </div>
                  <div>
                    <span className="text-[#24363F]/60">CUSHION: </span>
                    <span className="font-semibold">{quickViewProduct.cushioning}</span>
                  </div>
                  <div>
                    <span className="text-[#24363F]/60">WEIGHT: </span>
                    <span>{quickViewProduct.specs.weight}</span>
                  </div>
                  <div>
                    <span className="text-[#24363F]/60">DROP: </span>
                    <span>{quickViewProduct.specs.drop}</span>
                  </div>
                </div>
              </div>

              {/* Add to Bag in modal */}
              <button
                type="button"
                onClick={handleModalAddToCart}
                className={`w-full py-3.5 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  modalAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#24363F] text-white hover:bg-[#1b2930]'
                }`}
              >
                {modalAdded ? (
                  <>
                    <Check className="size-4 stroke-[2.5]" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4" />
                    <span>
                      Add to Bag • ₹{quickViewProduct.price.toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
