import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import type { OrderRecord, Product, ShoeSize } from '../src/types'
import {
  ALL_SIZES,
  type AdminOrder,
  type FulfillmentStatus,
  type InventoryAdjustment,
  type LowStockAlert,
  type PaymentStatus,
  type ProductInventory,
  type SizeStock,
} from '../src/admin/types.ts'
import {
  makeSku,
  slugify,
  makeProductId,
  formatINR,
  readJSON,
  writeJSON,
  uid,
} from '../src/admin/utils.ts'
import { OrderStore } from '../src/server/orderStore.ts'
import { setupMockBrowser, type MockBrowserEnv } from './helpers/mockStorage.ts'
import { TEST_SHOE_1, TEST_SHOE_2, TEST_CUSTOMER, createTestCartItem } from './helpers/testData.ts'

const DEFAULT_THRESHOLD = 5
const MAX_LOG = 50

const seedStock = (productId: string, size: ShoeSize): number => {
  let h = size * 31
  for (const ch of productId) h = (h * 33 + ch.charCodeAt(0)) % 997
  return h % 28
}

const buildInventory = (product: Product, previous?: ProductInventory): ProductInventory => {
  const sizes = {} as Record<ShoeSize, SizeStock>
  for (const size of ALL_SIZES) {
    const prev = previous?.sizes?.[size]
    sizes[size] = {
      sku: prev?.sku || makeSku(product.id, size),
      stock: prev ? prev.stock : product.sizes.includes(size) ? seedStock(product.id, size) : 0,
    }
  }
  return {
    productId: product.id,
    lowStockThreshold: previous?.lowStockThreshold ?? DEFAULT_THRESHOLD,
    sizes,
  }
}

const reconcileInventory = (
  products: Product[],
  current: Record<string, ProductInventory>
): Record<string, ProductInventory> => {
  const next: Record<string, ProductInventory> = {}
  for (const p of products) next[p.id] = buildInventory(p, current[p.id])
  return next
}

const defaultFulfillment = (order: OrderRecord): FulfillmentStatus =>
  order.status === 'completed' ? 'completed' : 'pending'

/**
 * Headless Admin Operations Engine implementing exact logic from src/admin/AdminStore.tsx
 */
class AdminEngine {
  public products: Product[]
  public inventory: Record<string, ProductInventory>
  public fulfillment: Record<string, FulfillmentStatus>
  public adjustments: InventoryAdjustment[]
  public orderStore: OrderStore

  private readonly PRODUCTS_KEY = 'aevion_admin_products'
  private readonly INVENTORY_KEY = 'aevion_admin_inventory'
  private readonly FULFILLMENT_KEY = 'aevion_admin_fulfillment'
  private readonly ADJUSTMENTS_KEY = 'aevion_admin_inventory_log'

  constructor(initialProducts: Product[] = [TEST_SHOE_1, TEST_SHOE_2]) {
    this.orderStore = new OrderStore()
    this.products = readJSON<Product[]>(this.PRODUCTS_KEY, initialProducts)
    this.inventory = reconcileInventory(
      this.products,
      readJSON<Record<string, ProductInventory>>(this.INVENTORY_KEY, {})
    )
    this.fulfillment = readJSON<Record<string, FulfillmentStatus>>(this.FULFILLMENT_KEY, {})
    this.adjustments = readJSON<InventoryAdjustment[]>(this.ADJUSTMENTS_KEY, [])
    this.persist()
  }

  public persist(): void {
    writeJSON(this.PRODUCTS_KEY, this.products)
    writeJSON(this.INVENTORY_KEY, this.inventory)
    writeJSON(this.FULFILLMENT_KEY, this.fulfillment)
    writeJSON(this.ADJUSTMENTS_KEY, this.adjustments)
  }

  public get orders(): AdminOrder[] {
    const raw = this.orderStore.getAllOrders()
    return [...raw]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((o) => ({
        ...o,
        fulfillment: this.fulfillment[o.id] ?? defaultFulfillment(o),
      }))
  }

