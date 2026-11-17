import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { OrderRecord, Product, ShoeSize } from '../types'
import { INITIAL_PRODUCTS } from '../data/products'
import { orderStore } from '../server/orderStore'
import {
  ALL_SIZES,
  type AdminOrder,
  type FulfillmentStatus,
  type InventoryAdjustment,
  type LowStockAlert,
  type PaymentStatus,
  type ProductInventory,
  type SizeStock,
} from './types'
import { makeSku, readJSON, uid, writeJSON } from './utils'

const ORDERS_KEY = 'aevion_shoe_orders_db'
const PRODUCTS_KEY = 'aevion_admin_products'
const INVENTORY_KEY = 'aevion_admin_inventory'
const FULFILLMENT_KEY = 'aevion_admin_fulfillment'
const ADJUSTMENTS_KEY = 'aevion_admin_inventory_log'
const SYNCED_ORDERS_KEY = 'aevion_admin_synced_orders'

const POLL_MS = 3000
const DEFAULT_THRESHOLD = 5
const MAX_LOG = 50

/** Deterministic, varied starting stock so the demo has a mix of healthy and low items. */
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

const readOrders = (): OrderRecord[] => {
  const stored = readJSON<OrderRecord[] | null>(ORDERS_KEY, null)
  return Array.isArray(stored) ? stored : orderStore.getAllOrders()
}

const defaultFulfillment = (order: OrderRecord): FulfillmentStatus =>
  order.status === 'completed' ? 'completed' : 'pending'

