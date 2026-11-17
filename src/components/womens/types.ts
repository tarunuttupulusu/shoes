export type WomensShoeSize = 5 | 5.5 | 6 | 6.5 | 7 | 7.5 | 8 | 8.5 | 9 | 9.5 | 10 | 10.5 | 11

export type ArchSupport = 'Neutral' | 'Medium' | 'High' | 'Stability'

export type CushioningLevel = 'Responsive' | 'Balanced' | 'Plush' | 'Lightweight'

export type ShoeCategory = 'Athletic' | 'Lifestyle'

export interface Colorway {
  name: string
  hex: string
  accentHex?: string
  image: string
  badge?: string
}

export interface WomensShoeSpecs {
  weight: string
  energyReturn: string
  stackHeight: string
  drop: string
}

export interface WomensProduct {
  id: string
  name: string
  tagline: string
  description: string
  price: number // in INR (₹)
  category: ShoeCategory
  activity: string
  sizes: WomensShoeSize[]
  archSupport: ArchSupport
  cushioning: CushioningLevel
  colorways: Colorway[]
  badge?: string
  features: string[]
  specs: WomensShoeSpecs
}

export interface WomensFilterState {
  category: 'All' | 'Athletic' | 'Lifestyle'
  sizes: WomensShoeSize[]
  archSupport: ArchSupport[]
  cushioning: CushioningLevel[]
  searchQuery: string
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name'
}
