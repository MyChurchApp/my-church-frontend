import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function CultoLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-24" />
      </div>

      <Skeleton className="h-6 w-full max-w-md mb-6" />

      <Card className="mb-4">
        <CardContent className="p-4 flex items-center justify-center h-20">
          <Skeleton className="h-6 w-48" />
        </CardContent>
      </Card>

      {[1, 2, 3].map((i) => (
        <Card key={i} className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-16 w-full mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
