/**
 * seed-thienlong.mjs
 *
 * 1. Xóa toàn bộ products có category='thien-long' khỏi DB
 * 2. Xóa toàn bộ file trong Storage: van-phong-pham/thien-long/
 * 3. Upload ảnh từ ../../thienlong_cards_2/ → WebP → Supabase Storage
 * 4. Seed products mới vào DB
 *
 * Run từ web-ban-hang/:
 *   node scripts/seed-thienlong.mjs
 */

import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { readdirSync, statSync } from 'fs'
import { join, basename, extname } from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET       = 'product-images'
const CATEGORY     = 'thien-long'
const BRANCH       = 'van-phong-pham'
const SOURCE_DIR   = '../thienlong_cards_2'

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Vietnamese slug ───────────────────────────────────────────────────────────
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

// Làm sạch tên sản phẩm từ tên file:
//   "Bìa CB04(Xanh_Tím)" → "Bìa CB04 (Xanh, Tím)"
function cleanName(fileNameNoExt) {
  return fileNameNoExt
    .replace(/\(([^)]+)\)/g, (_, inner) => ` (${inner.replace(/_/g, ', ')})`)
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Xóa file trong storage (1 level) ─────────────────────────────────────────
async function deleteStorageFolder(prefix) {
  let offset = 0
  const PAGE = 1000
  let totalDeleted = 0
  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: PAGE, offset })
    if (error || !data || data.length === 0) break

    const paths = data.filter(f => f.id !== null).map(f => `${prefix}/${f.name}`)
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths)
      totalDeleted += paths.length
    }
    if (data.length < PAGE) break
    offset += PAGE
  }
  console.log(`   ✓ Đã xóa ${totalDeleted} file trong storage/${prefix}`)
}

// ── Upload một ảnh → WebP ─────────────────────────────────────────────────────
async function uploadImage(localPath, storagePath) {
  const buf = await sharp(localPath)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buf, { contentType: 'image/webp', upsert: true })
  if (error) throw new Error(`Upload ${storagePath}: ${error.message}`)

  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}

// ── Main ──────────────────────────────────────────────────────────────────────
;(async () => {
  // 1. Xóa products trong DB
  console.log(`\n🗑️  Xóa products category='${CATEGORY}' trong DB...`)
  const { error: delErr, count } = await supabase
    .from('products')
    .delete({ count: 'exact' })
    .eq('category', CATEGORY)
  if (delErr) throw new Error(`Delete products: ${delErr.message}`)
  console.log(`   ✓ Đã xóa ${count ?? '?'} product(s)`)

  // 2. Xóa Storage
  console.log(`\n🗑️  Xóa Storage ${BRANCH}/${CATEGORY}/...`)
  await deleteStorageFolder(`${BRANCH}/${CATEGORY}`)

  // 3. Đọc file từ source folder
  const files = readdirSync(SOURCE_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .sort()

  console.log(`\n📂 Tìm thấy ${files.length} ảnh trong thienlong_cards_2/\n`)

  // Smart grouping: gom file có tên trùng (bỏ " (N)" hoặc "_N" suffix)
  const allNames = new Set(files.map(f => basename(f, extname(f))))
  const groups = new Map()

  for (const file of files) {
    const raw = basename(file, extname(file))
    // Tìm base key: bỏ " (N)" hoặc "_N"
    const noParens = raw.replace(/\s*\(\d+\)$/, '').trim()
    const noUnder  = raw.replace(/_\d+$/, '').trim()
    const key = (noParens !== raw && allNames.has(noParens)) ? noParens
              : (noUnder  !== raw && allNames.has(noUnder))  ? noUnder
              : raw
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(join(SOURCE_DIR, file))
  }

  const rows = []
  let done = 0
  const total = groups.size

  for (const [key, paths] of groups) {
    const name = cleanName(key)
    const slug = toSlug(name)
    const imageUrls = []

    for (let i = 0; i < paths.length; i++) {
      const storagePath = `${BRANCH}/${CATEGORY}/${slug}${i === 0 ? '' : `_${i}`}.webp`
      try {
        const url = await uploadImage(paths[i], storagePath)
        imageUrls.push(url)
      } catch (e) {
        console.error(`\n  ✗ ${e.message}`)
      }
    }

    rows.push({
      slug,
      name,
      category: CATEGORY,
      description: '',
      images: imageUrls,
      featured: false,
      price: null,
      stock: 0,
      keyword: null,
      fb_post_url: null,
    })

    done++
    process.stdout.write(`\r[${done}/${total}] ${name.slice(0, 55).padEnd(55)}`)
  }

  // 4. Insert vào DB
  console.log('\n\n💾 Inserting vào DB...')
  const BATCH = 50
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase.from('products').insert(batch)
    if (error) {
      console.error(`\nBatch error: ${error.message}`)
      for (const row of batch) {
        const { error: e2 } = await supabase.from('products').insert(row)
        if (e2) console.error(`  ✗ ${row.slug}: ${e2.message}`)
        else { console.log(`  ✓ ${row.slug}`); inserted++ }
      }
    } else {
      inserted += batch.length
    }
  }

  console.log(`\n✅ Hoàn thành! Seeded ${inserted}/${rows.length} sản phẩm Thiên Long.`)
})()
