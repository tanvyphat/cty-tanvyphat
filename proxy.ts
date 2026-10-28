import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getPublicSupabaseKey } from './src/lib/supabase/public-key'

export async function proxy(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getPublicSupabaseKey(),
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // Always call getUser() to refresh session tokens
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminPath = pathname.startsWith('/admin')
  const isLoginPath = pathname === '/admin/dang-nhap'

  const isAdmin = user?.app_metadata?.role === 'admin'

  // Chưa đăng nhập hoặc không phải admin → vào trang admin (không phải login) → redirect về login
  if (isAdminPath && !isLoginPath && !isAdmin) {
    return NextResponse.redirect(new URL('/admin/dang-nhap', request.url))
  }

  // Đã là admin → vào trang login → redirect về san-pham
  if (isLoginPath && isAdmin) {
    return NextResponse.redirect(new URL('/admin/san-pham', request.url))
  }

  // Đã là admin → vào /admin root hoặc /admin/don-hang → redirect về san-pham
  if ((pathname === '/admin' || pathname.startsWith('/admin/don-hang')) && isAdmin) {
    return NextResponse.redirect(new URL('/admin/san-pham', request.url))
  }

  return supabaseResponse
}

export const config = {
  // Catalog is public: avoid Supabase Auth network calls on every page request.
  // Admin pages/APIs and auth callbacks still refresh and verify sessions.
  matcher: ['/admin/:path*', '/api/admin/:path*', '/auth/:path*'],
}
