import { Skeleton } from "@/components/ui/skeleton"

export default function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}

