'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
// Lưu ý: Sếp sửa lại import này nếu IDE báo lỗi nhé (Tuỳ thuộc thư mục app của sếp nằm đâu)
import LogoutButton from '@/app/admin/don-hang/LogoutButton'

const NAV_LINKS = [
    { href: '/admin/don-hang', label: '📦 Đơn hàng' },
    { href: '/admin/san-pham', label: '🛍️ Sản phẩm' },
    { href: '/admin/tin-tuc', label: '📰 Tin tức' },
    { href: '/admin/quan-tri-vien', label: '👥 Quản trị viên' },
]

export default function AdminNavbar() {
    const pathname = usePathname()

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            {/* Cố định kích thước max-w-6xl cho mọi trang để Navbar không bị thụt ra thụt vào */}
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname?.startsWith(link.href)
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-semibold transition-colors border-b-2 py-1 ${
                                    isActive
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </div>

                <div className="flex items-center gap-4 pl-4 border-l border-gray-200 cursor-pointer">
                    <LogoutButton />
                </div>
            </div>
        </header>
    )
}