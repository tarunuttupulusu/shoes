import type { OrderRecord, Product, ShoeSize } from '../types'

export const ALL_SIZES: ShoeSize[] = [7, 8, 9, 10, 11, 12]

export type FulfillmentStatus = 'pending' | 'processing' | 'completed'
export type PaymentStatus = OrderRecord['status']

export interface SizeStock {
  sku: string
  stock: number
}

export interface ProductInventory {
  productId: string
  lowStockThreshold: number
  sizes: Record<ShoeSize, SizeStock>
}

export interface InventoryAdjustment {
  id: string
  productId: string
  productName: string
  size: ShoeSize
  sku: string
  delta: number
  resultingStock: number
  reason: 'restock' | 'adjustment' | 'order' | 'set'
  at: string
}

export interface AdminOrder extends OrderRecord {
  fulfillment: FulfillmentStatus
}

export interface LowStockAlert {
  product: Product
  size: ShoeSize
  sku: string
  stock: number
  threshold: number
}

export type AdminTab = 'dashboard' | 'inventory' | 'products' | 'orders'
