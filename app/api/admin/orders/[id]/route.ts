import { NextRequest } from 'next/server'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

const VALID_STATUSES = ['moi', 'dang_xu_ly', 'da_giao', 'huy'] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const status = body.status as string

  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return Response.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 })
  }

  const db = getAdminClient()
  const updatePayload: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (status === 'da_giao') updatePayload.payment_status = 'paid'

  const { data, error } = await db
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ order: data })
}
