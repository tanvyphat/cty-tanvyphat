/**
 * upload-and-seed.mjs — v2
 *
 * 1. Xóa toàn bộ products, categories khỏi DB
 * 2. Xóa toàn bộ ảnh trong Supabase Storage
 * 3. Seed categories mới dựa theo structure san-pham/[branch]/[subfolder]/
 * 4. Walk san-pham/, convert JPG→WebP, upload Storage, seed products
 *
 * Run from web-ban-hang/ directory:
 *   node scripts/upload-and-seed.mjs
 */

import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { readdirSync, statSync } from 'fs'
import { join, basename, extname } from 'path'

const SUPABASE_URL = 'https://dsgvnlyubkohjiojjmrm.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZ3ZubHl1YmtvaGppb2pqbXJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkzODU5MCwiZXhwIjoyMDkwNTE0NTkwfQ.PphTAd-vYorBWHk_qwqjM2Fl7KCKakIJzl2-Cr3tZKw'
const BUCKET      = 'product-images'
const SAN_PHAM    = '../san-pham'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Category seeds per branch slug ───────────────────────────────────────────
// Thứ tự sort_order cho giay-in ảnh hưởng đến thứ tự hiển thị sản phẩm
// (filter size/weight vẫn hoạt động dựa trên name.ilike trong server.ts)
const CATEGORY_SEEDS = {
  'giay-in': [
    { slug: 'supreme',         name: 'Supreme',         description: 'Giấy Supreme – bền, mịn, chuyên in văn phòng',                     icon: '📄', sort_order: 10  },
    { slug: 'idea',            name: 'Idea',            description: 'Giấy Idea – sáng trắng, đa định lượng',                           icon: '📄', sort_order: 20  },
    { slug: 'delight',         name: 'Delight',         description: 'Giấy Delight – nhẹ bẻ, in không kẹt',                             icon: '📄', sort_order: 30  },
    { slug: 'projecta-optima', name: 'Projecta Optima', description: 'Giấy Projecta Optima – chuẩn ISO, in 2 mặt tốt',                  icon: '📄', sort_order: 40  },
    { slug: 'double-a',        name: 'Double A',        description: 'Giấy Double A – thương hiệu Thái Lan nổi tiếng',                  icon: '📄', sort_order: 50  },
    { slug: 'paper-one',       name: 'Paper One',       description: 'Giấy Paper One – trắng sáng, in laser & inkjet',                  icon: '📄', sort_order: 60  },
    { slug: 'quality',         name: 'Quality',         description: 'Giấy Quality – giá tốt, phù hợp văn phòng',                      icon: '📄', sort_order: 70  },
    { slug: 'bia-thai',        name: 'Bìa Thái Gold',   description: 'Bìa Thái Gold màu 160gsm – nhiều màu sắc đẹp',                   icon: '🗂️', sort_order: 80  },
    { slug: 'giay-in-khac',    name: 'Tổng Hợp',        description: 'Các loại giấy in khác – IK Copy, Excel, For, Golden Star…',      icon: '📄', sort_order: 999 },
  ],
  'van-phong-pham': [
    { slug: 'thien-long',   name: 'Thiên Long',  description: 'Bút, kéo, thước Thiên Long – thương hiệu Việt Nam',           icon: '✏️', sort_order: 10  },
    { slug: 'gold',         name: 'Gold',        description: 'Bìa lỗ, kẹp bướm Gold – chắc chắn, đẹp',                     icon: '✏️', sort_order: 20  },
    { slug: 'plus',         name: 'Plus',        description: 'Bấm kim, băng xóa, bìa lá Plus – chuẩn Nhật',                icon: '✏️', sort_order: 30  },
    { slug: 'double-a-vpp', name: 'Double A',    description: 'Pin, bấm kim, máy tính Double A – chính hãng Thái',           icon: '✏️', sort_order: 40  },
    { slug: 'vpp-khac',     name: 'Tổng Hợp',   description: 'Bút bi, mực dấu, kẹp giấy, nhựa ép, tập vở…',               icon: '✏️', sort_order: 999 },
  ],
  'hang-thai-lan': [
    { slug: 'nuoc-giat',      name: 'Nước Giặt',           description: 'Hygiene, Haby, PAO, Essence, FineLine – đậm đặc thơm lâu',    icon: '🧺', sort_order: 10  },
    { slug: 'bot-giat',       name: 'Bột Giặt',            description: 'Bột giặt PAO, Pro – trắng sáng, thơm lâu',                   icon: '🧺', sort_order: 20  },
    { slug: 'nuoc-xa-vai',    name: 'Nước Xả Vải',         description: 'Hygiene, Haby – mềm mại, thơm lâu',                          icon: '🫧', sort_order: 30  },
    { slug: 'nuoc-rua-chen',  name: 'Nước Rửa Chén',       description: 'Lipon, Jiplai, XCleen – sạch nhờn, an toàn',                 icon: '🍽️', sort_order: 40  },
    { slug: 'nuoc-lau-san',   name: 'Nước Lau Sàn',        description: 'Moppi, Okay, Whiz, XCleen – thơm như nước hoa',              icon: '🏠', sort_order: 50  },
    { slug: 'tay-rua',        name: 'Tẩy Rửa Các Loại',    description: 'Tẩy toilet, bột thông cống, xịt đa năng Okay, Vixol',        icon: '🧹', sort_order: 60  },
    { slug: 'sua-tam',        name: 'Sữa Tắm',             description: 'Beauty Care, Dnee, Rufus, Amoré – nhập khẩu Thái',           icon: '🧴', sort_order: 70  },
    { slug: 'kem-danh-rang',  name: 'Kem Đánh Răng',       description: 'Kodomo, Zact, Fresh & White – trắng sáng',                   icon: '🦷', sort_order: 80  },
    { slug: 'huong-thom',     name: 'Xịt Thơm & Túi Thơm', description: 'Túi thơm Hygiene, xịt khử mùi Haby – thơm dịu kéo dài',    icon: '🌸', sort_order: 90  },
    { slug: 'hang-thai-khac', name: 'Tổng Hợp',            description: 'Khăn giấy, bông tẩy trang, xịt côn trùng và sản phẩm khác', icon: '🛒', sort_order: 999 },
  ],
}

