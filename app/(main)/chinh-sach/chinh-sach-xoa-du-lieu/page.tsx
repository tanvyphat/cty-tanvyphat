import type { Metadata } from 'next'
import { store } from '@/src/data/store'

export const metadata: Metadata = { title: 'Yêu cầu xóa dữ liệu | Tân Vy Phát', robots: { index: false, follow: false } }

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 space-y-5 text-gray-700 leading-relaxed">
        <h1 className="text-2xl font-bold">Yêu cầu xóa dữ liệu cá nhân</h1>
        <p>Website {store.name} giới thiệu sản phẩm và tiếp nhận liên hệ, không còn chức năng tạo tài khoản khách mua hoặc thanh toán trên website.</p>
        <p>Nếu trước đây quý khách cung cấp dữ liệu qua website hoặc các kênh liên hệ, quý khách có thể yêu cầu kiểm tra, chỉnh sửa hoặc xóa dữ liệu khi phù hợp với nghĩa vụ lưu trữ theo pháp luật.</p>
        <p>Gửi yêu cầu tới <a href={`mailto:${store.email}?subject=Yeu%20cau%20xoa%20du%20lieu`} className="text-blue-600">{store.email}</a> hoặc gọi <a href={`tel:${store.phone}`} className="text-blue-600">{store.phoneDisplay}</a>. Công ty sẽ xác minh và phản hồi yêu cầu.</p>
      </article>
    </main>
  )
}
