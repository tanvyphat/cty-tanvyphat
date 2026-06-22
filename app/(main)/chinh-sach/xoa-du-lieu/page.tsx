import type { Metadata } from 'next'
import { store } from '@/src/data/store'

export const metadata: Metadata = {
  title: 'Yêu cầu xoá dữ liệu',
  robots: { index: false, follow: false },
}

export default function XoaDuLieuPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu xoá dữ liệu</h1>
        <p className="text-gray-500 text-sm mb-8">
          CT Tân Vy Phát — Chính sách xoá dữ liệu người dùng
        </p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Dữ liệu chúng tôi lưu trữ</h2>
            <p>
              Khi bạn đăng nhập bằng Facebook, chúng tôi chỉ lưu trữ các thông tin cơ bản:
              tên hiển thị, địa chỉ email, và ảnh đại diện công khai. Ngoài ra, bạn có thể
              tự bổ sung số điện thoại và địa chỉ giao hàng trong phần tài khoản.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Cách yêu cầu xoá dữ liệu</h2>
            <p className="mb-3">
              Để yêu cầu xoá toàn bộ dữ liệu cá nhân của bạn khỏi hệ thống của chúng tôi,
              vui lòng liên hệ theo một trong các cách sau:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">✉️</span>
                <span>
                  Email:{' '}
                  <a href={`mailto:${store.email}`} className="text-blue-600 hover:underline font-medium">
                    {store.email}
                  </a>
                  {' '}— tiêu đề: <em>"Yêu cầu xoá dữ liệu"</em>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">📞</span>
                <span>
                  Điện thoại / Zalo:{' '}
                  <a href={`tel:${store.phone}`} className="text-blue-600 hover:underline font-medium">
                    {store.phoneDisplay}
                  </a>
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Thời gian xử lý</h2>
            <p>
              Chúng tôi sẽ xử lý và xác nhận việc xoá dữ liệu trong vòng <strong>7 ngày làm việc</strong>
              {' '}kể từ khi nhận được yêu cầu hợp lệ.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Lưu ý</h2>
            <p>
              Sau khi xoá tài khoản, lịch sử đơn hàng liên quan đến số điện thoại của bạn vẫn
              được giữ lại để phục vụ mục đích kế toán và bảo hành theo quy định pháp luật,
              nhưng sẽ không còn liên kết với tài khoản đăng nhập.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
          {store.name} — {store.address}
        </div>
      </div>
    </main>
  )
}
