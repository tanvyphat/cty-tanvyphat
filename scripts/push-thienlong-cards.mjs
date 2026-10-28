/**
 * push-thienlong-cards.mjs
 *
 * Upload ảnh từ ../thienlong_cards/ lên Supabase Storage + upsert products
 * Branch: van-phong-pham | Category: thien-long
 *
 * Chạy từ web-ban-hang/:
 *   node scripts/push-thienlong-cards.mjs
 */

import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { readdirSync, statSync } from 'fs'
import { join, basename, extname } from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET       = 'product-images'
const CARDS_DIR    = '../thienlong_cards'
const BRANCH       = 'van-phong-pham'
const CATEGORY     = 'thien-long'

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Vietnamese slug ────────────────────────────────────────────────────────────
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

// ── Smart grouping: gom ảnh cùng sản phẩm ─────────────────────────────────────
function getGroupKey(fileName, allNames) {
  const noParens = fileName.replace(/\s*\(\d+\)$/, '').trim()
  if (noParens !== fileName && allNames.has(noParens)) return noParens

  const noUnderscore = fileName.replace(/_\d+$/, '').trim()
  if (noUnderscore !== fileName && allNames.has(noUnderscore)) return noUnderscore

  const noDigits = fileName.replace(/\d+$/, '').trim()
  if (noDigits !== fileName && noDigits.length > 0 && allNames.has(noDigits)) return noDigits

  return fileName
}

// ── Upload ảnh → WebP, trả về public URL ──────────────────────────────────────
async function uploadImage(localPath, storagePath) {
  const buf = await sharp(localPath)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buf, { contentType: 'image/webp', upsert: true })
  if (error) throw new Error(`Upload ${storagePath}: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

// ── Main ───────────────────────────────────────────────────────────────────────
;(async () => {
  const files = readdirSync(CARDS_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .sort()

  const allNames = new Set(files.map(f => basename(f, extname(f))))

  // Group ảnh theo sản phẩm
  const groups = new Map()
  for (const file of files) {
    const nameNoExt = basename(file, extname(file))
    const key = getGroupKey(nameNoExt, allNames)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(join(CARDS_DIR, file))
  }

  console.log(`📦 Tìm thấy ${groups.size} sản phẩm (${files.length} ảnh) trong thienlong_cards/\n`)

  const rows = []
  let done = 0

  for (const [name, paths] of groups) {
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
    process.stdout.write(`\r[${done}/${groups.size}] ${name.slice(0, 55).padEnd(55)}`)
  }

  console.log('\n\n💾 Upsert products vào DB...')

  const BATCH = 50
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'slug' })
    if (error) {
      console.error(`\nUpsert error (batch ${Math.floor(i / BATCH) + 1}): ${error.message}`)
      for (const row of batch) {
        const { error: e2 } = await supabase.from('products').upsert(row, { onConflict: 'slug' })
        if (e2) console.error(`  ✗ ${row.slug}: ${e2.message}`)
        else { console.log(`  ✓ ${row.slug}`); inserted++ }
      }
    } else {
      inserted += batch.length
    }
  }

  console.log(`\n✅ Xong! Đã upsert ${inserted}/${rows.length} sản phẩm Thiên Long vào Supabase.`)
})()
