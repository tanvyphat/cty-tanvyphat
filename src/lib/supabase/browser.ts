import { createBrowserClient } from '@supabase/ssr'
import { getPublicSupabaseKey } from './public-key'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getPublicSupabaseKey()
  )
}
