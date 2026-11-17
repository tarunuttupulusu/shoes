import React from 'react'
import { RotateCcw, Search, SlidersHorizontal, Mountain, Zap } from 'lucide-react'
import { MensFiltersProps, MensShoeSize, MensTerrain, MensCushioning } from './types'

export const ALL_MENS_SIZES: MensShoeSize[] = [7, 8, 9, 10, 11, 12, 13]
export const MENS_TERRAINS: (MensTerrain | 'All')[] = ['All', 'Road', 'Trail', 'Track', 'All-Terrain']
export const MENS_CUSHIONING_LEVELS: (MensCushioning | 'All')[] = ['All', 'Responsive', 'Balanced', 'Maximum']

export const MensFilters: React.FC<MensFiltersProps> = ({
  selectedSize,
  onSizeChange,
  selectedTerrain,
  onTerrainChange,
  selectedCushioning,
  onCushioningChange,
  filters,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onResetFilters,
  totalResults,
  activeFilterCount,
  className = '',
}) => {
  // Resolve values from unified filters or individual props
  const currentSize: MensShoeSize | null = filters ? filters.size : (selectedSize ?? null)
  const currentTerrain: MensTerrain | 'All' = filters ? filters.terrain : (selectedTerrain ?? 'All')
  const currentCushioning: MensCushioning | 'All' = filters ? filters.cushioning : (selectedCushioning ?? 'All')
  const currentSearch = filters?.searchQuery ?? searchQuery ?? ''
  const currentSort = filters?.sortBy ?? sortBy ?? 'featured'

  const handleSizeClick = (size: MensShoeSize | null) => {
    if (filters && onFilterChange) {
      onFilterChange({ ...filters, size })
    }
    onSizeChange?.(size)
  }

  const handleTerrainClick = (terrain: MensTerrain | 'All') => {
    if (filters && onFilterChange) {
      onFilterChange({ ...filters, terrain })
    }
    onTerrainChange?.(terrain)
  }

  const handleCushioningClick = (cushioning: MensCushioning | 'All') => {
    if (filters && onFilterChange) {
      onFilterChange({ ...filters, cushioning })
    }
    onCushioningChange?.(cushioning)
  }

  const handleSearchInput = (value: string) => {
    if (filters && onFilterChange) {
      onFilterChange({ ...filters, searchQuery: value })
    }
    onSearchChange?.(value)
  }

  const handleSortSelect = (value: 'featured' | 'price-asc' | 'price-desc' | 'weight') => {
    if (filters && onFilterChange) {
      onFilterChange({ ...filters, sortBy: value })
    }
    onSortChange?.(value)
  }

  return (
    <div
      className={`w-full bg-white/70 backdrop-blur-md rounded-2xl border border-[#24363F]/15 p-5 md:p-6 shadow-xs space-y-6 ${className}`}
    >
      {/* Top Bar: Search, Status, Active Filter Count & Reset */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#24363F]/10">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-[#24363F]/5 border border-[#24363F]/10 flex items-center justify-center text-[#24363F]">
            <SlidersHorizontal className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#24363F] font-semibold">
                Filters & Parameters
              </span>
              {activeFilterCount > 0 && (
                <span className="bg-[#24363F] text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  {activeFilterCount} Active
                </span>
              )}
            </div>
            <p className="font-mono text-[11px] text-[#24363F]/50">
              Calibrate sizing, terrain profile, and kinetic response
            </p>
          </div>
        </div>

        {/* Search & Sort & Reset */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#24363F]/40 pointer-events-none" />
            <input
              type="text"
              value={currentSearch}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search models, specs..."
              aria-label="Search shoes"
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#24363F]/15 bg-white text-xs font-mono text-[#24363F] placeholder:text-[#24363F]/40 focus:outline-hidden focus:border-[#24363F] transition-colors"
            />
          </div>

          <select
            value={currentSort}
            onChange={(e) =>
              handleSortSelect(
                e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'weight'
              )
            }
            aria-label="Sort shoes by"
            className="py-1.5 px-3 rounded-xl border border-[#24363F]/15 bg-white text-xs font-mono text-[#24363F] focus:outline-hidden focus:border-[#24363F] transition-colors cursor-pointer"
          >
            <option value="featured">Featured Order</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="weight">Weight: Lightest First</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-mono text-xs font-medium transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </button>
          )}

          <div className="font-mono text-xs text-[#24363F]/60 ml-auto sm:ml-0 bg-[#24363F]/5 px-2.5 py-1.5 rounded-xl border border-[#24363F]/10">
            <span className="font-bold text-[#24363F]">{totalResults}</span> models
          </div>
        </div>
      </div>

      {/* Filter Rows: Size, Terrain, Cushioning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Size Filter (Sizes 7-13) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-mono text-xs uppercase tracking-wider text-[#24363F] font-semibold flex items-center gap-1.5">
              <span>Size (UK/US Men's 7-13)</span>
            </label>
            {currentSize !== null && (
              <button
                type="button"
                onClick={() => handleSizeClick(null)}
                className="font-mono text-[11px] text-[#24363F]/50 hover:text-[#24363F] underline cursor-pointer"
              >
                Clear size
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSizeClick(null)}
              className={`h-9 px-3 rounded-lg font-mono text-xs transition-all duration-150 cursor-pointer ${
                currentSize === null
                  ? 'bg-[#24363F] text-white font-bold shadow-xs'
                  : 'bg-white border border-[#24363F]/15 text-[#24363F]/70 hover:border-[#24363F]/40 hover:bg-[#24363F]/5'
              }`}
            >
              All
            </button>
            {ALL_MENS_SIZES.map((size) => {
              const isSelected = currentSize === size
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeClick(isSelected ? null : size)}
                  aria-pressed={isSelected}
                  className={`h-9 w-10 rounded-lg font-mono text-xs transition-all duration-150 flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-[#24363F] text-white font-bold shadow-xs scale-105'
                      : 'bg-white border border-[#24363F]/15 text-[#24363F] hover:border-[#24363F]/40 hover:bg-[#24363F]/5'
                  }`}
                >
                  <span>{size}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Terrain Filter */}
        <div className="lg:col-span-4 space-y-2">
          <label className="font-mono text-xs uppercase tracking-wider text-[#24363F] font-semibold flex items-center gap-1.5">
            <Mountain className="size-3 text-[#24363F]/60" />
            <span>Terrain Category</span>
          </label>

          <div className="flex flex-wrap gap-1.5">
            {MENS_TERRAINS.map((terrain) => {
              const isSelected = currentTerrain === terrain
              return (
                <button
                  key={terrain}
                  type="button"
                  onClick={() => handleTerrainClick(terrain)}
                  aria-pressed={isSelected}
                  className={`px-3 py-2 rounded-lg font-mono text-xs transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[#24363F] text-white font-semibold shadow-xs'
                      : 'bg-white border border-[#24363F]/15 text-[#24363F]/70 hover:border-[#24363F]/40 hover:bg-[#24363F]/5'
                  }`}
                >
                  {terrain}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cushioning Filter */}
        <div className="lg:col-span-3 space-y-2">
          <label className="font-mono text-xs uppercase tracking-wider text-[#24363F] font-semibold flex items-center gap-1.5">
            <Zap className="size-3 text-[#24363F]/60" />
            <span>Cushioning Level</span>
          </label>

          <div className="flex flex-wrap gap-1.5">
            {MENS_CUSHIONING_LEVELS.map((cushion) => {
              const isSelected = currentCushioning === cushion
              return (
                <button
                  key={cushion}
                  type="button"
                  onClick={() => handleCushioningClick(cushion)}
                  aria-pressed={isSelected}
                  className={`px-3 py-2 rounded-lg font-mono text-xs transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[#24363F] text-white font-semibold shadow-xs'
                      : 'bg-white border border-[#24363F]/15 text-[#24363F]/70 hover:border-[#24363F]/40 hover:bg-[#24363F]/5'
                  }`}
                >
                  {cushion}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
