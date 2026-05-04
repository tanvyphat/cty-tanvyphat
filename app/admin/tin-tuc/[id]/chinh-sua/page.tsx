import { redirect, notFound } from 'next/navigation'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'
import ChinhSuaClient from './ChinhSuaClient'

export default async function ChinhSuaPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/dang-nhap')

  const { id } = await params
  const { data } = await getAdminClient().from('news').select('*').eq('id', id).single()
  if (!data) notFound()

  return <ChinhSuaClient item={data} />
}
