import { redirect, notFound } from 'next/navigation'
import { createSSRClient, getCategories } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'
import ProductFormClient from '../../ProductFormClient'

export default async function ChinhSuaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/dang-nhap')

  const { id } = await params

  const [categories, { data: rawProduct, error }] = await Promise.all([
    getCategories(),
    getAdminClient()
      .from('products')
      .select('*')
      .eq('id', Number(id))
      .single(),
  ])

  if (error || !rawProduct) notFound()

  return <ProductFormClient categories={categories} product={rawProduct} />
}
