export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'
import StatusUpdater from './StatusUpdater'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  moi: { label: 'Mới', color: 'bg-blue-100 text-blue-700' },
  dang_xu_ly: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-700' },
  da_giao: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  huy: { label: 'Huỷ', color: 'bg-red-100 text-red-700' },
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/dang-nhap')

  const { id } = await params
  const db = getAdminClient()
  const { data: order } = await db
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const orderItems = (order.order_items as Array<Record<string, unknown>>) ?? []

  const s = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin/don-hang" className="text-gray-400 hover:text-gray-600">
            ← Quay lại
          </Link>
          <h1 className="font-bold text-gray-900">Chi tiết đơn hàng</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Status */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${s.color}`}>
              {s.label}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(order.created_at).toLocaleString('vi-VN')}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono">#{order.id}</p>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-700 text-sm mb-3">Sản phẩm</h2>
          {orderItems.length === 0 ? (
            <p className="text-gray-400 text-sm">Không có sản phẩm</p>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id as number} className="flex justify-between items-start text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name as string}</p>
                    <p className="text-gray-500 text-xs">
                      {Number(item.product_price) > 0
                        ? Number(item.product_price).toLocaleString('vi-VN') + 'đ'
                        : 'Liên hệ'} × {item.quantity as number}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800 text-xs">
                    {Number(item.product_price) > 0
                      ? (Number(item.product_price) * (item.quantity as number)).toLocaleString('vi-VN') + 'đ'
                      : '—'}
                  </p>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-semibold text-gray-700">Tổng cộng</span>
                <span className="font-bold text-blue-600">
                  {Number(order.total_price) > 0
                    ? Number(order.total_price).toLocaleString('vi-VN') + 'đ'
                    : 'Liên hệ'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Customer */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-700 text-sm mb-3">Khách hàng</h2>
          <div className="space-y-1 text-sm text-gray-700">
            <p><span className="text-gray-500">Tên:</span> {order.customer_name}</p>
            <p><span className="text-gray-500">SĐT:</span> {order.customer_phone}</p>
            <p><span className="text-gray-500">Địa chỉ:</span> {order.customer_address}</p>
            {order.note && (
              <p><span className="text-gray-500">Ghi chú:</span> {order.note}</p>
            )}
          </div>
        </div>

        {/* Status updater */}
        <StatusUpdater orderId={id} currentStatus={order.status} />
      </div>
    </div>
  )
}
