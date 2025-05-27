export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 animate-pulse">
        <div className="p-4 space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="space-y-2">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
