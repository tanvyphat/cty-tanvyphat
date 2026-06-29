'use client'

import { useState } from 'react'
import { useCart } from '../hooks/useCart'
import type { ProductUnitRow } from '../lib/supabase/server'

interface Product {
  id: number
  slug: string
  name: string
  images: string[]
}

interface Props {
  product: Product
  unit: ProductUnitRow
  fullWidth?: boolean
}

export default function AddToCartButton({ product, unit, fullWidth }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem({
      productId: product.id,
      unitId: unit.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] ?? null,
      price: unit.price,
      unit: unit.unit_name,
      weight_grams: unit.weight_grams ?? null,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      className={`text-center text-[10px] sm:text-xs font-medium py-1 sm:py-1.5 px-1 sm:px-3 rounded-lg transition-colors bg-green-500 hover:bg-green-600 text-white ${fullWidth ? 'w-full' : ''}`}
    >
      {added ? '✓ Đã thêm!' : 'Thêm vào giỏ'}
    </button>
  )
}
