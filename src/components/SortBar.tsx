'use client'

import { useRouter } from 'nextjs-toploader/app'
import { usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'

type Props = {
  sortBy: string
  sortDir: string
  count: number
  selectedBranch: string
  selectedCategory: string
  searchText: string
  perPage: number
  selectedSizes: string[]
  selectedWeights: string[]
}

const SORT_OPTIONS = [
  { label: 'Tên A→Z',       sort: 'name',  dir: 'asc' },
  { label: 'Tên Z→A',       sort: 'name',  dir: 'desc' },
  { label: 'Giá thấp→cao',  sort: 'price', dir: 'asc' },
  { label: 'Giá cao→thấp',  sort: 'price', dir: 'desc' },
]

export default function SortBar({
  sortBy,
  sortDir,
  count,
  selectedBranch,
  selectedCategory,
  searchText,
  perPage,
  selectedSizes,
  selectedWeights,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const navigate = useCallback(
    (sort: string, dir: string) => {
      const params = new URLSearchParams()
      if (selectedBranch !== 'all') params.set('branch', selectedBranch)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (searchText) params.set('search', searchText)
      if (sort !== 'name') params.set('sort', sort)
      if (dir !== 'asc') params.set('dir', dir)
      if (perPage !== 50) params.set('per_page', String(perPage))
      if (selectedSizes.length) params.set('size', selectedSizes.join(','))
      if (selectedWeights.length) params.set('weight', selectedWeights.join(','))
      const qs = params.toString()
      startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname))
    },
    [router, pathname, selectedBranch, selectedCategory, searchText, perPage, selectedSizes, selectedWeights]
  )

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className={`flex items-center gap-2 flex-wrap${isPending ? ' pointer-events-none' : ''}`}>
        <span className="text-sm text-gray-500 font-medium">Sắp xếp:</span>
        {SORT_OPTIONS.map((opt) => {
          const isActive = sortBy === opt.sort && sortDir === opt.dir
          return (
            <button
              key={`${opt.sort}|${opt.dir}`}
              onClick={() => navigate(opt.sort, opt.dir)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? 'bg-[#1a56db] text-white border-[#1a56db]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a56db] hover:text-[#1a56db]'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      <div className="text-sm text-gray-500">
        <span className="font-semibold text-gray-900">{count}</span> sản phẩm
      </div>
    </div>
  )
}
