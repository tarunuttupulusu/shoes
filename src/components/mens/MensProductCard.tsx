import React, { useState } from 'react'
import { Check, ShoppingBag, Layers, ShieldCheck, Zap, Compass, Eye } from 'lucide-react'
import { MensProductCardProps, MensShoeSize } from './types'
import { useCart } from '../../context/CartContext'
import { Product, ShoeSize } from '../../types'

export const MensProductCard: React.FC<MensProductCardProps> = ({
  product,
  className = '',
  initialSelectedSize,
  onAddToCart,
  onQuickView,
}) => {
  const { addToCart } = useCart()

  // Default to initialSelectedSize or first available size in product.sizes or size 9
  const [selectedSize, setSelectedSize] = useState<MensShoeSize>(() => {
    if (initialSelectedSize && product.sizes.includes(initialSelectedSize)) {
      return initialSelectedSize
    }
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.includes(9) ? 9 : product.sizes[0]
    }
    return 9
  })

  const [justAdded, setJustAdded] = useState(false)

  const handleSelectSize = (size: MensShoeSize) => {
    setSelectedSize(size)
  }

  const handleAddToCart = () => {
    // Construct standard Product object matching app types
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      price: product.price,
      category: `Men's ${product.category}`,
      sizes: product.sizes.map((s) => (s > 12 ? 12 : s) as ShoeSize),
      image: product.image,
      badge: product.badge,
      features: product.features,
    }

    addToCart(cartProduct, selectedSize as unknown as ShoeSize)
    onAddToCart?.(product, selectedSize)

    setJustAdded(true)
    setTimeout(() => {
      setJustAdded(false)
    }, 1800)
  }

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl border border-[#24363F]/15 bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Top Media & Badge Area */}
      <div className="relative p-6 bg-gradient-to-br from-neutral-50 via-white to-neutral-100/60 border-b border-[#24363F]/10">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#24363F]/60">
              {product.terrain} · {product.cushioning}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {product.badge && (
              <span className="px-2.5 py-1 rounded-full bg-[#24363F] text-white text-[10px] font-mono font-semibold tracking-wider uppercase">
                {product.badge}
              </span>
            )}
            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(product)}
                aria-label={`Quick view ${product.name}`}
                className="size-7 rounded-full bg-white border border-[#24363F]/15 text-[#24363F]/70 hover:text-[#24363F] hover:bg-[#24363F]/5 flex items-center justify-center transition-colors cursor-pointer"
                title="Quick View Telemetry"
              >
                <Eye className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Shoe Image Centerpiece */}
        <div className="relative aspect-16/10 flex items-center justify-center overflow-hidden rounded-2xl bg-white/80 border border-[#24363F]/10 p-4">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/apple-icon.png'
            }}
          />
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono text-[#24363F]/80 border border-[#24363F]/10">
            MENS ARCHITECTURE
          </div>
        </div>

        {/* Telemetry quick strip */}
        <div className="grid grid-cols-3 gap-2 mt-4 font-mono text-[10px]">
          <div className="bg-white/90 p-2 rounded-lg border border-[#24363F]/10 text-center">
            <div className="text-[#24363F]/50 uppercase text-[9px]">Weight</div>
            <div className="font-semibold text-[#24363F] truncate">{product.weight.split(' ')[0]}</div>
          </div>
          <div className="bg-white/90 p-2 rounded-lg border border-[#24363F]/10 text-center">
            <div className="text-[#24363F]/50 uppercase text-[9px]">Return</div>
            <div className="font-semibold text-[#24363F] truncate">{product.energyReturn.split(' ')[0]}</div>
          </div>
          <div className="bg-white/90 p-2 rounded-lg border border-[#24363F]/10 text-center">
            <div className="text-[#24363F]/50 uppercase text-[9px]">Offset</div>
            <div className="font-semibold text-[#24363F] truncate">{product.drop.split(' ')[0]}</div>
          </div>
        </div>
      </div>

      {/* Product Content & Details */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#24363F]/50 mb-1">
            {product.category}
          </div>
          <h3 className="text-xl font-medium text-[#24363F] tracking-tight group-hover:text-[#1a2830] transition-colors">
            {product.name}
          </h3>
          <p className="font-mono text-xs text-[#24363F]/70 mt-0.5">
            {product.tagline}
          </p>

          <p className="mt-3 text-xs text-[#24363F]/80 font-light leading-relaxed line-clamp-2">
            {product.description}
          </p>

          {/* Key Features Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {product.features.slice(0, 3).map((feat, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#24363F]/5 border border-[#24363F]/10 font-mono text-[10px] text-[#24363F]/80"
              >
                <Layers className="size-2.5 text-[#24363F]/50" />
                <span>{feat}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Size Selection & Action CTA */}
        <div className="space-y-4 pt-4 border-t border-[#24363F]/10">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-mono font-semibold text-[#24363F]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="font-mono text-[10px] text-[#24363F]/50 block">
                Standard Shipping Included
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              In Stock
            </span>
          </div>

          {/* Size Selector (7-13) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#24363F] font-semibold uppercase tracking-wider">
                Select Size:
              </span>
              <span className="text-[#24363F]/60">
                UK/US {selectedSize}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {([7, 8, 9, 10, 11, 12, 13] as MensShoeSize[]).map((size) => {
                const isAvailable = product.sizes.includes(size)
                const isSelected = selectedSize === size

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleSelectSize(size)}
                    aria-label={`Select size ${size}`}
                    className={`h-9 rounded-lg font-mono text-xs transition-all duration-150 flex items-center justify-center relative cursor-pointer ${
                      !isAvailable
                        ? 'opacity-25 bg-[#24363F]/5 cursor-not-allowed border border-[#24363F]/10'
                        : isSelected
                        ? 'bg-[#24363F] text-white font-bold shadow-xs scale-105'
                        : 'bg-white border border-[#24363F]/20 text-[#24363F] hover:border-[#24363F]/60 hover:bg-[#24363F]/5'
                    }`}
                  >
                    <span>{size}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} size ${selectedSize} to bag`}
            className={`w-full py-3 px-4 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-xs cursor-pointer font-semibold ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#24363F] text-white hover:bg-[#1a2830] active:scale-[0.98]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="size-4 stroke-[2.5]" />
                <span>Added to Bag (Size {selectedSize})</span>
              </>
            ) : (
              <>
                <ShoppingBag className="size-4" />
                <span>Add to Bag · ₹{product.price.toLocaleString('en-IN')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
