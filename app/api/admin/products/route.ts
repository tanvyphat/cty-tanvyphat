import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { slug, name, category, description, images, featured, fb_post_url, keyword, units } = body

  if (!slug || !name || !category) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc (tên, slug, danh mục)' }, { status: 400 })
  }

  const db = getAdminClient()

  const { data: existing } = await db
    .from('products')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

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
      keyword: keyword || null,
    })
    .select('id')
    .single()

  if (error || !product) return NextResponse.json({ error: error?.message }, { status: 500 })

  // Thêm các đơn vị
  if (Array.isArray(units) && units.length > 0) {
    const unitRows = units.map((u: { unit_name: string; price?: string; stock?: string; weight_grams?: number | null }, i: number) => ({
      product_id: product.id,
      unit_name: u.unit_name.trim(),
      price: u.price !== '' && u.price != null ? Number(u.price) : null,
      stock: Number(u.stock ?? 0) || 0,
      sort_order: i,
      weight_grams: u.weight_grams ?? null,
    }))
    await db.from('product_units').insert(unitRows)
  }

  revalidatePath(`/san-pham/${slug}`)
  revalidatePath('/san-pham')

  return NextResponse.json({ id: product.id }, { status: 201 })
}
