export default function SanPhamLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-[#1a3a6b] to-[#1a56db] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 bg-white/20 rounded" />
            <div className="h-8 w-48 bg-white/20 rounded" />
          </div>
          <div className="h-4 w-80 bg-white/20 rounded" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar skeleton */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg" />
            ))}
          </div>

          {/* Products grid skeleton */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="aspect-[4/3] rounded-xl bg-gray-200" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
                    <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
