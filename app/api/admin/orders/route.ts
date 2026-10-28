import { NextRequest } from 'next/server'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = 20
  const offset = (page - 1) * limit

  const db = getAdminClient()
  let query = db
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: orders, count, error } = await query

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ orders: orders ?? [], total: count ?? 0, page })
}
