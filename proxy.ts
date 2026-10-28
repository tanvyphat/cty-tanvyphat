import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

// Keep session refresh for protected pages, authenticated customer flows,
// and API endpoints that read the user's SSR session.
// Public catalog/marketing pages intentionally bypass Supabase Auth in Proxy.
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/auth/:path*',
    '/api/orders/:path*',
    '/dang-nhap',
    '/tai-khoan/:path*',
    '/don-hang-da-dat/:path*',
    '/gio-hang/:path*',
    '/thanh-toan',
    '/dat-hang/:path*',
  ],
}
