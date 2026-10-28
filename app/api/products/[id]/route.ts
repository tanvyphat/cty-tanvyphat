import { NextRequest } from 'next/server'
import { getClient } from '@/src/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const productId = parseInt(id, 10)
  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return Response.json({ error: 'Invalid id' }, { status: 400 })
  }

  const db = getClient()
  const { data: product, error } = await db
    .from('products')
    .select('id, slug, name, images, product_units(id, unit_name, price, stock, sort_order)')
    .eq('id', productId)
    .single()

  if (error && error.code !== 'PGRST116') return Response.json({ error: 'Catalog unavailable' }, { status: 503 })
  if (!product) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const units = (product.product_units as { id: number; unit_name: string; price: number | null; stock: number; sort_order: number }[] ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
  const firstUnit = units[0] ?? null

  return Response.json({ ...product, firstUnit, product_units: units })
}
