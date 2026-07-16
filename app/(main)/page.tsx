import Link from 'next/link'
import { store } from '../../src/data/store'
import { getProducts, getCategories } from '../../src/lib/supabase/server'
import FeaturedCarousel from '../../src/components/FeaturedCarousel'
import HomeHero from '../../src/components/HomeHero'
import ScrollReveal from '../../src/components/ScrollReveal'

const uspItems = [
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: 'Giá sỉ tận gốc',
    desc: 'Nhập thẳng từ nhà máy',
    iconColor: 'text-amber-600',
    ring: 'border-amber-300',
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="5" width="14" height="12" rx="1.5" />
        <path d="M15 8h4l3 4v5h-7" />
        <circle cx="6" cy="19" r="1.8" />
        <circle cx="18" cy="19" r="1.8" />
      </svg>
    ),
    title: 'Giao toàn quốc',
    desc: 'Nội thành HCM trong ngày',
    iconColor: 'text-blue-600',
    ring: 'border-blue-300',
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z" />
        <path d="M9 11.5l2 2 4-4" />
      </svg>
    ),
    title: '100% chính hãng',
    desc: 'Đổi trả nếu không đúng',
    iconColor: 'text-green-600',
    ring: 'border-green-300',
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'Hỗ trợ 24/7',
    desc: 'Tư vấn báo giá miễn phí',
    iconColor: 'text-purple-600',
    ring: 'border-purple-300',
  },
]


