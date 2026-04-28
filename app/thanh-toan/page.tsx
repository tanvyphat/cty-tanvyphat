'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart, useFbUserId, CartItem } from '../../src/hooks/useCart'

function CheckoutContent() {
  const { items, totalPrice, clearCart } = useCart()
  const { getFbUserId } = useFbUserId()
  const router = useRouter()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_address: address.trim(),
          note: note.trim() || undefined,
          fb_user_id: getFbUserId() || undefined,
          items: items.map((i: CartItem) => ({ product_id: i.productId, quantity: i.quantity })),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
      } else {
        clearCart()
        setSuccess(true)
      }
    } catch {
      setError('Không thể kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Chúng tôi đã nhận được đơn hàng của bạn. Shop sẽ liên hệ sớm để xác nhận.
          </p>
          <p className="text-gray-400 text-xs mb-6">📞 Hotline: 0903 608 768</p>
          <Link
            href="/san-pham"
            className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
          >
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Giỏ hàng đang trống</p>
          <Link href="/san-pham" className="text-blue-600 hover:underline text-sm">
            Xem sản phẩm →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/gio-hang" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Quay lại giỏ hàng
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">THANH TOÁN</h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT: Delivery form */}
          <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-5">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 text-base mb-5">Thông tin giao hàng</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901 234 567"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ghi chú <span className="text-gray-400 font-normal">(không bắt buộc)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              {loading ? 'Đang xử lý...' : '✅ Xác nhận đặt hàng'}
            </button>
          </form>

          {/* RIGHT: Order summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 text-base uppercase tracking-wide border-b border-gray-200 pb-3 mb-4">
                Đơn hàng của bạn
              </h2>

              <div className="space-y-3 mb-4">
                {items.map((item: CartItem) => (
                  <div key={item.productId} className="flex gap-3 items-center text-sm">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-2 text-xs">{item.name}</p>
                      <p className="text-gray-500 text-xs">x{item.quantity}</p>
                    </div>
                    <p className="text-gray-900 font-semibold text-xs whitespace-nowrap">
                      {item.price
                        ? (item.price * item.quantity).toLocaleString('vi-VN') + 'đ'
                        : 'Liên hệ'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Tạm tính</span>
                  <span>{totalPrice > 0 ? totalPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-2">
                  <span>TỔNG</span>
                  <span className="text-amber-600">
                    {totalPrice > 0 ? totalPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Đang tải...</p>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
