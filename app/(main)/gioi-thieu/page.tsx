import { store } from '../../../src/data/store'

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
  { value: 'Q.12 TPHCM', label: 'Địa chỉ kho', sub: '1/6 Đường Tân Thới Nhất 22' },
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* Article content — takes 2/3 */}
            <div className="lg:col-span-2">
              <h2 className="text-xl md:text-2xl font-bold text-[#1a3a6b] mb-5 leading-snug">
                GIẤY IN VĂN PHÒNG – LỰA CHỌN TÂN VY PHÁT ĐỂ TỐI ƯU HIỆU QUẢ LÀM VIỆC
              </h2>
              <div className="flex flex-col gap-3 text-gray-600 leading-relaxed text-sm">
                <p>
                  <em>Trong môi trường doanh nghiệp hiện đại, giấy in không chỉ là vật tư tiêu hao mà còn ảnh hưởng trực tiếp đến hiệu suất vận hành, hình ảnh chuyên nghiệp và chi phí dài hạn.</em>
                </p>
                <p>
                  <em>Với hơn 17 năm kinh nghiệm trong ngành, chúng tôi nhận thấy một thực tế: nhiều doanh nghiệp vẫn lựa chọn giấy dựa trên giá, thay vì dựa trên hiệu quả sử dụng tổng thể.</em>
                </p>

                <p className="mt-1">
                  <strong>Chất lượng giấy – yếu tố cốt lõi nhưng thường bị xem nhẹ.</strong>
                </p>
                <p>
                  Các thương hiệu giấy in trên thị trường hiện nay đều có những tiêu chuẩn sản xuất riêng. Tuy nhiên, sự khác biệt nằm ở độ ổn định chất lượng: từ độ trắng, độ mịn bề mặt đến khả năng tương thích với thiết bị in. Giấy đạt chuẩn giúp bản in sắc nét, hạn chế bụi giấy và giảm thiểu tình trạng kẹt giấy.
                </p>

                <p className="mt-1">
                  <strong>Tối ưu chi phí không đồng nghĩa với chọn giá thấp nhất.</strong>
                </p>
                <p>Một loại giấy phù hợp sẽ giúp:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Giảm hao mực in</li>
                  <li>Hạn chế hư hao máy móc</li>
                  <li>Tăng tuổi thọ thiết bị</li>
                  <li>Đảm bảo tiến độ công việc</li>
                </ul>
                <p>
                  <em>Chi phí thực tế cần được nhìn trên tổng thể vận hành, không chỉ là giá mua ban đầu.</em>
                </p>

                <p className="mt-1">
                  <strong>Tính ổn định – tiêu chí quan trọng khi lựa chọn.</strong>
                </p>
                <p>
                  <em>Đối với doanh nghiệp, việc sử dụng giấy có chất lượng đồng đều giữa các lô hàng là yếu tố then chốt để đảm bảo công việc không bị gián đoạn. Đây cũng là lý do nên ưu tiên các dòng giấy có nguồn gốc rõ ràng và được phân phối bởi đơn vị uy tín.</em>
                </p>

                <p className="mt-1">
                  <strong>Giải pháp phù hợp cho từng nhu cầu.</strong>
                </p>
                <p>
                  Không có một loại giấy nào "tốt nhất cho tất cả", chỉ có loại phù hợp nhất cho từng mục đích: in nội bộ, in hợp đồng, in báo cáo hay tài liệu trình ký.
                </p>
                <p>
                  <em>Với nền tảng kinh nghiệm hơn 17 năm, chúng tôi tập trung vào việc tư vấn đúng nhu cầu, giúp doanh nghiệp tối ưu chi phí và nâng cao hiệu quả sử dụng.</em>
                </p>
              </div>
            </div>

            {/* Info card — takes 1/3 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-7 text-center border border-blue-100 lg:sticky lg:top-24">
              <div className="flex justify-center mb-4">
                <img
                  src="/logo.png"
                  alt="Logo Tân Vy Phát"
                  className="w-20 h-20 rounded-full object-cover bg-white shadow-sm border-2 border-blue-100"
                />
              </div>
              <h3 className="text-base font-bold text-[#1a3a6b] mb-1">CÔNG TY TÂN VY PHÁT</h3>
              <p className="text-gray-500 text-xs mb-4">{store.tagline}</p>
              <div className="border-t border-blue-200 pt-4 text-xs text-gray-500 space-y-2 text-left">
                <p><span className="font-semibold text-gray-600">Giờ làm việc:</span> 7:30 – 17:30 (T2 – T7) · CN nghỉ</p>
                <p><span className="font-semibold text-gray-600">Địa chỉ:</span> 1/6 Đường Tân Thới Nhất 22, Khu phố 8, P. Đông Hưng Thuận, TP.HCM</p>
                <p><span className="font-semibold text-gray-600">Hotline/Zalo:</span> 0906&nbsp;892&nbsp;828 – 090&nbsp;360&nbsp;87&nbsp;68</p>
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
