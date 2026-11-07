import type { Metadata } from 'next'
import { store } from '@/src/data/store'

export const metadata: Metadata = { title: 'Chính sách bảo mật | Tân Vy Phát' }

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 space-y-5 text-gray-700 leading-relaxed">
        <h1 className="text-3xl font-bold text-[#1a3a6b]">Chính sách bảo mật</h1>
        <p>Website {store.name} là trang giới thiệu sản phẩm và thông tin doanh nghiệp. Website không có giỏ hàng hoặc thanh toán trực tuyến; khách hàng có thể đăng ký tài khoản để quản lý thông tin liên hệ.</p>
        <h2 className="font-semibold text-lg">Thông tin khách hàng</h2>
        <p>Khách hàng có thể đăng ký bằng email/mật khẩu hoặc đăng nhập Google. Tài khoản lưu email, họ tên và số điện thoại nếu người dùng cung cấp. Ngoài ra khách có thể chủ động liên hệ qua điện thoại, Zalo, Facebook hoặc biểu mẫu liên hệ để được tư vấn, báo giá.</p>
        <h2 className="font-semibold text-lg">Bảo vệ dữ liệu</h2>
        <p>Thông tin liên hệ chỉ được sử dụng cho tư vấn, hỗ trợ và các nghĩa vụ hợp pháp liên quan. Website không tự tạo đơn hàng hoặc giao dịch thanh toán trực tuyến.</p>
        <h2 className="font-semibold text-lg">Yêu cầu về dữ liệu cá nhân</h2>
        <p>Để yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân đã cung cấp, vui lòng liên hệ <a className="text-blue-600 hover:underline" href={`mailto:${store.email}`}>{store.email}</a> hoặc hotline {store.phoneDisplay}.</p>
      </article>
    </main>
  )
}
