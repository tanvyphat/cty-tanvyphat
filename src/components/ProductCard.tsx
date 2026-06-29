import Link from 'next/link'
import Image from 'next/image'
import type { ProductRow, CategoryRow } from '../lib/supabase/server'
import { store } from '../data/store'
import AddToCartButton from './AddToCartButton'

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
}

interface ProductCardProps {
  product: ProductRow
  category?: CategoryRow
}

export default function ProductCard({ product, category }: ProductCardProps) {
  const hasImage = product.images.length > 0
  const firstUnit = product.product_units[0] ?? null
  const hasPrice = firstUnit?.price != null
  const multipleUnits = product.product_units.length > 1

  return (
    <div className="group flex flex-col bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <Link href={`/san-pham/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 sm:gap-2">
            <span className="text-3xl sm:text-5xl">{category?.icon ?? '📦'}</span>
            <span className="text-xs sm:text-sm text-blue-600 font-medium text-center px-2">
              {product.name}
            </span>
          </div>
        )}
        {category && (
          <span className="absolute top-1.5 right-1.5 bg-black/40 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded-full">
            {category.name}
          </span>
        )}
      </Link>

      <div className="px-1.5 pt-1 pb-1.5 sm:p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-[11px] sm:text-sm leading-snug mb-0.5 line-clamp-2 group-hover:text-[#1a56db] transition-colors">
          {product.name}
        </h3>
        <div className="hidden sm:block sm:flex-1 mb-2">
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {stripMarkdown(product.description)}
          </p>
        </div>
        <p className="text-red-600 font-bold text-[11px] sm:text-xs mb-1 sm:mb-3">
          {hasPrice ? (
            <>
              {multipleUnits ? 'Từ ' : 'Giá: '}
              {firstUnit!.price!.toLocaleString('vi-VN')}đ/{firstUnit!.unit_name}
            </>
          ) : (
            <span className="text-red-600">Liên hệ</span>
          )}
        </p>

        <div className="flex gap-1 sm:gap-2 mt-auto">
          <Link
            href={`/san-pham/${product.slug}`}
            className="flex-1 text-center text-[10px] sm:text-xs border border-[#1a56db] text-[#1a56db] hover:bg-[#1a56db] hover:text-white font-medium py-0.5 sm:py-1.5 px-1 sm:px-3 rounded-md sm:rounded-lg transition-colors"
          >
            Chi tiết
          </Link>
          {hasPrice && firstUnit ? (
            <div className="flex-1">
              <AddToCartButton
                product={{ id: product.id, slug: product.slug, name: product.name, images: product.images }}
                unit={firstUnit}
                fullWidth
              />
            </div>
          ) : (
            <a
              href={`tel:${store.phone}`}
              className="flex-1 text-center text-[10px] sm:text-xs border border-red-500 text-red-600 hover:bg-red-500 hover:text-white font-medium py-0.5 sm:py-1.5 px-1 sm:px-3 rounded-md sm:rounded-lg transition-colors"
            >
              Đặt hàng
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
