import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/src/lib/admin-auth'
import { getAdminClient } from '@/src/lib/supabase/admin'
import { validateAdminUpload } from '@/src/lib/admin-upload'

export async function POST(req: NextRequest) {
  if (!await getCurrentAdmin()) {
    return NextResponse.json({ error: 'Chỉ quản trị viên mới được tải lên tập tin.' }, { status: 403 })
  }
  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Dữ liệu tải lên không hợp lệ.' }, { status: 400 })
  const checked = validateAdminUpload(formData.get('file'), false);
  if ('error' in checked) return NextResponse.json({ error: checked.error }, { status: checked.status })

  const admin = getAdminClient()
  const { error } = await admin.storage.from('product-images')
    .upload(checked.path, await checked.file.arrayBuffer(), { contentType: checked.file.type, upsert: false })
  if (error) return NextResponse.json({ error: 'Tải lên thất bại: ' + error.message }, { status: 502 })

  const { data: { publicUrl } } = admin.storage.from('product-images').getPublicUrl(checked.path)
  return NextResponse.json({ url: publicUrl })
}
