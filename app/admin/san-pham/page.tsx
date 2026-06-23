export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSSRClient, getBranches, getCategories } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'
import DeleteProductButton from './DeleteProductButton'
import AdminNavbar from '@/app/admin/AdminNavbar' // Import Navbar chung

export default async function AdminSanPhamPage({
                                                 searchParams,
                                               }: {
  searchParams: Promise<{ branch?: string; search?: string; page?: string }>
}) {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/dang-nhap')

  const { branch = 'all', search = '', page: pageStr = '1' } = await searchParams
  const page = Math.max(1, parseInt(pageStr, 10))
  const limit = 20
  const offset = (page - 1) * limit

  const [branches, categories] = await Promise.all([getBranches(), getCategories()])
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

  if (search.trim()) {
    query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`)
  }
  if (catSlugs !== null) {
    query = query.in('category', catSlugs)
  }

  const { data, count } = await query
  const products = (data ?? []).map(p => ({
    ...p,
    product_units: ((p as any).product_units as Array<{ id: number; unit_name: string; price: number | null; stock: number; sort_order: number }> ?? [])
        .sort((a, b) => a.sort_order - b.sort_order),
  })) as Array<{
    id: number
    slug: string
    name: string
    category: string
    images: string[]
    min_price: number | null
    featured: boolean
    updated_at: string
    product_units: Array<{ id: number; unit_name: string; price: number | null; stock: number; sort_order: number }>
  }>
  const totalPages = Math.ceil((count ?? 0) / limit)

  return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          {/* Tiêu đề trang và Nút hành động (Dời từ navbar xuống đây) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <h2 className="text-xl font-bold text-gray-900">Quản lý sản phẩm</h2>
            <Link
                href="/admin/san-pham/tao-moi"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              + Thêm sản phẩm
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl shadow-sm">
            <div className="flex gap-2 flex-wrap">
              <Link
                  href={`/admin/san-pham?branch=all${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      branch === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                Tất cả
              </Link>
              {branches.map(b => (
                  <Link
                      key={b.slug}
                      href={`/admin/san-pham?branch=${b.slug}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          branch === b.slug
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                  >
                    {b.name}
                  </Link>
              ))}
            </div>
            <form method="get" action="/admin/san-pham" className="flex-1 min-w-[200px] max-w-sm">
              {branch !== 'all' && <input type="hidden" name="branch" value={branch} />}
              <input
                  type="search"
                  name="search"
                  defaultValue={search}
                  placeholder="Tìm theo tên sản phẩm..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </form>
          </div>

          <p className="text-sm text-gray-500">{count ?? 0} sản phẩm</p>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-sm mb-3">Chưa có sản phẩm nào.</p>
                  <Link
                      href="/admin/san-pham/tao-moi"
                      className="text-blue-600 hover:underline text-sm font-medium"
                  >
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
                                    <img
                                        src={product.images[0]}
                                        alt=""
                                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-xl">
                                      📷
                                    </div>
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
                                <Link
                                    href={`/san-pham/${product.slug}`}
                                    target="_blank"
                                    className="text-gray-400 hover:text-gray-600 text-xs"
                                >
                                  Xem
                                </Link>
                                <Link
                                    href={`/admin/san-pham/${product.id}/chinh-sua`}
                                    className="text-blue-600 hover:underline text-xs"
                                >
                                  Sửa
                                </Link>
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

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="flex gap-2 justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Link
                        key={p}
                        href={`/admin/san-pham?branch=${branch}&search=${search}&page=${p}`}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${
                            p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {p}
                    </Link>
                ))}
              </div>
          )}
        </div>
      </div>
  )
}