import type { Metadata } from 'next'
import TraCuuClient from './TraCuuClient'

export const metadata: Metadata = {
  title: 'Tra cứu đơn hàng',
  description: 'Tra cứu trạng thái đơn hàng theo số điện thoại',
}

export default function TraCuuPage() {
  return <TraCuuClient />
}
