import { store } from '../../src/data/store'

const strengths = [
  {
    icon: '🏭',
    title: 'Nhập trực tiếp từ nhà sản xuất',
    desc: 'Chúng tôi làm việc trực tiếp với các nhà máy sản xuất giấy trong nước và đối tác nhập khẩu uy tín. Không qua trung gian, đảm bảo nguồn gốc và chất lượng sản phẩm.',
  },
  {
    icon: '💲',
    title: 'Giá không qua trung gian',
    desc: 'Nhờ chuỗi cung ứng tối ưu, chúng tôi cung cấp giá sỉ cạnh tranh nhất thị trường. Chiết khấu hấp dẫn cho đại lý và khách mua số lượng lớn.',
  },
  {
    icon: '🚀',
    title: 'Giao nhanh TPHCM & toàn quốc',
    desc: 'Kho hàng tại Q.12, TPHCM – giao hàng nội thành trong ngày. Hợp tác với các đơn vị vận chuyển uy tín để ship toàn quốc nhanh chóng, an toàn.',
  },
]

const stats = [
  { value: '700+', label: 'Khách hàng', sub: 'tin tưởng hợp tác' },
  { value: 'Toàn quốc', label: 'Phạm vi giao hàng', sub: '63 tỉnh thành' },
  { value: 'Q.12 TPHCM', label: 'Địa chỉ kho', sub: '149/9 Tân Thới Nhất 17' },
  { value: '5+', label: 'Năm kinh nghiệm', sub: 'trong ngành giấy & VPP' },
]

export default function GioiThieuPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a6b] to-[#1a56db] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Về CT Tân Vy Phát</h1>
          <p className="text-blue-200 text-base max-w-xl mx-auto">
            Đơn vị phân phối giấy in & văn phòng phẩm giá sỉ tại Q.12, TPHCM
          </p>
        </div>
      </div>

      {/* Story / Mission */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#1a3a6b] mb-4">Câu chuyện của chúng tôi</h2>
              <div className="flex flex-col gap-4 text-gray-600 leading-relaxed text-sm">
                <p>
                  CT Tân Vy Phát được thành lập với sứ mệnh cung cấp giấy in và văn phòng phẩm
                  chất lượng cao với giá sỉ tốt nhất cho các doanh nghiệp, trường học và tiệm văn
                  phòng phẩm trên cả nước.
                </p>
                <p>
                  Với hơn 5 năm kinh nghiệm trong ngành, chúng tôi đã xây dựng được mạng lưới
                  hơn 700 khách hàng thân thiết khắp các tỉnh thành. Kho hàng rộng rãi tại{' '}
                  <strong>{store.address}</strong> luôn sẵn hàng để phục vụ quý khách.
                </p>
                <p>
                  Chúng tôi không ngừng mở rộng danh mục sản phẩm từ giấy in A4 các nhãn hiệu
                  Double A, Projecta, Supreme đến bìa Thái, giấy decal, nhựa ép laminating và
                  đầy đủ văn phòng phẩm Thiên Long.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-100">
              <div className="text-7xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-[#1a3a6b] mb-2">{store.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{store.tagline}</p>
              <div className="border-t border-blue-200 pt-4 text-xs text-gray-500 space-y-1">
                <p>📍 {store.address}</p>
                <p>📞 {store.phoneDisplay}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section className="py-12 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a3a6b] text-center mb-8">
            Tại sao chọn Tân Vy Phát?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {strengths.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-[#1a3a6b] text-base mb-3">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-12 bg-gradient-to-r from-[#1a3a6b] to-[#1a56db] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-amber-400 mb-1">{stat.value}</div>
                <div className="text-white font-semibold text-sm mb-1">{stat.label}</div>
                <div className="text-blue-200 text-xs">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-xl font-bold text-[#1a3a6b] mb-3">Hãy liên hệ với chúng tôi</h2>
          <p className="text-gray-500 text-sm mb-6">
            Gọi ngay để được tư vấn và báo giá tốt nhất cho đơn hàng của bạn
          </p>
          <a
            href={`tel:${store.phone}`}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {store.phoneDisplay}
          </a>
        </div>
      </section>
    </div>
  )
}
