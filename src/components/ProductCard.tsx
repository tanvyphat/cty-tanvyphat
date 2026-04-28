import Link from 'next/link'
import Image from 'next/image'
import type { ProductRow, CategoryRow } from '../lib/supabase/server'
import { store } from '../data/store'
import AddToCartButton from './AddToCartButton'

interface ProductCardProps {
  product: ProductRow
  category?: CategoryRow
}

export default function ProductCard({ product, category }: ProductCardProps) {
  const hasImage = product.images.length > 0
  const hasPrice = product.price != null

  return (
    <div className="group flex flex-col">
      {/* Ảnh */}
      <Link href={`/san-pham/${product.slug}`} className="block relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 mb-3">
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-5xl">{category?.icon ?? '📦'}</span>
            <span className="text-sm text-blue-600 font-medium text-center px-4">
              {product.name}
            </span>
          </div>
        )}
        {category && (
          <span className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {category.name}
          </span>
        )}
      </Link>

      {/* Nội dung */}
      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-[#1a56db] transition-colors">
        {product.name}
      </h3>
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2 flex-1">
        {product.description}
      </p>
      <p className="text-amber-600 font-semibold text-xs mb-3">
        {hasPrice ? product.price!.toLocaleString('vi-VN') + 'đ' : 'Liên hệ báo giá'}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/san-pham/${product.slug}`}
          className="flex-1 text-center text-xs border border-[#1a56db] text-[#1a56db] hover:bg-[#1a56db] hover:text-white font-medium py-1.5 px-3 rounded-lg transition-colors"
        >
          Xem chi tiết
        </Link>
        {hasPrice ? (
          <div className="flex-1">
            <AddToCartButton
              product={{ id: product.id, slug: product.slug, name: product.name, images: product.images, price: product.price }}
              fullWidth
            />
          </div>
        ) : (
          <a
            href={`tel:${store.phone}`}
            className="flex-1 text-center text-xs border border-red-500 text-red-600 hover:bg-red-500 hover:text-white font-medium py-1.5 px-3 rounded-lg transition-colors"
          >
            Đặt hàng
          </a>
        )}
      </div>
    </div>
  )
}
