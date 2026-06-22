import Link from 'next/link'
import { store } from '../src/data/store'
import { getProducts, getCategories } from '../src/lib/supabase/server'
import FeaturedCarousel from '../src/components/FeaturedCarousel'
import BannerCarousel from '../src/components/BannerCarousel'
import ScrollReveal from '../src/components/ScrollReveal'

const uspItems = [
  {
    icon: '💰',
    title: 'Giá sỉ tận gốc',
    desc: 'Nhập trực tiếp từ nhà sản xuất, không qua trung gian. Giá cạnh tranh nhất thị trường.',
    cardHover: 'hover:bg-gradient-to-br hover:from-amber-50 hover:to-yellow-50 hover:border-amber-300',
    iconHover: 'group-hover:bg-amber-100',
  },
  {
    icon: '🚚',
    title: 'Giao hàng toàn quốc',
    desc: 'Ship toàn quốc nhanh chóng, đóng gói cẩn thận. Giao hàng nội thành TPHCM trong ngày.',
    cardHover: 'hover:bg-gradient-to-br hover:from-blue-50 hover:to-sky-50 hover:border-blue-300',
    iconHover: 'group-hover:bg-blue-100',
  },
  {
    icon: '✅',
    title: 'Hàng chính hãng',
    desc: 'Cam kết 100% hàng chính hãng, đầy đủ chứng từ nhập khẩu. Đổi trả nếu không đúng.',
    cardHover: 'hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 hover:border-green-300',
    iconHover: 'group-hover:bg-green-100',
  },
  {
    icon: '📞',
    title: 'Hỗ trợ 24/7',
    desc: 'Đội ngũ tư vấn nhiệt tình, hỗ trợ báo giá nhanh. Gọi ngay để được tư vấn miễn phí.',
    cardHover: 'hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50 hover:border-purple-300',
    iconHover: 'group-hover:bg-purple-100',
  },
]


export default async function Home() {
  const [allProducts, categories] = await Promise.all([getProducts(), getCategories()])
  const withImages = allProducts.filter((p) => p.images?.length > 0)
  const featuredProducts = [...withImages].sort(() => Math.random() - 0.5).slice(0, 15)
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]))
  const vppSlugs = new Set(categories.filter((c) => c.branch_slug === 'van-phong-pham').map((c) => c.slug))
  const vppProductImage = allProducts.find((p) => vppSlugs.has(p.category) && p.images?.length > 0)?.images[0]

  return (
    <>
      {/* Banner Carousel */}
      <BannerCarousel />

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

      {/* USP Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {uspItems.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 100}>
              <div
                className={`group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${item.cardHover} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center cursor-default`}
              >
                <div className={`bg-gray-100 ${item.iconHover} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transition-colors duration-300`}>
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3 className="font-bold text-[#1a3a6b] text-base mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
              </ScrollReveal>
            ))}
          </div>
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
      <section className="py-12 bg-gradient-to-r from-[#1a3a6b] to-[#1a56db] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Liên hệ ngay để được báo giá tốt nhất!
          </h2>
          <p className="text-blue-200 mb-6 text-base">
            Gọi hotline hoặc nhắn tin qua Facebook / Zalo – phản hồi trong vài phút
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href={`tel:${store.phone}`}
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold px-8 py-3.5 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
            <a
              href={store.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#0c63d4] text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
            <a
              href={store.zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0068FF] hover:bg-[#0054cc] text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Zalo
            </a>
          </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
