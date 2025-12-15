export default function CatalogLoading() {
  return (
    <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-600">Загрузка каталога...</p>
      </div>
    </div>
  )
}
