import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import type { CartItem, Product, ShoeSize, OrderRecord } from '../src/types'
import { ALL_SIZES, type ProductInventory, type InventoryAdjustment } from '../src/admin/types.ts'
import { makeSku, uid } from '../src/admin/utils.ts'
import { setupMockBrowser, type MockBrowserEnv } from './helpers/mockStorage.ts'
import { TEST_SHOE_1, TEST_SHOE_2, TEST_CUSTOMER, createTestCartItem } from './helpers/testData.ts'

/**
 * Pure headless Cart Engine matching the exact state transition logic
 * of src/context/CartContext.tsx for deterministic unit testing.
 */
class CartEngine {
  public items: CartItem[] = []
  private storageKey = 'aevion_cart_items_v1'

  constructor() {
    this.load()
  }

  private load(): void {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      const saved = localStorage.getItem(this.storageKey)
      this.items = saved ? JSON.parse(saved) : []
    } catch {
      this.items = []
    }
  }

  private persist(): void {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items))
    } catch {
      // storage unavailable
    }
  }

  public addToCart(product: Product, size: ShoeSize): void {
    const itemId = `${product.id}-${size}`
    const existingIndex = this.items.findIndex((item) => item.id === itemId)

    if (existingIndex > -1) {
      this.items = this.items.map((item, index) =>
        index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      )
    } else {
      this.items = [
        ...this.items,
        {
          id: itemId,
          product,
          size,
          quantity: 1,
        },
      ]
    }
    this.persist()
  }

  public removeFromCart(cartItemId: string): void {
    this.items = this.items.filter((item) => item.id !== cartItemId)
    this.persist()
  }

  public updateQuantity(cartItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(cartItemId)
      return
    }
    this.items = this.items.map((item) =>
      item.id === cartItemId ? { ...item, quantity } : item
    )
    this.persist()
  }

  public clearCart(): void {
    this.items = []
    this.persist()
  }

  public get totalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  public get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }
}

/**
 * Stock deduction engine matching src/admin/AdminStore.tsx `applyNewOrdersToInventory`
 */
function applyOrderStockDeduction(
  inventory: Record<string, ProductInventory>,
  orders: OrderRecord[],
  syncedOrderIds: Set<string>
): {
  updatedInventory: Record<string, ProductInventory>
  adjustments: InventoryAdjustment[]
  newlySynced: string[]
} {
  const fresh = orders.filter((o) => !syncedOrderIds.has(o.id) && o.status !== 'failed')
  const adjustments: InventoryAdjustment[] = []
  const next: Record<string, ProductInventory> = JSON.parse(JSON.stringify(inventory))
  const newlySynced: string[] = []

  for (const order of fresh) {
    newlySynced.push(order.id)
    for (const item of order.items) {
      const inv = next[item.product.id]
      const slot = inv?.sizes[item.size]
      if (!inv || !slot) continue

      const currentStock = slot.stock
      const stock = Math.max(0, currentStock - item.quantity)
      next[item.product.id] = {
        ...inv,
        sizes: {
          ...inv.sizes,
          [item.size]: { ...slot, stock },
        },
      }

      adjustments.push({
        id: uid('adj'),
        productId: item.product.id,
        productName: item.product.name,
        size: item.size,
        sku: slot.sku,
        delta: -item.quantity,
        resultingStock: stock,
        reason: 'order',
        at: new Date().toISOString(),
      })
    }
  }

  return { updatedInventory: next, adjustments, newlySynced }
}

