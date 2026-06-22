'use client'

import { useState } from 'react'

type SavedCustomer = {
  customer_name: string | null
  customer_phone: string | null
  customer_address: string | null
}

export default function CheckoutForm({
  token,
  savedCustomer,
}: {
  token: string
  savedCustomer?: SavedCustomer
}) {
  const [name, setName] = useState(savedCustomer?.customer_name ?? '')
  const [phone, setPhone] = useState(savedCustomer?.customer_phone ?? '')
  const [address, setAddress] = useState(savedCustomer?.customer_address ?? '')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const hasSavedInfo = savedCustomer?.customer_name || savedCustomer?.customer_phone

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_address: address.trim(),
          note: note.trim() || undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
      } else {
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
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 text-sm">
          Chúng tôi đã nhận được đơn hàng của bạn. Shop sẽ liên hệ sớm để xác nhận.
        </p>
        <p className="text-gray-400 text-xs mt-3">📞 Hotline: 0903 608 768</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 text-lg">Thông tin giao hàng</h2>

      {hasSavedInfo && (
        <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
          ℹ️ Thông tin đã được điền tự động từ lần đặt hàng trước
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nguyễn Văn A"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="0901 234 567"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ giao hàng <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú <span className="text-gray-400 font-normal">(không bắt buộc)</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
      >
        {loading ? 'Đang xử lý...' : '✅ Xác nhận đặt hàng'}
      </button>
    </form>
  )
}
