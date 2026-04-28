'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

const slides = [
  { src: '/carousel/slide-1.jpg', alt: 'Banner 1' },
  { src: '/carousel/slide-2.jpg', alt: 'Banner 2' },
  { src: null, alt: 'Sắp ra mắt' },
]

const N = slides.length

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const prev = useCallback(() => setCurrent((i) => (i === 0 ? N - 1 : i - 1)), [])
  const next = useCallback(() => setCurrent((i) => (i === N - 1 ? 0 : i + 1)), [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isPaused, next])

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden bg-gray-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Track — chiều rộng = 100% * số slide */}
      <div
        className="absolute inset-0 flex h-full"
        style={{
          width: `${N * 100}%`,
          transform: `translateX(-${(current / N) * 100}%)`,
          transition: 'transform 500ms ease-in-out',
        }}
      >
        {slides.map((slide, i) =>
          slide.src ? (
            <div key={i} className="relative h-full" style={{ width: `${100 / N}%` }}>
              {/* Nền blur */}
              <Image
                src={slide.src}
                alt=""
                fill
                className="object-cover scale-110 blur-xl brightness-75"
                priority={i === 0}
                sizes="100vw"
                aria-hidden
              />
              {/* Ảnh thật object-contain */}
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-contain relative z-10"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          ) : (
            <div
              key={i}
              className="h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300"
              style={{ width: `${100 / N}%` }}
            >
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 3h18" />
              </svg>
              <span className="text-gray-400 text-sm font-medium">Ảnh sắp ra mắt</span>
            </div>
          )
        )}
      </div>

      {/* Prev */}
      <button
        onClick={prev}
        aria-label="Trước"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 bg-black/40 hover:bg-black/65 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-md ring-1 ring-white/20"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next */}
      <button
        onClick={next}
        aria-label="Tiếp theo"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 bg-black/40 hover:bg-black/65 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-md ring-1 ring-white/20"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40 bg-black/40 px-3 py-1.5 rounded-full shadow-md ring-1 ring-white/20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
