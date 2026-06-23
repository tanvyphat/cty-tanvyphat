export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSSRClient } from '@/src/lib/supabase/server'
import { getAdminClient } from '@/src/lib/supabase/admin'
import type { NewsRow } from '@/src/lib/supabase/server'
import DeleteNewsButton from './DeleteNewsButton'
import AdminNavbar from '@/app/admin/AdminNavbar' // Import Navbar chung

export default async function AdminTinTucPage() {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/dang-nhap')

  const { data } = await getAdminClient()
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })

  const news: NewsRow[] = data ?? []

  return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Header Hành động của trang */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Quản lý tin tức</h2>
            <Link
                href="/admin/tin-tuc/tao-moi"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              + Đăng bài mới
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {news.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">Chưa có bài đăng nào.</p>
            ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium w-1/2">Tiêu đề</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Tag</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Ngày đăng</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {news.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.image_url && (
                                  <img
                                      src={item.image_url}
                                      alt=""
                                      className="w-12 h-10 object-cover rounded-lg flex-shrink-0"
                                  />
                              )}
                              <span className="text-gray-800 font-medium line-clamp-2">{item.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.tag_color}`}>
                          {item.tag}
                        </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            {new Date(item.published_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                  href={`/tin-tuc/${item.slug}`}
                                  target="_blank"
                                  className="text-gray-400 hover:text-gray-600 text-xs"
                              >
                                Xem
                              </Link>
                              <Link
                                  href={`/admin/tin-tuc/${item.id}/chinh-sua`}
                                  className="text-blue-600 hover:underline text-xs"
                              >
                                Sửa
                              </Link>
                              <DeleteNewsButton id={item.id} />
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        </div>
      </div>
  )
}