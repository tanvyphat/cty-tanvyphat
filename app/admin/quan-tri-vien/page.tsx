'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import AdminNavbar from '@/app/admin/AdminNavbar' // Đảm bảo import đúng đường dẫn Navbar chung của sếp

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

// Cấu hình Pop-up
interface ModalConfig {
  isOpen: boolean
  title: string
  message: string
  type: 'danger' | 'warning' | 'info'
  isAlert?: boolean
  onConfirm?: () => void
}

export default function QuanTriVienPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')

  // State quản lý Pop-up (Modal)
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  // Các hàm hỗ trợ hiển thị Pop-up
  const showConfirm = (title: string, message: string, type: 'danger' | 'warning' | 'info', onConfirm: () => void) => {
    setModal({ isOpen: true, title, message, type, isAlert: false, onConfirm })
  }

  const showAlert = (title: string, message: string, type: 'danger' | 'warning' | 'info') => {
    setModal({ isOpen: true, title, message, type, isAlert: true })
  }

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }))

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

  // Hàm Cấp/Hạ cấp Admin với Pop-up
  function handleToggleAdmin(user: AdminUser) {
    const newRole = user.role === 'admin' ? null : 'admin'
    const isPromoting = newRole === 'admin'

    const title = isPromoting ? 'Cấp quyền Quản trị viên' : 'Hạ cấp Quản trị viên'
    const message = isPromoting
        ? `Bạn có chắc chắn muốn cấp quyền Quản trị viên cho tài khoản ${user.email}?\n\nNgười này sẽ có toàn quyền truy cập hệ thống.`
        : `Bạn có chắc chắn muốn hạ cấp ${user.email} xuống thành Người dùng thường?`

    showConfirm(title, message, isPromoting ? 'info' : 'warning', async () => {
      closeModal()
      setToggling(user.id)
      try {
        const res = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, role: newRole }),
        })
        const data = await res.json()
        if (!res.ok) {
          showAlert('Lỗi cập nhật', data.error || 'Có lỗi xảy ra', 'danger')
        } else {
          await fetchUsers()
        }
      } catch {
        showAlert('Lỗi kết nối', 'Không thể kết nối đến máy chủ.', 'danger')
      } finally {
        setToggling(null)
      }
    })
  }

  // Hàm Xoá vĩnh viễn người dùng với Pop-up
  function handleDeleteUser(user: AdminUser) {
    showConfirm(
        'Xoá vĩnh viễn người dùng',
        `CẢNH BÁO: Bạn sắp xoá vĩnh viễn ${user.email} khỏi hệ thống.\n\nHành động này KHÔNG THỂ HOÀN TÁC và sẽ xoá toàn bộ dữ liệu liên quan!`,
        'danger',
        async () => {
          closeModal()
          setDeleting(user.id)
          try {
            const res = await fetch('/api/admin/users', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: user.id }),
            })

            const data = await res.json()
            if (!res.ok) {
              showAlert('Lỗi khi xoá', data.error || 'Đã xảy ra lỗi khi xoá người dùng.', 'danger')
            } else {
              await fetchUsers()
            }
          } catch {
            showAlert('Lỗi kết nối', 'Không thể kết nối đến máy chủ.', 'danger')
          } finally {
            setDeleting(null)
          }
        }
    )
  }

  const admins = users.filter(u => u.role === 'admin')
  const others = users.filter(u => u.role !== 'admin')

  return (
      <div className="min-h-screen bg-gray-100 relative">
        <AdminNavbar />

        {/* Modal / Pop-up Overlay */}
        {modal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className={`p-5 border-b ${
                    modal.type === 'danger' ? 'bg-red-50/50 border-red-100' :
                        modal.type === 'warning' ? 'bg-orange-50/50 border-orange-100' :
                            'bg-blue-50/50 border-blue-100'
                }`}>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${
                      modal.type === 'danger' ? 'text-red-700' :
                          modal.type === 'warning' ? 'text-orange-700' :
                              'text-blue-700'
                  }`}>
                    {modal.type === 'danger' && '⚠️ '}
                    {modal.type === 'warning' && '⚡ '}
                    {modal.type === 'info' && '🛡️ '}
                    {modal.title}
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{modal.message}</p>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                  {!modal.isAlert && (
                      <button
                          onClick={closeModal}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
                      >
                        Huỷ
                      </button>
                  )}
                  <button
                      onClick={modal.isAlert ? closeModal : modal.onConfirm}
                      className={`px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all shadow-sm ${
                          modal.type === 'danger' ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-200' :
                              modal.type === 'warning' ? 'bg-orange-600 hover:bg-orange-700 hover:shadow-orange-200' :
                                  'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
                      } hover:shadow-lg`}
                  >
                    {modal.isAlert ? 'Đã hiểu' : 'Xác nhận'}
                  </button>
                </div>
              </div>
            </div>
        )}

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}

          {loading ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
          ) : (
              <>
                {/* Danh sách Admin */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
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
                                isProcessing={toggling === user.id || deleting === user.id}
                                onToggle={() => handleToggleAdmin(user)}
                                onDelete={() => handleDeleteUser(user)}
                            />
                        ))}
                      </ul>
                  )}
                </div>

                {/* Danh sách Người dùng thường */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-semibold text-gray-800 text-sm">Người dùng thường ({others.length})</h2>
                  </div>
                  {others.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-8">Chưa có người dùng nào</p>
                  ) : (
                      <ul className="divide-y divide-gray-50">
                        {others.map(user => (
                            <UserRow
                                key={user.id}
                                user={user}
                                isProcessing={toggling === user.id || deleting === user.id}
                                onToggle={() => handleToggleAdmin(user)}
                                onDelete={() => handleDeleteUser(user)}
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

function UserRow({
                   user,
                   isProcessing,
                   onToggle,
                   onDelete
                 }: {
  user: AdminUser
  isProcessing: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  const isAdmin = user.role === 'admin'
  const displayName = user.full_name ?? user.email
  const initials = displayName.charAt(0).toUpperCase()

  return (
      <li className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
        {user.avatar_url ? (
            <img src={user.avatar_url} alt={displayName} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-100" />
        ) : (
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isAdmin ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {initials}
            </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900 truncate">{user.email}</span>
            {user.full_name && (
                <span className="text-xs text-gray-500">({user.full_name})</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              {PROVIDER_LABEL[user.provider] ?? user.provider}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">
              Gia nhập {new Date(user.created_at).toLocaleDateString('vi-VN')}
            </span>
            {user.last_sign_in_at && (
                <>
                  <span className="text-gray-300 hidden sm:inline">·</span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    Đăng nhập {new Date(user.last_sign_in_at).toLocaleDateString('vi-VN')}
                  </span>
                </>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {isAdmin ? (
              <button
                  onClick={onToggle}
                  disabled={isProcessing}
                  className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:opacity-50"
              >
                {isProcessing ? 'Đang xử lý...' : 'Hạ cấp'}
              </button>
          ) : (
              <>
                <button
                    onClick={onToggle}
                    disabled={isProcessing}
                    className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                >
                  {isProcessing ? '...' : 'Cấp admin'}
                </button>
                <button
                    onClick={onDelete}
                    disabled={isProcessing}
                    className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {isProcessing ? '...' : 'Xoá user'}
                </button>
              </>
          )}
        </div>
      </li>
  )
}