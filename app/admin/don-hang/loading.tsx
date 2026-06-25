import AdminNavbar from '@/app/admin/AdminNavbar'

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

export default function DonHangLoading() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-4 items-end">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-9 w-44 rounded-lg" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-16 rounded-lg" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Khách hàng', 'SĐT', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày tạo', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
