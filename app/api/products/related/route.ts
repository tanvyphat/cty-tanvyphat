import { NextRequest } from 'next/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids') ?? ''

  const ids = idsParam
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n))

  if (ids.length === 0) {
    return Response.json({ products: [] })
  }

  const db = getAdminClient()

  // Get categories of the cart products
  const { data: cartProducts } = await db
    .from('products')
    .select('category')
    .in('id', ids)

  if (!cartProducts || cartProducts.length === 0) {
    return Response.json({ products: [] })
  }

  const categories = [...new Set(cartProducts.map((p) => p.category))]

  // Fetch products in same categories, excluding cart items
  const { data: related } = await db
    .from('products')
    .select('id, slug, name, category, description, images, price, stock, featured, keyword, fb_post_url, created_at, updated_at')
    .in('category', categories)
    .not('id', 'in', `(${ids.join(',')})`)

  if (!related || related.length === 0) {
    return Response.json({ products: [] })
  }

  // Shuffle and limit to 10
  const shuffled = [...related].sort(() => Math.random() - 0.5).slice(0, 10)

  return Response.json({ products: shuffled })
}
