import { redirect, notFound } from 'next/navigation'
import { createSSRClient, getCategories } from '@/src/lib/supabase/server'
import ProductFormClient from '../../ProductFormClient'

export default async function ChinhSuaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/admin/dang-nhap')

  const { id } = await params

  const [categories, { data: rawProduct, error }] = await Promise.all([
    getCategories(),
    supabase
      .from('products')
      .select('*, product_units(id, product_id, unit_name, price, stock, sort_order, created_at)')
      .eq('id', Number(id))
      .single(),
  ])

  const product = rawProduct ? {
    ...rawProduct,
    product_units: (rawProduct.product_units ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  } : null

  if (error || !rawProduct || !product) notFound()

  return <ProductFormClient categories={categories} product={product} />
}
