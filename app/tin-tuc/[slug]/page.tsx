import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllNewsSlugs, getNewsBySlug } from '../../../src/lib/supabase/server'
import { store } from '../../../src/data/store'
import { TocSidebar, MediaCarousel } from './TinTucDetailClient'

export async function generateStaticParams() {
  const slugs = await getAllNewsSlugs()
  return slugs.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getNewsBySlug(slug)
  if (!item) return { title: 'Không tìm thấy' }
  return {
    title: `${item.title} | CT Tân Vy Phát`,
    description: item.excerpt,
    openGraph: item.image_url ? { images: [item.image_url] } : undefined,
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

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

function processContent(html: string): {
  headings: Heading[]
  processedHtml: string
  images: string[]
} {
  const headings: Heading[] = []
  const images: string[] = []

  // Collect image srcs
  const imgSrcRe = /<img[^>]+src="([^"]+)"/gi
  let m
  while ((m = imgSrcRe.exec(html)) !== null) images.push(m[1])

  // Remove img tags and clean up empty paragraphs they leave behind
  let out = html
    .replace(/<img\s[^>]*?\/?>/gi, '')
    .replace(/<p>\s*<\/p>/g, '')

  // Add IDs to h2/h3 and collect headings
  let counter = 0
  out = out.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (_, tag, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim()
    const id = `sec-${counter++}`
    headings.push({ id, text, level: parseInt(tag[1]) })
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`
  })

  return { headings, processedHtml: out, images }
}

export default async function TinTucDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = await getNewsBySlug(slug)
  if (!item) notFound()

  const { headings, processedHtml, images } = processContent(item.content)

  const media: MediaItem[] = []
  if (item.image_url) media.push({ type: 'image', src: item.image_url, alt: item.title })
  images.forEach((src) => media.push({ type: 'image', src }))
  if (item.video_url) media.push({ type: 'video', src: item.video_url })

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Tag + date */}
        <div className="flex items-center gap-3 mb-5">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.tag_color}`}>
            {item.tag}
          </span>
          <span className="text-sm text-gray-400">{formatDate(item.published_at)}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-[#1a3a6b] mb-6 leading-tight">
          {item.title}
        </h1>

        {/* Abstract */}
        {item.excerpt && (
          <div className="relative pl-5 mb-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#1a56db] before:rounded-full">
            <p className="text-gray-600 text-lg leading-relaxed italic">{item.excerpt}</p>
          </div>
        )}

        {/* Two-column layout: content + TOC */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Article body */}
          <div className="flex-1 min-w-0">
            <div
              className="news-content text-gray-700"
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
          </div>

          {/* TOC — desktop only sticky sidebar */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
              <TocSidebar headings={headings} />
            </aside>
          )}
        </div>

        {/* Media carousel at bottom */}
        {media.length > 0 && <MediaCarousel items={media} />}

        {/* Facebook link */}
        {item.fb_url && (
          <div className="mt-8">
            <a
              href={item.fb_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#0c63d4] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <svg className="w-4 h-4" style={{ fill: 'white' }} viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Xem trên Facebook
            </a>
          </div>
        )}

        {/* Footer nav */}
        <div className="mt-10 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1a56db] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại Tin tức
          </Link>
          <a
            href={`tel:${store.phone}`}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" style={{ fill: 'white' }} viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            Liên hệ ngay
          </a>
        </div>

      </div>
    </div>
  )
}