interface AdminContextValue {
  products: Product[]
  inventory: Record<string, ProductInventory>
  orders: AdminOrder[]
  adjustments: InventoryAdjustment[]
  lowStockAlerts: LowStockAlert[]
  lastSyncedAt: Date
  newOrderIds: Set<string>
  // inventory
  adjustStock: (productId: string, size: ShoeSize, delta: number, reason?: InventoryAdjustment['reason']) => void
  setStock: (productId: string, size: ShoeSize, value: number) => void
  setSku: (productId: string, size: ShoeSize, sku: string) => void
  setThreshold: (productId: string, threshold: number) => void
  // catalog
  saveProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  resetCatalog: () => void
  // orders
  setFulfillment: (orderId: string, status: FulfillmentStatus) => void
  setPaymentStatus: (orderId: string, status: PaymentStatus, paymentId?: string) => void
  deleteOrder: (orderId: string) => void
  refreshOrders: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = readJSON<Product[] | null>(PRODUCTS_KEY, null)
    return Array.isArray(stored) && stored.length ? stored : INITIAL_PRODUCTS
  })
  const [inventory, setInventory] = useState<Record<string, ProductInventory>>(() =>
    reconcileInventory(products, readJSON(INVENTORY_KEY, {}))
  )
  const [fulfillment, setFulfillmentMap] = useState<Record<string, FulfillmentStatus>>(() =>
    readJSON(FULFILLMENT_KEY, {})
  )
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>(() => readJSON(ADJUSTMENTS_KEY, []))
  const [rawOrders, setRawOrders] = useState<OrderRecord[]>(() => readOrders())
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date())
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(() => new Set())

  const productsRef = useRef(products)
  productsRef.current = products
  const inventoryRef = useRef(inventory)
  inventoryRef.current = inventory

  // Persist admin-owned state
  useEffect(() => writeJSON(PRODUCTS_KEY, products), [products])
  useEffect(() => writeJSON(INVENTORY_KEY, inventory), [inventory])
  useEffect(() => writeJSON(FULFILLMENT_KEY, fulfillment), [fulfillment])
  useEffect(() => writeJSON(ADJUSTMENTS_KEY, adjustments), [adjustments])

  // Keep inventory rows in step with the catalog
  useEffect(() => {
    setInventory((cur) => reconcileInventory(products, cur))
  }, [products])

  const logAdjustments = useCallback((entries: InventoryAdjustment[]) => {
    if (!entries.length) return
    setAdjustments((cur) => [...entries, ...cur].slice(0, MAX_LOG))
  }, [])

  /** Deduct stock for orders the admin panel has never seen before. */
  const applyNewOrdersToInventory = useCallback(
    (orders: OrderRecord[]) => {
      const synced = readJSON<string[] | null>(SYNCED_ORDERS_KEY, null)
      if (!synced) {
        // First run: treat existing orders as already reflected in stock.
        writeJSON(SYNCED_ORDERS_KEY, orders.map((o) => o.id))
        return
      }
      const seen = new Set(synced)
      const fresh = orders.filter((o) => !seen.has(o.id) && o.status !== 'failed')
      if (!fresh.length) return

      const entries: InventoryAdjustment[] = []
      const next = { ...inventoryRef.current }
      for (const order of fresh) {
        for (const item of order.items) {
          const inv = next[item.product.id]
          const slot = inv?.sizes[item.size]
          if (!inv || !slot) continue
          const stock = Math.max(0, slot.stock - item.quantity)
          next[item.product.id] = { ...inv, sizes: { ...inv.sizes, [item.size]: { ...slot, stock } } }
          entries.push({
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
      inventoryRef.current = next
      setInventory(next)
      logAdjustments(entries)
      setNewOrderIds((cur) => {
        const next = new Set(cur)
        fresh.forEach((o) => next.add(o.id))
        return next
      })
      writeJSON(SYNCED_ORDERS_KEY, [...synced, ...fresh.map((o) => o.id)])
    },
    [logAdjustments]
  )

  const refreshOrders = useCallback(() => {
    const orders = readOrders()
    setRawOrders((cur) => (JSON.stringify(cur) === JSON.stringify(orders) ? cur : orders))
    applyNewOrdersToInventory(orders)
    setLastSyncedAt(new Date())
  }, [applyNewOrdersToInventory])

  // Live order feed: poll + cross-tab storage events
  useEffect(() => {
    refreshOrders()
    const timer = window.setInterval(refreshOrders, POLL_MS)
    const onStorage = (e: StorageEvent) => {
      if (e.key === ORDERS_KEY) refreshOrders()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('storage', onStorage)
    }
  }, [refreshOrders])

  const orders = useMemo<AdminOrder[]>(
    () =>
      [...rawOrders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((o) => ({ ...o, fulfillment: fulfillment[o.id] ?? defaultFulfillment(o) })),
    [rawOrders, fulfillment]
  )

  const lowStockAlerts = useMemo<LowStockAlert[]>(() => {
    const alerts: LowStockAlert[] = []
    for (const product of products) {
      const inv = inventory[product.id]
      if (!inv) continue
      for (const size of product.sizes) {
        const slot = inv.sizes[size]
        if (slot && slot.stock <= inv.lowStockThreshold) {
          alerts.push({ product, size, sku: slot.sku, stock: slot.stock, threshold: inv.lowStockThreshold })
        }
      }
    }
    return alerts.sort((a, b) => a.stock - b.stock)
  }, [products, inventory])

  const mutateSlot = useCallback(
    (
      productId: string,
      size: ShoeSize,
      compute: (stock: number) => number,
      reason: InventoryAdjustment['reason']
    ) => {
      const inv = inventory[productId]
      const slot = inv?.sizes[size]
      if (!inv || !slot) return
      const stock = Math.max(0, Math.floor(compute(slot.stock)))
      if (stock === slot.stock) return
      setInventory((cur) => ({
        ...cur,
        [productId]: { ...cur[productId], sizes: { ...cur[productId].sizes, [size]: { ...slot, stock } } },
      }))
      const product = productsRef.current.find((p) => p.id === productId)
      logAdjustments([
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
    },
    [inventory, logAdjustments]
  )

  const adjustStock = useCallback<AdminContextValue['adjustStock']>(
    (productId, size, delta, reason) =>
      mutateSlot(productId, size, (s) => s + delta, reason ?? (delta > 0 ? 'restock' : 'adjustment')),
    [mutateSlot]
  )

  const setStock = useCallback<AdminContextValue['setStock']>(
    (productId, size, value) => mutateSlot(productId, size, () => (Number.isFinite(value) ? value : 0), 'set'),
    [mutateSlot]
  )

  const setSku = useCallback<AdminContextValue['setSku']>((productId, size, sku) => {
    setInventory((cur) => {
      const inv = cur[productId]
      if (!inv) return cur
      return { ...cur, [productId]: { ...inv, sizes: { ...inv.sizes, [size]: { ...inv.sizes[size], sku } } } }
    })
  }, [])

  const setThreshold = useCallback<AdminContextValue['setThreshold']>((productId, threshold) => {
    setInventory((cur) => {
      const inv = cur[productId]
      if (!inv) return cur
      return { ...cur, [productId]: { ...inv, lowStockThreshold: Math.max(0, Math.floor(threshold) || 0) } }
    })
  }, [])

  const saveProduct = useCallback<AdminContextValue['saveProduct']>((product) => {
    setProducts((cur) => {
      const idx = cur.findIndex((p) => p.id === product.id)
      if (idx === -1) return [...cur, product]
      const next = [...cur]
      next[idx] = product
      return next
    })
  }, [])

  const deleteProduct = useCallback<AdminContextValue['deleteProduct']>((productId) => {
    setProducts((cur) => cur.filter((p) => p.id !== productId))
  }, [])

  const resetCatalog = useCallback(() => {
    setProducts(INITIAL_PRODUCTS)
    setInventory(reconcileInventory(INITIAL_PRODUCTS, {}))
  }, [])

  const setFulfillment = useCallback<AdminContextValue['setFulfillment']>((orderId, status) => {
    setFulfillmentMap((cur) => ({ ...cur, [orderId]: status }))
    setNewOrderIds((cur) => {
      if (!cur.has(orderId)) return cur
      const next = new Set(cur)
      next.delete(orderId)
      return next
    })
  }, [])

  const setPaymentStatus = useCallback<AdminContextValue['setPaymentStatus']>(
    (orderId, status, paymentId) => {
      orderStore.updateOrderStatus(orderId, status, paymentId)
      refreshOrders()
    },
    [refreshOrders]
  )

  const deleteOrder = useCallback<AdminContextValue['deleteOrder']>(
    (orderId) => {
      orderStore.deleteOrder(orderId)
      setFulfillmentMap((cur) => {
        const { [orderId]: _removed, ...rest } = cur
        return rest
      })
      refreshOrders()
    },
    [refreshOrders]
  )

  const value: AdminContextValue = {
    products,
    inventory,
    orders,
    adjustments,
    lowStockAlerts,
    lastSyncedAt,
    newOrderIds,
    adjustStock,
    setStock,
    setSku,
    setThreshold,
    saveProduct,
    deleteProduct,
    resetCatalog,
    setFulfillment,
    setPaymentStatus,
    deleteOrder,
    refreshOrders,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export const useAdmin = (): AdminContextValue => {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>')
  return ctx
}
