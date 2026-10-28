import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createSSRClient } from '@/src/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next') ?? '/admin/san-pham'
  const next = requestedNext.startsWith('/admin/') ? requestedNext : '/admin/san-pham'

  if (code) {
    const supabase = await createSSRClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) redirect(next)
  }

  redirect('/admin/dang-nhap?error=auth')
}
