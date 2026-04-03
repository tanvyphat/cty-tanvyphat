import { NextRequest } from 'next/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

interface OrderItem {
  product_id: number
  quantity: number
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { customer_name, customer_phone, customer_address, note, fb_user_id, items } = body as {
    customer_name: string
    customer_phone: string
    customer_address: string
    note?: string
    fb_user_id?: string
    items: OrderItem[]
  }

  if (!customer_name || !customer_phone || !customer_address) {
    return Response.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'Giỏ hàng trống' }, { status: 400 })
  }

  const db = getAdminClient()

  // Fetch product info for all items
  const productIds = items.map((i) => i.product_id)
  const { data: products } = await db
    .from('products')
    .select('id, name, price')
    .in('id', productIds)

  if (!products || products.length === 0) {
    return Response.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 })
  }

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  // Build order items with resolved product info
  const resolvedItems = items.map((item) => {
    const product = productMap[item.product_id]
    return {
      product_id: item.product_id,
      product_name: product?.name ?? 'Sản phẩm không xác định',
      product_price: product?.price ?? 0,
      quantity: item.quantity,
    }
  })

  const total_price = resolvedItems.reduce(
    (sum, i) => sum + Number(i.product_price) * i.quantity,
    0
  )

  // Create order
  const { data: order, error: orderError } = await db
    .from('orders')
    .insert({
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_address: customer_address.trim(),
      note: note?.trim() || null,
      total_price,
      status: 'moi',
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('Create order error:', orderError)
    return Response.json({ error: 'Không thể tạo đơn hàng' }, { status: 500 })
  }

  // Insert order items
  const { error: itemsError } = await db.from('order_items').insert(
    resolvedItems.map((i) => ({ order_id: order.id, ...i }))
  )

  if (itemsError) {
    console.error('Create order_items error:', itemsError)
    return Response.json({ error: 'Không thể lưu sản phẩm đơn hàng' }, { status: 500 })
  }

  // Save customer info for Facebook users (auto-fill next time)
  if (fb_user_id) {
    await db.from('fb_customers').upsert({
      fb_user_id,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_address: customer_address.trim(),
      updated_at: new Date().toISOString(),
    })
  }

  return Response.json({ success: true, order_id: order.id })
}
