import type { Product, CartItem, OrderCustomerDetails, ShoeSize } from '../../src/types'

export const TEST_SHOE_1: Product = {
  id: 'shoe-strata-01',
  name: 'AEVION Strata-X 01',
  tagline: 'Ultralight Kinetic Trail Runner',
  description: 'Carbon-plated adaptive cushioning engineered with high-traction terrain grip.',
  price: 12999,
  category: 'Trail / Kinetic',
  sizes: [7, 8, 9, 10, 11, 12],
  image: '/drone/drone-env.jpg',
  badge: 'Flagship',
  features: ['Aerospace Monomesh', 'Dual-Density Carbon Plate'],
}

export const TEST_SHOE_2: Product = {
  id: 'shoe-vortex-02',
  name: 'AEVION Vortex Alpha',
  tagline: 'High-Response Road Racing Shoe',
  description: 'Propulsive composite chassis designed for sustained threshold speed.',
  price: 14499,
  category: 'Road / Race',
  sizes: [8, 9, 10, 11],
  image: '/drone/drone-showcase.jpg',
  badge: 'Pro Edition',
  features: ['Pebax Foam Core', 'Graphene Traction Outsole'],
}

export const TEST_CUSTOMER: OrderCustomerDetails = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '+91 91234 56789',
  address: '42 Flight Avenue',
  city: 'Bengaluru',
  pincode: '560025',
}

export function createTestCartItem(product: Product, size: ShoeSize, quantity: number = 1): CartItem {
  return {
    id: `${product.id}-${size}`,
    product,
    size,
    quantity,
  }
}
