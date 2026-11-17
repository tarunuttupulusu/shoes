import { Product } from '../types'

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'shoe-strata-01',
    name: 'AEVION Strata-X 01',
    tagline: 'Ultralight Kinetic Trail Runner',
    description: 'Carbon-plated adaptive cushioning engineered with high-traction terrain grip and aerospace knit upper.',
    price: 12999,
    category: 'Trail / Kinetic',
    sizes: [7, 8, 9, 10, 11, 12],
    image: '/drone/drone-env.jpg',
    badge: 'Flagship',
    features: ['Aerospace Monomesh', 'Dual-Density Carbon Plate', 'Vibram Megagrip Lug System']
  },
  {
    id: 'shoe-vector-02',
    name: 'AEVION Vector Flow',
    tagline: 'Precision Aerodynamic Road Racer',
    description: 'Laser-engineered responsive midsole returning 88% kinetic energy on high-cadence road courses.',
    price: 14499,
    category: 'Road / Speed',
    sizes: [8, 9, 10, 11],
    image: '/icon.png',
    badge: 'New Release',
    features: ['EnergyMatrix Foam', 'Bio-adaptive Fit Collar', 'Hydrophobic TPU Coating']
  },
  {
    id: 'shoe-terra-03',
    name: 'AEVION Terra Shield',
    tagline: 'All-Terrain Expedition Sneaker',
    description: 'Reinforced ballistic weave and anatomical arch stabilizer for alpine ascents and urban transit.',
    price: 16999,
    category: 'Expedition / Tactical',
    sizes: [7, 8, 9, 10, 11, 12],
    image: '/apple-icon.png',
    badge: 'Pro Tier',
    features: ['Gore-Shield Membrane', 'Ortholite 3D Footbed', 'Kevlar Reinforced Eyelets']
  }
]
