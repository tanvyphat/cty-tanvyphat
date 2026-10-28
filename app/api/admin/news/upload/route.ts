import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { createSSRClient } from '@/src/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.app_metadata?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!(file instanceof File)) return NextResponse.json({ error: 'Không có file' }, { status: 400 })

  const imageTypes: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
    'image/gif': 'gif', 'image/avif': 'avif',
  }
  const videoTypes: Record<string, string> = {
    'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
  }
  const isVideo = Object.hasOwn(videoTypes, file.type)
  const ext = imageTypes[file.type] ?? videoTypes[file.type]
  if (!ext) return NextResponse.json({ error: 'Định dạng media không được hỗ trợ' }, { status: 415 })
  const maxBytes = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
  if (file.size === 0 || file.size > maxBytes) {
    return NextResponse.json({ error: 'File quá lớn hoặc rỗng' }, { status: 413 })
  }
  const folder = isVideo ? 'videos' : 'images'
  const path = `${folder}/${randomUUID()}.${ext}`

  const bytes = await file.arrayBuffer()

  const admin = supabase
  const { error } = await admin.storage
    .from('news-media')
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage
    .from('news-media')
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
