'use client'

import { createSupabaseBrowserClient } from '@/src/lib/supabase/browser'
import { adminRequest } from '@/src/lib/admin-api-client'

export const MAX_NEWS_VIDEO_SIZE = 45 * 1024 * 1024
export const MAX_NEWS_IMAGE_SIZE = 10 * 1024 * 1024
const NEWS_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
])

export async function uploadAdminNewsMedia(file: File): Promise<string> {
  const isVideo = file.type.startsWith('video/')
  if (!NEWS_TYPES.has(file.type)) throw new Error('Chỉ hỗ trợ JPG, PNG, WebP hoặc video MP4, WebM, MOV.')
  if (file.size <= 0 || file.size > (isVideo ? MAX_NEWS_VIDEO_SIZE : MAX_NEWS_IMAGE_SIZE)) {
    throw new Error(isVideo ? 'Video phải dưới 45 MB.' : 'Ảnh phải dưới 10 MB.')
  }

  const { path, token, url } = await adminRequest<{ path: string; token: string; url: string }>(
    '/api/admin/news/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: file.type, size: file.size }),
    }
  )
  const { error } = await createSupabaseBrowserClient()
    .storage.from('news-media')
    .uploadToSignedUrl(path, token, file, { contentType: file.type })
  if (error) throw new Error('Tải lên Supabase Storage thất bại: ' + error.message)
  return url
}
