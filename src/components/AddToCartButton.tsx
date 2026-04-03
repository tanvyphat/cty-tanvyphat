'use client'

import { useState } from 'react'
import { useCart } from '../hooks/useCart'

interface Product {
  id: number
  slug: string
  name: string
  images: string[]
  price: number | null
}

export default function AddToCartButton({ product, fullWidth }: { product: Product; fullWidth?: boolean }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] ?? null,
      price: product.price,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      className={`text-center text-xs font-medium py-1.5 px-3 rounded-lg transition-colors bg-green-500 hover:bg-green-600 text-white ${fullWidth ? 'w-full' : ''}`}
    >
      {added ? '✓ Đã thêm!' : 'Thêm vào giỏ'}
    </button>
  )
}
