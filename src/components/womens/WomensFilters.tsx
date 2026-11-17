import React, { useState } from 'react'
import {
  Filter,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Sparkles,
  Layers,
  Activity,
  Heart,
} from 'lucide-react'
import {
  WomensFilterState,
  WomensShoeSize,
  ArchSupport,
  CushioningLevel,
  ShoeCategory,
} from './types'
import {
  ALL_WOMENS_SIZES,
  ARCH_SUPPORT_OPTIONS,
  CUSHIONING_OPTIONS,
} from './womensData'

interface WomensFiltersProps {
  filters: WomensFilterState
  onFilterChange: (newFilters: WomensFilterState) => void
  totalCount: number
  filteredCount: number
  className?: string
}

export const WomensFilters: React.FC<WomensFiltersProps> = ({
  filters,
  onFilterChange,
  totalCount,
  filteredCount,
  className = '',
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const [openSections, setOpenSections] = useState({
    sizes: true,
    archSupport: true,
    cushioning: true,
    category: true,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Handle Category
  const handleCategoryChange = (cat: 'All' | 'Athletic' | 'Lifestyle') => {
    onFilterChange({ ...filters, category: cat })
  }

  // Handle Sizes toggle
  const toggleSize = (size: WomensShoeSize) => {
    const exists = filters.sizes.includes(size)
    const newSizes = exists
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size]
    onFilterChange({ ...filters, sizes: newSizes })
  }

  // Handle Arch Support toggle
  const toggleArchSupport = (arch: ArchSupport) => {
    const exists = filters.archSupport.includes(arch)
    const newArch = exists
      ? filters.archSupport.filter((a) => a !== arch)
      : [...filters.archSupport, arch]
    onFilterChange({ ...filters, archSupport: newArch })
  }

  // Handle Cushioning toggle
  const toggleCushioning = (cushion: CushioningLevel) => {
    const exists = filters.cushioning.includes(cushion)
    const newCushion = exists
      ? filters.cushioning.filter((c) => c !== cushion)
      : [...filters.cushioning, cushion]
    onFilterChange({ ...filters, cushioning: newCushion })
  }

  // Reset all filters
  const resetFilters = () => {
    onFilterChange({
      category: 'All',
      sizes: [],
      archSupport: [],
      cushioning: [],
      searchQuery: '',
      sortBy: 'featured',
    })
  }

  // Count active filters (excluding default category/sort)
  const activeFiltersCount =
    (filters.category !== 'All' ? 1 : 0) +
    filters.sizes.length +
    filters.archSupport.length +
    filters.cushioning.length +
    (filters.searchQuery.trim() ? 1 : 0)

  return (
    <div className={`flex flex-col gap-6 text-[#24363F] ${className}`}>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#24363F]/5 rounded-2xl border border-[#24363F]/15">
        <button
          type="button"
          onClick={() => setMobileExpanded((prev) => !prev)}
          className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer"
        >
          <SlidersHorizontal className="size-4" />
          <span>Refine Collection</span>
          {activeFiltersCount > 0 && (
            <span className="size-5 rounded-full bg-[#24363F] text-white text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <span className="font-mono text-xs text-[#24363F]/60">
          Showing {filteredCount} of {totalCount}
        </span>
      </div>

      {/* Main Filter Container (Always visible on desktop, collapsable on mobile) */}
      <div
        className={`${
          mobileExpanded ? 'block' : 'hidden'
        } lg:block space-y-6 bg-[#FDFDFD]`}
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#24363F]/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search models, tech, traits..."
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            className="w-full bg-[#24363F]/5 border border-[#24363F]/15 rounded-xl pl-10 pr-9 py-2.5 text-xs text-[#24363F] placeholder:text-[#24363F]/40 focus:outline-none focus:ring-2 focus:ring-[#24363F]/20 focus:border-[#24363F]/40 transition-all font-sans"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#24363F]/40 hover:text-[#24363F] cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter Header with Reset */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24363F]/10">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#24363F]/70">
            <Filter className="size-3.5" />
            <span>Telemetry Filters</span>
            {activeFiltersCount > 0 && (
              <span className="size-4.5 rounded-full bg-[#24363F] text-white text-[9px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 font-mono text-[11px] text-[#24363F]/60 hover:text-[#24363F] transition-colors cursor-pointer group"
            >
              <RotateCcw className="size-3 group-hover:-rotate-90 transition-transform duration-300" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="border-b border-[#24363F]/10 pb-5">
          <button
            type="button"
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full font-mono text-xs uppercase tracking-wider font-semibold text-[#24363F] mb-3 text-left cursor-pointer"
          >
            <span>Division Category</span>
            {openSections.category ? (
              <ChevronUp className="size-3.5 text-[#24363F]/50" />
            ) : (
              <ChevronDown className="size-3.5 text-[#24363F]/50" />
            )}
          </button>

          {openSections.category && (
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#24363F]/5 rounded-xl border border-[#24363F]/10 font-mono text-xs">
              {(['All', 'Athletic', 'Lifestyle'] as const).map((cat) => {
                const isActive = filters.category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`py-2 px-2.5 rounded-lg text-center font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#24363F] text-white shadow-xs font-semibold'
                        : 'text-[#24363F]/70 hover:text-[#24363F] hover:bg-black/5'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Size Filter (Sizes 5 to 11) */}
        <div className="border-b border-[#24363F]/10 pb-5">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => toggleSection('sizes')}
              className="flex items-center justify-between flex-1 font-mono text-xs uppercase tracking-wider font-semibold text-[#24363F] text-left cursor-pointer"
            >
              <span>Shoe Size (US Women's 5-11)</span>
              {openSections.sizes ? (
                <ChevronUp className="size-3.5 text-[#24363F]/50" />
              ) : (
                <ChevronDown className="size-3.5 text-[#24363F]/50" />
              )}
            </button>
          </div>

          {openSections.sizes && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#24363F]/50 mb-2">
                <span>Select one or more:</span>
                {filters.sizes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filters, sizes: [] })}
                    className="hover:text-[#24363F] underline cursor-pointer"
                  >
                    Clear sizes
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-1.5">
                {ALL_WOMENS_SIZES.map((size) => {
                  const isSelected = filters.sizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`h-9 rounded-lg font-mono text-xs font-medium border transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#24363F] text-white border-[#24363F] shadow-xs'
                          : 'bg-white border-[#24363F]/15 text-[#24363F]/80 hover:border-[#24363F]/40 hover:bg-[#24363F]/5'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Arch Support Filter */}
        <div className="border-b border-[#24363F]/10 pb-5">
          <button
            type="button"
            onClick={() => toggleSection('archSupport')}
            className="flex items-center justify-between w-full font-mono text-xs uppercase tracking-wider font-semibold text-[#24363F] mb-3 text-left cursor-pointer"
          >
            <span>Arch Support</span>
            {openSections.archSupport ? (
              <ChevronUp className="size-3.5 text-[#24363F]/50" />
            ) : (
              <ChevronDown className="size-3.5 text-[#24363F]/50" />
            )}
          </button>

          {openSections.archSupport && (
            <div className="space-y-2">
              {ARCH_SUPPORT_OPTIONS.map((opt) => {
                const isSelected = filters.archSupport.includes(opt.value)
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleArchSupport(opt.value)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#24363F]/5 border-[#24363F] shadow-xs'
                        : 'bg-white border-[#24363F]/15 hover:border-[#24363F]/30 hover:bg-[#24363F]/2'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-[#24363F]">
                          {opt.label}
                        </span>
                        {opt.value === 'High' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-500/10 text-amber-800 rounded font-medium">
                            Anatomical
                          </span>
                        )}
                        {opt.value === 'Stability' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/10 text-emerald-800 rounded font-medium">
                            Anti-Pronation
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#24363F]/60 font-light mt-0.5 leading-snug">
                        {opt.description}
                      </p>
                    </div>

                    <div
                      className={`size-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-[#24363F] border-[#24363F] text-white'
                          : 'border-[#24363F]/25 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="size-3 stroke-[2.5]" />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cushioning Filter */}
        <div className="border-b border-[#24363F]/10 pb-5">
          <button
            type="button"
            onClick={() => toggleSection('cushioning')}
            className="flex items-center justify-between w-full font-mono text-xs uppercase tracking-wider font-semibold text-[#24363F] mb-3 text-left cursor-pointer"
          >
            <span>Cushioning Level</span>
            {openSections.cushioning ? (
              <ChevronUp className="size-3.5 text-[#24363F]/50" />
            ) : (
              <ChevronDown className="size-3.5 text-[#24363F]/50" />
            )}
          </button>

          {openSections.cushioning && (
            <div className="space-y-2">
              {CUSHIONING_OPTIONS.map((opt) => {
                const isSelected = filters.cushioning.includes(opt.value)
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleCushioning(opt.value)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#24363F]/5 border-[#24363F] shadow-xs'
                        : 'bg-white border-[#24363F]/15 hover:border-[#24363F]/30 hover:bg-[#24363F]/2'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-[#24363F]">
                          {opt.label}
                        </span>
                        {opt.value === 'Plush' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-purple-500/10 text-purple-800 rounded font-medium">
                            Max 39mm
                          </span>
                        )}
                        {opt.value === 'Responsive' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-sky-500/10 text-sky-800 rounded font-medium">
                            Snap Foam
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#24363F]/60 font-light mt-0.5 leading-snug">
                        {opt.description}
                      </p>
                    </div>

                    <div
                      className={`size-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-[#24363F] border-[#24363F] text-white'
                          : 'border-[#24363F]/25 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="size-3 stroke-[2.5]" />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Active Filters Summary Chips */}
        {activeFiltersCount > 0 && (
          <div className="pt-2">
            <div className="font-mono text-[11px] text-[#24363F]/50 uppercase tracking-wider mb-2">
              Active Parameters:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filters.category !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#24363F]/10 text-[#24363F] font-mono text-[11px]">
                  Category: {filters.category}
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('All')}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {filters.sizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#24363F]/10 text-[#24363F] font-mono text-[11px]"
                >
                  Size: {s}
                  <button
                    type="button"
                    onClick={() => toggleSize(s)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}

              {filters.archSupport.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#24363F]/10 text-[#24363F] font-mono text-[11px]"
                >
                  Arch: {a}
                  <button
                    type="button"
                    onClick={() => toggleArchSupport(a)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}

              {filters.cushioning.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#24363F]/10 text-[#24363F] font-mono text-[11px]"
                >
                  Cushion: {c}
                  <button
                    type="button"
                    onClick={() => toggleCushioning(c)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
