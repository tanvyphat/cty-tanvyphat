'use client'

import { useRouter } from 'nextjs-toploader/app'
import { usePathname } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import type { CategoryRow } from '../lib/supabase/server'

const SIZES = ['A4', 'A3', 'A5', 'A3L']
const WEIGHTS = ['70gsm', '75gsm', '80gsm', '100gsm']

type Props = {
  categories: CategoryRow[]
  productCounts: Record<string, number>
  selectedBranch: string
  selectedCategory: string
  searchText: string
  sortBy: string
  sortDir: string
  perPage: number
  selectedSizes: string[]
  selectedWeights: string[]
}

export default function ProductFilter({
  categories,
  productCounts,
  selectedBranch,
  selectedCategory,
  searchText,
  sortBy,
  sortDir,
  perPage,
  selectedSizes,
  selectedWeights,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['size', 'weight', 'brand', 'type'])
  )

  const buildUrl = useCallback(
    (overrides: { category?: string; sizes?: string[]; weights?: string[] }) => {
      const params = new URLSearchParams()
      if (selectedBranch !== 'all') params.set('branch', selectedBranch)
      const cat = overrides.category !== undefined ? overrides.category : selectedCategory
      if (cat && cat !== 'all') params.set('category', cat)
      if (searchText) params.set('search', searchText)
      if (sortBy !== 'name') params.set('sort', sortBy)
      if (sortDir !== 'asc') params.set('dir', sortDir)
      if (perPage !== 50) params.set('per_page', String(perPage))
      const sizes = overrides.sizes !== undefined ? overrides.sizes : selectedSizes
      const weights = overrides.weights !== undefined ? overrides.weights : selectedWeights
      if (sizes.length) params.set('size', sizes.join(','))
      if (weights.length) params.set('weight', weights.join(','))
      const qs = params.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [pathname, selectedBranch, selectedCategory, searchText, sortBy, sortDir, perPage, selectedSizes, selectedWeights]
  )

  const go = useCallback(
    (url: string) => {
      setDrawerOpen(false)
      startTransition(() => router.push(url))
    },
    [router]
  )

  const toggleSize = (size: string) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size]
    go(buildUrl({ sizes: next }))
  }

  const toggleWeight = (weight: string) => {
    const next = selectedWeights.includes(weight)
      ? selectedWeights.filter((w) => w !== weight)
      : [...selectedWeights, weight]
    go(buildUrl({ weights: next }))
  }

  const toggleCategory = (slug: string) => {
    const next = selectedCategory === slug ? 'all' : slug
    go(buildUrl({ category: next }))
  }

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const branchCats = categories.filter((c) => c.branch_slug === selectedBranch)

  if (selectedBranch === 'all') return null

  const filterContent = (
    <div className={isPending ? 'pointer-events-none' : ''}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Bộ lọc</p>

      {selectedBranch === 'giay-in' && (
        <>
          <FilterSection
            title="Kích thước"
            sectionKey="size"
            expanded={expanded.has('size')}
            onToggle={() => toggleExpand('size')}
          >
            {SIZES.map((size) => (
              <CheckItem
                key={size}
                label={size}
                checked={selectedSizes.includes(size)}
                onChange={() => toggleSize(size)}
              />
            ))}
          </FilterSection>
          <FilterSection
            title="Định lượng"
            sectionKey="weight"
            expanded={expanded.has('weight')}
            onToggle={() => toggleExpand('weight')}
          >
            {WEIGHTS.map((w) => (
              <CheckItem
                key={w}
                label={w}
                checked={selectedWeights.includes(w)}
                onChange={() => toggleWeight(w)}
              />
            ))}
          </FilterSection>
        </>
      )}

      {selectedBranch === 'van-phong-pham' && (
        <FilterSection
          title="Thương hiệu"
          sectionKey="brand"
          expanded={expanded.has('brand')}
          onToggle={() => toggleExpand('brand')}
        >
          {branchCats.map((cat) => (
            <CheckItem
              key={cat.slug}
              label={cat.name}
              count={productCounts[cat.slug] ?? 0}
              checked={selectedCategory === cat.slug}
              onChange={() => toggleCategory(cat.slug)}
            />
          ))}
        </FilterSection>
      )}

      {selectedBranch === 'hang-thai-lan' && (
        <FilterSection
          title="Loại sản phẩm"
          sectionKey="type"
          expanded={expanded.has('type')}
          onToggle={() => toggleExpand('type')}
        >
          {branchCats.map((cat) => (
            <CheckItem
              key={cat.slug}
              label={cat.name}
              count={productCounts[cat.slug] ?? 0}
              checked={selectedCategory === cat.slug}
              onChange={() => toggleCategory(cat.slug)}
            />
          ))}
        </FilterSection>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-48 shrink-0">
        <div className="sticky top-20 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          {filterContent}
        </div>
      </aside>

      {/* Mobile: open button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed bottom-6 left-4 z-30 flex items-center gap-2 bg-[#1a56db] text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        Bộ lọc
      </button>

      {/* Mobile backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 overflow-y-auto shadow-xl transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <span className="font-semibold text-gray-900">Bộ lọc</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {filterContent}
      </div>
    </>
  )
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  sectionKey: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-2"
      >
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{title}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="space-y-2.5 mt-3">{children}</div>}
    </div>
  )
}

function CheckItem({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-[#1a56db] focus:ring-[#1a56db] cursor-pointer"
      />
      <span
        className={`flex-1 text-sm ${
          checked ? 'text-[#1a56db] font-medium' : 'text-gray-600 group-hover:text-gray-900'
        }`}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className={`text-xs tabular-nums ${checked ? 'text-[#1a56db]' : 'text-gray-400'}`}>
          {count}
        </span>
      )}
    </label>
  )
}
