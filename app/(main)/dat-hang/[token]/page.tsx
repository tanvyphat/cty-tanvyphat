export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getAdminClient } from '@/src/lib/supabase/admin'
import CheckoutForm from './CheckoutForm'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const db = getAdminClient()

  // Fetch cart session + product
  const { data: session } = await db
    .from('cart_sessions')
    .select('id, fb_user_id, product_id, quantity, status, expires_at')
    .eq('token', token)
    .single()

  if (!session || session.status !== 'pending') {
    notFound()
  }

  // Fetch product info
  const { data: product } = await db
    .from('products')
    .select('id, name, price, stock, images')
    .eq('id', session.product_id)
    .single()

  if (!product) notFound()

  // Check expiry
  const isExpired = new Date(session.expires_at) < new Date()

  // Fetch saved customer info if any
  const { data: savedCustomer } = await db
    .from('fb_customers')
    .select('customer_name, customer_phone, customer_address')
    .eq('fb_user_id', session.fb_user_id)
    .single()

  if (isExpired) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Liên kết đã hết hạn</h1>
          <p className="text-gray-500 text-sm">
            Link đặt hàng này đã hết hạn (24 giờ). Vui lòng comment lại keyword
            trên Facebook để nhận link mới.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Đặt hàng</h1>
          <p className="text-gray-500 text-sm mt-1">CT Tân Vy Phát</p>
        </div>

        {/* Product Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex gap-4 items-center">
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{product.name}</p>
            <p className="text-sm text-gray-500">Số lượng: {session.quantity}</p>
            {product.price && (
              <p className="text-blue-600 font-bold">
                {(product.price * session.quantity).toLocaleString('vi-VN')}đ
              </p>
            )}
          </div>
        </div>

        <CheckoutForm
          token={token}
          savedCustomer={savedCustomer ?? undefined}
        />
      </div>
    </main>
  )
}
