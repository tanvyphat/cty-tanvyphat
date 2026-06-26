'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
  { value: 'moi', label: 'Mới' },
  { value: 'dang_xu_ly', label: 'Đang xử lý' },
  { value: 'da_giao', label: 'Đã giao' },
  { value: 'huy', label: 'Huỷ' },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: 'chua_thanh_toan', label: 'Chưa thanh toán' },
  { value: 'da_thanh_toan', label: 'Đã thanh toán' },
]

export default function StatusUpdater({
                                        orderId,
                                        currentStatus,
                                        currentPaymentStatus = 'chua_thanh_toan',
                                        paymentMethod = 'cod',
                                      }: {
  orderId: string
  currentStatus: string
  currentPaymentStatus?: string
  paymentMethod?: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus)

  const [statusLoading, setStatusLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [statusMessage, setStatusMessage] = useState('')
  const [paymentMessage, setPaymentMessage] = useState('')

  const router = useRouter()

  const isCod = paymentMethod === 'cod' || paymentMethod === 'cash_on_delivery' || !paymentMethod

  async function handleUpdateStatus() {
    if (status === currentStatus) return

    setStatusLoading(true)
    setStatusMessage('')

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        setStatusMessage('✅ Đã cập nhật trạng thái đơn hàng')
        router.refresh()
      } else {
        const data = await res.json()
        setStatusMessage(`❌ ${data.error ?? 'Lỗi khi cập nhật'}`)
      }
    } catch {
      setStatusMessage('❌ Không thể kết nối đến server')
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleUpdatePaymentStatus() {
    if (paymentStatus === currentPaymentStatus) return

    setPaymentLoading(true)
    setPaymentMessage('')

    try {
      const paymentValue = paymentStatus === 'da_thanh_toan' ? 'paid' : null

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: paymentValue
        }),
      })

      if (res.ok) {
        setPaymentMessage('✅ Đã cập nhật trạng thái thanh toán')
        router.refresh()
      } else {
        const data = await res.json()
        setPaymentMessage(`❌ ${data.error ?? 'Lỗi khi cập nhật'}`)
      }
    } catch {
      setPaymentMessage('❌ Không thể kết nối đến server')
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-8">
        <h2 className="font-semibold text-gray-800 text-lg">Cập nhật trạng thái</h2>

        {/* Trạng thái đơn hàng */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Trạng thái đơn hàng</h3>
          <div className="flex gap-3">
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
                onClick={handleUpdateStatus}
                disabled={statusLoading || status === currentStatus}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              {statusLoading ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
          {statusMessage && <p className={`text-sm ${statusMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{statusMessage}</p>}
        </div>

        {/* Trạng thái thanh toán */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Trạng thái thanh toán</h3>
          {isCod ? (
              <>
                <div className="flex gap-3">
                  <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  <button
                      onClick={handleUpdatePaymentStatus}
                      disabled={paymentLoading || paymentStatus === currentPaymentStatus}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    {paymentLoading ? 'Đang lưu...' : 'Cập nhật'}
                  </button>
                </div>
                {paymentMessage && <p className={`text-sm ${paymentMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{paymentMessage}</p>}
              </>
          ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                Đơn chuyển khoản ngân hàng (Sepay). Trạng thái thanh toán được cập nhật tự động.
              </div>
          )}
        </div>
      </div>
  )
}