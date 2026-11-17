import type { OrderRecord, CartItem, OrderCustomerDetails } from '../types'

const STORAGE_KEY = 'aevion_shoe_orders_db'

const SAMPLE_ORDERS: OrderRecord[] = [
  {
    id: 'ord_sample_001',
    items: [
      {
        id: 'cart_item_01',
        product: {
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
        },
        size: 10,
        quantity: 1,
      },
    ],
    customer: {
      name: 'Alex Vance',
      email: 'alex.vance@aevion.io',
      phone: '+91 98765 43210',
      address: 'Sector 42, Aero Space Hub',
      city: 'Bengaluru',
      pincode: '560001',
    },
    amount: 12999,
    razorpayOrderId: 'order_sample_strata_01',
    razorpayPaymentId: 'pay_sample_strata_01',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]

export interface CreateOrderInput {
  items: CartItem[]
  customer: OrderCustomerDetails
  amount: number
  razorpayOrderId: string
  razorpayPaymentId?: string
  status?: OrderRecord['status']
}

export class OrderStore {
  private memoryOrders: OrderRecord[] = []

  constructor() {
    this.init()
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  }

  private init(): void {
    if (!this.isBrowser()) {
      this.memoryOrders = [...SAMPLE_ORDERS]
      return
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ORDERS))
        this.memoryOrders = [...SAMPLE_ORDERS]
      } else {
        const parsed = JSON.parse(stored)
        this.memoryOrders = Array.isArray(parsed) ? parsed : [...SAMPLE_ORDERS]
      }
    } catch {
      this.memoryOrders = [...SAMPLE_ORDERS]
    }
  }

  private persist(): void {
    if (!this.isBrowser()) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryOrders))
    } catch (err) {
      console.warn('Failed to persist orders to localStorage', err)
    }
  }

  private generateId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `ord_${timestamp}_${random}`
  }

  public createOrder(input: CreateOrderInput): OrderRecord {
    const newOrder: OrderRecord = {
      id: this.generateId(),
      items: input.items,
      customer: input.customer,
      amount: input.amount,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      status: input.status || 'pending',
      createdAt: new Date().toISOString(),
    }

    this.memoryOrders.unshift(newOrder)
    this.persist()
    return newOrder
  }

  public getOrder(id: string): OrderRecord | null {
    return this.memoryOrders.find((o) => o.id === id) || null
  }

  public getOrderByRazorpayOrderId(razorpayOrderId: string): OrderRecord | null {
    return this.memoryOrders.find((o) => o.razorpayOrderId === razorpayOrderId) || null
  }

  public getAllOrders(): OrderRecord[] {
    return [...this.memoryOrders]
  }

  public getOrdersByCustomerEmail(email: string): OrderRecord[] {
    const normalized = email.trim().toLowerCase()
    return this.memoryOrders.filter((o) => o.customer.email.toLowerCase() === normalized)
  }

  public updateOrderStatus(
    orderIdOrRazorpayId: string,
    status: OrderRecord['status'],
    paymentId?: string
  ): OrderRecord | null {
    const order = this.memoryOrders.find(
      (o) => o.id === orderIdOrRazorpayId || o.razorpayOrderId === orderIdOrRazorpayId
    )

    if (!order) return null

    order.status = status
    if (paymentId) {
      order.razorpayPaymentId = paymentId
    }

    this.persist()
    return { ...order }
  }

  public updateOrder(id: string, updates: Partial<OrderRecord>): OrderRecord | null {
    const index = this.memoryOrders.findIndex((o) => o.id === id)
    if (index === -1) return null

    this.memoryOrders[index] = {
      ...this.memoryOrders[index],
      ...updates,
    }

    this.persist()
    return { ...this.memoryOrders[index] }
  }

  public deleteOrder(id: string): boolean {
    const initialLen = this.memoryOrders.length
    this.memoryOrders = this.memoryOrders.filter((o) => o.id !== id)
    if (this.memoryOrders.length !== initialLen) {
      this.persist()
      return true
    }
    return false
  }

  public clear(): void {
    this.memoryOrders = []
    this.persist()
  }

  public resetToDefaults(): void {
    this.memoryOrders = [...SAMPLE_ORDERS]
    this.persist()
  }
}

export const orderStore = new OrderStore()
export default orderStore
