import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllNewsSlugs, getNewsBySlug } from '../../../src/lib/supabase/server'
import { store } from '../../../src/data/store'

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
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function TinTucDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = await getNewsBySlug(slug)
  if (!item) notFound()

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Ảnh bìa */}
      {item.image_url && (
        <div className="w-full max-h-96 overflow-hidden bg-gray-100">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            style={{ maxHeight: '24rem' }}
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.tag_color}`}>
            {item.tag}
          </span>
          <span className="text-sm text-gray-400">{formatDate(item.published_at)}</span>
        </div>

        {/* Tiêu đề */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a3a6b] mb-6 leading-tight">
          {item.title}
        </h1>

        {/* Video (nếu có) */}
        {item.video_url && (
          <div className="mb-6 rounded-2xl overflow-hidden bg-black">
            <video
              src={item.video_url}
              controls
              className="w-full max-h-96"
              preload="metadata"
            />
          </div>
        )}

        {/* Nội dung */}
        <div
          className="news-content text-gray-700"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />

        {/* Facebook link */}
        {item.fb_url && (
          <div className="mt-8">
            <a
              href={item.fb_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#0c63d4] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Xem trên Facebook
            </a>
          </div>
        )}

        {/* Divider */}
        <div className="mt-10 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1a56db] transition-colors"
          >
            ← Quay lại Tin tức
          </Link>
          <a
            href={`tel:${store.phone}`}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            📞 Liên hệ ngay
          </a>
        </div>
      </div>
    </div>
  )
}
