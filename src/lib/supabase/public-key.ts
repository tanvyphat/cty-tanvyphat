/** Client-safe Supabase API key selection.
 * Modern publishable API keys are preferred. Keep legacy anon as a temporary
 * migration fallback until separately approved key cutover is complete.
 * NEVER reference a service-role or secret key in this module.
 */
export function getPublicSupabaseKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('Missing Supabase publishable/anon API key')
  return key
}
