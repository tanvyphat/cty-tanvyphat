import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.app_metadata?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const productId = Number(id)
  if (!Number.isSafeInteger(productId) || productId <= 0) return NextResponse.json({ error: 'ID sản phẩm không hợp lệ.' }, { status: 400 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
  const { slug, name, category, description, images, featured, fb_post_url } = body

  if (![slug, name, category].every(v => typeof v === 'string' && v.trim())) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }

  const db = getAdminClient()

  const [{ data: currentProduct }, { data: existing }] = await Promise.all([
    db.from('products').select('slug').eq('id', productId).single(),
    db.from('products').select('id').eq('slug', slug).neq('id', productId).maybeSingle(),
  ])

  if (!currentProduct) return NextResponse.json({ error: 'Không tìm thấy sản phẩm cần sửa.' }, { status: 404 })
  if (existing) {
    return NextResponse.json({ error: 'Slug đã tồn tại, hãy chỉnh sửa tên hoặc slug' }, { status: 409 })
  }

  const { error } = await db
    .from('products')
    .update({
      slug,
      name,
      category,
      description: description || '',
      images: images || [],
      featured: Boolean(featured),
      fb_post_url: fb_post_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Revalidate slug cũ (nếu slug đổi) và slug mới
  if (currentProduct && currentProduct.slug !== slug) {
    revalidatePath(`/san-pham/${currentProduct.slug}`)
  }
  revalidatePath(`/san-pham/${slug}`)
  revalidatePath('/san-pham')
  revalidatePath('/')
  revalidatePath('/sitemap.xml')

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.app_metadata?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) return NextResponse.json({ error: 'ID sản phẩm không hợp lệ.' }, { status: 400 })
  const db = getAdminClient()

  const { data: product } = await db.from('products').select('slug').eq('id', Number(id)).maybeSingle()
  if (!product) return NextResponse.json({ error: 'Sản phẩm không tồn tại.' }, { status: 404 })
  const { error } = await db.from('products').delete().eq('id', Number(id))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidatePath(`/san-pham/${product.slug}`)
  revalidatePath('/san-pham')
  revalidatePath('/')
  revalidatePath('/sitemap.xml')

  return NextResponse.json({ success: true })
}
