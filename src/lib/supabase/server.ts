import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type ProductUnitRow = {
  id: number
  product_id: number
  unit_name: string
  price: number | null
  stock: number
  sort_order: number
  created_at: string
}

export type ProductRow = {
  id: number
  slug: string
  name: string
  category: string
  description: string
  images: string[]
  fb_post_url: string | null
  featured: boolean
  keyword: string | null
  min_price: number | null
  created_at: string
  updated_at: string
  product_units: ProductUnitRow[]
}

export type BranchRow = {
  id: number
  slug: string
  name: string
  icon: string
  sort_order: number
}

export type CategoryRow = {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  branch_id: number
  branch_slug: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type SortBy = 'name' | 'price'
export type SortDir = 'asc' | 'desc'
export type PerPage = 50 | 100 | 200

export type ProductFilterParams = {
  category?: string
  branchSlug?: string
  search?: string
  sortBy?: SortBy
  sortDir?: SortDir
  page?: number
  perPage?: PerPage
  sizes?: string[]
  weights?: string[]
}

function normalizeProduct(row: ProductRow & { product_units?: ProductUnitRow[] }): ProductRow {
  const units = (row.product_units ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)
  return { ...row, product_units: units }
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key)
}

export async function createSSRClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options))
      },
    },
  })
}

export async function getProducts(): Promise<ProductRow[]> {
  const { data, error } = await getClient()
    .from('products')
    .select('*, product_units(id, product_id, unit_name, price, stock, sort_order, created_at)')
    .order('featured', { ascending: false })
    .order('name')
  if (error) throw new Error(`getProducts: ${error.message}`)
  return (data ?? []).map(normalizeProduct)
}

export async function getRandomProducts(limit: number): Promise<ProductRow[]> {
  const { data, error } = await getClient()
    .rpc('get_random_products', { limit_count: limit })
    .select('*, product_units(id, product_id, unit_name, price, stock, sort_order, created_at)')
  if (error) throw new Error(`getRandomProducts: ${error.message}`)
  return (data ?? []).map(normalizeProduct)
}

export async function getBranches(): Promise<BranchRow[]> {
  const { data, error } = await getClient()
    .from('branches')
    .select('*')
    .order('sort_order')
  if (error) throw new Error(`getBranches: ${error.message}`)
  return data ?? []
}

