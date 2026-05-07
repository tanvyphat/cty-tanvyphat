'use client'

import { useState, useEffect } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

interface MediaItem {
  type: 'image' | 'video'
  src: string
  alt?: string
}

export function TocSidebar({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-5% 0% -70% 0%' }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <svg className="w-4 h-4 shrink-0" style={{ fill: '#1a56db' }} viewBox="0 0 24 24">
          <path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z" />
        </svg>
        <h3 className="text-xs font-bold text-[#1a3a6b] uppercase tracking-widest">
          Mục lục bài viết
        </h3>
      </div>
      <nav className="space-y-0.5">
        {headings.map(({ id, text, level }) => (
          <button
            key={id}
            onClick={() => {
              const el = document.getElementById(id)
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={[
              'w-full text-left text-sm leading-snug px-3 py-2 rounded-lg transition-all duration-150',
              level === 3 ? 'pl-6 text-xs' : '',
              activeId === id
                ? 'bg-blue-50 text-[#1a56db] font-semibold border-l-2 border-[#1a56db]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a3a6b]',
            ].join(' ')}
          >
            {level === 2 ? '▸ ' : '· '}{text}
          </button>
        ))}
      </nav>
    </div>
  )
}

export function MediaCarousel({ items }: { items: MediaItem[] }) {
  const [index, setIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length)
  const next = () => setIndex((i) => (i + 1) % items.length)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft')
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + items.length) % items.length : null
        )
      if (e.key === 'ArrowRight')
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % items.length : null
        )
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, items.length])

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  if (items.length === 0) return null

  const current = items[index]

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 shrink-0" style={{ fill: '#1a56db' }} viewBox="0 0 24 24">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
        <h3 className="text-xs font-bold text-[#1a3a6b] uppercase tracking-widest">
          Hình ảnh &amp; Video
        </h3>
      </div>

      {/* Main display */}
      <div className="relative bg-black rounded-2xl overflow-hidden group">
        <div className="aspect-video relative">
          {current.type === 'image' ? (
            <>
              <img
                src={current.src}
                alt={current.alt || ''}
                className="w-full h-full object-contain cursor-zoom-in select-none"
                onClick={() => setLightboxIndex(index)}
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none flex items-end justify-center pb-4">
                <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  Bấm để xem lớn
                </span>
              </div>
            </>
          ) : (
            <video
              src={current.src}
              controls
              className="w-full h-full"
              preload="metadata"
            />
          )}
        </div>

        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Ảnh trước"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" style={{ fill: 'white' }} viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Ảnh tiếp"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" style={{ fill: 'white' }} viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={[
                'flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200',
                i === index
                  ? 'border-[#1a56db] opacity-100 scale-105'
                  : 'border-gray-200 opacity-60 hover:opacity-90 hover:border-gray-400',
              ].join(' ')}
            >
              {item.type === 'image' ? (
                <img src={item.src} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <svg className="w-6 h-6" style={{ fill: 'white' }} viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={[
                'rounded-full transition-all duration-200',
                i === index ? 'w-5 h-2 bg-[#1a56db]' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400',
              ].join(' ')}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && items[lightboxIndex]?.type === 'image' && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4"
          style={{ zIndex: 200 }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Counter */}
          {items.length > 1 && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm select-none">
              {lightboxIndex + 1} / {items.length}
            </div>
          )}

          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <svg className="w-5 h-5" style={{ fill: 'white' }} viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>

          <img
            src={items[lightboxIndex].src}
            alt={items[lightboxIndex].alt || ''}
            className="max-w-[90vw] max-h-[90vh] object-contain select-none rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {/* Prev / Next */}
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev - 1 + items.length) % items.length : null
                  )
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                aria-label="Ảnh trước"
              >
                <svg className="w-6 h-6" style={{ fill: 'white' }} viewBox="0 0 24 24">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev + 1) % items.length : null
                  )
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                aria-label="Ảnh tiếp"
              >
                <svg className="w-6 h-6" style={{ fill: 'white' }} viewBox="0 0 24 24">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
