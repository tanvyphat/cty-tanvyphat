'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/browser'
import { useAuth } from '@/src/contexts/AuthContext'
import { PROVINCES, DISTRICTS_BY_PROVINCE, type Province, type District } from '@/src/data/provinces'
import Link from 'next/link'

const supabase = createSupabaseBrowserClient()

export default function ProfileClient() {
  const { user, profile, authLoading, signOut, refreshProfile } = useAuth()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [province, setProvince] = useState<Province | null>(null)
  const [district, setDistrict] = useState<District | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const districts = province ? (DISTRICTS_BY_PROVINCE[province.code] ?? []) : []

  useEffect(() => {
    if (!authLoading && !user) router.replace('/dang-nhap')
  }, [authLoading, user, router])

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setPhone(profile.phone ?? '')
      setAddress(profile.address ?? '')
      const p = PROVINCES.find(pr => pr.name === profile.province) ?? null
      setProvince(p)
      if (p && profile.district) {
        const d = (DISTRICTS_BY_PROVINCE[p.code] ?? []).find(d => d.name === profile.district) ?? null
        setDistrict(d)
      }
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user!.id,
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        province: province?.name ?? null,
        district: district?.name ?? null,
        updated_at: new Date().toISOString(),
      })
      if (error) {
        setError('Không thể lưu, vui lòng thử lại.')
      } else {
        await refreshProfile()
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleProvinceChange(code: string) {
    const p = PROVINCES.find(pr => pr.code === code) ?? null
    setProvince(p)
    setDistrict(null)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Đang tải...</p>
      </div>
    )
  }

  if (!user) return null

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const displayName = profile?.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? ''
  const provider = user.app_metadata?.provider as string | undefined

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#1a3a6b] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{displayName}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            {provider && provider !== 'email' && (
              <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                {provider === 'google' ? '🔵 Google' : provider === 'facebook' ? '🔷 Facebook' : provider}
              </span>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="ml-auto text-xs text-red-500 hover:text-red-600 font-medium flex-shrink-0"
          >
            Đăng xuất
          </button>
        </div>

        {/* Profile form */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Thông tin cá nhân</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0901 234 567"
                inputMode="numeric"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tỉnh / Thành phố</label>
                <select
                  value={province?.code ?? ''}
                  onChange={e => handleProvinceChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Chọn tỉnh/TP</option>
                  {PROVINCES.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quận / Huyện</label>
                <select
                  value={district?.code ?? ''}
                  onChange={e => setDistrict(districts.find(d => d.code === e.target.value) ?? null)}
                  disabled={!province}
                  key={province?.code ?? 'none'}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ chi tiết</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã"
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
            )}

            {saved && (
              <p className="text-green-600 text-sm bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                ✓ Đã lưu thông tin thành công
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#1a3a6b] hover:bg-[#1e4db7] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </form>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          <Link href="/tra-cuu-don-hang" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors rounded-t-2xl">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <span className="text-xl">📦</span>
              Tra cứu đơn hàng
            </div>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/san-pham" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <span className="text-xl">🛒</span>
              Tiếp tục mua sắm
            </div>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors rounded-b-2xl text-left"
          >
            <div className="flex items-center gap-3 text-sm font-medium text-red-500">
              <span className="text-xl">🚪</span>
              Đăng xuất
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
