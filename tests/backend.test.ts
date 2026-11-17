import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { RazorpayService } from '../src/server/razorpayService.ts'
import { OrderStore } from '../src/server/orderStore.ts'
import { ApiClient } from '../src/server/apiClient.ts'
import { setupMockBrowser, type MockBrowserEnv } from './helpers/mockStorage.ts'
import { TEST_SHOE_1, TEST_CUSTOMER, createTestCartItem } from './helpers/testData.ts'

describe('Backend Regression Suite - Razorpay & Order Management', () => {
  let mockEnv: MockBrowserEnv

  beforeEach(() => {
    mockEnv = setupMockBrowser()
  })

  afterEach(() => {
    mockEnv.cleanup()
  })

  describe('1. Razorpay Order Creation', () => {
    it('creates an order with default currency INR and amount converted to paise when isRupees is true', async () => {
      const razorpay = new RazorpayService('test_key_id', 'test_secret_key')
      const order = await razorpay.createOrder({
        amount: 12999, // ₹12,999
        isRupees: true,
      })

      assert.ok(order.id.startsWith('order_'), 'Order ID should begin with order_')
      assert.equal(order.currency, 'INR')
      assert.equal(order.amount, 1299900, 'Amount should be 12999 * 100 paise')
      assert.equal(order.status, 'created')
      assert.ok(order.receipt.startsWith('rcpt_'), 'Receipt should be auto-generated')
    })

    it('creates an order with explicit amount in paise when isRupees is false or omitted', async () => {
      const razorpay = new RazorpayService('test_key_id', 'test_secret_key')
      const order = await razorpay.createOrder({
        amount: 500000, // 500000 paise = ₹5,000
      })

      assert.equal(order.amount, 500000)
      assert.equal(order.currency, 'INR')
    })

    it('preserves custom receipt ID when provided', async () => {
      const razorpay = new RazorpayService('test_key_id', 'test_secret_key')
      const customReceipt = 'rcpt_custom_trail_99'
      const order = await razorpay.createOrder({
        amount: 899900,
        receipt: customReceipt,
      })

      assert.equal(order.receipt, customReceipt)
    })

    it('supports custom currency when specified', async () => {
      const razorpay = new RazorpayService('test_key_id', 'test_secret_key')
      const order = await razorpay.createOrder({
        amount: 15000,
        currency: 'USD',
      })

      assert.equal(order.currency, 'USD')
    })

    it('rejects order creation with non-positive amounts', async () => {
      const razorpay = new RazorpayService('test_key_id', 'test_secret_key')

      await assert.rejects(
        async () => {
          await razorpay.createOrder({ amount: 0 })
        },
        {
          message: 'Order amount must be greater than zero.',
        }
      )

      await assert.rejects(
        async () => {
          await razorpay.createOrder({ amount: -100 })
        },
        {
          message: 'Order amount must be greater than zero.',
        }
      )
    })

    it('returns the configured Razorpay Key ID', () => {
      const customKey = 'rzp_custom_prod_key_2026'
      const razorpay = new RazorpayService(customKey, 'secret')
      assert.equal(razorpay.getKeyId(), customKey)
    })

    it('stores and retrieves created orders by order ID', async () => {
      const razorpay = new RazorpayService('key', 'secret')
      const order = await razorpay.createOrder({ amount: 99900 })

      const retrieved = razorpay.getOrder(order.id)
      assert.deepEqual(retrieved, order)

      const nonExistent = razorpay.getOrder('order_non_existent')
      assert.equal(nonExistent, null)
    })
  })

  describe('2. HMAC SHA256 Payment Signature Verification', () => {
    it('generates deterministic HMAC SHA256 signature and verifies valid payment', async () => {
      const secret = 'super_secret_key_aevion_2026'
      const razorpay = new RazorpayService('key_123', secret)

      const order = await razorpay.createOrder({ amount: 1299900 })
      const paymentId = 'pay_test_payment_9876'

      const signature = await razorpay.generateSignature(order.id, paymentId, secret)
      assert.ok(typeof signature === 'string')
      assert.equal(signature.length, 64, 'HMAC SHA256 hex string must be 64 chars long')

      const result = await razorpay.verifyPaymentSignature({
        razorpay_order_id: order.id,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      })

      assert.equal(result.success, true)
      assert.equal(result.orderId, order.id)
      assert.equal(result.paymentId, paymentId)
      assert.equal(result.message, 'Payment verified successfully.')

      // Check order status updated to 'paid' in razorpayService
      const updatedOrder = razorpay.getOrder(order.id)
      assert.equal(updatedOrder?.status, 'paid')
    })

    it('rejects invalid or tampered payment signature', async () => {
      const razorpay = new RazorpayService('key_123', 'secret_key')
      const order = await razorpay.createOrder({ amount: 1299900 })

      const result = await razorpay.verifyPaymentSignature({
        razorpay_order_id: order.id,
        razorpay_payment_id: 'pay_123456',
        razorpay_signature: 'invalid_tampered_signature_hex_value_000000000000000000000000',
      })

      assert.equal(result.success, false)
      assert.equal(result.message, 'Payment signature verification failed: signature mismatch.')
    })

    it('rejects signature generated with a mismatched secret', async () => {
      const razorpay = new RazorpayService('key_123', 'correct_secret')
      const order = await razorpay.createOrder({ amount: 100000 })
      const paymentId = 'pay_001'

      // Signature created with wrong secret
      const wrongSignature = await razorpay.generateSignature(order.id, paymentId, 'wrong_secret')

      const result = await razorpay.verifyPaymentSignature({
        razorpay_order_id: order.id,
        razorpay_payment_id: paymentId,
        razorpay_signature: wrongSignature,
      })

      assert.equal(result.success, false)
      assert.equal(result.message, 'Payment signature verification failed: signature mismatch.')
    })

    it('fails gracefully when required fields are missing', async () => {
      const razorpay = new RazorpayService('key_123', 'secret_key')

      const missingSig = await razorpay.verifyPaymentSignature({
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: '',
      })
      assert.equal(missingSig.success, false)
      assert.equal(missingSig.message, 'Missing required Razorpay payment verification fields.')

      const missingOrderId = await razorpay.verifyPaymentSignature({
        razorpay_order_id: '',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'some_sig',
      })
      assert.equal(missingOrderId.success, false)
    })

    it('accepts configured mock bypass signatures for simulation and tests', async () => {
      const razorpay = new RazorpayService('key_123', 'secret_key')
      const order = await razorpay.createOrder({ amount: 100000 })

      for (const mockSig of ['mock_sig_ok', 'test_sig_1234', 'mock_success_signature']) {
        const result = await razorpay.verifyPaymentSignature({
          razorpay_order_id: order.id,
          razorpay_payment_id: 'pay_simulated_999',
          razorpay_signature: mockSig,
        })
        assert.equal(result.success, true, `Should accept mock signature: ${mockSig}`)
      }
    })
  })

  describe('3. OrderStore Persistence & Operations', () => {
    it('initializes order store with default sample order and persists to localStorage', () => {
      const store = new OrderStore()
      const orders = store.getAllOrders()

      assert.ok(orders.length >= 1)
      assert.equal(orders[0].id, 'ord_sample_001')

      const raw = mockEnv.storage.getItem('aevion_shoe_orders_db')
      assert.ok(raw !== null, 'LocalStorage must contain serialized orders')
      const parsed = JSON.parse(raw!)
      assert.equal(parsed.length, orders.length)
    })

    it('creates an order, generates unique ID, and updates localStorage', () => {
      const store = new OrderStore()
      const initialCount = store.getAllOrders().length

      const item = createTestCartItem(TEST_SHOE_1, 10, 2)
      const newOrder = store.createOrder({
        items: [item],
        customer: TEST_CUSTOMER,
        amount: 25998,
        razorpayOrderId: 'order_rzp_test_101',
      })

      assert.ok(newOrder.id.startsWith('ord_'))
      assert.equal(newOrder.status, 'pending')
      assert.equal(newOrder.amount, 25998)
      assert.equal(newOrder.customer.email, TEST_CUSTOMER.email)
      assert.equal(newOrder.items.length, 1)

      const ordersAfter = store.getAllOrders()
      assert.equal(ordersAfter.length, initialCount + 1)
      assert.equal(ordersAfter[0].id, newOrder.id, 'New order should be unshifted to the front')

      // Verify persistence across new store instance
      const freshStoreInstance = new OrderStore()
      const retrieved = freshStoreInstance.getOrder(newOrder.id)
      assert.ok(retrieved !== null)
      assert.equal(retrieved?.razorpayOrderId, 'order_rzp_test_101')
    })

    it('retrieves orders by razorpayOrderId', () => {
      const store = new OrderStore()
      const item = createTestCartItem(TEST_SHOE_1, 9, 1)
      const order = store.createOrder({
        items: [item],
        customer: TEST_CUSTOMER,
        amount: 12999,
        razorpayOrderId: 'order_unique_rzp_404',
      })

      const found = store.getOrderByRazorpayOrderId('order_unique_rzp_404')
      assert.deepEqual(found, order)

      const notFound = store.getOrderByRazorpayOrderId('non_existent_rzp')
      assert.equal(notFound, null)
    })

    it('retrieves orders by customer email (case-insensitive and trimmed)', () => {
      const store = new OrderStore()
      store.createOrder({
        items: [createTestCartItem(TEST_SHOE_1, 10, 1)],
        customer: { ...TEST_CUSTOMER, email: 'Buyer.Alpha@aevion.io' },
        amount: 12999,
        razorpayOrderId: 'order_email_test_1',
      })

      const found = store.getOrdersByCustomerEmail('   BUYER.ALPHA@AEVION.IO  ')
      assert.equal(found.length, 1)
      assert.equal(found[0].razorpayOrderId, 'order_email_test_1')

      const noOrders = store.getOrdersByCustomerEmail('unknown@domain.com')
      assert.equal(noOrders.length, 0)
    })

    it('updates order status and payment ID and persists changes', () => {
      const store = new OrderStore()
      const order = store.createOrder({
        items: [createTestCartItem(TEST_SHOE_1, 8, 1)],
        customer: TEST_CUSTOMER,
        amount: 12999,
        razorpayOrderId: 'order_status_update_rzp',
      })

      assert.equal(order.status, 'pending')

      const updated = store.updateOrderStatus('order_status_update_rzp', 'completed', 'pay_verified_123')
      assert.ok(updated !== null)
      assert.equal(updated?.status, 'completed')
      assert.equal(updated?.razorpayPaymentId, 'pay_verified_123')

      // Verify persistence in a second instance
      const verifyStore = new OrderStore()
      const persisted = verifyStore.getOrder(order.id)
      assert.equal(persisted?.status, 'completed')
      assert.equal(persisted?.razorpayPaymentId, 'pay_verified_123')
    })

    it('supports partial updates to orders via updateOrder', () => {
      const store = new OrderStore()
      const order = store.createOrder({
        items: [createTestCartItem(TEST_SHOE_1, 11, 1)],
        customer: TEST_CUSTOMER,
        amount: 12999,
        razorpayOrderId: 'order_partial_update',
      })

      const updated = store.updateOrder(order.id, {
        customer: { ...TEST_CUSTOMER, name: 'Jane Updated' },
      })

      assert.equal(updated?.customer.name, 'Jane Updated')
      assert.equal(store.getOrder(order.id)?.customer.name, 'Jane Updated')

      const invalidUpdate = store.updateOrder('non_existent_id', { amount: 0 })
      assert.equal(invalidUpdate, null)
    })

    it('deletes orders and persists deletion', () => {
      const store = new OrderStore()
      const order = store.createOrder({
        items: [createTestCartItem(TEST_SHOE_1, 7, 1)],
        customer: TEST_CUSTOMER,
        amount: 12999,
        razorpayOrderId: 'order_to_delete',
      })

      assert.ok(store.getOrder(order.id) !== null)

      const deleted = store.deleteOrder(order.id)
      assert.equal(deleted, true)
      assert.equal(store.getOrder(order.id), null)

      // Deleting again returns false
      assert.equal(store.deleteOrder(order.id), false)
    })

    it('clears orders and resets to defaults', () => {
      const store = new OrderStore()
      store.clear()
      assert.equal(store.getAllOrders().length, 0)
      assert.equal(mockEnv.storage.getItem('aevion_shoe_orders_db'), '[]')

      store.resetToDefaults()
      assert.ok(store.getAllOrders().length >= 1)
      assert.equal(store.getAllOrders()[0].id, 'ord_sample_001')
    })

    it('operates safely in pure in-memory mode when localStorage is unavailable', () => {
      mockEnv.cleanup() // removes window and localStorage
      const memoryStore = new OrderStore()

      assert.ok(memoryStore.getAllOrders().length >= 1)
      const order = memoryStore.createOrder({
        items: [],
        customer: TEST_CUSTOMER,
        amount: 5000,
        razorpayOrderId: 'order_in_memory_only',
      })

      assert.equal(memoryStore.getOrder(order.id)?.amount, 5000)
    })
  })

  describe('4. ApiClient End-to-End Backend Workflows', () => {
    it('creates Razorpay orders in INR rupees, creates OrderRecords, and verifies payments', async () => {
      const client = new ApiClient()
      ;(client as any).simulateLatency = () => Promise.resolve()

      // 1. Create Razorpay order for ₹12,999
      const rzpOrder = await client.createRazorpayOrder(12999, 'rcpt_e2e_01')
      assert.equal(rzpOrder.amount, 1299900)
      assert.equal(rzpOrder.currency, 'INR')
      assert.equal(rzpOrder.receipt, 'rcpt_e2e_01')

      // 2. Create pending order record
      const item = createTestCartItem(TEST_SHOE_1, 10, 1)
      const orderRecord = await client.createOrderRecord([item], TEST_CUSTOMER, rzpOrder)
      assert.equal(orderRecord.status, 'pending')
      assert.equal(orderRecord.razorpayOrderId, rzpOrder.id)
      assert.equal(orderRecord.amount, 12999)

      // 3. Generate signature and confirm payment
      const paymentId = 'pay_e2e_success_999'
      const sig = await client.generateMockPaymentSignature(rzpOrder.id, paymentId)

      const confirmation = await client.confirmOrderPayment(rzpOrder.id, {
        razorpay_order_id: rzpOrder.id,
        razorpay_payment_id: paymentId,
        razorpay_signature: sig,
      })

      assert.equal(confirmation.verification.success, true)
      assert.equal(confirmation.order?.status, 'completed')
      assert.equal(confirmation.order?.razorpayPaymentId, paymentId)
    })

    it('marks order as failed when signature verification fails in confirmOrderPayment', async () => {
      const client = new ApiClient()
      ;(client as any).simulateLatency = () => Promise.resolve()
      const rzpOrder = await client.createRazorpayOrder(9999)
      const orderRecord = await client.createOrderRecord([], TEST_CUSTOMER, rzpOrder)
      assert.equal(orderRecord.status, 'pending')

      const confirmation = await client.confirmOrderPayment(rzpOrder.id, {
        razorpay_order_id: rzpOrder.id,
        razorpay_payment_id: 'pay_fraud_111',
        razorpay_signature: 'invalid_forged_signature',
      })

      assert.equal(confirmation.verification.success, false)
      assert.equal(confirmation.order?.status, 'failed')
    })

    it('cancels a pending order, but rejects cancelling an already completed order', async () => {
      const client = new ApiClient()
      ;(client as any).simulateLatency = () => Promise.resolve()
      const rzpOrder = await client.createRazorpayOrder(5000)
      const order = await client.createOrderRecord([], TEST_CUSTOMER, rzpOrder)

      // Cancel pending
      const cancelled = await client.cancelOrder(order.id)
      assert.equal(cancelled?.status, 'failed')

      // Create a completed order
      const completedRzp = await client.createRazorpayOrder(5000)
      const completedOrder = await client.createOrderRecord([], TEST_CUSTOMER, completedRzp)
      const sig = await client.generateMockPaymentSignature(completedRzp.id, 'pay_completed')
      await client.confirmOrderPayment(completedRzp.id, {
        razorpay_order_id: completedRzp.id,
        razorpay_payment_id: 'pay_completed',
        razorpay_signature: sig,
      })

      await assert.rejects(
        async () => {
          await client.cancelOrder(completedOrder.id)
        },
        {
          message: 'Cannot cancel a completed order.',
        }
      )
    })
  })
})
