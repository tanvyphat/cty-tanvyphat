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

  // Nếu đã có phiên Admin mà mở lại trang đăng nhập: trở về trang chủ.
  if (isLoginPath && isAdmin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Đã là admin → vào /admin root hoặc /admin/don-hang → redirect về san-pham
  if ((pathname === '/admin' || pathname.startsWith('/admin/don-hang')) && isAdmin) {
    return NextResponse.redirect(new URL('/admin/san-pham', request.url))
  }

  return supabaseResponse
}

// Refresh sessions for admin, auth callbacks and customer account pages; catalog remains public.
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/auth/:path*',
    '/dang-nhap',
    '/tai-khoan/:path*',
    '/quen-mat-khau',
    '/doi-mat-khau',
  ],
}
