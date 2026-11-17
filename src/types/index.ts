export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export type ShoeSize = 7 | 8 | 9 | 10 | 11 | 12

export interface Product {
  id: string
  name: string
  tagline: string
  description: string
  price: number // in INR (₹)
  category: string
  sizes: ShoeSize[]
  image: string
  badge?: string
  features: string[]
}

export interface CartItem {
  id: string
  product: Product
  size: ShoeSize
  quantity: number
}

export interface RazorpayOrder {
  id: string
  amount: number // in paise (e.g. 999900 for ₹9,999)
  currency: string
  receipt: string
  status: 'created' | 'attempted' | 'paid'
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface PaymentVerificationResult {
  success: boolean
  orderId: string
  paymentId: string
  message: string
}

export interface OrderCustomerDetails {
  name: string
  email: string
  phone: string
  address: string
  city: string
  pincode: string
}

export interface OrderRecord {
  id: string
  items: CartItem[]
  customer: OrderCustomerDetails
  amount: number
  razorpayOrderId: string
  razorpayPaymentId?: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}