describe('Cart & Pricing Regression Suite', () => {
  let mockEnv: MockBrowserEnv

  beforeEach(() => {
    mockEnv = setupMockBrowser()
  })

  afterEach(() => {
    mockEnv.cleanup()
  })

  describe('1. Shoe Sizing & Cart Items', () => {
    it('supports all valid shoe sizes (7 through 12)', () => {
      const expectedSizes: ShoeSize[] = [7, 8, 9, 10, 11, 12]
      assert.deepEqual(ALL_SIZES, expectedSizes)
    })

    it('treats different sizes of the same shoe as separate cart items', () => {
      const cart = new CartEngine()
      cart.addToCart(TEST_SHOE_1, 8)
      cart.addToCart(TEST_SHOE_1, 10)

      assert.equal(cart.items.length, 2)
      assert.equal(cart.items[0].id, `${TEST_SHOE_1.id}-8`)
      assert.equal(cart.items[0].size, 8)
      assert.equal(cart.items[0].quantity, 1)

      assert.equal(cart.items[1].id, `${TEST_SHOE_1.id}-10`)
      assert.equal(cart.items[1].size, 10)
      assert.equal(cart.items[1].quantity, 1)
    })

    it('increments quantity when adding the exact same shoe and size', () => {
      const cart = new CartEngine()
      cart.addToCart(TEST_SHOE_1, 9)
      cart.addToCart(TEST_SHOE_1, 9)
      cart.addToCart(TEST_SHOE_1, 9)

      assert.equal(cart.items.length, 1)
      assert.equal(cart.items[0].id, `${TEST_SHOE_1.id}-9`)
      assert.equal(cart.items[0].quantity, 3)
      assert.equal(cart.totalItems, 3)
    })

    it('keeps different products of the same size distinct', () => {
      const cart = new CartEngine()
      cart.addToCart(TEST_SHOE_1, 10)
      cart.addToCart(TEST_SHOE_2, 10)

      assert.equal(cart.items.length, 2)
      assert.equal(cart.items[0].id, `${TEST_SHOE_1.id}-10`)
      assert.equal(cart.items[1].id, `${TEST_SHOE_2.id}-10`)
    })
  })

  describe('2. Quantity Updates & Cart Modification', () => {
    it('updates quantity to any positive integer', () => {
      const cart = new CartEngine()
      cart.addToCart(TEST_SHOE_1, 9)

      const itemId = `${TEST_SHOE_1.id}-9`
      cart.updateQuantity(itemId, 5)

      assert.equal(cart.items.length, 1)
      assert.equal(cart.items[0].quantity, 5)
      assert.equal(cart.totalItems, 5)
    })

    it('removes item from cart when quantity is updated to 0', () => {
      const cart = new CartEngine()
      cart.addToCart(TEST_SHOE_1, 9)
      cart.addToCart(TEST_SHOE_1, 10)
      assert.equal(cart.items.length, 2)

      cart.updateQuantity(`${TEST_SHOE_1.id}-9`, 0)
      assert.equal(cart.items.length, 1)
      assert.equal(cart.items[0].id, `${TEST_SHOE_1.id}-10`)
    })

    it('removes item from cart when quantity is updated to a negative value', () => {
      const cart = new CartEngine()
      cart.addToCart(TEST_SHOE_1, 8)

      cart.updateQuantity(`${TEST_SHOE_1.id}-8`, -3)
      assert.equal(cart.items.length, 0)
      assert.equal(cart.totalItems, 0)
    })

    it('removes item explicitly via removeFromCart', () => {
      const cart = new CartEngine()
      cart.addToCart(TEST_SHOE_1, 7)
      cart.addToCart(TEST_SHOE_1, 11)

      cart.removeFromCart(`${TEST_SHOE_1.id}-7`)
      assert.equal(cart.items.length, 1)
      assert.equal(cart.items[0].size, 11)
    })

    it('clears all items from cart', () => {
      const cart = new CartEngine()
      cart.addToCart(TEST_SHOE_1, 8)
      cart.addToCart(TEST_SHOE_2, 9)
      assert.equal(cart.items.length, 2)

      cart.clearCart()
      assert.equal(cart.items.length, 0)
      assert.equal(cart.totalItems, 0)
      assert.equal(cart.subtotal, 0)
    })

    it('persists cart state to localStorage and restores on new instance', () => {
      const cart1 = new CartEngine()
      cart1.addToCart(TEST_SHOE_1, 10)
      cart1.addToCart(TEST_SHOE_2, 11)
      cart1.updateQuantity(`${TEST_SHOE_1.id}-10`, 3)

      const raw = mockEnv.storage.getItem('aevion_cart_items_v1')
      assert.ok(raw !== null)

      const cart2 = new CartEngine()
      assert.equal(cart2.items.length, 2)
      assert.equal(cart2.totalItems, 4)
      assert.equal(cart2.items[0].quantity, 3)
    })
  })

  describe('3. Subtotal & Pricing Calculations', () => {
    it('calculates subtotal as 0 for an empty cart', () => {
      const cart = new CartEngine()
      assert.equal(cart.subtotal, 0)
      assert.equal(cart.totalItems, 0)
    })

    it('calculates single-item subtotal (price × quantity)', () => {
      const cart = new CartEngine()
      cart.addToCart(TEST_SHOE_1, 9) // price ₹12,999

      assert.equal(cart.subtotal, 12999)

      cart.updateQuantity(`${TEST_SHOE_1.id}-9`, 3)
      assert.equal(cart.subtotal, 12999 * 3) // ₹38,997
      assert.equal(cart.totalItems, 3)
    })

    it('calculates multi-product, multi-size subtotal accurately', () => {
      const cart = new CartEngine()
      // Shoe 1: ₹12,999
      cart.addToCart(TEST_SHOE_1, 8) // qty 1 -> ₹12,999
      cart.addToCart(TEST_SHOE_1, 10) // qty 1 -> ₹12,999
      cart.updateQuantity(`${TEST_SHOE_1.id}-10`, 2) // qty 2 -> ₹25,998

      // Shoe 2: ₹14,499
      cart.addToCart(TEST_SHOE_2, 9) // qty 1 -> ₹14,499
      cart.updateQuantity(`${TEST_SHOE_2.id}-9`, 3) // qty 3 -> ₹43,497

      const expectedTotal = 12999 * 1 + 12999 * 2 + 14499 * 3
      assert.equal(cart.subtotal, expectedTotal) // 12999 + 25998 + 43497 = 82494
      assert.equal(cart.subtotal, 82494)
      assert.equal(cart.totalItems, 6)
    })

    it('dynamically updates subtotal when items are removed or cleared', () => {
      const cart = new CartEngine()
      cart.addToCart(TEST_SHOE_1, 9) // 12999
      cart.addToCart(TEST_SHOE_2, 10) // 14499

      assert.equal(cart.subtotal, 27498)

      cart.removeFromCart(`${TEST_SHOE_1.id}-9`)
      assert.equal(cart.subtotal, 14499)

      cart.clearCart()
      assert.equal(cart.subtotal, 0)
    })
  })

  describe('4. Stock Deduction Logic', () => {
    function createMockInventory(initialStockMap: Record<number, number>): Record<string, ProductInventory> {
      const sizes = {} as Record<ShoeSize, { sku: string; stock: number }>
      for (const size of ALL_SIZES) {
        sizes[size] = {
          sku: makeSku(TEST_SHOE_1.id, size),
          stock: initialStockMap[size] ?? 10,
        }
      }

      return {
        [TEST_SHOE_1.id]: {
          productId: TEST_SHOE_1.id,
          lowStockThreshold: 5,
          sizes,
        },
      }
    }

    it('deducts inventory stock matching item quantities in fresh orders', () => {
      const inventory = createMockInventory({ 9: 15, 10: 20 })
      const order: OrderRecord = {
        id: 'ord_deduct_01',
        items: [
          createTestCartItem(TEST_SHOE_1, 9, 3),
          createTestCartItem(TEST_SHOE_1, 10, 5),
        ],
        customer: TEST_CUSTOMER,
        amount: 12999 * 8,
        razorpayOrderId: 'rzp_deduct_01',
        status: 'completed',
        createdAt: new Date().toISOString(),
      }

      const { updatedInventory, adjustments, newlySynced } = applyOrderStockDeduction(
        inventory,
        [order],
        new Set()
      )

      assert.equal(updatedInventory[TEST_SHOE_1.id].sizes[9].stock, 12, '15 - 3 = 12')
      assert.equal(updatedInventory[TEST_SHOE_1.id].sizes[10].stock, 15, '20 - 5 = 15')
      assert.equal(adjustments.length, 2)
      assert.equal(adjustments[0].delta, -3)
      assert.equal(adjustments[0].reason, 'order')
      assert.equal(adjustments[0].resultingStock, 12)
      assert.equal(adjustments[1].delta, -5)
      assert.equal(adjustments[1].resultingStock, 15)
      assert.deepEqual(newlySynced, ['ord_deduct_01'])
    })

    it('prevents stock from dropping below zero (bounds at 0)', () => {
      const inventory = createMockInventory({ 8: 2 })
      const order: OrderRecord = {
        id: 'ord_oversold_01',
        items: [createTestCartItem(TEST_SHOE_1, 8, 10)], // Order 10 when only 2 in stock
        customer: TEST_CUSTOMER,
        amount: 129990,
        razorpayOrderId: 'rzp_oversold_01',
        status: 'completed',
        createdAt: new Date().toISOString(),
      }

      const { updatedInventory, adjustments } = applyOrderStockDeduction(
        inventory,
        [order],
        new Set()
      )

      assert.equal(updatedInventory[TEST_SHOE_1.id].sizes[8].stock, 0)
      assert.equal(adjustments[0].resultingStock, 0)
    })

    it('does not deduct stock for already synced orders (idempotent)', () => {
      const inventory = createMockInventory({ 9: 10 })
      const order: OrderRecord = {
        id: 'ord_already_synced',
        items: [createTestCartItem(TEST_SHOE_1, 9, 2)],
        customer: TEST_CUSTOMER,
        amount: 25998,
        razorpayOrderId: 'rzp_synced_01',
        status: 'completed',
        createdAt: new Date().toISOString(),
      }

      const alreadySeen = new Set(['ord_already_synced'])
      const { updatedInventory, adjustments, newlySynced } = applyOrderStockDeduction(
        inventory,
        [order],
        alreadySeen
      )

      // Stock should remain unchanged
      assert.equal(updatedInventory[TEST_SHOE_1.id].sizes[9].stock, 10)
      assert.equal(adjustments.length, 0)
      assert.equal(newlySynced.length, 0)
    })

    it('does not deduct stock for failed orders', () => {
      const inventory = createMockInventory({ 9: 10 })
      const failedOrder: OrderRecord = {
        id: 'ord_failed_01',
        items: [createTestCartItem(TEST_SHOE_1, 9, 4)],
        customer: TEST_CUSTOMER,
        amount: 12999 * 4,
        razorpayOrderId: 'rzp_failed_01',
        status: 'failed',
        createdAt: new Date().toISOString(),
      }

      const { updatedInventory, adjustments, newlySynced } = applyOrderStockDeduction(
        inventory,
        [failedOrder],
        new Set()
      )

      assert.equal(updatedInventory[TEST_SHOE_1.id].sizes[9].stock, 10)
      assert.equal(adjustments.length, 0)
      assert.equal(newlySynced.length, 0)
    })
  })
})
