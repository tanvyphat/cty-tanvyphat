'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function DonHangFilter({
  currentPhone,
  currentDateFrom,
  currentDateTo,
  currentStatus,
}: {
  currentPhone: string
  currentDateFrom: string
  currentDateTo: string
  currentStatus: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [phone, setPhone] = useState(currentPhone)
  const [dateFrom, setDateFrom] = useState(currentDateFrom)
  const [dateTo, setDateTo] = useState(currentDateTo)

  const hasFilter = phone.trim() || dateFrom || dateTo

  function buildParams(overrides: Record<string, string> = {}) {
    const p = new URLSearchParams()
    if (currentStatus && currentStatus !== 'all') p.set('status', currentStatus)
    const ph = overrides.phone ?? phone.trim()
    const df = overrides.dateFrom ?? dateFrom
    const dt = overrides.dateTo ?? dateTo
    if (ph) p.set('phone', ph)
    if (df) p.set('dateFrom', df)
    if (dt) p.set('dateTo', dt)
    p.set('page', '1')
    return p.toString()
  }

  function apply() {
    startTransition(() => {
      router.push(`/admin/don-hang?${buildParams()}`)
    })
  }

  function reset() {
    setPhone('')
    setDateFrom('')
    setDateTo('')
    startTransition(() => {
      router.push(`/admin/don-hang?${buildParams({ phone: '', dateFrom: '', dateTo: '' })}`)
    })
  }

  return (
    <div className="flex flex-wrap gap-3 mb-4 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Số điện thoại</label>
        <input
          type="tel"
          placeholder="Tìm SĐT khách hàng..."
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && apply()}
          disabled={isPending}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Từ ngày</label>
        <input
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={e => setDateFrom(e.target.value)}
          disabled={isPending}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 font-medium">Đến ngày</label>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={e => setDateTo(e.target.value)}
          disabled={isPending}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <button
        onClick={apply}
        disabled={isPending}
        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        {isPending ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Đang lọc...
          </>
        ) : 'Lọc'}
      </button>

      {hasFilter && (
        <button
          onClick={reset}
          disabled={isPending}
          className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Xoá bộ lọc
        </button>
      )}
    </div>
  )
}
