import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.app_metadata?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
  const { slug, name, category, description, images, featured, fb_post_url } = body

  if (![slug, name, category].every(v => typeof v === 'string' && v.trim())) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc (tên, slug, danh mục)' }, { status: 400 })
  }

  const db = getAdminClient()

  const { data: existing, error: existingError } = await db
    .from('products')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 })
  if (existing) {
    return NextResponse.json({ error: 'Slug đã tồn tại, hãy chỉnh sửa tên hoặc slug' }, { status: 409 })
  }

  const { data: product, error } = await db
    .from('products')
    .insert({
      slug,
      name,
      category,
      description: description || '',
      images: images || [],
      featured: Boolean(featured),
      fb_post_url: fb_post_url || null,
    })
    .select('id')
    .single()

  if (error || !product) return NextResponse.json({ error: error?.message }, { status: 500 })

  revalidatePath(`/san-pham/${slug}`)
  revalidatePath('/san-pham')
  revalidatePath('/')
  revalidatePath('/sitemap.xml')

  return NextResponse.json({ id: product.id }, { status: 201 })
}