// ── Folder → category slug mapping (khớp đúng tên folder thực tế) ───────────
const CATEGORY_MAP = {
  // giay-in
  'giay-in/Supreme':                  'supreme',
  'giay-in/Idea':                     'idea',
  'giay-in/Delight':                  'delight',
  'giay-in/Projecta Optima':          'projecta-optima',
  'giay-in/Double':                   'double-a',
  'giay-in/Paper One':                'paper-one',
  'giay-in/Quality':                  'quality',
  'giay-in/Gold':                     'bia-thai',
  'giay-in/Tổng Hợp':                 'giay-in-khac',
  // van-phong-pham
  'van-phong-pham/Thiên long':        'thien-long',
  'van-phong-pham/Gold':              'gold',
  'van-phong-pham/Plus':              'plus',
  'van-phong-pham/Double A':          'double-a-vpp',
  'van-phong-pham/Tổng hợp':          'vpp-khac',
  // hang-thai-lan (folder names là ALL CAPS theo filesystem)
  'hang-thai-lan/NƯỚC GIẶT':          'nuoc-giat',
  'hang-thai-lan/BỘT GIẶT':           'bot-giat',
  'hang-thai-lan/NƯỚC XẢ':            'nuoc-xa-vai',
  'hang-thai-lan/NƯỚC RỬA CHÉN':      'nuoc-rua-chen',
  'hang-thai-lan/NƯỚC LAU SÀN':       'nuoc-lau-san',
  'hang-thai-lan/TẨY RỬA CÁC LOẠI':  'tay-rua',
  'hang-thai-lan/SỮA TẮM':            'sua-tam',
  'hang-thai-lan/KEM ĐÁNH RĂNG':      'kem-danh-rang',
  'hang-thai-lan/XỊT THƠM + TÚI THƠM': 'huong-thom',
  'hang-thai-lan/Tổng hợp':           'hang-thai-khac',
}

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

// ── Xóa toàn bộ file trong storage (đệ quy) ──────────────────────────────────
async function deleteStoragePath(prefix) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 1000 })

  if (error || !data || data.length === 0) return

  const filePaths = []
  const folderItems = []
  for (const item of data) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name
    // item.id === null → folder (virtual directory), có id → file thực
    if (item.id !== null) {
      filePaths.push(fullPath)
    } else {
      folderItems.push(fullPath)
    }
  }

  if (filePaths.length > 0) {
    const { error: removeErr } = await supabase.storage.from(BUCKET).remove(filePaths)
    if (removeErr) {
      console.error(`   ✗ remove ${prefix}: ${removeErr.message}`)
    } else {
      console.log(`   ✓ Deleted ${filePaths.length} file(s) from ${prefix || 'root'}`)
    }
  }

  for (const folder of folderItems) {
    await deleteStoragePath(folder)
  }
}

// ── Seed categories vào DB ────────────────────────────────────────────────────
async function seedCategories() {
  console.log('\n🌱 Seeding categories...')

  const { data: branches, error } = await supabase.from('branches').select('id, slug')
  if (error) throw new Error(`Get branches: ${error.message}`)

  const branchIdMap = Object.fromEntries(branches.map(b => [b.slug, b.id]))

  for (const [branchSlug, cats] of Object.entries(CATEGORY_SEEDS)) {
    const branch_id = branchIdMap[branchSlug]
    if (!branch_id) {
      console.warn(`   ⚠  Branch not found in DB: ${branchSlug}`)
      continue
    }
    const rows = cats.map(c => ({ ...c, branch_id }))
    const { error: insertErr } = await supabase.from('categories').insert(rows)
    if (insertErr) throw new Error(`Insert categories [${branchSlug}]: ${insertErr.message}`)
    console.log(`   ✓ ${branchSlug}: ${cats.length} categories`)
  }
}