export async function getProductsFiltered(filter: ProductFilterParams = {}): Promise<{
  data: ProductRow[]
  count: number
}> {
  const {
    category,
    branchSlug,
    search,
    sortBy = 'name',
    sortDir = 'asc',
    page = 1,
    perPage = 50,
    sizes,
    weights,
  } = filter

  const client = getClient()

  // Nếu lọc theo branch, lấy danh sách category slug thuộc branch đó trước
  let branchCategorySlugs: string[] | null = null
  if (branchSlug && branchSlug !== 'all') {
    const { data: cats } = await client
      .from('categories')
      .select('slug, branches!inner(slug)')
      .eq('branches.slug', branchSlug)
    branchCategorySlugs = (cats ?? []).map((c: { slug: string }) => c.slug)
  }

  // Include categories to allow ordering by sort_order for giay-in branch
  let query = client
    .from('products')
    .select('*, categories!products_category_fkey(sort_order), product_units(id, product_id, unit_name, price, stock, sort_order, created_at)', { count: 'exact' })

  if (search && search.trim()) {
    const term = search.trim()
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`)
  }

  if (category && category !== 'all') {
    query = query.eq('category', category)
  } else if (branchCategorySlugs !== null) {
    query = query.in('category', branchCategorySlugs)
  }

  if (sizes && sizes.length > 0) {
    query = query.or(sizes.map((s) => `name.ilike.%${s}%`).join(','))
  }
  if (weights && weights.length > 0) {
    // "100+" → match tất cả định lượng >= 100gsm (100, 110, 120, ... 300)
    const weightPatterns = weights.flatMap((w) =>
      w === '100+'
        ? Array.from({ length: 21 }, (_, i) => `name.ilike.%${100 + i * 10}gsm%`)
        : [`name.ilike.%${w}%`]
    )
    query = query.or(weightPatterns.join(','))
  }

  if (branchSlug === 'giay-in' || branchSlug === 'van-phong-pham' || branchSlug === 'hang-thai-lan') {
    // Fetch theo name trước; sort theo brand priority sẽ xử lý trong JS bên dưới
    query = query.order('name', { ascending: true })
  } else if (sortBy === 'price') {
    query = query
      .order('min_price', { ascending: sortDir === 'asc', nullsFirst: false })
      .order('name', { ascending: true })
  } else {
    query = query
      .order('featured', { ascending: false })
      .order('name', { ascending: sortDir === 'asc' })
  }

  const offset = (page - 1) * perPage
  query = query.range(offset, offset + perPage - 1)

  const { data, error, count } = await query
  if (error) throw new Error(`getProductsFiltered: ${error.message}`)

  // Giấy in: sort theo categories.sort_order (brand priority) → name
  // referencedTable order của Supabase không hoạt động với FK text→slug
  let result = data ?? []
  if (branchSlug === 'giay-in' || branchSlug === 'van-phong-pham' || branchSlug === 'hang-thai-lan') {
    result = [...result].sort((a, b) => {
      const aOrder = (a as any).categories?.sort_order ?? 9999
      const bOrder = (b as any).categories?.sort_order ?? 9999
      if (aOrder !== bOrder) return aOrder - bOrder
      return a.name.localeCompare(b.name, 'vi')
    })
  }

  return { data: result.map(normalizeProduct), count: count ?? 0 }
}

export async function getProductCounts(): Promise<Record<string, number>> {
  const { data, error } = await getClient()
    .from('products')
    .select('category')
  if (error) throw new Error(`getProductCounts: ${error.message}`)
  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.category] = (counts[row.category] ?? 0) + 1
  }
  return counts
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const { data, error } = await getClient()
    .from('products')
    .select('*, product_units(id, product_id, unit_name, price, stock, sort_order, created_at)')
    .eq('slug', slug)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getProductBySlug: ${error.message}`)
  }
  return normalizeProduct(data)
}

export async function getCategories(): Promise<CategoryRow[]> {
  const { data, error } = await getClient()
    .from('categories')
    .select('*, branches!inner(slug)')
    .order('branch_id')
    .order('sort_order')
  if (error) throw new Error(`getCategories: ${error.message}`)
  return (data ?? []).map((row: CategoryRow & { branches: { slug: string } }) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    icon: row.icon,
    branch_id: row.branch_id,
    branch_slug: row.branches.slug,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

export async function getProductsByCategory(categorySlug: string): Promise<ProductRow[]> {
  const { data, error } = await getClient()
    .from('products')
    .select('*, product_units(id, product_id, unit_name, price, stock, sort_order, created_at)')
    .eq('category', categorySlug)
    .order('name')
  if (error) throw new Error(`getProductsByCategory: ${error.message}`)
  return (data ?? []).map(normalizeProduct)
}

export type NewsRow = {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  image_url: string | null
  video_url: string | null
  tag: string
  tag_color: string
  published_at: string
  fb_url: string | null
}

export async function getNewsList(): Promise<NewsRow[]> {
  const { data, error } = await getClient()
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
  if (error) throw new Error(`getNewsList: ${error.message}`)
  return data ?? []
}

export async function getNewsBySlug(slug: string): Promise<NewsRow | null> {
  const { data, error } = await getClient()
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getNewsBySlug: ${error.message}`)
  }
  return data
}

export async function getAllNewsSlugs(): Promise<{ slug: string }[]> {
  const { data, error } = await getClient()
    .from('news')
    .select('slug')
    .order('published_at', { ascending: false })
  if (error) throw new Error(`getAllNewsSlugs: ${error.message}`)
  return data ?? []
}
