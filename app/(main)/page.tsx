import Link from 'next/link'
import { store } from '../../src/data/store'
import { getProducts, getCategories } from '../../src/lib/supabase/server'
import HomeHero from '../../src/components/HomeHero'
import ScrollReveal from '../../src/components/ScrollReveal'
import ProductCard from '../../src/components/ProductCard'

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
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]))
  const productsByBranch = (branchSlug: string) =>
    allProducts.filter((p) => categoryMap[p.category]?.branch_slug === branchSlug).slice(0, 4)

  return (
    <>
      {/* Hero: carousel tràn viền */}
      <HomeHero />

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

      {/* Dòng sản phẩm — 4 thẻ danh mục */}
      <section className="py-12 sm:py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 sm:gap-10">
          {[
            {
              index: 1,
              branchSlug: 'van-phong-pham',
              title: 'Văn Phòng Phẩm — Giá Sỉ Tận Gốc',
              description:
                'Nhập thẳng từ nhà máy — giấy in A4, bìa Thái, decal, nhựa ép dẻo và đầy đủ văn phòng phẩm các loại. Hàng sẵn kho, xuất hoá đơn VAT, giao toàn quốc.',
              image: '/branch-van-phong-pham.png',
            },
            {
              index: 2,
              branchSlug: 'hang-thai-lan',
              title: 'Hàng Tiêu Dùng Thái Lan — Nhập Khẩu Chính Ngạch',
              description:
                'Nước giặt, nước xả vải, vệ sinh nhà cửa, chăm sóc cá nhân và hàng tiêu dùng Thái Lan chính hãng. Đầy đủ chứng từ thuế VAT, hàng sẵn kho số lượng lớn.',
              image: '/branch-hang-thai-lan.png',
            },
            {
              index: 3,
              branchSlug: 'giay-in',
              title: 'Giấy In — Nhập Thẳng Từ Nhà Máy',
              description:
                'Giấy in A4 các hãng Supreme, Double A, Paper One, bìa Thái Gold 160gsm, decal và nhựa ép dẻo. Hàng sẵn kho số lượng lớn, xuất hoá đơn VAT đầy đủ.',
              image: '/branch-giay-in.png',
            },
            {
              index: 4,
              branchSlug: 'becker-chemie',
              title: 'Becker Chemie — Nhập Khẩu Chính Ngạch',
              description:
                'Giải pháp làm sạch toàn diện từ Đức — lau đa năng, tẩy rửa nhà vệ sinh, lau sàn, rửa chén, tẩy dầu mỡ. Công thức tiên tiến, an toàn, hiệu quả tối ưu.',
              image: '/branch-becker-chemie.png',
            },
          ].map((branch) => {
            const branchCategories = categories.filter((c) => c.branch_slug === branch.branchSlug)
            const branchProducts = productsByBranch(branch.branchSlug)
            return (
              <ScrollReveal key={branch.branchSlug}>
                <div className="bg-white shadow-md rounded-3xl p-6 sm:p-10">
                  <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase mb-2">
                    [ Dòng sản phẩm {String(branch.index).padStart(2, '0')} ]
                  </p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
                    {branch.title}
                  </h2>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                    {branch.description}
                  </p>

                  {branchCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {branchCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/san-pham?branch=${branch.branchSlug}&category=${cat.slug}`}
                          className="text-sm font-medium text-gray-700 bg-[#f8faff] border border-[#d7e5ff] hover:bg-[#1a56db] hover:text-white hover:border-transparent px-4 py-2 rounded-full transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="rounded-2xl overflow-hidden mb-6">
                    <img src={branch.image} alt={branch.title} className="w-full h-auto" />
                  </div>

                  {branchProducts.length > 0 && (
                    <div className="flex items-stretch gap-3 sm:gap-4">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {branchProducts.map((product) => (
                          <ProductCard
                            key={product.slug}
                            product={product}
                            category={categoryMap[product.category]}
                            surfaceClassName="bg-[#f8faff] border border-[#d7e5ff]"
                          />
                        ))}
                      </div>
                      <Link
                        href={`/san-pham?branch=${branch.branchSlug}`}
                        aria-label={`Xem tất cả ${branch.title}`}
                        className="shrink-0 self-center w-11 h-11 rounded-full bg-[#1a56db] hover:bg-[#1e40af] text-white flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )
          })}
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
