'use client'

import {useState, useRef, useEffect} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useRouter} from 'nextjs-toploader/app'
import {store} from '../data/store'
import CartBadge from './CartBadge'
import {useAuth} from '../contexts/AuthContext'

const navLinks = [
    {href: '/', label: 'Trang chủ'},
    {href: '/san-pham?branch=giay-in', label: 'Giấy in'},
    {href: '/san-pham?branch=van-phong-pham', label: 'Văn phòng phẩm'},
    {href: '/san-pham?branch=hang-thai-lan', label: 'Hàng Thái Lan'},
    {href: '/san-pham?branch=becker-chemie', label: 'Becker Chemie'},
    {href: '/gioi-thieu', label: 'Giới thiệu'},
    {href: '/tin-tuc', label: 'Tin tức'},
]

const utilityLinks = [
    {href: '/tra-cuu-don-hang', label: 'Tra cứu đơn hàng'},
    {href: '/tin-tuc', label: 'Tin tức'},
    {href: '/lien-he', label: 'Liên hệ'},
]

function UserMenu() {
    const {user, profile, authLoading, signOut} = useAuth()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }

        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    if (authLoading) return <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"/>

    if (!user) {
        return (
            <Link
                href="/dang-nhap"
                className="flex items-center gap-1.5 text-gray-600 hover:text-[#1a56db] text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Đăng nhập
            </Link>
        )
    }

    const avatarUrl = user.user_metadata?.avatar_url as string | undefined
    const displayName = profile?.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? ''
    const initials = displayName.charAt(0).toUpperCase()
    // Kiểm tra quyền Admin từ app_metadata (cột raw_app_meta_data trong SQL)
    const isAdmin = user.app_metadata?.role === 'admin'
    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 rounded-full hover:opacity-90 transition-opacity"
                aria-label="Tài khoản"
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName}
                         className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"/>
                ) : (
                    <div
                        className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-sm font-bold text-[#1a3a6b] border-2 border-gray-200">
                        {initials}
                    </div>
                )}
                <span
                    className="hidden lg:block text-sm text-gray-700 font-medium max-w-[100px] truncate">{displayName.split(' ').pop()}</span>
                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                     strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                        href="/tai-khoan"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                             strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Tài khoản
                    </Link>
                    <Link
                        href="/don-hang-da-dat"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                             strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        Đơn hàng của tôi
                    </Link>
                    {isAdmin && (
                        <Link
                            href="/admin"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium text-blue-600"
                        >
                            {}
                            <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                 strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            Admin Mode
                        </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                            onClick={async () => {
                                setOpen(false);
                                await signOut();
                                router.push('/')
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                 strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                            Đăng xuất
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const desktopSearchRef = useRef<HTMLInputElement>(null)
    const mobileSearchRef = useRef<HTMLInputElement>(null)

    const isActive = (href: string) => {
        if (href.includes('?')) return false
        return href === '/' ? pathname === '/' : pathname.startsWith(href)
    }

    const runSearch = (value: string) => {
        const q = value.trim()
        setMenuOpen(false)
        router.push(q ? `/san-pham?search=${encodeURIComponent(q)}` : '/san-pham')
    }

    return (
        <header className="sticky top-0 z-50 shadow-sm">
            {/* Utility bar */}
            <div className="hidden md:flex items-center justify-between bg-[#0f2444] text-blue-200 text-xs px-4 sm:px-6 lg:px-8 py-1.5">
                <div className="flex items-center gap-3">
                    <span>Phân phối giá sỉ tận gốc</span>
                    <span className="opacity-30">|</span>
                    <span>Xuất hoá đơn VAT đầy đủ</span>
                    <span className="opacity-30">|</span>
                    <span>Giao hàng toàn quốc</span>
                </div>
                <div className="flex items-center gap-4">
                    {utilityLinks.map((link) => (
                        <Link key={link.label} href={link.href} className="hover:text-white transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main header row */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4 sm:gap-6">
                    <Link href="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity">
                        <img src="/logo.png" alt="Tân Vy Phát"
                             className="h-11 w-11 rounded-xl object-cover bg-white border border-gray-100"/>
                        <div className="hidden sm:flex flex-col leading-tight">
                            <span className="text-lg font-extrabold text-[#1a3a6b]">{store.name}</span>
                            <span className="text-[11px] text-gray-500">Giấy in · VPP · Hàng Thái Lan giá sỉ</span>
                        </div>
                    </Link>

                    {/* Search - desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl">
                        <div className="flex w-full">
                            <input
                                ref={desktopSearchRef}
                                type="text"
                                placeholder="Tìm giấy A4, bìa Thái, nước giặt Thái Lan…"
                                onKeyDown={(e) => e.key === 'Enter' && runSearch(desktopSearchRef.current?.value ?? '')}
                                className="flex-1 min-w-0 h-11 border border-[#1a56db] border-r-0 rounded-l-lg px-4 text-sm text-gray-900 outline-none"
                            />
                            <button
                                onClick={() => runSearch(desktopSearchRef.current?.value ?? '')}
                                aria-label="Tìm kiếm"
                                className="w-12 h-11 bg-[#1a56db] hover:bg-[#1e40af] rounded-r-lg flex items-center justify-center transition-colors shrink-0"
                            >
                                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
                                    <circle cx="11" cy="11" r="7"/>
                                    <path d="M21 21l-4.5-4.5"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-5 ml-auto shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="#1a56db" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <div className="text-[11px] text-gray-500">Hotline báo giá sỉ</div>
                                <a href={`tel:${store.phone}`} className="text-base font-bold text-[#1a56db] hover:text-[#1e40af] transition-colors">
                                    {store.phoneDisplay}
                                </a>
                            </div>
                        </div>
                        <UserMenu/>
                        <CartBadge/>
                    </div>

                    {/* Mobile: user + cart + phone + hamburger */}
                    <div className="flex md:hidden items-center gap-1 ml-auto">
                        <UserMenu/>
                        <CartBadge/>
                        <a
                            href={`tel:${store.phone}`}
                            className="text-[#1a56db] p-2"
                            aria-label="Gọi điện"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                        </a>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-gray-700 p-2"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Search - mobile */}
                <div className="md:hidden px-4 pb-3 flex">
                    <input
                        ref={mobileSearchRef}
                        type="text"
                        placeholder="Tìm giấy A4, bìa Thái, nước giặt Thái Lan…"
                        onKeyDown={(e) => e.key === 'Enter' && runSearch(mobileSearchRef.current?.value ?? '')}
                        className="flex-1 min-w-0 h-10 border border-[#1a56db] border-r-0 rounded-l-lg px-3 text-sm text-gray-900 outline-none"
                    />
                    <button
                        onClick={() => runSearch(mobileSearchRef.current?.value ?? '')}
                        aria-label="Tìm kiếm"
                        className="w-11 h-10 bg-[#1a56db] rounded-r-lg flex items-center justify-center shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
                            <circle cx="11" cy="11" r="7"/>
                            <path d="M21 21l-4.5-4.5"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Nav links row - desktop */}
            <nav className="hidden md:block bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                                isActive(link.href)
                                    ? 'text-[#1a56db] border-[#1a56db]'
                                    : 'text-gray-600 border-transparent hover:text-[#1a56db]'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
                    <div className="px-4 pt-3 pb-4 flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive(link.href)
                                        ? 'bg-blue-50 text-[#1a56db]'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="border-t border-gray-100 my-2"/>
                        {utilityLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="px-3 py-2 text-sm text-gray-500 hover:text-[#1a56db] transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a
                            href={`tel:${store.phone}`}
                            className="mt-2 flex items-center justify-center gap-2 bg-[#1a56db] hover:bg-[#1e40af] text-white font-semibold px-4 py-2.5 rounded-full text-sm transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            Hotline: {store.phoneDisplay}
                        </a>
                    </div>
                </div>
            )}
        </header>
    )
}
