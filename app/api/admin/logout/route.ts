import { createSSRClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createSSRClient()
  await supabase.auth.signOut()
  redirect('/')
}
