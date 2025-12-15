import { Card, CardContent } from "@/components/ui/card"

export function CategorySkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <CardContent className="p-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mt-1 animate-pulse"></div>
      </CardContent>
    </Card>
  )
} 