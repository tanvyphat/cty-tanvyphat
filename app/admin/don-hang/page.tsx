export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'
import LogoutButton from './LogoutButton'

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

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/dang-nhap')

  const { status = 'all', page: pageStr = '1' } = await searchParams
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

  const { data: ordersData, count = 0 } = await query
  const orders = ordersData ?? []
  const totalPages = Math.ceil((count ?? 0) / limit)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-gray-900">📦 Quản lý đơn hàng</h1>
            <Link href="/admin/tin-tuc" className="text-sm text-gray-500 hover:text-gray-700">
              Tin tức
            </Link>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {STATUS_TABS.map(tab => (
            <Link
              key={tab.key}
              href={`/admin/don-hang?status=${tab.key}`}
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
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Trạng thái</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Ngày tạo</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order: Record<string, unknown>) => {
                    const s = STATUS_LABELS[order.status as string] ?? { label: order.status as string, color: 'bg-gray-100 text-gray-600' }
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
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(order.created_at as string).toLocaleDateString('vi-VN')}
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
                href={`/admin/don-hang?status=${status}&page=${p}`}
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
