import { Product, ShoeSize } from '../../types'

export type MensShoeSize = 7 | 8 | 9 | 10 | 11 | 12 | 13

export type MensTerrain = 'Road' | 'Trail' | 'Track' | 'All-Terrain'

export type MensCushioning = 'Responsive' | 'Balanced' | 'Maximum'

export interface MensShoeSpecs {
  terrain: MensTerrain
  cushioning: MensCushioning
  weight: string
  energyReturn: string
  drop: string
  stackHeight?: string
  colorways?: string[]
}

export interface MensShoe extends Omit<Product, 'sizes'> {
  id: string
  name: string
  tagline: string
  description: string
  price: number
  category: string
  sizes: MensShoeSize[]
  image: string
  badge?: string
  features: string[]
  terrain: MensTerrain
  cushioning: MensCushioning
  weight: string
  energyReturn: string
  drop: string
  stackHeight?: string
  colorways?: string[]
}

export interface MensFilterState {
  size: MensShoeSize | null
  terrain: MensTerrain | 'All'
  cushioning: MensCushioning | 'All'
  searchQuery?: string
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'weight'
}

export interface MensFiltersProps {
  selectedSize?: MensShoeSize | null
  onSizeChange?: (size: MensShoeSize | null) => void
  selectedTerrain?: MensTerrain | 'All'
  onTerrainChange?: (terrain: MensTerrain | 'All') => void
  selectedCushioning?: MensCushioning | 'All'
  onCushioningChange?: (cushioning: MensCushioning | 'All') => void
  // Unified filter state
  filters?: MensFilterState
  onFilterChange?: (filters: MensFilterState) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'weight'
  onSortChange?: (sort: 'featured' | 'price-asc' | 'price-desc' | 'weight') => void
  onResetFilters: () => void
  totalResults: number
  activeFilterCount: number
  className?: string
}

export interface MensProductCardProps {
  product: MensShoe
  className?: string
  priority?: boolean
  initialSelectedSize?: MensShoeSize
  onAddToCart?: (product: MensShoe, size: MensShoeSize) => void
  onQuickView?: (product: MensShoe) => void
}

export interface MensSectionProps {
  id?: string
  className?: string
  initialShoes?: MensShoe[]
}
