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
import AddToCartButton from '../../../src/components/AddToCartButton'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanvyphat.com'

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: `${SITE_URL}/san-pham/${product.slug}`,
    ...(product.images.length > 0 && { image: product.images }),
    brand: { '@type': 'Organization', name: 'CT Tân Vy Phát' },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStoreOnly',
      priceCurrency: 'VND',
      seller: {
        '@type': 'Organization',
        name: 'CT Tân Vy Phát',
        telephone: store.phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '149/9 Tân Thới Nhất 17',
          addressLocality: 'Quận 12',
          addressRegion: 'TP. Hồ Chí Minh',
          addressCountry: 'VN',
        },
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 min-h-72 md:min-h-96 flex items-center justify-center">
                {hasImage ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover max-h-96"
                  />
                ) : (
                  <div className="text-center py-12 px-8">
                    <div className="text-8xl mb-4">{category?.icon ?? '📦'}</div>
                    <p className="text-blue-500 font-medium text-lg">{product.name}</p>
                  </div>
                )}
                <div className="absolute top-4 left-4">
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

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-amber-700 font-semibold text-sm">Giá bán:</p>
                  <p className="text-amber-600 font-bold text-xl">
                    {product.price != null
                      ? product.price.toLocaleString('vi-VN') + 'đ'
                      : 'Liên hệ để được báo giá sỉ tốt nhất'}
                  </p>
                </div>

                <p className="text-gray-600 leading-relaxed text-sm mb-6 flex-1">
                  {product.description}
                </p>

                <div className="flex flex-col gap-3">
                  {product.price != null ? (
                    <AddToCartButton product={{ id: product.id, slug: product.slug, name: product.name, images: product.images, price: product.price }} />
                  ) : (
                    <a
                      href={`tel:${store.phone}`}
                      className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-md"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      Gọi điện: {store.phoneDisplay}
                    </a>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={store.zalo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-[#0068FF] hover:bg-[#0054cc] text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors"
                    >
                      Nhắn Zalo
                    </a>
                    <a
                      href={store.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#0c63d4] text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </a>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4 text-center">Địa chỉ: {store.address}</p>
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
