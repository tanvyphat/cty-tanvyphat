import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getProducts,
  getProductBySlug,
  getCategories,
  getProductsByCategory,
} from '../../../src/lib/supabase/server'
import { store } from '../../../src/data/store'
import ProductCard from '../../../src/components/ProductCard'
import ProductDescription from '../../../src/components/ProductDescription'
import UnitSelector from './UnitSelector'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanvyphat.com'

export const revalidate = 3600 // fallback ISR mỗi 1 tiếng; on-demand revalidation xử lý tức thì khi admin save

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) return { title: 'Sản phẩm không tồn tại' }

  const title = `${product.name} – Giá Sỉ TPHCM`
  const description =
    product.description.length > 155
      ? product.description.slice(0, 152) + '...'
      : product.description
  const canonicalUrl = `${SITE_URL}/san-pham/${product.slug}`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      locale: 'vi_VN',
      images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params

  const [product, categories] = await Promise.all([getProductBySlug(slug), getCategories()])

  if (!product) notFound()

  const category = categories.find((c) => c.slug === product.category)
  const relatedProducts = await getProductsByCategory(product.category).then((ps) =>
    ps.filter((p) => p.slug !== product.slug).slice(0, 4)
  )
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]))
  const hasImage = product.images.length > 0

  const firstUnit = product.product_units[0] ?? null
  const minPrice = product.min_price

  const productUrl = `${SITE_URL}/san-pham/${product.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.slug,
    url: productUrl,
    ...(product.images.length > 0 && { image: product.images }),
    brand: { '@type': 'Organization', name: 'CT Tân Vy Phát' },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/OnlineOrInStoreOnly',
      priceCurrency: 'VND',
      ...(minPrice != null && { price: minPrice }),
      url: productUrl,
      seller: {
        '@type': 'Organization',
        name: 'CT Tân Vy Phát',
        telephone: store.phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '1/6 Đường Tân Thới Nhất 22, Khu phố 8, Phường Đông Hưng Thuận',
          addressLocality: 'TP. Hồ Chí Minh',
          addressRegion: 'TP. Hồ Chí Minh',
          addressCountry: 'VN',
        },
      },
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Sản phẩm', item: `${SITE_URL}/san-pham` },
      ...(category
        ? [{ '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/san-pham?category=${category.slug}` },
           { '@type': 'ListItem', position: 4, name: product.name, item: productUrl }]
        : [{ '@type': 'ListItem', position: 3, name: product.name, item: productUrl }]),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="min-h-screen bg-[#f8fafc]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#1a56db] transition-colors">
                Trang chủ
              </Link>
              <span>›</span>
              <Link href="/san-pham" className="hover:text-[#1a56db] transition-colors">
                Sản phẩm
              </Link>
              <span>›</span>
              {category && (
                <>
                  <Link
                    href={`/san-pham?category=${category.slug}`}
                    className="hover:text-[#1a56db] transition-colors"
                  >
                    {category.name}
                  </Link>
                  <span>›</span>
                </>
              )}
              <span className="text-[#1a3a6b] font-medium truncate max-w-[200px]">
                {product.name}
              </span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-indigo-100">
                {hasImage ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                    <div className="text-8xl mb-4">{category?.icon ?? '📦'}</div>
                    <p className="text-blue-500 font-medium text-lg">{product.name}</p>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-[#1a56db] text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-md">
                    {category?.icon} {category?.name ?? product.category}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 md:p-8 flex flex-col">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1a3a6b] mb-4 leading-snug">
                  {product.name}
                </h1>

                <div className="flex-1" />

                <UnitSelector
                  product={{ id: product.id, slug: product.slug, name: product.name, images: product.images }}
                  units={product.product_units}
                />

                <p className="text-xs text-gray-400 mt-4 text-center">Địa chỉ: {store.address}</p>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 px-6 md:px-8 py-6">
              <h2 className="font-semibold text-[#1a3a6b] mb-3 text-base">Mô tả sản phẩm</h2>
              <ProductDescription description={product.description} />
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                <p>* Lưu ý: Quý khách mua hàng vui lòng lấy Hóa đơn VAT (giá được tính thêm thuế VAT 10%, trường hợp quý khách không lấy HĐ VAT hoặc lấy HĐ trực tiếp, giá vẫn được tính thêm 10%)</p>
                <p>❤️ Quý khách liên hệ mua sỉ Giấy In &amp; Văn Phòng Phẩm: 0903608768</p>
                <p>❤️ Quý khách liên hệ mua sỉ Hàng Tiêu Dùng Thái Lan: 0926616674</p>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-[#1a3a6b] mb-5">Sản phẩm liên quan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((rp) => (
                  <ProductCard key={rp.slug} product={rp} category={categoryMap[rp.category]} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
