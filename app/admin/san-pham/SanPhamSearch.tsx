'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Branch = { slug: string; name: string }

export default function SanPhamSearch({
  branch,
  search,
  branches,
}: {
  branch: string
  search: string
  branches: Branch[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(search)

  function navigate(newBranch: string, newSearch: string) {
    startTransition(() => {
      const p = new URLSearchParams()
      p.set('branch', newBranch)
      if (newSearch.trim()) p.set('search', newSearch.trim())
      p.set('page', '1')
      router.push(`/admin/san-pham?${p.toString()}`)
    })
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl shadow-sm">
      {/* Branch tabs */}
      <div className="flex gap-2 flex-wrap">
        {[{ slug: 'all', name: 'Tất cả' }, ...branches].map(b => (
          <button
            key={b.slug}
            onClick={() => navigate(b.slug, searchValue)}
            disabled={isPending}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              branch === b.slug
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <input
          type="search"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && navigate(branch, searchValue)}
          placeholder="Tìm theo tên sản phẩm..."
          disabled={isPending}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:opacity-60"
        />
        {isPending && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        )}
      </div>
    </div>
  )
}
