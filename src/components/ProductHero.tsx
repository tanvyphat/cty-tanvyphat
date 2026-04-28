'use client'

import { useRouter } from 'nextjs-toploader/app'
import { usePathname } from 'next/navigation'
import { useCallback, useRef, useTransition } from 'react'
import type { BranchRow } from '../lib/supabase/server'

type Props = {
  branches: BranchRow[]
  selectedBranch: string
  searchText: string
  selectedCategory: string
  sortBy: string
  sortDir: string
  perPage: number
  selectedSizes: string[]
  selectedWeights: string[]
}

const BRANCH_ICONS: Record<string, (selected: boolean) => React.ReactNode> = {
  'giay-in': () => <span>📄</span>,
  'van-phong-pham': () => <span>📋</span>,
  'hang-thai-lan': (selected) => (
    <span className={`inline-flex items-center justify-center text-[10px] font-bold w-5 h-5 rounded ${
      selected ? 'bg-[#1a56db]/15 text-[#1a56db]' : 'bg-white/20 text-white'
    }`}>
      TH
    </span>
  ),
}

export default function ProductHero({
  branches,
  selectedBranch,
  searchText,
  selectedCategory,
  sortBy,
  sortDir,
  perPage,
  selectedSizes,
  selectedWeights,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams()
      if (selectedBranch !== 'all') params.set('branch', selectedBranch)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (searchText) params.set('search', searchText)
      if (sortBy !== 'name') params.set('sort', sortBy)
      if (sortDir !== 'asc') params.set('dir', sortDir)
      if (perPage !== 50) params.set('per_page', String(perPage))
      if (selectedSizes.length) params.set('size', selectedSizes.join(','))
      if (selectedWeights.length) params.set('weight', selectedWeights.join(','))
      for (const [k, v] of Object.entries(overrides)) {
        if (v === '') params.delete(k)
        else params.set(k, v)
      }
      const qs = params.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [selectedBranch, selectedCategory, searchText, sortBy, sortDir, perPage, selectedSizes, selectedWeights, pathname]
  )

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

  const handleSearch = () => {
    const val = inputRef.current?.value.trim() ?? ''
    go(buildUrl({ search: val, page: '' }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="bg-gradient-to-br from-[#0d2456] via-[#1440a0] to-[#1a56db] text-white pt-10 pb-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="text-blue-200 text-lg font-semibold tracking-[0.2em] uppercase mb-2">
          TÂN VY PHÁT
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          Giấy In &amp; Văn Phòng Phẩm Giá Sỉ Và Lẻ
        </h1>

        {/* Branch tabs */}
        <div className={`flex justify-center gap-2 mb-7 flex-wrap${isPending ? ' pointer-events-none' : ''}`}>
          <button
            onClick={() => handleBranchClick('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              selectedBranch === 'all'
                ? 'bg-white text-[#1a56db] border-white'
                : 'border-white/40 text-white hover:border-white/70'
            }`}
          >
            <span>🛍️</span>
            Tất cả
          </button>
          {branches.map((b) => {
            const isSelected = selectedBranch === b.slug
            return (
              <button
                key={b.slug}
                onClick={() => handleBranchClick(b.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-white text-[#1a56db] border-white'
                    : 'border-white/40 text-white hover:border-white/70'
                }`}
              >
                {BRANCH_ICONS[b.slug]?.(isSelected) ?? <span>{b.icon}</span>}
                {b.name}
              </button>
            )
          })}
        </div>

        {/* Search bar */}
        <div className="flex items-center max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm tên sản phẩm, thương hiệu..."
              defaultValue={searchText}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3.5 text-gray-900 text-sm focus:outline-none bg-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="m-1.5 px-6 py-2.5 bg-red-400 hover:bg-red-500 text-gray-900 font-semibold text-sm rounded-xl transition-colors whitespace-nowrap"
          >
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  )
}
