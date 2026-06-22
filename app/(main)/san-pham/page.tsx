import type { Metadata } from 'next'
import {
  getProductsFiltered,
  getProductCounts,
  getCategories,
  getBranches,
  type SortBy,
  type SortDir,
  type PerPage,
} from '../../../src/lib/supabase/server'
import ProductCard from '../../../src/components/ProductCard'
import ProductFilter from '../../../src/components/ProductFilter'
import ProductHero from '../../../src/components/ProductHero'
import CategoryStrip from '../../../src/components/CategoryStrip'
import SortBar from '../../../src/components/SortBar'
import ProductPagination from '../../../src/components/ProductPagination'

export const metadata: Metadata = {
  title: 'Sản Phẩm – Văn Phòng Phẩm & Hàng Tiêu Dùng Thái Lan',
  description:
    'Giấy in A4, bìa Thái, nhựa ép, văn phòng phẩm và hàng tiêu dùng Thái Lan nhập khẩu chính ngạch – giá sỉ tốt nhất. Hàng sẵn kho, giao toàn quốc.',
}

const VALID_PER_PAGE: PerPage[] = [50, 100, 200]

type PageProps = {
  searchParams: Promise<{
    branch?: string
    category?: string
    search?: string
    sort?: string
    dir?: string
    per_page?: string
    page?: string
    size?: string
    weight?: string
  }>
}

export default async function SanPhamPage({ searchParams }: PageProps) {
  const {
    branch: branchParam,
    category: categoryParam,
    search: searchParam,
    sort: sortParam,
    dir: dirParam,
    per_page: perPageParam,
    page: pageParam,
    size: sizeParam,
    weight: weightParam,
  } = await searchParams

  const selectedBranch = branchParam ?? 'all'
  const selectedCategory = categoryParam ?? 'all'
  const searchText = searchParam ?? ''
  const sortBy: SortBy = sortParam === 'price' ? 'price' : 'name'
  const sortDir: SortDir = dirParam === 'desc' ? 'desc' : 'asc'
  const perPage: PerPage = VALID_PER_PAGE.includes(Number(perPageParam) as PerPage)
    ? (Number(perPageParam) as PerPage)
    : 50
  const page = Math.max(1, Number(pageParam) || 1)
  const selectedSizes = sizeParam ? sizeParam.split(',').filter(Boolean) : []
  const selectedWeights = weightParam ? weightParam.split(',').filter(Boolean) : []

  const [{ data: products, count }, categories, branches, productCounts] = await Promise.all([
    getProductsFiltered({
      category: selectedCategory,
      branchSlug: selectedBranch,
      search: searchText,
      sortBy,
      sortDir,
      page,
      perPage,
      sizes: selectedSizes,
      weights: selectedWeights,
    }),
    getCategories(),
    getBranches(),
    getProductCounts(),
  ])

  const totalPages = Math.ceil(count / perPage)
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]))

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (selectedBranch !== 'all') params.set('branch', selectedBranch)
    if (selectedCategory !== 'all') params.set('category', selectedCategory)
    if (searchText) params.set('search', searchText)
    if (sortBy !== 'name') params.set('sort', sortBy)
    if (sortDir !== 'asc') params.set('dir', sortDir)
    if (perPage !== 50) params.set('per_page', String(perPage))
    if (selectedSizes.length) params.set('size', selectedSizes.join(','))
    if (selectedWeights.length) params.set('weight', selectedWeights.join(','))
    params.set('page', String(p))
    return `/san-pham?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductHero
        branches={branches}
        selectedBranch={selectedBranch}
        searchText={searchText}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        sortDir={sortDir}
        perPage={perPage}
        selectedSizes={selectedSizes}
        selectedWeights={selectedWeights}
      />

      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
        {selectedBranch !== 'all' && (
          <CategoryStrip
            categories={categories}
            selectedBranch={selectedBranch}
            selectedCategory={selectedCategory}
            searchText={searchText}
            sortBy={sortBy}
            sortDir={sortDir}
            perPage={perPage}
          />
        )}

        <div className="mt-6 mb-4">
          <SortBar
            sortBy={sortBy}
            sortDir={sortDir}
            count={count}
            selectedBranch={selectedBranch}
            selectedCategory={selectedCategory}
            searchText={searchText}
            perPage={perPage}
            selectedSizes={selectedSizes}
            selectedWeights={selectedWeights}
          />
        </div>

        <div className="flex gap-6 pb-12">
          <ProductFilter
            categories={categories}
            productCounts={productCounts}
            selectedBranch={selectedBranch}
            selectedCategory={selectedCategory}
            searchText={searchText}
            sortBy={sortBy}
            sortDir={sortDir}
            perPage={perPage}
            selectedSizes={selectedSizes}
            selectedWeights={selectedWeights}
          />

          <div className="flex-1 min-w-0">
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-1 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.slug}
                      product={product}
                      category={categoryMap[product.category]}
                    />
                  ))}
                </div>
                <ProductPagination
                  currentPage={page}
                  totalPages={totalPages}
                  buildHref={buildHref}
                />
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                </p>
                <a
                  href="/san-pham"
                  className="inline-block bg-[#1a56db] hover:bg-[#1e40af] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Xem tất cả sản phẩm
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