  public get lowStockAlerts(): LowStockAlert[] {
    const alerts: LowStockAlert[] = []
    for (const product of this.products) {
      const inv = this.inventory[product.id]
      if (!inv) continue
      for (const size of product.sizes) {
        const slot = inv.sizes[size]
        if (slot && slot.stock <= inv.lowStockThreshold) {
          alerts.push({
            product,
            size,
            sku: slot.sku,
            stock: slot.stock,
            threshold: inv.lowStockThreshold,
          })
        }
      }
    }
    return alerts.sort((a, b) => a.stock - b.stock)
  }

  private logAdjustments(entries: InventoryAdjustment[]): void {
    if (!entries.length) return
    this.adjustments = [...entries, ...this.adjustments].slice(0, MAX_LOG)
    this.persist()
  }

  private mutateSlot(
    productId: string,
    size: ShoeSize,
    compute: (stock: number) => number,
    reason: InventoryAdjustment['reason']
  ): void {
    const inv = this.inventory[productId]
    const slot = inv?.sizes[size]
    if (!inv || !slot) return

    const stock = Math.max(0, Math.floor(compute(slot.stock)))
    if (stock === slot.stock) return

    this.inventory = {
      ...this.inventory,
      [productId]: {
        ...inv,
        sizes: {
          ...inv.sizes,
          [size]: { ...slot, stock },
        },
      },
    }

    const product = this.products.find((p) => p.id === productId)
    this.logAdjustments([
      {
        id: uid('adj'),
        productId,
        productName: product?.name ?? productId,
        size,
        sku: slot.sku,
        delta: stock - slot.stock,
        resultingStock: stock,
        reason,
        at: new Date().toISOString(),
      },
    ])
    this.persist()
  }

  public adjustStock(
    productId: string,
    size: ShoeSize,
    delta: number,
    reason?: InventoryAdjustment['reason']
  ): void {
    this.mutateSlot(
      productId,
      size,
      (s) => s + delta,
      reason ?? (delta > 0 ? 'restock' : 'adjustment')
    )
  }

  public setStock(productId: string, size: ShoeSize, value: number): void {
    this.mutateSlot(
      productId,
      size,
      () => (Number.isFinite(value) ? value : 0),
      'set'
    )
  }

  public setSku(productId: string, size: ShoeSize, sku: string): void {
    const inv = this.inventory[productId]
    if (!inv) return
    this.inventory = {
      ...this.inventory,
      [productId]: {
        ...inv,
        sizes: {
          ...inv.sizes,
          [size]: { ...inv.sizes[size], sku },
        },
      },
    }
    this.persist()
  }

  public setThreshold(productId: string, threshold: number): void {
    const inv = this.inventory[productId]
    if (!inv) return
    this.inventory = {
      ...this.inventory,
      [productId]: {
        ...inv,
        lowStockThreshold: Math.max(0, Math.floor(threshold) || 0),
      },
    }
    this.persist()
  }

  public setFulfillment(orderId: string, status: FulfillmentStatus): void {
    this.fulfillment = { ...this.fulfillment, [orderId]: status }
    this.persist()
  }

  public setPaymentStatus(orderId: string, status: PaymentStatus, paymentId?: string): void {
    this.orderStore.updateOrderStatus(orderId, status, paymentId)
    this.persist()
  }

  public deleteOrder(orderId: string): void {
    this.orderStore.deleteOrder(orderId)
    const { [orderId]: _removed, ...rest } = this.fulfillment
    this.fulfillment = rest
    this.persist()
  }
}

