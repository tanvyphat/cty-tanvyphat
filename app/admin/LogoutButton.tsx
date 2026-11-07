'use client'

import { createSupabaseBrowserClient } from '@/src/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogout() {
    setLoading(true)
    setError('')
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      router.replace('/')
      router.refresh()
    } catch {
      setError('Không thể đăng xuất. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
          onClick={handleLogout}
          disabled={loading}
          className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 transition-all duration-200 rounded-lg hover:bg-red-50 hover:text-red-600 focus:outline-none"
          title="Đăng xuất khỏi hệ thống"
      >
        <span>{loading ? "Đang thoát..." : "Đăng xuất"}</span>
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
      {error && <span role="alert" className="text-xs text-red-600">{error}</span>}
    </>
  )
}