export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-6 w-64 bg-gray-200 animate-pulse rounded mb-6"></div>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        <div className="lg:w-1/2">
          <div className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
        </div>

        <div className="lg:w-1/2">
          <div className="h-10 w-3/4 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-6"></div>
          <div className="space-y-2 mb-6">
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="flex gap-4 mb-8">
            <div className="h-10 flex-1 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 flex-1 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="h-40 bg-gray-200 animate-pulse rounded mb-6"></div>
        </div>
      </div>

      <div className="mt-12">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
