import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'
export const metadata: Metadata = { title: 'Tài khoản', description: 'Quản lý hồ sơ khách hàng' }
export default function AccountPage() { return <ProfileClient /> }
