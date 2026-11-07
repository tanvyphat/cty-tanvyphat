import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentAdmin } from '@/src/lib/admin-auth'
import { getAdminClient } from '@/src/lib/supabase/admin'

export async function GET() {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Không có quyền quản trị.' }, { status: 403 })

  const { data, error } = await getAdminClient()
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Không có quyền quản trị.' }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 })
  const { slug, title, excerpt, content, image_url, video_url, tag, tag_color, fb_url, published_at } = body

  if (![slug, title, excerpt, content, tag].every(value => typeof value === 'string' && value.trim())) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }

  const { data, error } = await getAdminClient()
    .from('news')
    .insert({ slug, title, excerpt, content, image_url, video_url, tag, tag_color, fb_url, published_at })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidatePath('/tin-tuc')
  revalidatePath('/tin-tuc/' + data.slug)
  revalidatePath('/')
  return NextResponse.json(data, { status: 201 })
}
