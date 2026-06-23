import Link from 'next/link'
import { getNewsList } from '../../../src/lib/supabase/server'
import { store } from '../../../src/data/store'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function TinTucPage() {
  const newsItems = await getNewsList()

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
        {newsItems.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Chưa có bài tin tức nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((item) => (
              <Link
                key={item.id}
                href={`/tin-tuc/${item.slug}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col group"
              >
                {/* Ảnh bìa */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">📰</div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.tag_color}`}>
                      {item.tag}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(item.published_at)}</span>
                  </div>
                  <h2 className="font-bold text-[#1a3a6b] text-base mb-2 leading-snug group-hover:text-[#1a56db] transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                    {item.excerpt}
                  </p>
                  <span className="mt-4 text-sm text-blue-600 font-medium group-hover:underline">
                    Đọc thêm →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

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
              <svg className="w-5 h-5" style={{ fill: 'white' }} viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              {store.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
