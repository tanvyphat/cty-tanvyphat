import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Không có file' }, { status: 400 })

  const isVideo = file.type.startsWith('video/')
  const folder = isVideo ? 'videos' : 'images'
  const ext = file.name.split('.').pop() ?? (isVideo ? 'mp4' : 'jpg')
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const bytes = await file.arrayBuffer()

  const admin = getAdminClient()
  const { error } = await admin.storage
    .from('news-media')
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage
    .from('news-media')
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
