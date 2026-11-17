import type {
  CartItem,
  OrderCustomerDetails,
  OrderRecord,
  PaymentVerificationRequest,
  PaymentVerificationResult,
  RazorpayOrder,
} from '../types'
import { razorpayService } from './razorpayService.ts'
import { orderStore } from './orderStore.ts'

export class ApiClient {
  private simulateLatency(ms: number = 250): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Returns the Razorpay Key ID for client checkout integration.
   */
  public getKeyId(): string {
    return razorpayService.getKeyId()
  }

  /**
   * Creates a Razorpay order with the amount specified in INR (₹).
   * Amount is converted to paise for Razorpay.
   */
  public async createRazorpayOrder(
    amountInRupees: number,
    receipt?: string,
    notes?: Record<string, string>
  ): Promise<RazorpayOrder> {
    await this.simulateLatency(300)
    return razorpayService.createOrder({
      amount: amountInRupees,
      isRupees: true,
      receipt,
      notes,
    })
  }

  /**
   * Verifies Razorpay payment signature and updates the order status in the store.
   */
  public async verifyPayment(
    request: PaymentVerificationRequest
  ): Promise<PaymentVerificationResult> {
    await this.simulateLatency(350)
    const result = await razorpayService.verifyPaymentSignature(request)

    if (result.success && request.razorpay_order_id) {
      orderStore.updateOrderStatus(
        request.razorpay_order_id,
        'completed',
        request.razorpay_payment_id
      )
    }

    return result
  }

  /**
   * Creates a pending OrderRecord linked to a Razorpay order.
   */
  public async createOrderRecord(
    items: CartItem[],
    customer: OrderCustomerDetails,
    razorpayOrder: RazorpayOrder
  ): Promise<OrderRecord> {
    await this.simulateLatency(200)

    const totalAmount = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    return orderStore.createOrder({
      items,
      customer,
      amount: totalAmount > 0 ? totalAmount : razorpayOrder.amount / 100,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    })
  }

  /**
   * Complete payment verification and order confirmation flow.
   */
  public async confirmOrderPayment(
    razorpayOrderId: string,
    payment: PaymentVerificationRequest
  ): Promise<{ verification: PaymentVerificationResult; order: OrderRecord | null }> {
    const verification = await this.verifyPayment(payment)

    let order = orderStore.getOrderByRazorpayOrderId(razorpayOrderId)
    if (verification.success && order) {
      order = orderStore.updateOrderStatus(
        razorpayOrderId,
        'completed',
        payment.razorpay_payment_id
      )
    } else if (!verification.success && order) {
      order = orderStore.updateOrderStatus(razorpayOrderId, 'failed')
    }

    return { verification, order }
  }

  /**
   * Retrieves an order by its ID.
   */
  public async getOrder(orderId: string): Promise<OrderRecord | null> {
    await this.simulateLatency(150)
    return orderStore.getOrder(orderId)
  }

  /**
   * Retrieves an order by Razorpay order ID.
   */
  public async getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<OrderRecord | null> {
    await this.simulateLatency(150)
    return orderStore.getOrderByRazorpayOrderId(razorpayOrderId)
  }

  /**
   * Retrieves all orders for a specific user email.
   */
  public async getUserOrders(email: string): Promise<OrderRecord[]> {
    await this.simulateLatency(200)
    return orderStore.getOrdersByCustomerEmail(email)
  }

  /**
   * Retrieves all orders.
   */
  public async getAllOrders(): Promise<OrderRecord[]> {
    await this.simulateLatency(200)
    return orderStore.getAllOrders()
  }

  /**
   * Cancels a pending order.
   */
  public async cancelOrder(orderId: string): Promise<OrderRecord | null> {
    await this.simulateLatency(200)
    const order = orderStore.getOrder(orderId)
    if (!order) return null
    if (order.status === 'completed') {
      throw new Error('Cannot cancel a completed order.')
    }
    return orderStore.updateOrderStatus(orderId, 'failed')
  }

  /**
   * Helper to generate a valid mock payment signature for checkout simulation.
   */
  public async generateMockPaymentSignature(
    orderId: string,
    paymentId: string
  ): Promise<string> {
    return razorpayService.generateSignature(orderId, paymentId)
  }
}

export const apiClient = new ApiClient()
export default apiClient
