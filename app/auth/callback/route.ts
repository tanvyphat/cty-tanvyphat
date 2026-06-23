import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createSSRClient } from '@/src/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createSSRClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirect(next)
    }
  }

  redirect('/dang-nhap?error=auth')
}
