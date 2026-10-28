/**
 * update-thienlong-images.mjs
 *
 * Upload ảnh từ ../thienlong_cards_3/ lên Supabase Storage,
 * sau đó update cột images[] của product tương ứng trong DB.
 *
 * Chạy từ web-ban-hang/ directory:
 *   node scripts/update-thienlong-images.mjs
 */

import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { readdirSync } from 'fs'
import { join, basename, extname } from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET      = 'product-images'
const SOURCE_DIR  = '../thienlong_cards_3'
const STORAGE_DIR = 'van-phong-pham/thien-long'

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Vietnamese slugify ────────────────────────────────────────────────────────
function toSlug(str) {
  const map = {
    à:'a',á:'a',ả:'a',ã:'a',ạ:'a',
    ă:'a',ắ:'a',ặ:'a',ằ:'a',ẳ:'a',ẵ:'a',
    â:'a',ấ:'a',ầ:'a',ẩ:'a',ẫ:'a',ậ:'a',
    đ:'d',
    è:'e',é:'e',ẻ:'e',ẽ:'e',ẹ:'e',
    ê:'e',ế:'e',ề:'e',ể:'e',ễ:'e',ệ:'e',
    ì:'i',í:'i',ỉ:'i',ĩ:'i',ị:'i',
    ò:'o',ó:'o',ỏ:'o',õ:'o',ọ:'o',
    ô:'o',ố:'o',ồ:'o',ổ:'o',ỗ:'o',ộ:'o',
    ơ:'o',ớ:'o',ờ:'o',ở:'o',ỡ:'o',ợ:'o',
    ù:'u',ú:'u',ủ:'u',ũ:'u',ụ:'u',
    ư:'u',ứ:'u',ừ:'u',ử:'u',ữ:'u',ự:'u',
    ỳ:'y',ý:'y',ỷ:'y',ỹ:'y',ỵ:'y',
  }
  return str
    .toLowerCase()
    .split('').map(c => map[c] ?? c).join('')
    .replace(/[^a-z0-9\s\-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Thêm khoảng trắng quanh ngoặc đơn để khớp với cách DB đã seed
// "FO-DB01(Xanh"   → "FO-DB01 (Xanh"
// "(1ms)(Xanh"     → "(1ms) (Xanh"
function normalizeParens(name) {
  return name
    .replace(/([^\s])\(/g, '$1 (')  // space trước (
    .replace(/\)([^\s])/g, ') $1')  // space sau )
}

// Slug dùng cho cả storage path lẫn DB lookup
function makeSlug(name) {
  return toSlug(normalizeParens(name))
}

// ── Convert + upload ──────────────────────────────────────────────────────────
async function uploadImage(localPath, storagePath) {
  const buf = await sharp(localPath)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buf, { contentType: 'image/webp', upsert: true })
  if (error) throw new Error(`Upload: ${error.message}`)

  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}

// ── Main ──────────────────────────────────────────────────────────────────────
;(async () => {
  const files = readdirSync(SOURCE_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .sort()

  console.log(`\n📂 ${files.length} ảnh trong ${SOURCE_DIR}\n`)

  let uploaded = 0, updated = 0
  const notFound = [], errors = []

  for (let i = 0; i < files.length; i++) {
    const file    = files[i]
    const name    = basename(file, extname(file))
    const slug    = makeSlug(name)
    const dstPath = `${STORAGE_DIR}/${slug}.webp`

    process.stdout.write(`[${i + 1}/${files.length}] ${name.slice(0, 50).padEnd(50)}`)

    // 1. Upload
    let url
    try {
      url = await uploadImage(join(SOURCE_DIR, file), dstPath)
      uploaded++
      process.stdout.write(' ✓ up')
    } catch (e) {
      errors.push({ name, error: e.message })
      process.stdout.write(` ✗ ${e.message}\n`)
      continue
    }

    // 2. Tìm product theo slug (normalized)
    const { data, error: fetchErr } = await supabase
      .from('products')
      .select('id, slug')
      .eq('slug', slug)
      .limit(1)

    if (fetchErr) {
      errors.push({ name, error: fetchErr.message })
      process.stdout.write(` ✗ DB: ${fetchErr.message}\n`)
      continue
    }

    if (!data || data.length === 0) {
      notFound.push({ name, slug })
      process.stdout.write(` ⚠ not found  slug: ${slug}\n`)
      continue
    }

    // 3. Update images[]
    const { error: updateErr } = await supabase
      .from('products')
      .update({ images: [url] })
      .eq('id', data[0].id)

    if (updateErr) {
      errors.push({ name, error: updateErr.message })
      process.stdout.write(` ✗ update: ${updateErr.message}\n`)
    } else {
      updated++
      process.stdout.write(' ✓ updated\n')
    }
  }

  console.log('\n' + '─'.repeat(65))
  console.log(`✅ Uploaded : ${uploaded}/${files.length}`)
  console.log(`✅ Updated  : ${updated}/${files.length}`)

  if (notFound.length > 0) {
    console.log(`\n⚠  ${notFound.length} không tìm thấy trong DB:`)
    notFound.forEach(p => console.log(`   • "${p.name}"\n     slug: ${p.slug}`))
  }
  if (errors.length > 0) {
    console.log(`\n✗  ${errors.length} lỗi:`)
    errors.forEach(e => console.log(`   • ${e.name}: ${e.error}`))
  }
  console.log('')
})()
