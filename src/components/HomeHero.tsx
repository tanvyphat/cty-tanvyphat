'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { store } from '../data/store'
import type { CategoryRow } from '../lib/supabase/server'

const slides = [
  { src: '/carousel/banner-1.jpg', alt: 'Banner 1' },
  { src: '/carousel/banner-2.jpg', alt: 'Banner 2' },
  { src: '/carousel/banner-3.jpg', alt: 'Banner 3' },
]
const N = slides.length

const BRANCHES: { slug: string; name: string; icon: React.ReactNode }[] = [
  {
    slug: 'giay-in',
    name: 'Giấy in',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  },
  {
    slug: 'van-phong-pham',
    name: 'Văn phòng phẩm',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h3l1.5-2h5L16 5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        <path d="M3 11h18" />
      </svg>
    ),
  },
  {
    slug: 'hang-thai-lan',
    name: 'Hàng Thái Lan',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c0 0-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z" />
      </svg>
    ),
  },
  {
    slug: 'becker-chemie',
    name: 'Becker Chemie',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2v6.34L3.6 19.1A1.5 1.5 0 0 0 5 21.3h14a1.5 1.5 0 0 0 1.4-2.2L15 8.34V2" />
        <path d="M8.5 2h7" />
        <path d="M6.5 15h11" />
      </svg>
    ),
  },
]

export default function HomeHero({ categories }: { categories: CategoryRow[] }) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [openBranch, setOpenBranch] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const prev = useCallback(() => setCurrent((i) => (i === 0 ? N - 1 : i - 1)), [])
  const next = useCallback(() => setCurrent((i) => (i === N - 1 ? 0 : i + 1)), [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isPaused, next])

  const openNow = (slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenBranch(slug)
  }

  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenBranch(null), 150)
  }

  return (
    <section className="bg-[#f5f7fa] py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_260px] gap-4">

          {/* Category sidebar — desktop only */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm py-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 pt-2 pb-1">
              Danh mục sản phẩm
            </div>
            {BRANCHES.map((branch) => {
              const subcats = categories.filter((c) => c.branch_slug === branch.slug)
              const isOpen = openBranch === branch.slug
              return (
                <div
                  key={branch.slug}
                  className="relative"
                  onMouseEnter={() => openNow(branch.slug)}
                  onMouseLeave={closeSoon}
                >
                  <Link
                    href={`/san-pham?branch=${branch.slug}`}
                    className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                      isOpen ? 'bg-blue-50 text-[#1a56db]' : 'text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {branch.icon}
                      {branch.name}
                    </span>
                    <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  {isOpen && subcats.length > 0 && (
                    <div
                      className="absolute left-full top-0 ml-2 w-64 max-h-[360px] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-30"
                      onMouseEnter={() => openNow(branch.slug)}
                      onMouseLeave={closeSoon}
                    >
                      {subcats.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/san-pham?branch=${branch.slug}&category=${cat.slug}`}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-[#1a56db] transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Carousel */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-sm h-[220px] sm:h-[280px] lg:h-[360px] bg-gray-100"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            ))}

            <button
              onClick={prev}
              aria-label="Trước"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 shadow-md rounded-full flex items-center justify-center text-[#1a3a6b] hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Tiếp theo"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 shadow-md rounded-full flex items-center justify-center text-[#1a3a6b] hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Side promos */}
          <div className="flex lg:flex-col gap-4">
            <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-center gap-2">
              <svg className="w-6 h-6 text-[#1a56db]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M9 15l2 2 4-4" />
              </svg>
              <div className="text-sm font-bold text-gray-900">Xuất hoá đơn VAT</div>
              <div className="text-xs text-gray-500 leading-relaxed">
                Hàng chính hãng, đầy đủ chứng từ nhập khẩu cho doanh nghiệp.
              </div>
            </div>
            <div className="flex-1 bg-[#e6f4ff] rounded-2xl p-5 flex flex-col justify-center gap-2">
              <div className="text-xs font-bold text-[#1a56db] uppercase tracking-wide">Báo giá sỉ trong ngày</div>
              <div className="text-sm text-gray-700 leading-relaxed">
                Gọi hotline hoặc nhắn Zalo — phản hồi trong vài phút.
              </div>
              <a
                href={`tel:${store.phone}`}
                className="mt-1 h-9 flex items-center justify-center bg-[#1a56db] hover:bg-[#1e40af] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Nhận báo giá ngay
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
