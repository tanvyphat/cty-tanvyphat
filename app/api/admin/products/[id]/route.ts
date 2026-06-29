import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const productId = Number(id)
  const body = await req.json()
  const { slug, name, category, description, images, featured, fb_post_url, keyword, units } = body

  if (!slug || !name || !category) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }

  const db = getAdminClient()

  const [{ data: currentProduct }, { data: existing }] = await Promise.all([
    db.from('products').select('slug').eq('id', productId).single(),
    db.from('products').select('id').eq('slug', slug).neq('id', productId).maybeSingle(),
  ])

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
      keyword: keyword || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Đồng bộ đơn vị: xóa hết rồi insert lại
  if (Array.isArray(units)) {
    await db.from('product_units').delete().eq('product_id', productId)
    if (units.length > 0) {
      const unitRows = units.map((u: { unit_name: string; price?: string; stock?: string; weight_grams?: number | null }, i: number) => ({
        product_id: productId,
        unit_name: u.unit_name.trim(),
        price: u.price !== '' && u.price != null ? Number(u.price) : null,
        stock: Number(u.stock ?? 0) || 0,
        sort_order: i,
        weight_grams: u.weight_grams ?? null,
      }))
      await db.from('product_units').insert(unitRows)
    }
  }

  // Revalidate slug cũ (nếu slug đổi) và slug mới
  if (currentProduct && currentProduct.slug !== slug) {
    revalidatePath(`/san-pham/${currentProduct.slug}`)
  }
  revalidatePath(`/san-pham/${slug}`)
  revalidatePath('/san-pham')

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getAdminClient()

  const { data: product } = await db.from('products').select('slug').eq('id', Number(id)).single()

  const { error } = await db.from('products').delete().eq('id', Number(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (product) revalidatePath(`/san-pham/${product.slug}`)
  revalidatePath('/san-pham')

  return NextResponse.json({ success: true })
}
