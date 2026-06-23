'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart, useFbUserId, CartItem } from '../../../src/hooks/useCart'
import FeaturedCarousel from '../../../src/components/FeaturedCarousel'
import type { ProductRow, CategoryRow } from '../../../src/lib/supabase/server'

interface Props {
  categoryMap: Record<string, CategoryRow>
}

function CartPageContent({ categoryMap }: Props) {
  const { items, totalItems, totalPrice, hydrated, addItem, removeItem, updateQuantity } = useCart()
  const { setFbUserId } = useFbUserId()
  const router = useRouter()
  const searchParams = useSearchParams()
  const addHandled = useRef(false)
  const [relatedProducts, setRelatedProducts] = useState<ProductRow[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(() => !!searchParams.get('add'))

  // Fetch related products when cart items change
  useEffect(() => {
    if (items.length === 0) {
      setRelatedProducts([])
      return
    }
    setRelatedLoading(true)
    const ids = items.map((i) => i.productId).join(',')
    fetch(`/api/products/related?ids=${ids}`)
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((data) => setRelatedProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setRelatedLoading(false))
  }, [items.map((i) => i.productId).join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (addHandled.current) return
    addHandled.current = true

    const addId = searchParams.get('add')
    const fbid = searchParams.get('fbid')

    if (fbid) setFbUserId(fbid)

    if (addId) {
      setIsAdding(true)
      fetch(`/api/products/${addId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((product) => {
          if (product && product.firstUnit) {
            addItem({
              productId: product.id,
              unitId: product.firstUnit.id,
              slug: product.slug,
              name: product.name,
              image: product.images?.[0] ?? null,
              price: product.firstUnit.price,
              unit: product.firstUnit.unit_name,
            })
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsAdding(false)
          router.replace('/gio-hang', { scroll: false })
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const carousel = relatedLoading ? (
    <section className="mt-16 border-t border-gray-100 pt-10">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </section>
  ) : relatedProducts.length > 0 ? (
    <section className="mt-16 border-t border-gray-100 pt-10">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Có thể bạn cũng thích</h2>
      <FeaturedCarousel products={relatedProducts} categoryMap={categoryMap} />
    </section>
  ) : null

  if (!hydrated || isAdding) {
    return (
      <main className="min-h-screen bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">GIỎ HÀNG CỦA BẠN</h1>
          <div className="flex flex-col lg:flex-row gap-8 items-start animate-pulse">
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 py-5 border-b border-gray-100">
                  <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full lg:w-72 border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (totalItems === 0) {
    return (
      <main className="min-h-screen bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">GIỎ HÀNG CỦA BẠN</h1>
          <div className="text-center py-20 border border-gray-200 rounded-lg mb-8">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 mb-6">Giỏ hàng đang trống</p>
            <Link
              href="/san-pham"
              className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Tiếp Tục Mua Sắm
            </Link>
          </div>
          {carousel}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">GIỎ HÀNG CỦA BẠN</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* LEFT: Cart table */}
          <div className="flex-1 min-w-0">
            <div className="cart-grid-header text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-3 mb-2 px-2">
              <span>Sản phẩm</span>
              <span className="text-right">Giá</span>
              <span className="text-center">Số lượng</span>
              <span className="text-center">Đơn vị</span>
              <span className="text-right">Tổng</span>
              <span />
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item: CartItem) => (
                <div key={item.cartKey}>
                  {/* Mobile card */}
                  <div className="flex gap-3 py-4 px-2 sm:hidden">
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/san-pham/${item.slug}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.cartKey)}
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Xoá"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.price ? item.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                        {item.unit ? `/${item.unit}` : ''}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors text-lg leading-none"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {item.price
                            ? (item.price * item.quantity).toLocaleString('vi-VN') + 'đ'
                            : 'Liên hệ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop table row */}
                  <div className="cart-grid-row py-5 px-2">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/san-pham/${item.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </div>

                    <div className="text-right text-sm text-gray-700">
                      {item.price ? item.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors text-lg leading-none"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-center text-sm text-gray-500">
                      {item.unit ?? '—'}
                    </div>

                    <div className="text-right text-sm font-semibold text-gray-900">
                      {item.price
                        ? (item.price * item.quantity).toLocaleString('vi-VN') + 'đ'
                        : 'Liên hệ'}
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => removeItem(item.cartKey)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Xoá"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <textarea
                placeholder="Ghi chú giao hàng"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
              />
            </div>
          </div>

          {/* RIGHT: Order summary */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-3 mb-4">
                Tổng số tiền
              </h2>

              <div className="flex justify-between text-sm text-gray-700 mb-4">
                <span>Tổng số tiền:</span>
                <span className="font-semibold text-gray-900">
                  {totalPrice > 0 ? totalPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                </span>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Mã khuyến mãi"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-4 mb-6">
                <span>TỔNG</span>
                <span>{totalPrice > 0 ? totalPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</span>
              </div>

              <Link
                href="/thanh-toan"
                className="block w-full text-center border-2 border-gray-900 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-900 hover:text-white transition-colors text-sm mb-3"
              >
                Đi Đến Trang Thanh Toán
              </Link>

              <Link
                href="/san-pham"
                className="block w-full text-center bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                Tiếp Tục Mua Sắm
              </Link>
            </div>
          </div>
        </div>

        {carousel}
      </div>
    </main>
  )
}

export default function CartClient({ categoryMap }: Props) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-400 text-sm">Đang tải giỏ hàng...</p>
        </main>
      }
    >
      <CartPageContent categoryMap={categoryMap} />
    </Suspense>
  )
}
