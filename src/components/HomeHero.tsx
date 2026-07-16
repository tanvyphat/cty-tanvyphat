'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

const slides = [
  { src: '/carousel/banner-tvp-tong-quan.png', alt: 'Tân Vy Phát — Nhà cung cấp văn phòng phẩm & hóa chất uy tín' },
  { src: '/carousel/banner-giay-in.png', alt: 'Giấy in chính ngạch' },
  { src: '/carousel/banner-nuoc-lau-san.png', alt: 'Nước lau sàn Thái Lan nhập khẩu' },
  { src: '/carousel/banner-bot-giat.png', alt: 'Bột giặt Thái Lan chính hãng' },
]
const N = slides.length

export default function HomeHero() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchX = useRef<number | null>(null)

  const prev = useCallback(() => setCurrent((i) => (i === 0 ? N - 1 : i - 1)), [])
  const next = useCallback(() => setCurrent((i) => (i === N - 1 ? 0 : i + 1)), [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isPaused, next])

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - (touchX.current ?? 0)
    if (Math.abs(dx) <= 40) return
    if (dx < 0) next()
    else prev()
  }

  return (
    <section
      className="relative overflow-hidden w-full aspect-[2560/910] min-h-[180px] bg-[#dce9ff]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, i) => (
        <Image
          key={i}
          src={slide.src}
          alt={slide.alt}
          fill
          className="object-cover transition-opacity duration-700 ease-in-out pointer-events-none"
          style={{ opacity: i === current ? 1 : 0 }}
          priority={i === 0}
          sizes="100vw"
        />
      ))}

      <button
        onClick={prev}
        aria-label="Trước"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-[#1E40AF] hover:bg-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Tiếp theo"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-[#1E40AF] hover:bg-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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
    </section>
  )
}