// ── Upload ảnh, trả về public URL ────────────────────────────────────────────
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

// ── Smart grouping: gom ảnh cùng sản phẩm (hồng1 → hồng, (1) → base) ────────
function getGroupKey(fileName, allNames) {
  // Strip " (N)" suffix — e.g. "Giấy Excel A3 70gsm (1)"
  const noParens = fileName.replace(/\s*\(\d+\)$/, '').trim()
  if (noParens !== fileName && allNames.has(noParens)) return noParens

  // Strip "_N" suffix — e.g. "product_1"
  const noUnderscore = fileName.replace(/_\d+$/, '').trim()
  if (noUnderscore !== fileName && allNames.has(noUnderscore)) return noUnderscore

  // Strip trailing digits only if plain version exists — e.g. "hồng1" → "hồng"
  const noDigits = fileName.replace(/\d+$/, '').trim()
  if (noDigits !== fileName && noDigits.length > 0 && allNames.has(noDigits)) return noDigits

  return fileName
}

// ── Walk san-pham/ và collect sản phẩm ───────────────────────────────────────
function collectProducts() {
  const products = []
  const branches = readdirSync(SAN_PHAM).filter(
    b => statSync(join(SAN_PHAM, b)).isDirectory()
  )

  for (const branch of branches) {
    const brands = readdirSync(join(SAN_PHAM, branch)).filter(
      d => statSync(join(SAN_PHAM, branch, d)).isDirectory()
    )
    for (const brand of brands) {
      const folderKey = `${branch}/${brand}`
      const category = CATEGORY_MAP[folderKey]
      if (!category) {
        console.warn(`⚠  Không có mapping cho folder: ${folderKey}`)
        continue
      }

      const files = readdirSync(join(SAN_PHAM, branch, brand))
        .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
        .sort()

      // Tập hợp tên file (không extension) để smart grouping
      const allNames = new Set(files.map(f => basename(f, extname(f))))

      const groups = new Map()
      for (const file of files) {
        const nameNoExt = basename(file, extname(file))
        const key = getGroupKey(nameNoExt, allNames)
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key).push(join(SAN_PHAM, branch, brand, file))
      }

      for (const [name, paths] of groups) {
        products.push({ branch, category, name, paths })
      }
    }
  }
  return products
}

// ── Main ──────────────────────────────────────────────────────────────────────
;(async () => {
  // 1. Xóa products (phải xóa trước categories vì FK)
  console.log('🗑️  Deleting all products...')
  const { error: delProd } = await supabase.from('products').delete().gte('id', 0)
  if (delProd) throw new Error(`Delete products: ${delProd.message}`)
  console.log('   ✓ Products cleared')

  // 2. Xóa categories
  console.log('🗑️  Deleting all categories...')
  const { error: delCat } = await supabase.from('categories').delete().gte('id', 0)
  if (delCat) throw new Error(`Delete categories: ${delCat.message}`)
  console.log('   ✓ Categories cleared')

  // 3. Xóa storage images
  console.log('🗑️  Deleting storage images...')
  await deleteStoragePath('')

  // 4. Seed categories mới
  await seedCategories()

  // 5. Upload ảnh & seed products
  const items = collectProducts()
  console.log(`\n📦 Found ${items.length} products across all branches\n`)

  const rows = []
  let done = 0

  for (const item of items) {
    const { branch, category, name, paths } = item
    const slug = toSlug(name)

    const imageUrls = []
    for (let i = 0; i < paths.length; i++) {
      const storagePath = `${branch}/${category}/${slug}${i === 0 ? '' : `_${i}`}.webp`
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
      category,
      description: '',
      images: imageUrls,
      featured: false,
      price: null,
      stock: 0,
      keyword: null,
      fb_post_url: null,
    })

    done++
    process.stdout.write(
      `\r[${done}/${items.length}] ${name.slice(0, 52).padEnd(52)}`
    )
  }

  console.log('\n\n💾 Inserting products into DB...')

  const BATCH = 50
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase.from('products').insert(batch)
    if (error) {
      console.error(`\nInsert error (batch ${Math.floor(i / BATCH) + 1}): ${error.message}`)
      for (const row of batch) {
        const { error: e2 } = await supabase.from('products').insert(row)
        if (e2) console.error(`  ✗ ${row.slug}: ${e2.message}`)
        else console.log(`  ✓ ${row.slug}`)
      }
    }
  }

  console.log(`\n✅ Done! Seeded ${rows.length} products.`)
})()
