export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'
import AdminNavbar from '@/app/admin/AdminNavbar'
import DonHangFilter from './DonHangFilter'

const STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'moi', label: 'Mới' },
  { key: 'dang_xu_ly', label: 'Đang xử lý' },
  { key: 'da_giao', label: 'Đã giao' },
  { key: 'huy', label: 'Huỷ' },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  moi: { label: 'Mới', color: 'bg-blue-100 text-blue-700' },
  dang_xu_ly: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-700' },
  da_giao: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  huy: { label: 'Huỷ', color: 'bg-red-100 text-red-700' },
}

function buildUrl(params: Record<string, string | undefined>) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) p.set(k, v)
  }
  return `/admin/don-hang?${p.toString()}`
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; phone?: string; dateFrom?: string; dateTo?: string }>
}) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/dang-nhap')

  const {
    status = 'all',
    page: pageStr = '1',
    phone = '',
    dateFrom = '',
    dateTo = '',
  } = await searchParams

  const page = Math.max(1, parseInt(pageStr, 10))
  const limit = 20
  const offset = (page - 1) * limit

  const db = getAdminClient()
  let query = db
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status !== 'all') query = query.eq('status', status)
  if (phone.trim()) query = query.ilike('customer_phone', `%${phone.trim()}%`)
  if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00+07:00`)
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59+07:00`)

  const { data: ordersData, count = 0 } = await query
  const orders = ordersData ?? []
  const totalPages = Math.ceil((count ?? 0) / limit)

  const filterBase = { phone: phone || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {STATUS_TABS.map(tab => (
            <Link
              key={tab.key}
              href={buildUrl({ status: tab.key, page: '1', ...filterBase })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                status === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Search & filter bar */}
        <DonHangFilter
          currentPhone={phone}
          currentDateFrom={dateFrom}
          currentDateTo={dateTo}
          currentStatus={status}
        />

        {/* Orders table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">Chưa có đơn hàng nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Khách hàng</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">SĐT</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Tổng tiền</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Thanh toán</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Giao hàng</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Trạng thái</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Ngày tạo</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order: Record<string, unknown>) => {
                    const s = STATUS_LABELS[order.status as string] ?? { label: order.status as string, color: 'bg-gray-100 text-gray-600' }
                    const isCK = order.payment_method === 'bank_transfer'
                    const isPaid = order.payment_status === 'paid'
                    return (
                      <tr key={order.id as string} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{order.customer_name as string}</td>
                        <td className="px-4 py-3 text-gray-600">{order.customer_phone as string}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {Number(order.total_price ?? 0) > 0
                            ? Number(order.total_price).toLocaleString('vi-VN') + 'đ'
                            : 'Liên hệ'}
                        </td>
                        <td className="px-4 py-3">
                          {isCK ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {isPaid ? 'CK ✓' : 'CK ⏳'}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">COD</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {order.delivery_type === 'express' ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">⚡ Hỏa tốc</span>
                          ) : (
                            <span className="text-xs text-gray-500">Thường</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(order.created_at as string).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/don-hang/${order.id}`}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex gap-2 justify-center mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Link
                key={p}
                href={buildUrl({ status, page: String(p), ...filterBase })}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${
                  p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
