import { NextRequest } from 'next/server'
import { getClient } from '@/src/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawIds = (searchParams.get('ids') ?? '').split(',')
  if (rawIds.length > 20) return Response.json({ error: 'Too many ids' }, { status: 400 })

  const ids = [...new Set(rawIds.filter((id) => /^[1-9]\\d*$/.test(id.trim())).map((id) => Number(id.trim())).filter(Number.isSafeInteger))]
  if (ids.length === 0) return Response.json({ products: [] })

  const db = getClient()
  const { data: cartProducts, error: categoryError } = await db
    .from('products')
    .select('category')
    .in('id', ids)

  if (categoryError) return Response.json({ error: 'Catalog unavailable' }, { status: 503 })
  const categories = [...new Set((cartProducts ?? []).map((p) => p.category))]
  if (categories.length === 0) return Response.json({ products: [] })

  const { data: related, error } = await db
    .from('products')
    .select('id, slug, name, category, description, images, featured, keyword, fb_post_url, min_price, created_at, updated_at, product_units(id, product_id, unit_name, price, stock, sort_order, created_at, weight_grams)')
    .in('category', categories)
    .not('id', 'in', `(${ids.join(',')})`)
    .order('name')
    .limit(10)

  if (error) return Response.json({ error: 'Catalog unavailable' }, { status: 503 })
  return Response.json({ products: related ?? [] })
}