export default async function Home() {
  const [allProducts, categories] = await Promise.all([getProducts(), getCategories()])
  const featuredProducts = allProducts.filter((p) => p.featured)
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]))
  const vppSlugs = new Set(categories.filter((c) => c.branch_slug === 'van-phong-pham').map((c) => c.slug))
  const vppProductImage = allProducts.find((p) => vppSlugs.has(p.category) && p.images?.length > 0)?.images[0]

  return (
    <>
      {/* Hero: category sidebar + carousel + promo cards */}
      <HomeHero categories={categories} />

      {/* USP Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 divide-y divide-gray-100 md:divide-y-0 md:divide-x">
              {uspItems.map((item) => (
                <div key={item.title} className="flex items-center gap-3.5 px-6 py-5">
                  <div className={`w-11 h-11 rounded-full border-2 ${item.ring} ${item.iconColor} flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a3a6b] text-sm mb-0.5">{item.title}</h3>
                    <p className="text-gray-500 text-xs leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* About Mini */}
      <section className="py-12 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-widest text-[#1a56db] uppercase mb-2">
              CTY TNHH MTV SX TM TÂN VY PHÁT
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a6b] mb-4">
              Về Tân Vy Phát
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              <strong className="text-[#1a3a6b] font-semibold">Tân Vy Phát</strong> là đơn vị chuyên phân phối{' '}
              <strong className="text-[#1a3a6b] font-semibold">giấy in, văn phòng phẩm</strong> và{' '}
              <strong className="text-[#1a3a6b] font-semibold">hàng tiêu dùng Thái Lan</strong> giá sỉ tại Q.12, TPHCM.
              Với hơn 17 năm kinh nghiệm, chúng tôi nhập hàng trực tiếp từ nhà máy sản xuất trong nước
              và nhập khẩu chính ngạch, đảm bảo hàng <strong className="text-[#1a3a6b] font-semibold">chính hãng – đầy đủ chứng từ VAT</strong>.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Chúng tôi phục vụ các đại lý, văn phòng, trường học, tiệm văn phòng phẩm và hộ kinh doanh
              trên <strong className="text-gray-600 font-medium">toàn quốc</strong> — giao hàng nhanh, giá cạnh tranh, hỗ trợ tận tâm.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
              {[
                { value: '5868+', label: 'Khách hàng' },
                { value: 'Toàn quốc', label: 'Giao hàng' },
                { value: '17+', label: 'Năm kinh nghiệm' },
                { value: 'Q.12 HCM', label: 'Địa chỉ kho' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-extrabold text-[#1a56db] mb-1">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Categories Section – Editorial layout */}

      {/* Nhánh 1: Văn Phòng Phẩm — ảnh trái, text phải */}
      {(() => {
        const vpp = categories.filter((c) => c.branch_slug === 'van-phong-pham')
        return (
          <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                {/* Ảnh */}
                <ScrollReveal className="w-full lg:w-[45%] shrink-0">
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src="/branch-van-phong-pham.jpg"
                      alt="Văn Phòng Phẩm"
                      className="w-full h-auto hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </ScrollReveal>
                {/* Nội dung */}
                <ScrollReveal className="w-full lg:w-[55%]" delay={150}>
                  <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase mb-4">
                    [ Dòng sản phẩm 01 ]
                  </p>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a3a6b] leading-tight mb-4">
                    Văn Phòng Phẩm<br />
                    <span className="text-[#1a56db]">Giá Sỉ Tận Gốc</span>
                  </h2>
                  <p className="text-gray-500 text-base leading-relaxed mb-6">
                    Nhập thẳng từ nhà máy — giấy in A4, bìa Thái, decal, nhựa ép dẻo và đầy đủ
                    văn phòng phẩm các loại. Hàng sẵn kho, xuất hoá đơn VAT, giao toàn quốc.
                  </p>
                  {/* Danh mục */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {vpp.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/san-pham?category=${cat.slug}`}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1a56db] border border-gray-200 hover:border-[#1a56db] px-3 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/san-pham?branch=van-phong-pham"
                    className="inline-flex items-center gap-2 border-2 border-[#1a3a6b] text-[#1a3a6b] hover:bg-[#1a3a6b] hover:text-white font-semibold px-7 py-3 rounded-full transition-all duration-200 text-sm tracking-wide"
                  >
                    XEM SẢN PHẨM
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </ScrollReveal>
              </div>
            </div>
          </section>
        )
      })()}

      {/* Nhánh 2: Hàng Tiêu Dùng Thái Lan — text trái, ảnh phải */}
      {(() => {
        const thai = categories.filter((c) => c.branch_slug === 'hang-thai-lan')
        return (
          <section className="py-16 bg-[#f8fafc] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-16">
                {/* Ảnh */}
                <ScrollReveal className="w-full lg:w-[45%] shrink-0">
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src="/branch-hang-thai-lan.jpg"
                      alt="Hàng Tiêu Dùng Thái Lan"
                      className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </ScrollReveal>
                {/* Nội dung */}
                <ScrollReveal className="w-full lg:w-[55%]" delay={150}>
                  <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase mb-4">
                    [ Dòng sản phẩm 02 ]
                  </p>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#7f1d1d] leading-tight mb-4">
                    Hàng Tiêu Dùng Thái Lan<br />
                    <span className="text-[#dc2626]">Nhập Khẩu Chính Ngạch</span>
                  </h2>
                  <p className="text-gray-500 text-base leading-relaxed mb-6">
                    Nước giặt, nước xả vải, vệ sinh nhà cửa, chăm sóc cá nhân và hàng tiêu dùng
                    Thái Lan chính hãng. Đầy đủ chứng từ thuế VAT, hàng sẵn kho số lượng lớn.
                  </p>
                  {/* Danh mục */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {thai.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/san-pham?category=${cat.slug}`}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#dc2626] border border-gray-200 hover:border-[#dc2626] px-3 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/san-pham?branch=hang-thai-lan"
                    className="inline-flex items-center gap-2 border-2 border-[#991b1b] text-[#991b1b] hover:bg-[#991b1b] hover:text-white font-semibold px-7 py-3 rounded-full transition-all duration-200 text-sm tracking-wide"
                  >
                    XEM SẢN PHẨM
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </ScrollReveal>
              </div>
            </div>
          </section>
        )
      })()}

      {/* Nhánh 3: Giấy In — ảnh trái, text phải */}
      {(() => {
        const giayIn = categories.filter((c) => c.branch_slug === 'giay-in')
        return (
          <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                {/* Ảnh */}
                <ScrollReveal className="w-full lg:w-[45%] shrink-0">
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src="/branch-giay-in.jpg"
                      alt="Giấy In"
                      className="w-full h-auto hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </ScrollReveal>
                {/* Nội dung */}
                <ScrollReveal className="w-full lg:w-[55%]" delay={150}>
                  <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase mb-4">
                    [ Dòng sản phẩm 03 ]
                  </p>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#14532d] leading-tight mb-4">
                    Giấy In<br />
                    <span className="text-[#16a34a]">Nhập Thẳng Từ Nhà Máy</span>
                  </h2>
                  <p className="text-gray-500 text-base leading-relaxed mb-6">
                    Giấy in A4 các hãng Supreme, Double A, Paper One, bìa Thái Gold 160gsm,
                    decal và nhựa ép dẻo. Hàng sẵn kho số lượng lớn, xuất hoá đơn VAT đầy đủ.
                  </p>
                  {/* Danh mục */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {giayIn.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/san-pham?category=${cat.slug}`}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#16a34a] border border-gray-200 hover:border-[#16a34a] px-3 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/san-pham?branch=giay-in"
                    className="inline-flex items-center gap-2 border-2 border-[#14532d] text-[#14532d] hover:bg-[#14532d] hover:text-white font-semibold px-7 py-3 rounded-full transition-all duration-200 text-sm tracking-wide"
                  >
                    XEM SẢN PHẨM
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </ScrollReveal>
              </div>
            </div>
          </section>
        )
      })()}

      {/* Nhánh 4: Hàng Becker Chemie — text trái, ảnh phải */}
      {(() => {
        const becker = categories.filter((c) => c.branch_slug === 'becker-chemie')
        return (
            <section className="py-16 bg-[#f8fafc] overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-16">
                  {/* Ảnh */}
                  <ScrollReveal className="w-full lg:w-[45%] shrink-0">
                    <div className="overflow-hidden rounded-2xl">
                      <img
                          src="/branch-becker-chemie.jpg"
                          alt="Becker Chemie"
                          className="w-full h-auto block hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </ScrollReveal>
                  {/* Nội dung */}
                  <ScrollReveal className="w-full lg:w-[55%]" delay={150}>
                    <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase mb-4">
                      [ Dòng sản phẩm 04 ]
                    </p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#0000AA] leading-tight mb-4">
                      Dòng sản phẩm Becker Chemie<br />
                      <span className="text-[#0099FF]">Nhập Khẩu Chính Ngạch</span>
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed mb-6">
                      Giải pháp làm sạch toàn diện, nâng tầm không gian sống. Được nghiên cứu và phát triển dựa trên các tiêu chuẩn
                      chất lượng khắt khe, Becker Chemie không chỉ đơn thuần là dung dịch tẩy rửa, mà là "chuyên gia" đồng hành bảo vệ
                      tổ ấm và không gian làm việc của bạn.
                    </p>
                    {/* Danh mục */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {becker.map((cat) => (
                          <Link
                              key={cat.slug}
                              href={`/san-pham?category=${cat.slug}`}
                              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#dc2626] border border-gray-200 hover:border-[#dc2626] px-3 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </Link>
                      ))}
                    </div>
                    <Link
                        href="/san-pham?branch=becker-chemie"
                        className="inline-flex items-center gap-2 border-2 border-[#991b1b] text-[#991b1b] hover:bg-[#991b1b] hover:text-white font-semibold px-7 py-3 rounded-full transition-all duration-200 text-sm tracking-wide"
                    >
                      XEM SẢN PHẨM
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </ScrollReveal>
                </div>
              </div>
            </section>
        )
      })()}

      {/* Featured Products – Carousel */}
      <section className="py-12 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a6b]">Sản phẩm nổi bật</h2>
              <p className="text-gray-500 text-sm mt-1">Hàng sẵn kho, giá tốt nhất</p>
            </div>
            <Link
              href="/san-pham"
              className="text-[#1a56db] hover:text-[#1e40af] text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              Xem tất cả
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <ScrollReveal>
            <FeaturedCarousel products={featuredProducts} categoryMap={categoryMap} />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-[#1a56db] rounded-2xl px-6 sm:px-10 py-6 sm:py-7 flex flex-col lg:flex-row items-center justify-between gap-5">
              <div className="text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">
                  Liên hệ ngay để được báo giá sỉ tốt nhất
                </h2>
                <p className="text-blue-100 text-sm">
                  Gọi hotline hoặc nhắn tin qua Facebook / Zalo – phản hồi trong vài phút
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={`tel:${store.phone}`}
                  className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-[#1a56db] font-bold px-5 py-3 rounded-xl text-sm sm:text-base transition-colors whitespace-nowrap"
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Gọi {store.phoneDisplay}
                </a>
                <a
                  href={store.zalo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-white/70 hover:bg-white/10 text-white font-bold px-5 py-3 rounded-xl text-sm sm:text-base transition-colors whitespace-nowrap"
                >
                  Nhắn Zalo
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
