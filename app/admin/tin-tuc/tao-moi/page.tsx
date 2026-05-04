'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import MediaUpload from '@/src/components/admin/MediaUpload'

const NewsEditor = dynamic(() => import('@/src/components/admin/NewsEditor'), { ssr: false })

const TAG_OPTIONS = [
  { label: 'Thông báo', value: 'Thông báo', color: 'bg-green-100 text-green-700' },
  { label: 'Chia sẻ', value: 'Chia sẻ', color: 'bg-purple-100 text-purple-700' },
  { label: 'Sản phẩm', value: 'Sản phẩm', color: 'bg-blue-100 text-blue-700' },
  { label: 'Khuyến mãi', value: 'Khuyến mãi', color: 'bg-amber-100 text-amber-700' },
]

function toSlug(text: string): string {
  return text
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function TaoMoiPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [fbUrl, setFbUrl] = useState('')
  const [tag, setTag] = useState(TAG_OPTIONS[0].value)
  const [tagColor, setTagColor] = useState(TAG_OPTIONS[0].color)
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 10))

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!slugManual) setSlug(toSlug(val))
  }

  function handleTagChange(val: string) {
    const opt = TAG_OPTIONS.find(t => t.value === val)
    if (opt) { setTag(opt.value); setTagColor(opt.color) }
  }

  const handleContentChange = useCallback((html: string) => setContent(html), [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !slug || !excerpt || !content) {
      setError('Vui lòng điền đầy đủ tiêu đề, slug, tóm tắt và nội dung.')
      return
    }
    setSubmitting(true)
    setError(null)

    const res = await fetch('/api/admin/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug, title, excerpt, content,
        image_url: imageUrl || null,
        video_url: videoUrl || null,
        tag, tag_color: tagColor,
        fb_url: fbUrl || null,
        published_at: publishedAt,
      }),
    })

    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg)
      setSubmitting(false)
      return
    }

    router.push('/admin/tin-tuc')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/tin-tuc" className="text-gray-500 hover:text-gray-700 text-sm">← Tin tức</Link>
            <h1 className="font-bold text-gray-900">Đăng bài mới</h1>
          </div>
          <button
            form="news-form"
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : 'Đăng bài'}
          </button>
        </div>
      </header>

      <form id="news-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Tiêu đề */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
            <input
              type="text"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Tiêu đề bài đăng..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
            <input
              type="text"
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
              placeholder="duong-dan-bai-dang"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">URL: /tin-tuc/{slug || '...'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt *</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Mô tả ngắn hiển thị ở trang danh sách..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Hình ảnh & Video</h2>
          <MediaUpload
            label="Ảnh bìa"
            accept="image/*"
            currentUrl={imageUrl || null}
            onUpload={setImageUrl}
          />
          <MediaUpload
            label="Video (không bắt buộc)"
            accept="video/*"
            currentUrl={videoUrl || null}
            onUpload={setVideoUrl}
          />
        </div>

        {/* Nội dung */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Nội dung *</label>
          <NewsEditor content={content} onChange={handleContentChange} />
        </div>

        {/* Meta */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Thông tin bổ sung</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
              <select
                value={tag}
                onChange={e => handleTagChange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TAG_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đăng</label>
              <input
                type="date"
                value={publishedAt}
                onChange={e => setPublishedAt(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Facebook (không bắt buộc)</label>
            <input
              type="url"
              value={fbUrl}
              onChange={e => setFbUrl(e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </form>
    </div>
  )
}
