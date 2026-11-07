'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/browser'
import { useAuth } from '@/src/contexts/AuthContext'
const supabase = createSupabaseBrowserClient()
export default function ProfileClient() {
 const { user, profile, authLoading, signOut, refreshProfile } = useAuth()
 const router = useRouter()
 const [fullName, setFullName] = useState('')
 const [phone, setPhone] = useState('')
 const [saving, setSaving] = useState(false)
 const [message, setMessage] = useState('')
 const [error, setError] = useState('')
 useEffect(() => { if (!authLoading && !user) router.replace('/dang-nhap') }, [authLoading, user, router])
 useEffect(() => {
   setFullName(profile?.full_name ?? String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? ''))
   setPhone(profile?.phone ?? '')
 }, [profile, user])
 async function save(e: React.FormEvent) {
   e.preventDefault()
   if (!user) return
   setSaving(true); setError(''); setMessage('')
   const { error: saveError } = await supabase.from('profiles').upsert(
     { id: user.id, full_name: fullName.trim() || null, phone: phone.trim() || null },
     { onConflict: 'id' }
   )
   if (saveError) setError('Không lưu được: ' + saveError.message)
   else { await refreshProfile(); setMessage('Đã cập nhật hồ sơ.') }
   setSaving(false)
 }
 async function logout() { await signOut(); router.replace('/'); router.refresh() }
 if (authLoading || !user) return <main className="min-h-[70vh] flex items-center justify-center text-gray-500">Đang tải tài khoản...</main>
 const provider = user.app_metadata?.provider as string | undefined
 return <main className="min-h-[70vh] bg-gray-50 py-10 px-4">
   <section className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
     <div className="flex justify-between items-start gap-4">
       <div><h1 className="text-2xl font-bold text-[#1a3a6b]">Tài khoản của tôi</h1>
       <p className="text-sm text-gray-500 mt-1">{user.email}</p></div>
       <button type="button" onClick={logout} className="text-red-600 text-sm hover:underline">Đăng xuất</button>
     </div>
     <p className="rounded-lg bg-blue-50 text-gray-700 px-4 py-3 text-sm">Website chỉ giới thiệu sản phẩm và nhận yêu cầu báo giá qua điện thoại, Zalo hoặc Facebook; không đặt hàng hay thanh toán trực tuyến.</p>
     <form onSubmit={save} className="space-y-4">
       <div><label htmlFor="full-name" className="block text-sm font-medium mb-1">Họ và tên</label><input id="full-name" maxLength={120} value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border rounded-xl px-4 py-2.5" /></div>
       <div><label htmlFor="phone" className="block text-sm font-medium mb-1">Số điện thoại</label><input id="phone" type="tel" maxLength={20} value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded-xl px-4 py-2.5" /></div>
       {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
       {message && <p role="status" className="text-sm text-green-700">{message}</p>}
       <button type="submit" disabled={saving} className="bg-[#1a56db] text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-60">{saving ? 'Đang lưu...' : 'Lưu thông tin'}</button>
     </form>
     {(!provider || provider === 'email') && <Link href="/tai-khoan/doi-mat-khau" className="text-blue-600 text-sm hover:underline">Đổi mật khẩu</Link>}
   </section>
 </main>
}
