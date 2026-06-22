'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useCart, useFbUserId, CartItem } from '../../../src/hooks/useCart'
import { useAuth } from '../../../src/contexts/AuthContext'
import { PROVINCES, DISTRICTS_BY_PROVINCE, type Province, type District } from '../../../src/data/provinces'

const SEPAY_BANK = process.env.NEXT_PUBLIC_SEPAY_BANK_CODE ?? ''
const SEPAY_ACCOUNT = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT ?? ''

function CheckoutContent() {
  const { items, totalPrice, clearCart } = useCart()
  const { getFbUserId } = useFbUserId()
  const { user, profile } = useAuth()

  // Form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState<Province | null>(null)
  const [district, setDistrict] = useState<District | null>(null)
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod')

  // Shipping fee state
  const [shippingFee, setShippingFee] = useState<number | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingUnavailable, setShippingUnavailable] = useState(false)

  // Submission state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Profile auto-fill
  const [profileFilled, setProfileFilled] = useState(false)

  // Bank transfer state
  const [qrToken, setQrToken] = useState('')
  const [qrAmount, setQrAmount] = useState(0)
  const [qrContent, setQrContent] = useState('')
  const [qrStatus, setQrStatus] = useState<'waiting' | 'paid' | 'expired'>('waiting')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const districts = province ? (DISTRICTS_BY_PROVINCE[province.code] ?? []) : []
  const totalWithShipping = totalPrice + (shippingFee ?? 0)

  function fillFromProfile() {
    if (!profile) return
    if (profile.full_name) setName(profile.full_name)
    if (profile.phone) setPhone(profile.phone)
    if (profile.address) setAddress(profile.address)
    if (profile.province) {
      const p = PROVINCES.find(pr => pr.name === profile.province) ?? null
      setProvince(p)
      if (p && profile.district) {
        const d = (DISTRICTS_BY_PROVINCE[p.code] ?? []).find(d => d.name === profile.district) ?? null
        setDistrict(d)
      }
    }
    setProfileFilled(true)
  }

  // Tính phí vận chuyển khi chọn tỉnh + quận
  useEffect(() => {
    if (!province || !district) {
      setShippingFee(null)
      setShippingUnavailable(false)
      return
    }
    const controller = new AbortController()
    setShippingLoading(true)
    const params = new URLSearchParams({
      province: province.name,
      district: district.name,
      province_code: province.code,
      total: String(totalPrice),
    })
    fetch(`/api/shipping/fee?${params}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        const rawFee = data.fee ?? 0
        setShippingFee(rawFee > 0 ? Math.ceil(rawFee / 1000) * 1000 : 0)
        setShippingUnavailable(data.unavailable ?? false)
      })
      .catch(() => {})
      .finally(() => setShippingLoading(false))
    return () => controller.abort()
  }, [province, district, totalPrice])

  // Poll trạng thái thanh toán chuyển khoản
  useEffect(() => {
    if (!qrToken) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${qrToken}`)
        const data = await res.json()
        if (data.status === 'paid') {
          setQrStatus('paid')
          clearCart()
          clearInterval(pollRef.current!)
        } else if (data.status === 'expired') {
          setQrStatus('expired')
          clearInterval(pollRef.current!)
        }
      } catch {}
    }, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [qrToken, clearCart])

  function handleProvinceChange(code: string) {
    const p = PROVINCES.find(pr => pr.code === code) ?? null
    setProvince(p)
    setDistrict(null)
    setShippingFee(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setError('')
    setLoading(true)

    try {
      if (paymentMethod === 'bank_transfer') {
        // Lưu tạm thông tin, hiện QR popup
        const res = await fetch('/api/payments/pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: name.trim(),
            customer_phone: phone.trim(),
            customer_address: address.trim(),
            note: note.trim() || undefined,
            fb_user_id: getFbUserId() || undefined,
            province: province?.name,
            district: district?.name,
            shipping_fee: shippingFee ?? 0,
            items: items.map((i: CartItem) => ({ product_id: i.productId, unit_id: i.unitId, quantity: i.quantity })),
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
        } else {
          setQrToken(data.token)
          setQrAmount(data.amount)
          setQrContent(data.transfer_content)
          setSuccess(true)
        }
      } else {
        // COD
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: name.trim(),
            customer_phone: phone.trim(),
            customer_address: address.trim(),
            note: note.trim() || undefined,
            fb_user_id: getFbUserId() || undefined,
            province: province?.name,
            district: district?.name,
            shipping_fee: shippingFee ?? 0,
            items: items.map((i: CartItem) => ({ product_id: i.productId, unit_id: i.unitId, quantity: i.quantity })),
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
        } else {
          clearCart()
          setSuccess(true)
        }
      }
    } catch {
      setError('Không thể kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // COD success
  if (success && paymentMethod === 'cod') {
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

  // Bank transfer: show QR popup over the checkout form
  const showQrModal = success && paymentMethod === 'bank_transfer'

  if (items.length === 0 && !success) {
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
      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            {qrStatus === 'paid' ? (
              <>
                <div className="text-5xl mb-3">✅</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
                <p className="text-gray-500 text-sm mb-5">
                  Đơn hàng của bạn đã được xác nhận. Shop sẽ liên hệ sớm.
                </p>
                <Link
                  href="/san-pham"
                  className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                >
                  Tiếp Tục Mua Sắm
                </Link>
              </>
            ) : qrStatus === 'expired' ? (
              <>
                <div className="text-5xl mb-3">⏰</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Hết thời gian</h2>
                <p className="text-gray-500 text-sm mb-5">
                  Phiên thanh toán đã hết hạn. Vui lòng đặt lại đơn hàng.
                </p>
                <button
                  onClick={() => { setSuccess(false); setQrToken(''); setQrStatus('waiting') }}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-3 rounded-lg text-sm"
                >
                  Đặt lại
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Quét mã để thanh toán</h2>
                <p className="text-gray-500 text-xs mb-4">
                  Mã tự động xác nhận sau khi chuyển khoản thành công
                </p>

                {SEPAY_BANK && SEPAY_ACCOUNT ? (
                  <img
                    src={`https://qr.sepay.vn/img?bank=${SEPAY_BANK}&acc=${SEPAY_ACCOUNT}&template=compact&amount=${qrAmount}&des=${qrContent}`}
                    alt="QR chuyển khoản"
                    className="mx-auto w-52 h-52 rounded-xl border border-gray-200"
                  />
                ) : (
                  <div className="w-52 h-52 mx-auto rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                    Chưa cấu hình SePay
                  </div>
                )}

                <div className="mt-4 bg-gray-50 rounded-xl p-3 text-left space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Số tiền</span>
                    <span className="font-bold text-gray-900">{qrAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Nội dung CK</span>
                    <span className="font-mono font-semibold text-blue-600">{qrContent}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3 animate-pulse">
                  Đang chờ xác nhận thanh toán...
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Phiên thanh toán có hiệu lực 30 phút
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/gio-hang" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Quay lại giỏ hàng
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">THANH TOÁN</h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT: Form */}
          <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-5">
            {/* Profile auto-fill banner */}
            {user && profile && (profile.phone || profile.address) && !profileFilled && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="text-sm text-blue-800">
                  <span className="font-semibold">👤 Đã đăng nhập</span>
                  <span className="text-blue-600"> — Dùng thông tin đã lưu?</span>
                </div>
                <button
                  type="button"
                  onClick={fillFromProfile}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Tự điền
                </button>
              </div>
            )}
            {profileFilled && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                <span>✓</span>
                <span>Đã điền thông tin từ tài khoản. Bạn có thể chỉnh sửa bên dưới.</span>
              </div>
            )}

            {/* Thông tin giao hàng */}
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
                    onChange={e => setName(e.target.value)}
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
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0901 234 567"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      autoComplete="off"
                      suppressHydrationWarning
                      value={province?.code ?? ''}
                      onChange={e => handleProvinceChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Chọn tỉnh/TP</option>
                      {PROVINCES.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Quận / Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      autoComplete="off"
                      suppressHydrationWarning
                      key={province?.code ?? 'none'}
                      value={district?.code ?? ''}
                      onChange={e => {
                        const d = districts.find(d => d.code === e.target.value) ?? null
                        setDistrict(d)
                      }}
                      disabled={!province}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ghi chú <span className="text-gray-400 font-normal">(không bắt buộc)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 text-base mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-blue-600"
                  />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-gray-500">Trả tiền mặt khi nhận hàng</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'bank_transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="accent-blue-600"
                  />
                  <div>
                    <p className="font-medium text-sm text-gray-900">Chuyển khoản ngân hàng</p>
                    <p className="text-xs text-gray-500">Quét QR — xác nhận tự động qua SePay</p>
                  </div>
                </label>
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
              {loading
                ? 'Đang xử lý...'
                : paymentMethod === 'bank_transfer'
                  ? '📲 Tiếp tục & Quét QR'
                  : '✅ Xác nhận đặt hàng'}
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
                      <p className="text-gray-500 text-xs">
                        x{item.quantity}{item.unit ? ` ${item.unit}` : ''}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      {item.price && item.quantity > 1 && (
                        <p className="text-gray-400 text-[10px]">
                          {item.price.toLocaleString('vi-VN')}đ × {item.quantity}
                        </p>
                      )}
                      <p className="text-gray-900 font-semibold text-xs">
                        {item.price
                          ? (item.price * item.quantity).toLocaleString('vi-VN') + 'đ'
                          : 'Liên hệ'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Tạm tính</span>
                  <span>{totalPrice > 0 ? totalPrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-700">
                  <span>Phí vận chuyển</span>
                  <span>
                    {!province || !district ? (
                      <span className="text-gray-400 text-xs">Chọn địa chỉ</span>
                    ) : shippingLoading ? (
                      <span className="text-gray-400 text-xs">Đang tính...</span>
                    ) : shippingUnavailable || shippingFee === null ? (
                      <span className="text-orange-500 text-xs">Liên hệ shop</span>
                    ) : shippingFee === 0 ? (
                      <span className="text-green-600 font-semibold text-xs">MIỄN PHÍ</span>
                    ) : (
                      <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2 mt-2">
                  <span>TỔNG</span>
                  <span className="text-amber-600">
                    {totalPrice > 0
                      ? totalWithShipping.toLocaleString('vi-VN') + 'đ'
                      : 'Liên hệ'}
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
