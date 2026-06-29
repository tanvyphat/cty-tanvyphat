import { NextRequest } from 'next/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

interface PendingPaymentBody {
  customer_name: string
  customer_phone: string
  customer_address: string
  note?: string
  fb_user_id?: string
  province?: string
  district?: string
  shipping_fee: number
  delivery_type?: string
  items: { product_id: number; unit_id: number; quantity: number }[]
}

export async function POST(request: NextRequest) {
  let body: PendingPaymentBody
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    customer_name, customer_phone, customer_address,
    note, fb_user_id, province, district, shipping_fee, delivery_type, items,
  } = body

  if (!customer_name || !customer_phone || !customer_address) {
    return Response.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'Giỏ hàng trống' }, { status: 400 })
  }

  const db = getAdminClient()

  // Tính tổng tiền từ product_units
  const unitIds = [...new Set(items.map(i => i.unit_id))]
  const { data: units } = await db
    .from('product_units')
    .select('id, price')
    .in('id', unitIds)

  if (!units || units.length === 0) {
    return Response.json({ error: 'Không tìm thấy thông tin đơn vị sản phẩm' }, { status: 404 })
  }

  const unitMap = Object.fromEntries(units.map(u => [u.id, u]))
  const subtotal = items.reduce((sum, item) => {
    const price = Number(unitMap[item.unit_id]?.price ?? 0)
    return sum + price * item.quantity
  }, 0)
  const amount = subtotal + (shipping_fee ?? 0)

  const { data: pending, error } = await db
    .from('pending_payments')
    .insert({
      amount,
      shipping_fee: shipping_fee ?? 0,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_address: customer_address.trim(),
      note: note?.trim() || null,
      fb_user_id: fb_user_id || null,
      province: province || null,
      district: district || null,
      delivery_type: delivery_type ?? 'standard',
      items: JSON.stringify(items),
    })
    .select('token')
    .single()

  if (error || !pending) {
    console.error('[payments/pending] insert error:', error)
    return Response.json({ error: 'Không thể tạo phiên thanh toán' }, { status: 500 })
  }

  const tokenStr = pending.token as string
  const transferContent = 'TVP' + tokenStr.replace(/-/g, '').substring(0, 8).toUpperCase()

  return Response.json({ token: pending.token, amount, transfer_content: transferContent })
}
