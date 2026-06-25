import Link from 'next/link'
import { getCategories } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'
import DeleteProductButton from './DeleteProductButton'

type ProductUnit = { id: number; unit_name: string; price: number | null; stock: number; sort_order: number }
type Product = {
  id: number; slug: string; name: string; category: string
  images: string[]; min_price: number | null; featured: boolean
  updated_at: string; product_units: ProductUnit[]
}

export default async function SanPhamTable({
  branch,
  search,
  page,
}: {
  branch: string
  search: string
  page: number
}) {
  const limit = 20
  const offset = (page - 1) * limit

  const categories = await getCategories()
  const categoryMap = Object.fromEntries(categories.map(c => [c.slug, c]))

  let catSlugs: string[] | null = null
  if (branch !== 'all') {
    catSlugs = categories.filter(c => c.branch_slug === branch).map(c => c.slug)
  }

  const db = getAdminClient()
  let query = db
    .from('products')
    .select('id, slug, name, category, images, min_price, featured, updated_at, product_units(id, unit_name, price, stock, sort_order)', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)
  if (catSlugs !== null) query = query.in('category', catSlugs)

  const { data, count } = await query
  const products = (data ?? []).map(p => ({
    ...p,
    product_units: ((p as any).product_units as ProductUnit[] ?? []).sort((a, b) => a.sort_order - b.sort_order),
  })) as Product[]
  const totalPages = Math.ceil((count ?? 0) / limit)

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    params.set('branch', branch)
    if (search) params.set('search', search)
    params.set('page', String(p))
    return `/admin/san-pham?${params.toString()}`
  }

  return (
    <>
      <p className="text-sm text-gray-500">{count ?? 0} sản phẩm</p>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-3">Chưa có sản phẩm nào.</p>
            <Link href="/admin/san-pham/tao-moi" className="text-blue-600 hover:underline text-sm font-medium">
              + Thêm sản phẩm đầu tiên
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Sản phẩm</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Danh mục</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Đơn vị & Giá</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Nổi bật</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(product => {
                  const cat = categoryMap[product.category]
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-100" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-xl">📷</div>
                          )}
                          <div className="min-w-0">
                            <div className="text-gray-800 font-medium line-clamp-1">{product.name}</div>
                            <div className="text-xs text-gray-400 font-mono truncate">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {cat ? (
                          <div>
                            <div className="text-gray-700 text-xs">{cat.name}</div>
                            <div className="text-gray-400 text-xs capitalize">{cat.branch_slug.replace(/-/g, ' ')}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">{product.category}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {product.product_units.length === 0 ? (
                          <span className="text-gray-300 text-xs">—</span>
                        ) : (
                          <div className="space-y-0.5">
                            {product.product_units.map(u => (
                              <div key={u.id} className="text-xs text-gray-700">
                                <span className="font-medium">{u.unit_name}</span>
                                {u.price != null
                                  ? <span className="text-gray-500 ml-1">{Number(u.price).toLocaleString('vi-VN')}đ</span>
                                  : <span className="text-gray-400 ml-1">Liên hệ</span>
                                }
                                <span className="text-gray-400 ml-1">· kho: {u.stock}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {product.featured && <span className="text-yellow-500">★</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/san-pham/${product.slug}`} target="_blank" className="text-gray-400 hover:text-gray-600 text-xs">Xem</Link>
                          <Link href={`/admin/san-pham/${product.id}/chinh-sua`} className="text-blue-600 hover:underline text-xs">Sửa</Link>
                          <DeleteProductButton id={product.id} name={product.name} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={pageUrl(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${
                p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
