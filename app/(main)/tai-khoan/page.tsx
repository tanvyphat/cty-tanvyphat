import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = {
  title: 'Tài khoản',
  description: 'Quản lý tài khoản và thông tin giao hàng',
}

export default function TaiKhoanPage() {
  return <ProfileClient />
}
