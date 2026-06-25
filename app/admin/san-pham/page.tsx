export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSSRClient, getBranches } from '@/src/lib/supabase/server'
import AdminNavbar from '@/app/admin/AdminNavbar'
import SanPhamSearch from './SanPhamSearch'
import SanPhamTable from './SanPhamTable'

function TableSkeleton() {
  return (
    <>
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Sản phẩm', 'Danh mục', 'Đơn vị & Giá', 'Nổi bật', 'Thao tác'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse" /></td>
                <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse mx-auto" /></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-3">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

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

  const branches = await getBranches()

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h2 className="text-xl font-bold text-gray-900">Quản lý sản phẩm</h2>
          <Link
            href="/admin/san-pham/tao-moi"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            + Thêm sản phẩm
          </Link>
        </div>

        <SanPhamSearch branch={branch} search={search} branches={branches} />

        <Suspense fallback={<TableSkeleton />}>
          <SanPhamTable branch={branch} search={search} page={page} />
        </Suspense>
      </div>
    </div>
  )
}
