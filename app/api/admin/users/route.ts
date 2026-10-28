import { NextRequest } from 'next/server'
import { createSSRClient } from '@/src/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createSSRClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { status: 401 as const, supabase: null, user: null }
  if (user.app_metadata?.role !== 'admin') return { status: 403 as const, supabase: null, user: null }
  return { status: 200 as const, supabase, user }
}

// Database RPC independently verifies the caller's current app_metadata.role.
// The auth.users table is never directly exposed via the Data API.
export async function GET() {
  const session = await requireAdmin()
  if (!session.supabase) return Response.json({ error: 'Unauthorized' }, { status: session.status })

  const { data, error } = await session.supabase.rpc('catalog_admin_list_users')
  if (error) return Response.json({ error: 'Không thể tải tài khoản quản trị' }, { status: 503 })
  return Response.json({ users: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin()
  if (!session.supabase || !session.user) {
    return Response.json({ error: 'Unauthorized' }, { status: session.status })
  }
  let body: { user_id?: unknown; role?: unknown }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (typeof body.user_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.user_id)) {
    return Response.json({ error: 'User ID không hợp lệ' }, { status: 400 })
  }
  if (body.role !== 'admin' && body.role !== null) {
    return Response.json({ error: 'Vai trò không hợp lệ' }, { status: 400 })
  }
  if (body.user_id === session.user.id && body.role !== 'admin') {
    return Response.json({ error: 'Không thể tự hạ quyền Admin' }, { status: 400 })
  }
  const { error } = await session.supabase.rpc('catalog_admin_set_user_role', {
    target_user_id: body.user_id, new_role: body.role,
  })
  if (error) return Response.json({ error: 'Không thể cập nhật quyền tài khoản' }, { status: 403 })
  return Response.json({ success: true })
}

// Deliberately no DELETE endpoint: account deletion requires independent
// destructive-action approval and cannot silently delete production users.
