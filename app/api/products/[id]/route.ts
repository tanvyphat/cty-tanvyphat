import { NextRequest } from 'next/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const productId = parseInt(id, 10)
  if (isNaN(productId)) {
    return Response.json({ error: 'Invalid id' }, { status: 400 })
  }

  const db = getAdminClient()
  const { data: product } = await db
    .from('products')
    .select('id, slug, name, price, images')
    .eq('id', productId)
    .single()

  if (!product) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json(product)
}
