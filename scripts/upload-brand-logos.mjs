/**
 * upload-brand-logos.mjs
 *
 * Upload tất cả PNG trong logos/ lên Supabase Storage:
 *   product-images/brand-logos/[tên-file].png
 *
 * Run từ web-ban-hang/:
 *   node scripts/upload-brand-logos.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readdirSync, readFileSync } from 'fs'
import { join, extname, basename } from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET      = 'product-images'
const LOGOS_DIR   = '../logos'

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function main() {
  const files = readdirSync(LOGOS_DIR).filter(f => extname(f).toLowerCase() === '.png')

  console.log(`\nUpload ${files.length} logo(s) → ${BUCKET}/brand-logos/\n`)

  const slugs = []

  for (const file of files) {
    const slug = basename(file, '.png')
    const storagePath = `brand-logos/${file}`
    const buffer = readFileSync(join(LOGOS_DIR, file))

    process.stdout.write(`  ${slug.padEnd(20)} `)

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: 'image/png', upsert: true })

    if (error) {
      console.log(`✗  ${error.message}`)
    } else {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
      console.log(`✓  ${data.publicUrl}`)
      slugs.push(slug)
    }
  }

  console.log(`\nHoàn thành: ${slugs.length}/${files.length} logo đã upload.\n`)

  console.log('// Cập nhật BRAND_LOGO_SLUGS trong CategoryStrip.tsx:')
  console.log('const BRAND_LOGO_SLUGS = new Set([')
  slugs.sort().forEach(s => console.log(`  '${s}',`))
  console.log('])')
}

main().catch(e => { console.error(e); process.exit(1) })
