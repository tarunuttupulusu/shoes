import React, { useEffect, useState } from 'react'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { orderStore } from '../server/orderStore'

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    totalItems,
    subtotal,
    clearCart,
  } = useCart()

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'success'>('cart')
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeCart])

  // Reset checkout state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setCheckoutStep('cart')
        setIsCheckingOut(false)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleCheckout = () => {
    setIsCheckingOut(true)
    setTimeout(() => {
      try {
        orderStore.createOrder({
          items: [...items],
          customer: {
            name: 'Aevion Customer',
            email: 'customer@aevion.io',
            phone: '+91 98765 43210',
            address: 'Aerospace Velocity Terminal 4',
            city: 'Bengaluru',
            pincode: '560001',
          },
          amount: subtotal,
          razorpayOrderId: `order_${Date.now().toString(36)}`,
          razorpayPaymentId: `pay_${Date.now().toString(36)}`,
          status: 'completed',
        })
      } catch (e) {
        console.error('Failed to record order', e)
      }
      setIsCheckingOut(false)
      setCheckoutStep('success')
      clearCart()
    }, 1200)
  }

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 z-50 bg-[#24363F]/35 backdrop-blur-md transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        data-lenis-prevent="true"
        aria-label="Shopping Cart"
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 right-0 bottom-0 z-[60] w-full sm:w-[480px] md:w-[520px] bg-[#FDFDFD] text-[#24363F] shadow-2xl flex flex-col border-l border-[#24363F]/15 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#24363F]/10 bg-[#FDFDFD]/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#24363F]/50">
              [ BAG ]
            </span>
            <h2 className="text-xl font-medium tracking-tight text-[#24363F]">
              Your Selection
            </h2>
            <span className="font-mono text-xs bg-[#24363F]/10 text-[#24363F] px-2 py-0.5 rounded-full font-medium">
              {totalItems}
            </span>
          </div>

          <button
            onClick={closeCart}
            type="button"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#24363F]/15 hover:border-[#24363F]/40 hover:bg-[#24363F]/5 transition-all text-xs font-mono uppercase tracking-wider text-[#24363F]/70"
            aria-label="Close cart"
          >
            <span>Close</span>
            <X className="size-3.5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Success Screen after simulated checkout */}
        {checkoutStep === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5 animate-bounce">
              <Check className="size-8 stroke-[2.5]" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#24363F]/50 mb-1">
              Order Confirmed
            </span>
            <h3 className="text-2xl font-light text-[#24363F] mb-3">
              Crafting Your Velocity
            </h3>
            <p className="text-sm text-[#24363F]/70 max-w-xs leading-relaxed mb-6 font-light">
              Your carbon-plated footwear order has been securely scheduled for dispatch. Tracking credentials have been transmitted to your terminal.
            </p>
            <div className="font-mono text-xs bg-[#24363F]/5 border border-[#24363F]/10 rounded-lg p-3 w-full max-w-xs mb-8 text-left space-y-1">
              <div className="flex justify-between text-[#24363F]/60">
                <span>ESTIMATED DELIVERY:</span>
                <span className="font-medium text-[#24363F]">2-3 BUSINESS DAYS</span>
              </div>
              <div className="flex justify-between text-[#24363F]/60">
                <span>LOGISTICS TIER:</span>
                <span className="font-medium text-[#24363F]">AIR EXPEDITED</span>
              </div>
            </div>
            <button
              onClick={() => {
                setCheckoutStep('cart')
                closeCart()
              }}
              className="px-6 py-3 bg-[#24363F] text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-[#1b2930] transition-colors"
            >
              Continue Exploring
            </button>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="size-20 rounded-2xl bg-[#24363F]/5 border border-[#24363F]/10 flex items-center justify-center text-[#24363F]/40 mb-6">
              <ShoppingBag className="size-9 stroke-[1.5]" />
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#24363F]/50 mb-2">
              [ 0 ITEMS ]
            </div>
            <h3 className="text-2xl font-light text-[#24363F] mb-3">
              Your Bag is Empty
            </h3>
            <p className="text-sm text-[#24363F]/70 max-w-xs leading-relaxed mb-8 font-light">
              Select a carbon-plated performance model from the footwear collection below to experience aerospace kinetic propulsion.
            </p>
            <button
              onClick={() => {
                closeCart()
                const el = document.getElementById('footwear')
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#24363F] text-white rounded-full font-mono text-xs uppercase tracking-wider hover:bg-[#1b2930] transition-colors shadow-sm"
            >
              <span>Explore Collection</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        ) : (
          /* Cart Items List */
          <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-[#24363F]/10">
            {items.map((item) => (
              <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex gap-4 group">
                {/* Product Thumbnail / Graphic */}
                <div className="size-24 sm:size-28 rounded-xl bg-neutral-100 border border-[#24363F]/10 overflow-hidden shrink-0 relative flex items-center justify-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLImageElement).src = '/apple-icon.png'
                    }}
                  />
                  <div className="absolute top-1.5 left-1.5 font-mono text-[9px] bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded text-[#24363F] border border-[#24363F]/10 uppercase font-semibold">
                    UK {item.size}
                  </div>
                </div>

                {/* Product Info & Controls */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#24363F]/50 block">
                          {item.product.category}
                        </span>
                        <h4 className="font-medium text-base text-[#24363F] leading-tight truncate">
                          {item.product.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#24363F]/40 hover:text-red-500 transition-colors p-1"
                        aria-label={`Remove ${item.product.name} size ${item.size} from bag`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-[#24363F]/70 bg-[#24363F]/5 px-2 py-0.5 rounded border border-[#24363F]/10">
                        Size: {item.size} UK/US
                      </span>
                      {item.product.badge && (
                        <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.product.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#24363F]/20 rounded-lg bg-white overflow-hidden shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-[#24363F]/5 transition-colors text-[#24363F]/70 hover:text-[#24363F]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="px-3 font-mono text-xs font-semibold text-[#24363F] min-w-7 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-[#24363F]/5 transition-colors text-[#24363F]/70 hover:text-[#24363F]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      <span className="font-mono text-sm font-semibold text-[#24363F]">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {item.quantity > 1 && (
                        <span className="block font-mono text-[10px] text-[#24363F]/50">
                          ₹{item.product.price.toLocaleString('en-IN')} each
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer / Summary (shown only when items exist) */}
        {items.length > 0 && checkoutStep === 'cart' && (
          <div className="border-t border-[#24363F]/10 px-6 py-5 bg-[#FDFDFD] sticky bottom-0 z-10 space-y-4">
            {/* Breakdown */}
            <div className="space-y-1.5 font-mono text-xs text-[#24363F]/70">
              <div className="flex justify-between">
                <span>SHIPPING</span>
                <span className="text-emerald-700 font-medium">COMPLIMENTARY</span>
              </div>
              <div className="flex justify-between">
                <span>CARBON OFFSET</span>
                <span className="text-[#24363F]/90 font-medium">100% NEUTRAL</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#24363F]/10 text-base text-[#24363F]">
                <span className="font-sans font-medium text-lg">Subtotal</span>
                <span className="font-mono font-bold text-xl text-[#24363F]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-[#24363F]/50 font-sans">
                Taxes, customs duties, and express air freight included in total.
              </p>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full relative group overflow-hidden bg-[#24363F] text-white py-3.5 px-6 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#1b2930] transition-all duration-200 active:scale-[0.99] disabled:opacity-75 cursor-pointer shadow-md"
            >
              {isCheckingOut ? (
                <>
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Securing Order...</span>
                </>
              ) : (
                <>
                  <span>Checkout · ₹{subtotal.toLocaleString('en-IN')}</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Apple-style Guarantee Footnotes */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px] text-[#24363F]/60 text-center border-t border-[#24363F]/10">
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck className="size-3 text-emerald-600" />
                <span>30-Day Trial</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Sparkles className="size-3 text-[#24363F]/60" />
                <span>Zero Carbon</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-emerald-600 font-bold">2Y</span>
                <span>Warranty</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
