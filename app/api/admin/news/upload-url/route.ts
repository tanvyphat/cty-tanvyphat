import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { getCurrentAdmin } from '@/src/lib/admin-auth'
import { getAdminClient } from '@/src/lib/supabase/admin'

// Browser uploads media directly to Storage, avoiding Vercel's 4.5MB function body limit.
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
}
const MAX_NEWS_VIDEO_SIZE = 45 * 1024 * 1024
const MAX_NEWS_IMAGE_SIZE = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Không có quyền tải media lên.' }, { status: 403 })
  const body = await req.json().catch(() => null)
  const type = body?.type as string | undefined
  const size = body?.size as number | undefined
  const extension = type ? MIME_EXTENSIONS[type] : undefined
  if (!extension || typeof size !== 'number' || !Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: 'Loại hoặc kích thước tập tin không hợp lệ.' }, { status: 400 })
  }
  const isVideo = type!.startsWith('video/')
  if (size > (isVideo ? MAX_NEWS_VIDEO_SIZE : MAX_NEWS_IMAGE_SIZE)) {
    return NextResponse.json({ error: isVideo ? 'Video vượt 45 MB.' : 'Ảnh vượt 10 MB.' }, { status: 413 })
  }
  const path = `${isVideo ? 'videos' : 'images'}/${randomUUID()}.${extension}`
  const bucket = getAdminClient().storage.from('news-media')
  const { data, error } = await bucket.createSignedUploadUrl(path)
  if (error || !data) {
    return NextResponse.json({ error: 'Không tạo được liên kết tải tập tin: ' + (error?.message ?? 'Lỗi Supabase Storage') }, { status: 502 })
  }
  const { data: { publicUrl } } = bucket.getPublicUrl(path)
  return NextResponse.json({ path, token: data.token, url: publicUrl }, { headers: { 'Cache-Control': 'no-store' } })
}
