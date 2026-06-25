'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Quên mật khẩu</h1>
          <p className="text-gray-500 text-sm mt-1">CT Tân Vy Phát</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
            </p>
            <Link href="/" className="text-blue-600 text-sm hover:underline">
              Về trang chủ
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
            </button>
            <div className="text-center">
              <Link href="/" className="text-gray-500 text-sm hover:underline">
                Về trang chủ
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
