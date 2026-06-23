'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
  { value: 'moi', label: 'Mới' },
  { value: 'dang_xu_ly', label: 'Đang xử lý' },
  { value: 'da_giao', label: 'Đã giao' },
  { value: 'huy', label: 'Huỷ' },
]

export default function StatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleUpdate() {
    if (status === currentStatus) return
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setMessage('✅ Đã cập nhật')
        router.refresh()
      } else {
        const data = await res.json()
        setMessage(`❌ ${data.error ?? 'Lỗi'}`)
      }
    } catch {
      setMessage('❌ Không thể kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h2 className="font-semibold text-gray-700 text-sm mb-3">Cập nhật trạng thái</h2>
      <div className="flex gap-2 items-center">
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={handleUpdate}
          disabled={loading || status === currentStatus}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          {loading ? '...' : 'Lưu'}
        </button>
      </div>
      {message && <p className="text-sm mt-2 text-gray-600">{message}</p>}
    </div>
  )
}
