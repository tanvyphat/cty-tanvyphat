'use client'

import { useState, useRef } from 'react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  moi: { label: 'Mới', color: 'bg-blue-100 text-blue-700' },
  dang_xu_ly: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-700' },
  da_giao: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  huy: { label: 'Huỷ', color: 'bg-red-100 text-red-700' },
}

const STATUS_ICONS: Record<string, string> = {
  moi: '📋',
  dang_xu_ly: '📦',
  da_giao: '✅',
  huy: '❌',
}

interface OrderItem {
  id: number
  product_name: string
  product_price: number
  unit_name: string | null
  quantity: number
}

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  province: string | null
  district: string | null
  note: string | null
  total_price: number
  shipping_fee: number
  payment_method: string
  payment_status: string
  status: string
  created_at: string
  order_items: OrderItem[]
}

export default function TraCuuClient() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = phone.trim().replace(/\s+/g, '')
    if (!cleaned || cleaned.length < 9) {
      setError('Vui lòng nhập số điện thoại hợp lệ')
      inputRef.current?.focus()
      return
    }
    setLoading(true)
    setError('')
    setOrders(null)
    setExpandedId(null)
    try {
      const res = await fetch(`/api/orders/lookup?phone=${encodeURIComponent(cleaned)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Có lỗi xảy ra, vui lòng thử lại')
        return
      }
      setOrders(data.orders)
    } catch {
      setError('Không thể kết nối, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = (order: Order) =>
    order.order_items.reduce(
      (sum, item) => sum + Number(item.product_price) * item.quantity,
      0
    )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tra cứu đơn hàng</h1>
        <p className="text-gray-500 text-sm">Nhập số điện thoại đặt hàng để xem trạng thái đơn</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số điện thoại đặt hàng
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ví dụ: 0901234567"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            inputMode="numeric"
            maxLength={11}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1a3a6b] hover:bg-[#1e4db7] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Đang tìm...
              </>
            ) : (
              'Tra cứu'
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </form>

      {/* Results */}
      {orders !== null && (
        <>
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-600 font-medium">Không tìm thấy đơn hàng</p>
              <p className="text-gray-400 text-sm mt-1">
                Không có đơn hàng nào với số điện thoại <strong>{phone}</strong>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 px-1">
                Tìm thấy <strong className="text-gray-800">{orders.length}</strong> đơn hàng
              </p>
              {orders.map((order) => {
                const s = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }
                const icon = STATUS_ICONS[order.status] ?? '📋'
                const isExpanded = expandedId === order.id
                const shortId = order.id.slice(0, 8).toUpperCase()

                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Order summary row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl flex-shrink-0">{icon}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-semibold text-gray-800">
                                #{shortId}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                                {s.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(order.created_at).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-3">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {Number(order.total_price) > 0
                                ? Number(order.total_price).toLocaleString('vi-VN') + 'đ'
                                : 'Liên hệ'}
                            </p>
                            <p className="text-xs text-gray-400">{order.order_items.length} sản phẩm</p>
                          </div>
                          <svg
                            className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
                        {/* Products */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Sản phẩm
                          </h3>
                          <div className="space-y-2.5">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex justify-between items-start text-sm gap-3">
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800 leading-snug">{item.product_name}</p>
                                  <p className="text-gray-400 text-xs mt-0.5">
                                    {Number(item.product_price) > 0
                                      ? Number(item.product_price).toLocaleString('vi-VN') + 'đ'
                                      : 'Liên hệ'}
                                    {item.unit_name ? ` / ${item.unit_name}` : ''}
                                    {' × '}{item.quantity}
                                  </p>
                                </div>
                                <p className="font-semibold text-gray-700 text-sm flex-shrink-0">
                                  {Number(item.product_price) > 0
                                    ? (Number(item.product_price) * item.quantity).toLocaleString('vi-VN') + 'đ'
                                    : '—'}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Totals */}
                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                            {Number(order.shipping_fee) > 0 && (
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Tạm tính</span>
                                <span>{subtotal(order).toLocaleString('vi-VN')}đ</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Phí vận chuyển</span>
                              <span>
                                {Number(order.shipping_fee) > 0
                                  ? Number(order.shipping_fee).toLocaleString('vi-VN') + 'đ'
                                  : 'Miễn phí'}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold text-sm pt-1">
                              <span className="text-gray-800">Tổng cộng</span>
                              <span className="text-blue-600">
                                {Number(order.total_price) > 0
                                  ? Number(order.total_price).toLocaleString('vi-VN') + 'đ'
                                  : 'Liên hệ'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Delivery */}
                          <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Giao hàng
                            </h3>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-gray-500 text-xs">{order.customer_phone}</p>
                              {(order.province || order.district) && (
                                <p className="text-xs text-gray-500">
                                  {[order.district, order.province].filter(Boolean).join(', ')}
                                </p>
                              )}
                              <p className="text-xs text-gray-600">{order.customer_address}</p>
                              {order.note && (
                                <p className="text-xs text-gray-500 italic">Ghi chú: {order.note}</p>
                              )}
                            </div>
                          </div>

                          {/* Payment */}
                          <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Thanh toán
                            </h3>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-700">
                                {order.payment_method === 'bank_transfer'
                                  ? 'Chuyển khoản'
                                  : 'COD (tiền mặt)'}
                              </p>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                  order.payment_status === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status timeline */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Trạng thái đơn hàng
                          </h3>
                          <div className="flex items-center gap-1">
                            {['moi', 'dang_xu_ly', 'da_giao'].map((step, idx) => {
                              const stepS = STATUS_LABELS[step]
                              const isCancelled = order.status === 'huy'
                              const stepOrder = ['moi', 'dang_xu_ly', 'da_giao']
                              const currentIdx = stepOrder.indexOf(order.status)
                              const isDone = !isCancelled && currentIdx >= idx
                              const isCurrent = !isCancelled && currentIdx === idx

                              return (
                                <div key={step} className="flex items-center flex-1">
                                  <div className="flex flex-col items-center flex-1">
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                                        isCurrent
                                          ? 'border-blue-600 bg-blue-600 text-white'
                                          : isDone
                                          ? 'border-green-500 bg-green-500 text-white'
                                          : 'border-gray-200 bg-white text-gray-400'
                                      }`}
                                    >
                                      {isDone && !isCurrent ? '✓' : idx + 1}
                                    </div>
                                    <span className={`text-xs mt-1 text-center leading-tight ${isCurrent ? 'text-blue-600 font-medium' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                                      {stepS.label}
                                    </span>
                                  </div>
                                  {idx < 2 && (
                                    <div className={`h-0.5 w-4 flex-shrink-0 rounded ${isDone && currentIdx > idx ? 'bg-green-400' : 'bg-gray-200'}`} />
                                  )}
                                </div>
                              )
                            })}
                            {order.status === 'huy' && (
                              <div className="ml-2 px-2.5 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                                Đã huỷ
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Help text */}
      {orders === null && !loading && (
        <div className="text-center text-gray-400 text-sm mt-6">
          <p>Nhập đúng số điện thoại bạn dùng khi đặt hàng</p>
          <p className="mt-1">
            Cần hỗ trợ?{' '}
            <a href="/lien-he" className="text-blue-600 hover:underline">Liên hệ chúng tôi</a>
          </p>
        </div>
      )}
    </div>
  )
}
