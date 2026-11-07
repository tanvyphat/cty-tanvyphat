import type { Metadata } from 'next'
import { store } from '@/src/data/store'

export const metadata: Metadata = { title: 'Điều khoản sử dụng | Tân Vy Phát' }

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 space-y-5 text-gray-700 leading-relaxed">
        <h1 className="text-3xl font-bold text-[#1a3a6b]">Điều khoản sử dụng</h1>
        <p>Website {store.name} cung cấp thông tin, hình ảnh và mô tả sản phẩm nhằm mục đích tham khảo và liên hệ báo giá sỉ. Website không nhận đặt hàng hoặc thanh toán trực tuyến.</p>
        <h2 className="font-semibold text-lg">Báo giá và giao dịch</h2>
        <p>Giá, quy cách, số lượng, chứng từ và điều kiện mua bán được xác nhận trực tiếp với nhân viên. Thông tin trên website có thể thay đổi và không thay thế báo giá chính thức.</p>
        <h2 className="font-semibold text-lg">Khu vực giao hàng</h2>
        <p>Công ty chủ yếu giao hàng nội thành TP.HCM. Việc giao ngoài nội thành hoặc ngoài TP.HCM chỉ thực hiện theo thỏa thuận; khách hàng chịu toàn bộ phí vận chuyển phát sinh.</p>
        <h2 className="font-semibold text-lg">Thông tin liên hệ</h2>
        <p>Liên hệ hotline <a href={`tel:${store.phone}`} className="text-blue-600 hover:underline">{store.phoneDisplay}</a>, Zalo hoặc Facebook để hỏi giá và giao dịch trực tiếp với công ty.</p>
      </article>
    </main>
  )
}
