'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext'
export default function UserMenu() {
 const { user, profile, authLoading, signOut } = useAuth()
 const router = useRouter()
 const [open, setOpen] = useState(false)
 const menuRef = useRef<HTMLDivElement>(null)
 useEffect(() => {
   const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false) }
   document.addEventListener('mousedown', close)
   return () => document.removeEventListener('mousedown', close)
 }, [])
 async function logout() { setOpen(false); await signOut(); router.replace('/'); router.refresh() }
 if (authLoading) return <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" aria-label="Đang tải tài khoản" />
 if (!user) return <div className="flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm">
   <Link href="/dang-nhap" className="text-gray-700 font-medium hover:text-blue-600">Đăng nhập</Link>
   <Link href="/dang-nhap?mode=register" className="hidden sm:inline text-blue-600 font-semibold hover:underline">Đăng ký</Link>
 </div>
 const display = profile?.full_name || String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'Tài khoản')
 return <div className="relative" ref={menuRef}>
   <button type="button" aria-expanded={open} aria-label="Mở menu tài khoản" onClick={() => setOpen(v => !v)} className="flex gap-1.5 items-center text-sm text-gray-700 hover:text-blue-600">
     <span className="rounded-full bg-blue-50 text-blue-700 w-8 h-8 flex items-center justify-center font-bold">{display.slice(0,1).toUpperCase()}</span>
     <span className="hidden lg:block max-w-24 truncate">{display.split(' ').at(-1)}</span>
   </button>
   {open && <div className="absolute z-50 right-0 top-full mt-2 w-56 rounded-xl bg-white border border-gray-100 shadow-xl py-2">
     <p className="px-4 py-2 text-xs text-gray-400 truncate">{user.email}</p>
     <Link href="/tai-khoan" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50">Tài khoản của tôi</Link>
     {user.app_metadata?.role === 'admin' && <Link href="/admin/san-pham" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gray-50">Quản trị website</Link>}
     <button type="button" onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50">Đăng xuất</button>
   </div>}
 </div>
}
