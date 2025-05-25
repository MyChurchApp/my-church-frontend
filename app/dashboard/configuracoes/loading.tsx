export default function ConfiguracoesLoading() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
