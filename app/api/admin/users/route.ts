import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/src/lib/supabase/admin'
import { getCurrentAdmin } from '@/src/lib/admin-auth'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const deny = () => NextResponse.json({ error: 'Bạn cần đăng nhập bằng tài khoản quản trị viên.' }, { status: 403 })

async function readRequest(request: NextRequest): Promise<{ user_id: string; role?: 'admin' | null } | null> {
  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const { user_id, role } = body as { user_id?: unknown; role?: unknown }
  if (typeof user_id !== 'string' || !UUID_PATTERN.test(user_id)) return null
  if (role !== undefined && role !== null && role !== 'admin') return null
  return { user_id, role: role as 'admin' | null | undefined }
}

// GET /api/admin/users - list all users, not just the first 200.
export async function GET() {
  if (!await getCurrentAdmin()) return deny()
  const db = getAdminClient()
  const all: Array<{
    id: string; email?: string; user_metadata: Record<string, any>; app_metadata: Record<string, any>;
    created_at: string; last_sign_in_at?: string
  }> = []
  const perPage = 200
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage })
    if (error) return NextResponse.json({ error: 'Không thể tải danh sách tài khoản: ' + error.message }, { status: 502 })
    for (const user of data.users) {
      all.push({
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata ?? {},
        app_metadata: user.app_metadata ?? {},
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      })
    }
    if (data.users.length < perPage) break
    if (page === 50) return NextResponse.json({ error: 'Danh sách quá lớn. Hãy dùng chức năng phân trang.' }, { status: 503 })
  }

  return NextResponse.json({ users: all.map(u => ({
    id: u.id,
    email: u.email,
    full_name: u.user_metadata.full_name ?? u.user_metadata.name ?? null,
    avatar_url: u.user_metadata.avatar_url ?? null,
    provider: u.app_metadata.provider ?? 'email',
    role: u.app_metadata.role ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
  })) }, { headers: { 'Cache-Control': 'no-store' } })
}

// PATCH /api/admin/users - grant or revoke admin role.
export async function PATCH(request: NextRequest) {
  const caller = await getCurrentAdmin()
  if (!caller) return deny()
  const body = await readRequest(request)
  if (!body || body.role === undefined) {
    return NextResponse.json({ error: 'Thông tin tài khoản hoặc quyền quản trị không hợp lệ.' }, { status: 400 })
  }
  if (caller.id === body.user_id && body.role !== 'admin') {
    return NextResponse.json({ error: 'Không thể tự hạ quyền Admin của chính mình.' }, { status: 409 })
  }
  const db = getAdminClient()
  const { data: target, error: lookupError } = await db.auth.admin.getUserById(body.user_id)
  if (lookupError || !target.user) return NextResponse.json({ error: 'Không tìm thấy tài khoản.' }, { status: 404 })
  const { error } = await db.auth.admin.updateUserById(body.user_id, {
    app_metadata: { role: body.role },
  })
  if (error) return NextResponse.json({ error: 'Không cập nhật được quyền: ' + error.message }, { status: 502 })
  return NextResponse.json({ success: true })
}

// DELETE /api/admin/users - permanently delete a regular user's Supabase Auth account.
// public.profiles has an ON DELETE CASCADE FK to auth.users.
export async function DELETE(request: NextRequest) {
  const caller = await getCurrentAdmin()
  if (!caller) return deny()
  const body = await readRequest(request)
  if (!body) return NextResponse.json({ error: 'ID tài khoản không hợp lệ.' }, { status: 400 })
  if (caller.id === body.user_id) {
    return NextResponse.json({ error: 'Không thể xóa tài khoản Admin đang sử dụng.' }, { status: 409 })
  }

  const db = getAdminClient()
  const { data: target, error: lookupError } = await db.auth.admin.getUserById(body.user_id)
  if (lookupError || !target.user) {
    return NextResponse.json({ error: 'Tài khoản không còn tồn tại. Hãy tải lại danh sách.' }, { status: 404 })
  }
  if (target.user.app_metadata?.role === 'admin') {
    return NextResponse.json({ error: 'Để bảo vệ quyền quản trị, hãy hạ cấp tài khoản Admin trước khi xóa.' }, { status: 409 })
  }

  const { error } = await db.auth.admin.deleteUser(body.user_id)
  if (error) {
    // Supabase Storage objects can block Auth user deletion due to ownership references.
    const detail = /storage|foreign key|owner|constraint/i.test(error.message)
      ? 'Tài khoản còn dữ liệu liên kết (ví dụ file trong Supabase Storage). Hãy kiểm tra hoặc chuyển quyền sở hữu file trước khi xóa.'
      : 'Supabase không thể xóa tài khoản: ' + error.message
    return NextResponse.json({ error: detail }, { status: 409 })
  }
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
