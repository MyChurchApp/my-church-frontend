export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 animate-pulse">
        <div className="p-4">
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="h-8 bg-gray-200 rounded mb-6 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
