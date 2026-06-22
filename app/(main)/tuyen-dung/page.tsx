import { store } from '../../../src/data/store'

const jobs = [
  {
    title: 'Nhân Viên Kinh Doanh',
    type: 'Toàn thời gian',
    location: 'Q.12, TPHCM',
    description:
      'Phụ trách tìm kiếm và chăm sóc khách hàng doanh nghiệp, trường học, đại lý văn phòng phẩm. Xây dựng và mở rộng mạng lưới phân phối giấy in và văn phòng phẩm của công ty.',
    requirements: [
      'Tốt nghiệp THPT trở lên',
      'Có kinh nghiệm bán hàng B2B là lợi thế',
      'Năng động, chịu khó, có khả năng giao tiếp tốt',
      'Có xe máy và điện thoại smartphone',
      'Ưu tiên ứng viên có sẵn mạng lưới khách hàng',
    ],
    benefits: [
      'Lương cứng + hoa hồng doanh số hấp dẫn',
      'Thu nhập từ 8 – 15 triệu/tháng tùy năng lực',
      'Thưởng doanh số theo tháng/quý',
      'Hỗ trợ xăng xe, điện thoại',
      'Môi trường làm việc năng động, cơ hội thăng tiến',
    ],
  },
  {
    title: 'Kế Toán Bán Hàng',
    type: 'Toàn thời gian',
    location: 'Q.12, TPHCM',
    description:
      'Quản lý đơn hàng, xuất hóa đơn, theo dõi công nợ khách hàng. Hỗ trợ bộ phận kinh doanh trong việc xử lý đơn hàng và báo cáo doanh thu hàng ngày.',
    requirements: [
      'Tốt nghiệp trung cấp kế toán trở lên',
      'Thành thạo Excel, phần mềm kế toán (MISA là lợi thế)',
      'Cẩn thận, tỉ mỉ, trung thực',
      'Có kinh nghiệm kế toán bán hàng/kho là lợi thế',
      'Nữ, tuổi 20 – 35',
    ],
    benefits: [
      'Lương từ 7 – 10 triệu/tháng tùy kinh nghiệm',
      'Thưởng lễ, Tết đầy đủ',
      'Môi trường ổn định, thân thiện',
      'Được đào tạo nghiệp vụ nếu chưa có kinh nghiệm',
    ],
  },
]

export default function TuyenDungPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a6b] to-[#1a56db] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Tuyển Dụng & Cộng Tác Viên
          </h1>
          <p className="text-blue-200 text-base max-w-xl mx-auto">
            Gia nhập đội ngũ Tân Vy Phát – cùng phát triển trong ngành giấy in & văn phòng phẩm
          </p>
        </div>
      </div>

      {/* Jobs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-[#1a3a6b] mb-6">Vị trí đang tuyển dụng</h2>
        <div className="flex flex-col gap-6 mb-12">
          {jobs.map((job) => (
            <div
              key={job.title}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Job Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#1a3a6b]">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                        💼 {job.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        📍 {job.location}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${store.phone}`}
                    className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                  >
                    Ứng tuyển ngay
                  </a>
                </div>
              </div>

              {/* Job Details */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-[#1a3a6b] text-sm mb-3">Mô tả công việc</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1a3a6b] text-sm mb-3">Yêu cầu</h4>
                  <ul className="flex flex-col gap-1.5">
                    {job.requirements.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#1a56db] mt-0.5 shrink-0">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1a3a6b] text-sm mb-3">Quyền lợi</h4>
                  <ul className="flex flex-col gap-1.5">
                    {job.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-amber-500 mt-0.5 shrink-0">★</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTV Section */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1a56db] rounded-2xl p-8 text-white mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-3">
                Tuyển Cộng Tác Viên / Nhà Phân Phối Toàn Quốc
              </h2>
              <p className="text-blue-200 leading-relaxed text-sm mb-4">
                Bạn đang kinh doanh văn phòng phẩm, trường học, photo copy? Hãy trở thành đại
                lý/CTV của Tân Vy Phát để hưởng mức giá sỉ tốt nhất và chiết khấu hấp dẫn.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-blue-100">
                {[
                  'Không cần đặt cọc, không yêu cầu doanh số tối thiểu',
                  'Chiết khấu cao theo doanh số, thanh toán linh hoạt',
                  'Hỗ trợ marketing, tư vấn sản phẩm 24/7',
                  'Giao hàng toàn quốc, đóng gói cẩn thận',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="text-amber-400 shrink-0 mt-0.5">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">🤝</div>
              <p className="text-white font-semibold text-lg mb-2">Liên hệ ngay để hợp tác</p>
              <a
                href={`tel:${store.phone}`}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg"
              >
                📞 {store.phoneDisplay}
              </a>
            </div>
          </div>
        </div>

        {/* Apply CTA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <h3 className="text-lg font-bold text-[#1a3a6b] mb-2">Cách ứng tuyển</h3>
          <p className="text-gray-500 text-sm mb-4">
            Liên hệ trực tiếp qua điện thoại, Zalo hoặc Facebook để nộp hồ sơ và phỏng vấn ngay.
          </p>
          <p className="text-base font-semibold text-[#1a3a6b] mb-4">
            Hotline:{' '}
            <a
              href={`tel:${store.phone}`}
              className="text-amber-500 hover:text-amber-600 transition-colors"
            >
              {store.phoneDisplay}
            </a>
          </p>
          <p className="text-gray-400 text-xs">
            Địa chỉ: {store.address}
          </p>
        </div>
      </div>
    </div>
  )
}
