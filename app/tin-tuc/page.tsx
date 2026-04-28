import { store } from '../../src/data/store'

type NewsItem = {
  id: number
  title: string
  excerpt: string
  tag: string
  tagColor: string
  date: string
  fbUrl?: string
  icon: string
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: 'Bìa Thái Vàng Chanh A4 – Hàng về rồi!',
    excerpt:
      'Bìa Thái Vàng Chanh A4 vừa về kho! Hàng đẹp – dày – chuẩn màu, giá sỉ cực tốt. Phù hợp đóng hồ sơ, tài liệu văn phòng. Anh/chị cần lấy sỉ liên hệ ngay để được báo giá tốt nhất nhé!',
    tag: 'Sản phẩm',
    tagColor: 'bg-blue-100 text-blue-700',
    date: '2024-07-15',
    fbUrl: store.facebook,
    icon: '🗂️',
  },
  {
    id: 2,
    title: 'Giấy Nga DL 80 đã về hàng',
    excerpt:
      'Giấy Nga DL 80 đã về kho! Giấy nhập khẩu chất lượng cao, độ trắng sáng, in đẹp. Định lượng 80g/m². Giá sỉ cạnh tranh – giao hàng toàn quốc. Liên hệ ngay!',
    tag: 'Sản phẩm',
    tagColor: 'bg-blue-100 text-blue-700',
    date: '2024-07-10',
    icon: '📄',
  },
  {
    id: 3,
    title: 'Nhựa Ép Dẻo 80 Mic – Cập nhật giá mới',
    excerpt:
      'Nhựa ép dẻo 80 Mic A4/A3/A5 vừa cập nhật giá mới – hấp dẫn hơn. Hàng chất lượng cao, trong suốt, bền đẹp. Phù hợp văn phòng, tiệm in ấn. Gọi ngay để được báo giá!',
    tag: 'Khuyến mãi',
    tagColor: 'bg-amber-100 text-amber-700',
    date: '2024-07-05',
    icon: '🗃️',
  },
  {
    id: 4,
    title: 'Tuyển nhân viên kinh doanh & kế toán',
    excerpt:
      'CT Tân Vy Phát tuyển dụng Nhân Viên Kinh Doanh và Kế Toán Bán Hàng. Thu nhập hấp dẫn, môi trường làm việc năng động. Liên hệ 090 360 87 68 để ứng tuyển ngay hôm nay!',
    tag: 'Tuyển dụng',
    tagColor: 'bg-green-100 text-green-700',
    date: '2024-06-28',
    icon: '👥',
  },
  {
    id: 5,
    title: 'Giấy nhập khẩu Châu Âu – giá ổn định',
    excerpt:
      'Giấy nhập khẩu Châu Âu định lượng 70-80g tiếp tục giữ giá ổn định. Xăng lên nhưng giá giấy vẫn cạnh tranh! Alo là có giá tốt – chất lượng châu Âu chuẩn mực, chạy máy tốt.',
    tag: 'Sản phẩm',
    tagColor: 'bg-blue-100 text-blue-700',
    date: '2024-06-20',
    icon: '📄',
  },
  {
    id: 6,
    title: 'Thiên Long Group – chiết khấu cao hấp dẫn',
    excerpt:
      'Hiện đang cung cấp sỉ đầy đủ mặt hàng Thiên Long Group với chiết khấu cao hấp dẫn! Bút bi, kẹp bướm, ghim bấm, dập ghim và nhiều dụng cụ văn phòng khác. Đặt đơn sỉ ngay!',
    tag: 'Khuyến mãi',
    tagColor: 'bg-amber-100 text-amber-700',
    date: '2024-06-15',
    fbUrl: store.facebook,
    icon: '✏️',
  },
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function TinTucPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a6b] to-[#1a56db] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Tin tức & Khuyến mãi</h1>
          <p className="text-blue-200 text-base max-w-xl mx-auto">
            Cập nhật sản phẩm mới, giá tốt và thông tin khuyến mãi từ CT Tân Vy Phát
          </p>
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Icon Banner */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-32 flex items-center justify-center">
                <span className="text-6xl">{item.icon}</span>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Tags + Date */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${item.tagColor}`}
                  >
                    {item.tag}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                </div>

                <h2 className="font-bold text-[#1a3a6b] text-base mb-2 leading-snug">
                  {item.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">
                  {item.excerpt}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <a
                    href={`tel:${store.phone}`}
                    className="flex-1 text-center text-xs bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors"
                  >
                    Liên hệ ngay
                  </a>
                  {item.fbUrl && (
                    <a
                      href={item.fbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center text-xs bg-[#1877F2] hover:bg-[#0c63d4] text-white font-semibold py-2 px-3 rounded-lg transition-colors"
                    >
                      Xem trên Facebook
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Follow CTA */}
        <div className="mt-10 bg-gradient-to-r from-[#1a3a6b] to-[#1a56db] rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Theo dõi chúng tôi để cập nhật giá mới nhất!</h2>
          <p className="text-blue-200 text-sm mb-5">
            Like fanpage Facebook để nhận thông báo hàng về, giá tốt và khuyến mãi mỗi ngày
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={store.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#0c63d4] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Theo dõi Facebook
            </a>
            <a
              href={`tel:${store.phone}`}
              className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              📞 {store.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
