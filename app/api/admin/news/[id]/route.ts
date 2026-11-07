import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentAdmin } from '@/src/lib/admin-auth'
import { getAdminClient } from '@/src/lib/supabase/admin'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Không có quyền quản trị.' }, { status: 403 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 })
  const { slug, title, excerpt, content, image_url, video_url, tag, tag_color, fb_url, published_at } = body

  if (![slug, title, excerpt, content, tag].every(value => typeof value === 'string' && value.trim())) {
    return NextResponse.json({ error: 'Vui lòng điền đủ tiêu đề, đường dẫn, tóm tắt, nội dung và nhãn.' }, { status: 400 })
  }
  const db = getAdminClient()
  const { data: previous } = await db.from('news').select('slug').eq('id', id).maybeSingle()
  if (!previous) return NextResponse.json({ error: 'Không tìm thấy bài viết.' }, { status: 404 })
  const { data, error } = await db
    .from('news')
    .update({ slug, title, excerpt, content, image_url, video_url, tag, tag_color, fb_url, published_at })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (previous.slug !== data.slug) revalidatePath('/tin-tuc/' + previous.slug)
  revalidatePath('/tin-tuc/' + data.slug)
  revalidatePath('/tin-tuc')
  revalidatePath('/')
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Không có quyền quản trị.' }, { status: 403 })

  const { id } = await params

  const db = getAdminClient()
  const { data: previous } = await db.from('news').select('slug').eq('id', id).maybeSingle()
  if (!previous) return NextResponse.json({ error: 'Không tìm thấy bài viết.' }, { status: 404 })
  const { error } = await db.from('news').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidatePath('/tin-tuc/' + previous.slug)
  revalidatePath('/tin-tuc')
  revalidatePath('/')
  return NextResponse.json({ success: true })
}
