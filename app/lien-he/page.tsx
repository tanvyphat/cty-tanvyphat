import { store } from '../../src/data/store'
import ContactForm from './ContactForm'

const contactDetails = [
  {
    icon: (
      <svg
        className="w-5 h-5 text-amber-500"
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
    ),
    label: 'Hotline',
    value: store.phoneDisplay,
    href: `tel:${store.phone}`,
    isLink: true,
  },
  {
    icon: (
      <svg
        className="w-5 h-5 text-amber-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    label: 'Địa chỉ',
    value: store.address,
    href: store.mapsUrl,
    isLink: true,
  },
  {
    icon: (
      <svg
        className="w-5 h-5 text-amber-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    label: 'Giờ làm việc',
    value: 'Thứ 2 – Thứ 7: 7:30 – 17:30\nChủ nhật: Nghỉ',
    href: null,
    isLink: false,
  },
  {
    icon: (
      <svg
        className="w-5 h-5 text-amber-500 fill-current"
        viewBox="0 0 24 24"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    label: 'Facebook',
    value: 'CT Tân Vy Phát',
    href: store.facebook,
    isLink: true,
  },
]

export default function LienHePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3a6b] to-[#1a56db] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Liên hệ</h1>
          <p className="text-blue-200 text-base max-w-xl mx-auto">
            Liên hệ để được tư vấn và báo giá sỉ nhanh nhất
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-[#1a3a6b] mb-2">Gửi tin nhắn</h2>
            <p className="text-gray-500 text-sm mb-6">
              Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại sớm nhất
            </p>
            <ContactForm />
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-[#1a3a6b] mb-5">Thông tin liên hệ</h2>
              <div className="flex flex-col gap-5">
                {contactDetails.map((detail) => (
                  <div key={detail.label} className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">{detail.icon}</div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                        {detail.label}
                      </p>
                      {detail.isLink && detail.href ? (
                        <a
                          href={detail.href}
                          target={detail.href.startsWith('http') ? '_blank' : undefined}
                          rel={detail.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-[#1a56db] font-semibold text-sm hover:text-[#1e40af] transition-colors"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <p className="text-gray-700 text-sm whitespace-pre-line">{detail.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="bg-gradient-to-br from-[#1a3a6b] to-[#1a56db] rounded-2xl p-6 text-white">
              <h3 className="font-bold text-base mb-4">Liên hệ nhanh</h3>
              <div className="flex flex-col gap-3">
                <a
                  href={`tel:${store.phone}`}
                  className="flex items-center gap-3 bg-red-500 hover:bg-red-400 text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Gọi ngay: {store.phoneDisplay}
                </a>
                <a
                  href={store.zalo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#0068FF] hover:bg-[#0054cc] text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm"
                >
                  Nhắn Zalo
                </a>
                <a
                  href={store.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#1877F2] hover:bg-[#0c63d4] text-white font-semibold px-4 py-3 rounded-xl transition-colors text-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Nhắn tin Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#1a3a6b]">Bản đồ – Đông Hưng Thuận, Hồ Chí Minh</h2>
              <p className="text-gray-500 text-sm mt-1">{store.address}</p>
            </div>
            <div className="flex gap-2 shrink-0">
<a
                href={store.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#1a56db] hover:bg-[#1e40af] text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Xem chỉ đường
              </a>
            </div>
          </div>
          <iframe
            src={store.mapEmbed}
            width="100%"
            height="380"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Bản đồ CT Tân Vy Phát"
          />
        </div>
      </div>
    </div>
  )
}
