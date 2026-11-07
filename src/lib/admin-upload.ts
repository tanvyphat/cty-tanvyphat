import { randomUUID } from 'node:crypto'

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const NEWS_VIDEO_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}

/** A Vercel Function request body cannot reliably exceed 4.5 MB. */
export const MAX_ADMIN_UPLOAD_SIZE = 4 * 1024 * 1024

export function validateAdminUpload(file: FormDataEntryValue | null, allowVideo: boolean):
  | { file: File; path: string }
  | { error: string; status: number } {
  if (!file || typeof file === 'string' || !(file instanceof File)) {
    return { error: 'Vui lòng chọn tập tin hợp lệ.', status: 400 }
  }
  const ext = IMAGE_TYPES[file.type] ?? (allowVideo ? NEWS_VIDEO_TYPES[file.type] : undefined)
  if (!ext) {
    return { error: allowVideo ? 'Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc video MP4, WebM, MOV.' : 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.', status: 415 }
  }
  if (file.size === 0 || file.size > MAX_ADMIN_UPLOAD_SIZE) {
    return { error: 'Tập tin phải lớn hơn 0 và không vượt quá 4 MB khi tải qua máy chủ. Hãy nén ảnh/video trước khi tải lên.', status: 413 }
  }
  const folder = allowVideo ? (file.type.startsWith('video/') ? 'videos' : 'images') : 'uploads'
  return { file, path: `${folder}/${randomUUID()}.${ext}` }
}
