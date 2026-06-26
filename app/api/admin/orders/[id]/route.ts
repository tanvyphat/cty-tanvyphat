import { NextRequest } from 'next/server'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

const VALID_STATUSES = ['moi', 'dang_xu_ly', 'da_giao', 'huy'] as const
const VALID_PAYMENT_STATUSES = ['paid', 'pending'] as const

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const status = body.status as string | undefined
  const payment_status = body.payment_status as string | undefined

  const db = getAdminClient()
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  // Cập nhật trạng thái đơn hàng
  if (status) {
    if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      return Response.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 })
    }
    updatePayload.status = status
  }

  // Cập nhật trạng thái thanh toán - KHÔNG DÙNG NULL
  if (payment_status !== undefined) {
    let normalized: string

    if (payment_status === 'da_thanh_toan' || payment_status === 'paid') {
      normalized = 'paid'
    } else {
      normalized = 'pending'   // Chưa thanh toán
    }

    updatePayload.payment_status = normalized
  }

  if (Object.keys(updatePayload).length === 1) {
    return Response.json({ error: 'Không có trường nào cần cập nhật' }, { status: 400 })
  }

  const { data, error } = await db
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

  if (error) {
    console.error('Update error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({
    order: data,
    message: 'Cập nhật trạng thái thành công'
  })
}