describe('Admin Operations Regression Suite', () => {
  let mockEnv: MockBrowserEnv

  beforeEach(() => {
    mockEnv = setupMockBrowser()
  })

  afterEach(() => {
    mockEnv.cleanup()
  })

  describe('1. Inventory Adjustments & Stock Management', () => {
    it('initializes product inventory for all shoe sizes (7 to 12) with default SKUs', () => {
      const admin = new AdminEngine()
      const inv = admin.inventory[TEST_SHOE_1.id]

      assert.ok(inv !== undefined)
      assert.equal(inv.productId, TEST_SHOE_1.id)
      assert.equal(inv.lowStockThreshold, DEFAULT_THRESHOLD)

      for (const size of ALL_SIZES) {
        assert.ok(inv.sizes[size] !== undefined)
        assert.equal(inv.sizes[size].sku, makeSku(TEST_SHOE_1.id, size))
        assert.ok(typeof inv.sizes[size].stock === 'number')
      }
    })

    it('adjusts stock with positive delta and logs restock reason', () => {
      const admin = new AdminEngine()
      admin.setStock(TEST_SHOE_1.id, 9, 10)
      const initialLogs = admin.adjustments.length

      admin.adjustStock(TEST_SHOE_1.id, 9, 5)

      const updated = admin.inventory[TEST_SHOE_1.id].sizes[9].stock
      assert.equal(updated, 15)

      assert.equal(admin.adjustments.length, initialLogs + 1)
      const latestLog = admin.adjustments[0]
      assert.equal(latestLog.productId, TEST_SHOE_1.id)
      assert.equal(latestLog.size, 9)
      assert.equal(latestLog.delta, 5)
      assert.equal(latestLog.resultingStock, 15)
      assert.equal(latestLog.reason, 'restock')
    })

    it('adjusts stock with negative delta and logs adjustment reason', () => {
      const admin = new AdminEngine()
      admin.setStock(TEST_SHOE_1.id, 10, 20)

      admin.adjustStock(TEST_SHOE_1.id, 10, -8)

      const updated = admin.inventory[TEST_SHOE_1.id].sizes[10].stock
      assert.equal(updated, 12)

      const latestLog = admin.adjustments[0]
      assert.equal(latestLog.delta, -8)
      assert.equal(latestLog.resultingStock, 12)
      assert.equal(latestLog.reason, 'adjustment')
    })

    it('floors stock at zero when negative delta exceeds current stock', () => {
      const admin = new AdminEngine()
      admin.setStock(TEST_SHOE_1.id, 8, 3)

      admin.adjustStock(TEST_SHOE_1.id, 8, -10)

      const updated = admin.inventory[TEST_SHOE_1.id].sizes[8].stock
      assert.equal(updated, 0)

      const latestLog = admin.adjustments[0]
      assert.equal(latestLog.delta, -3, 'Recorded delta should be the actual change (-3)')
      assert.equal(latestLog.resultingStock, 0)
    })

    it('sets stock to an exact value with setStock and reason "set"', () => {
      const admin = new AdminEngine()
      admin.setStock(TEST_SHOE_1.id, 11, 42)

      assert.equal(admin.inventory[TEST_SHOE_1.id].sizes[11].stock, 42)
      const latestLog = admin.adjustments[0]
      assert.equal(latestLog.resultingStock, 42)
      assert.equal(latestLog.reason, 'set')
    })

    it('updates SKU for a specific shoe size', () => {
      const admin = new AdminEngine()
      const customSku = 'AEV-CUSTOM-STRATA-SIZE12-LIMITED'

      admin.setSku(TEST_SHOE_1.id, 12, customSku)

      assert.equal(admin.inventory[TEST_SHOE_1.id].sizes[12].sku, customSku)

      // Verify persistence in localStorage
      const persisted = readJSON<Record<string, ProductInventory>>('aevion_admin_inventory', {})
      assert.equal(persisted[TEST_SHOE_1.id].sizes[12].sku, customSku)
    })

    it('caps inventory adjustment history at MAX_LOG (50) items', () => {
      const admin = new AdminEngine()
      for (let i = 0; i < 60; i++) {
        admin.adjustStock(TEST_SHOE_1.id, 9, 1)
      }

      assert.equal(admin.adjustments.length, MAX_LOG)
    })

    it('validates admin utility functions (makeSku, slugify, makeProductId, formatINR)', () => {
      // makeSku
      assert.equal(makeSku('shoe-strata-01', 10), 'AEV-STRATA-01-10')
      assert.equal(makeSku('shoe-vortex-alpha', 8), 'AEV-VORTEX-ALPHA-8')

      // slugify
      assert.equal(slugify('  AEVION Apex Runner Pro!  '), 'aevion-apex-runner-pro')

      // makeProductId
      const existing: Product[] = [{ ...TEST_SHOE_1, id: 'shoe-aevion-strata-x-01' }]
      const newId1 = makeProductId('Apex Glide', existing)
      assert.equal(newId1, 'shoe-apex-glide')
      const newIdCollision = makeProductId('AEVION Strata-X 01', existing)
      assert.equal(newIdCollision, 'shoe-aevion-strata-x-01-2')

      // formatINR
      const formatted = formatINR(12999)
      assert.ok(formatted.includes('12,999') || formatted.includes('12999'))
    })
  })

  describe('2. Low-Stock Threshold Triggers', () => {
    it('triggers low-stock alert when stock is equal to or below threshold', () => {
      const admin = new AdminEngine([TEST_SHOE_1])
      admin.setThreshold(TEST_SHOE_1.id, 5)

      // Set size 9 stock to 4 (below threshold 5)
      admin.setStock(TEST_SHOE_1.id, 9, 4)
      // Set size 10 stock to 15 (healthy)
      admin.setStock(TEST_SHOE_1.id, 10, 15)

      const alerts = admin.lowStockAlerts
      const alertForSize9 = alerts.find((a) => a.product.id === TEST_SHOE_1.id && a.size === 9)
      assert.ok(alertForSize9 !== undefined)
      assert.equal(alertForSize9?.stock, 4)
      assert.equal(alertForSize9?.threshold, 5)

      const alertForSize10 = alerts.find((a) => a.product.id === TEST_SHOE_1.id && a.size === 10)
      assert.equal(alertForSize10, undefined, 'Size 10 has 15 in stock and should not trigger alert')
    })

    it('triggers alert when stock is exactly at the threshold value', () => {
      const admin = new AdminEngine([TEST_SHOE_1])
      admin.setThreshold(TEST_SHOE_1.id, 5)
      admin.setStock(TEST_SHOE_1.id, 8, 5)

      const alerts = admin.lowStockAlerts
      const alert = alerts.find((a) => a.size === 8)
      assert.ok(alert !== undefined)
      assert.equal(alert?.stock, 5)
    })

    it('clears low-stock alert when stock is replenished above threshold', () => {
      const admin = new AdminEngine([TEST_SHOE_1])
      admin.setThreshold(TEST_SHOE_1.id, 5)
      admin.setStock(TEST_SHOE_1.id, 9, 2)

      assert.ok(admin.lowStockAlerts.some((a) => a.size === 9))

      // Restock size 9 by +10 -> new stock 12
      admin.adjustStock(TEST_SHOE_1.id, 9, 10, 'restock')
      assert.equal(admin.inventory[TEST_SHOE_1.id].sizes[9].stock, 12)

      assert.equal(admin.lowStockAlerts.some((a) => a.size === 9), false)
    })

    it('updates threshold triggers dynamically via setThreshold', () => {
      const admin = new AdminEngine([TEST_SHOE_1])
      // Initial stock: 8
      admin.setStock(TEST_SHOE_1.id, 9, 8)
      admin.setThreshold(TEST_SHOE_1.id, 5)

      // Stock is 8, threshold is 5 -> No alert
      assert.equal(admin.lowStockAlerts.some((a) => a.size === 9), false)

      // Increase threshold to 10 -> Stock 8 is now <= 10 -> Triggers alert!
      admin.setThreshold(TEST_SHOE_1.id, 10)
      assert.equal(admin.inventory[TEST_SHOE_1.id].lowStockThreshold, 10)
      const triggered = admin.lowStockAlerts.find((a) => a.size === 9)
      assert.ok(triggered !== undefined)
      assert.equal(triggered?.threshold, 10)

      // Lower threshold to 3 -> Stock 8 is > 3 -> Alert cleared!
      admin.setThreshold(TEST_SHOE_1.id, 3)
      assert.equal(admin.lowStockAlerts.some((a) => a.size === 9), false)
    })

    it('sorts multiple low-stock alerts by stock ascending (most critical first)', () => {
      const admin = new AdminEngine([TEST_SHOE_1])
      admin.setThreshold(TEST_SHOE_1.id, 10)

      admin.setStock(TEST_SHOE_1.id, 7, 6)
      admin.setStock(TEST_SHOE_1.id, 8, 1) // most critical
      admin.setStock(TEST_SHOE_1.id, 9, 4)

      const alerts = admin.lowStockAlerts.filter((a) => a.product.id === TEST_SHOE_1.id)
      assert.ok(alerts.length >= 3)
      for (let i = 0; i < alerts.length - 1; i++) {
        assert.ok(alerts[i].stock <= alerts[i + 1].stock, 'Alerts must be ordered ascending by stock')
      }
      assert.equal(alerts[0].size, 8)
      assert.equal(alerts[0].stock, 1)
    })
  })

  describe('3. Fulfillment & Payment Status Transitions', () => {
    it('assigns correct default fulfillment status based on order completion', () => {
      const admin = new AdminEngine()
      const item = createTestCartItem(TEST_SHOE_1, 10, 1)

      const completedOrder = admin.orderStore.createOrder({
        items: [item],
        customer: TEST_CUSTOMER,
        amount: 12999,
        razorpayOrderId: 'rzp_done_01',
        status: 'completed',
      })

      const pendingOrder = admin.orderStore.createOrder({
        items: [item],
        customer: TEST_CUSTOMER,
        amount: 12999,
        razorpayOrderId: 'rzp_pend_01',
        status: 'pending',
      })

      const adminOrders = admin.orders
      const foundCompleted = adminOrders.find((o) => o.id === completedOrder.id)
      const foundPending = adminOrders.find((o) => o.id === pendingOrder.id)

      assert.equal(foundCompleted?.fulfillment, 'completed')
      assert.equal(foundPending?.fulfillment, 'pending')
    })

    it('transitions fulfillment status through full lifecycle (pending -> processing -> completed)', () => {
      const admin = new AdminEngine()
      const item = createTestCartItem(TEST_SHOE_1, 9, 1)
      const order = admin.orderStore.createOrder({
        items: [item],
        customer: TEST_CUSTOMER,
        amount: 12999,
        razorpayOrderId: 'rzp_trans_01',
        status: 'pending',
      })

      // 1. Initial state: pending
      assert.equal(admin.orders.find((o) => o.id === order.id)?.fulfillment, 'pending')

      // 2. Transition to processing
      admin.setFulfillment(order.id, 'processing')
      assert.equal(admin.orders.find((o) => o.id === order.id)?.fulfillment, 'processing')

      // Verify persistence in localStorage
      const storedFulfillment1 = readJSON<Record<string, FulfillmentStatus>>('aevion_admin_fulfillment', {})
      assert.equal(storedFulfillment1[order.id], 'processing')

      // 3. Transition to completed
      admin.setFulfillment(order.id, 'completed')
      assert.equal(admin.orders.find((o) => o.id === order.id)?.fulfillment, 'completed')

      const storedFulfillment2 = readJSON<Record<string, FulfillmentStatus>>('aevion_admin_fulfillment', {})
      assert.equal(storedFulfillment2[order.id], 'completed')
    })

    it('updates payment status and propagates to underlying OrderStore', () => {
      const admin = new AdminEngine()
      const order = admin.orderStore.createOrder({
        items: [],
        customer: TEST_CUSTOMER,
        amount: 12999,
        razorpayOrderId: 'rzp_pay_01',
        status: 'pending',
      })

      admin.setPaymentStatus(order.id, 'completed', 'pay_admin_confirm_888')

      const orderInStore = admin.orderStore.getOrder(order.id)
      assert.equal(orderInStore?.status, 'completed')
      assert.equal(orderInStore?.razorpayPaymentId, 'pay_admin_confirm_888')

      const adminOrder = admin.orders.find((o) => o.id === order.id)
      assert.equal(adminOrder?.status, 'completed')
      assert.equal(adminOrder?.razorpayPaymentId, 'pay_admin_confirm_888')
    })

    it('deletes order from OrderStore and removes corresponding fulfillment mapping', () => {
      const admin = new AdminEngine()
      const order = admin.orderStore.createOrder({
        items: [],
        customer: TEST_CUSTOMER,
        amount: 12999,
        razorpayOrderId: 'rzp_delete_01',
      })

      admin.setFulfillment(order.id, 'processing')
      assert.equal(admin.fulfillment[order.id], 'processing')
      assert.ok(admin.orders.some((o) => o.id === order.id))

      admin.deleteOrder(order.id)

      assert.equal(admin.orderStore.getOrder(order.id), null)
      assert.equal(admin.fulfillment[order.id], undefined)
      assert.equal(admin.orders.some((o) => o.id === order.id), false)

      // Verify localStorage was updated
      const storedFulfillment = readJSON<Record<string, FulfillmentStatus>>('aevion_admin_fulfillment', {})
      assert.equal(storedFulfillment[order.id], undefined)
    })
  })
})
