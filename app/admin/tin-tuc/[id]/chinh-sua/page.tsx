import { redirect, notFound } from 'next/navigation'
import { createSSRClient } from '@/src/lib/supabase/server'
import ChinhSuaClient from './ChinhSuaClient'

export default async function ChinhSuaPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/admin/dang-nhap')

  const { id } = await params
  const { data } = await supabase.from('news').select('*').eq('id', id).single()
  if (!data) notFound()

  return <ChinhSuaClient item={data} />
}
