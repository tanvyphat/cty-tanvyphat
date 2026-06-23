'use client'

import { createSupabaseBrowserClient } from '@/src/lib/supabase/browser'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/dang-nhap')
    router.refresh()
  }

  return (
      <button
          onClick={handleLogout}
          className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 transition-all duration-200 rounded-lg hover:bg-red-50 hover:text-red-600 focus:outline-none"
          title="Đăng xuất khỏi hệ thống"
      >
        <span>Đăng xuất</span>
        {/* Icon Mũi tên thoát ra */}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover:translate-x-1"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
  )
}