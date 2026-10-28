import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!(file instanceof File)) return NextResponse.json({ error: 'Không có file' }, { status: 400 })

  const supportedTypes: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
    'image/gif': 'gif', 'image/avif': 'avif',
  }
  const ext = supportedTypes[file.type]
  if (!ext) return NextResponse.json({ error: 'Định dạng ảnh không được hỗ trợ' }, { status: 415 })
  if (file.size === 0 || file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ảnh phải nhỏ hơn 10 MB' }, { status: 413 })
  }
  const path = `uploads/${randomUUID()}.${ext}`

  const bytes = await file.arrayBuffer()
  const admin = getAdminClient()
  const { error } = await admin.storage
    .from('product-images')
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage
    .from('product-images')
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
