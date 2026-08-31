'use client'

import { useState } from 'react'
import { store } from '../../../../src/data/store'
import type { ProductUnitRow } from '../../../../src/lib/supabase/server'

interface Product {
  id: number
  slug: string
  name: string
  images: string[]
}

interface Props {
  product: Product
  units: ProductUnitRow[]
}

export default function UnitSelector({ product, units }: Props) {
  const firstUnit = units[0] ?? null
  const hasPrice = firstUnit?.price != null
  const multipleUnits = units.length > 1

  return (
    <div className="space-y-4">
      {/* Hiển thị giá chung của sản phẩm */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-600 font-bold text-xl">
          {hasPrice ? (
            <>
              {multipleUnits ? 'Từ ' : 'Giá: '}
              {firstUnit!.price!.toLocaleString('vi-VN')}đ/{firstUnit!.unit_name}
            </>
          ) : (
            'Liên hệ để được báo giá sỉ tốt nhất'
          )}
        </p>
      </div>

      {/* Nút hành động */}
      <div className="flex flex-col gap-3">
        <a
          href={`tel:${store.phone}`}
          className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3.5 rounded-xl text-base transition-colors shadow-md"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Gọi điện: {store.phoneDisplay}
        </a>
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
    </div>
  )
}
