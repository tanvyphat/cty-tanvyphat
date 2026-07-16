'use client'

import { useRouter } from 'nextjs-toploader/app'
import { usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import type { BranchRow } from '../lib/supabase/server'

type Props = {
  branches: BranchRow[]
  selectedBranch: string
  searchText: string
  sortBy: string
  sortDir: string
  perPage: number
  count: number
}

export default function ProductHero({
  branches,
  selectedBranch,
  searchText,
  sortBy,
  sortDir,
  perPage,
  count,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const go = useCallback(
    (url: string) => startTransition(() => router.push(url)),
    [router]
  )

  const handleBranchClick = (branchSlug: string) => {
    const params = new URLSearchParams()
    if (searchText) params.set('search', searchText)
    if (sortBy !== 'name') params.set('sort', sortBy)
    if (sortDir !== 'asc') params.set('dir', sortDir)
    if (perPage !== 50) params.set('per_page', String(perPage))
    if (branchSlug !== 'all') params.set('branch', branchSlug)
    const qs = params.toString()
    go(qs ? `${pathname}?${qs}` : pathname)
  }

  const currentBranchName =
    selectedBranch === 'all'
      ? 'Tất cả sản phẩm'
      : (branches.find((b) => b.slug === selectedBranch)?.name ?? 'Sản phẩm')

  return (
    <div className="bg-white border-b border-gray-100 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="text-2xl md:text-[26px] font-extrabold text-gray-900">{currentBranchName}</h1>
          <span className="text-sm text-gray-500">
            {count} sản phẩm{selectedBranch === 'all' ? ` · ${branches.length} ngành hàng` : ''}
          </span>
        </div>

        <div className={`flex gap-1 overflow-x-auto${isPending ? ' pointer-events-none' : ''}`}>
          <button
            onClick={() => handleBranchClick('all')}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              selectedBranch === 'all'
                ? 'text-[#1a56db] border-[#1a56db]'
                : 'text-gray-500 border-transparent hover:text-[#1a56db]'
            }`}
          >
            Tất cả
          </button>
          {branches.map((b) => {
            const isSelected = selectedBranch === b.slug
            return (
              <button
                key={b.slug}
                onClick={() => handleBranchClick(b.slug)}
                className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  isSelected
                    ? 'text-[#1a56db] border-[#1a56db]'
                    : 'text-gray-500 border-transparent hover:text-[#1a56db]'
                }`}
              >
                {b.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
