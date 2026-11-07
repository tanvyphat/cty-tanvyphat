import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createSSRClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const requestedNext = searchParams.get('next')
  const next = type === 'recovery'
    ? '/doi-mat-khau'
    : (requestedNext?.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/tai-khoan')

  if (token_hash && type) {
    const supabase = await createSSRClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      redirect(next)
    }
  }

  redirect('/dang-nhap?error=auth')
}
