import { createSSRClient } from '@/src/lib/supabase/server'

/** Server-only: never trust a client-supplied role or user id for admin authorization. */
export async function getCurrentAdmin() {
  const supabase = await createSSRClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return !error && user?.app_metadata?.role === 'admin' ? user : null
}
