'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/browser'
import { useAuth } from '@/src/contexts/AuthContext'

const supabase = createSupabaseBrowserClient()

export default function DoiMatKhauPage() {
  const { user, authLoading } = useAuth()
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/dang-nhap')
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Đang tải...</p>
      </div>
    )
  }

  if (!user) return null

  const provider = user.app_metadata?.provider as string | undefined

  if (provider && provider !== 'email') {
    const providerLabel = provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : provider

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center space-y-3">
            <div className="text-4xl">🔒</div>
            <h1 className="font-bold text-gray-900">Không thể đổi mật khẩu</h1>
            <p className="text-sm text-gray-500">
              Tài khoản của bạn đăng nhập qua <span className="font-medium text-gray-700">{providerLabel}</span>.
              Mật khẩu được quản lý bởi {providerLabel}, bạn không thể đổi mật khẩu tại đây.
            </p>
            <Link
              href="/tai-khoan"
              className="inline-block mt-2 text-sm text-blue-600 hover:underline"
            >
              Quay lại tài khoản
            </Link>
          </div>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirm) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải ít nhất 6 ký tự.')
      return
    }

    setLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPassword,
      })
      if (signInError) {
        setError('Mật khẩu hiện tại không đúng.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) {
        setError('Có lỗi xảy ra. Vui lòng thử lại.')
      } else {
        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirm('')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/tai-khoan" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Đổi mật khẩu</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {success ? (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">✅</div>
              <p className="font-semibold text-gray-900">Đổi mật khẩu thành công!</p>
              <p className="text-sm text-gray-500">Mật khẩu mới của bạn đã được cập nhật.</p>
              <Link
                href="/tai-khoan"
                className="inline-block mt-2 text-sm text-blue-600 hover:underline"
              >
                Quay lại tài khoản
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a6b] hover:bg-[#1e4db7] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
