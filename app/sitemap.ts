import type { MetadataRoute } from 'next'
import { getProducts, getCategories, getAllNewsSlugs } from '../src/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanvyphat.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, newsSlugs] = await Promise.all([
    getProducts(),
    getCategories(),
    getAllNewsSlugs(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                        lastModified: new Date() },
    { url: `${SITE_URL}/san-pham`,          lastModified: new Date() },
    { url: `${SITE_URL}/tin-tuc`,           lastModified: new Date() },
    { url: `${SITE_URL}/gioi-thieu`,        lastModified: new Date() },
    { url: `${SITE_URL}/lien-he`,           lastModified: new Date() },
    { url: `${SITE_URL}/tuyen-dung`,        lastModified: new Date() },
    { url: `${SITE_URL}/tra-cuu-don-hang`,  lastModified: new Date() },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/san-pham?category=${cat.slug}`,
    lastModified: new Date(cat.updated_at),
  }))

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/san-pham/${p.slug}`,
    lastModified: new Date(p.updated_at),
  }))

  const newsPages: MetadataRoute.Sitemap = newsSlugs.map((n) => ({
    url: `${SITE_URL}/tin-tuc/${n.slug}`,
    lastModified: new Date(),
  }))

  return [...staticPages, ...categoryPages, ...productPages, ...newsPages]
}
