export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#f8fafc] animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-2 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-2 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main card skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image skeleton */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-72 md:min-h-96" />

            {/* Info skeleton */}
            <div className="p-6 md:p-8 flex flex-col gap-4">
              {/* Title */}
              <div className="space-y-2">
                <div className="h-7 w-3/4 bg-gray-200 rounded" />
                <div className="h-7 w-1/2 bg-gray-200 rounded" />
              </div>

              {/* Price box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="h-4 w-16 bg-amber-200 rounded mb-2" />
                <div className="h-6 w-40 bg-amber-200 rounded" />
              </div>

              {/* Description */}
              <div className="space-y-2 flex-1">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                <div className="h-4 w-4/6 bg-gray-200 rounded" />
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <div className="h-12 w-full bg-gray-200 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-11 bg-gray-200 rounded-xl" />
                  <div className="h-11 bg-gray-200 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related products skeleton */}
        <div>
          <div className="h-7 w-48 bg-gray-200 rounded mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
  )
}
