'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import AdminNavbar from '@/app/admin/AdminNavbar' // Import Navbar chung

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  provider: string
  role: string | null
  created_at: string
  last_sign_in_at: string | null
}

const PROVIDER_LABEL: Record<string, string> = {
  email: '✉️ Email',
  google: '🔵 Google',
  facebook: '🔷 Facebook',
}

export default function QuanTriVienPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setUsers(data.users)
    } catch {
      setError('Không thể tải danh sách')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function toggleAdmin(user: AdminUser) {
    const newRole = user.role === 'admin' ? null : 'admin'
    const confirm = window.confirm(
        newRole === 'admin'
            ? `Cấp quyền admin cho ${user.email}?`
            : `Xoá quyền admin của ${user.email}?`
    )
    if (!confirm) return

    setToggling(user.id)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error)
      } else {
        await fetchUsers()
      }
    } finally {
      setToggling(null)
    }
  }

  const admins = users.filter(u => u.role === 'admin')
  const others = users.filter(u => u.role !== 'admin')

  return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}

          {loading ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">Đang tải...</div>
          ) : (
              <>
                {/* Danh sách admin */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800 text-sm">Quản trị viên ({admins.length})</h2>
                  </div>
                  {admins.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-8">Chưa có quản trị viên</p>
                  ) : (
                      <ul className="divide-y divide-gray-50">
                        {admins.map(user => (
                            <UserRow
                                key={user.id}
                                user={user}
                                toggling={toggling === user.id}
                                onToggle={() => toggleAdmin(user)}
                            />
                        ))}
                      </ul>
                  )}
                </div>

                {/* Danh sách user thường */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800 text-sm">Người dùng ({others.length})</h2>
                  </div>
                  {others.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-8">Chưa có người dùng nào</p>
                  ) : (
                      <ul className="divide-y divide-gray-50">
                        {others.map(user => (
                            <UserRow
                                key={user.id}
                                user={user}
                                toggling={toggling === user.id}
                                onToggle={() => toggleAdmin(user)}
                            />
                        ))}
                      </ul>
                  )}
                </div>
              </>
          )}
        </div>
      </div>
  )
}

function UserRow({ user, toggling, onToggle }: {
  user: AdminUser
  toggling: boolean
  onToggle: () => void
}) {
  const isAdmin = user.role === 'admin'
  const displayName = user.full_name ?? user.email
  const initials = displayName.charAt(0).toUpperCase()
  const PROVIDER_LABEL: Record<string, string> = {
    email: '✉️',
    google: '🔵',
    facebook: '🔷',
  }

  return (
      <li className="flex items-center gap-3 px-5 py-3.5">
        {user.avatar_url ? (
            <img src={user.avatar_url} alt={displayName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        ) : (
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isAdmin ? 'bg-[#1a3a6b] text-white' : 'bg-gray-200 text-gray-600'}`}>
              {initials}
            </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900 truncate">{user.email}</span>
            {user.full_name && (
                <span className="text-xs text-gray-400">({user.full_name})</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">
            {PROVIDER_LABEL[user.provider] ?? user.provider}
          </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">
            Tham gia {new Date(user.created_at).toLocaleDateString('vi-VN')}
          </span>
            {user.last_sign_in_at && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                Đăng nhập {new Date(user.last_sign_in_at).toLocaleDateString('vi-VN')}
              </span>
                </>
            )}
          </div>
        </div>

        <button
            onClick={onToggle}
            disabled={toggling}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                isAdmin
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
        >
          {toggling ? '...' : isAdmin ? 'Xoá admin' : 'Cấp admin'}
        </button>
      </li>
  )
}