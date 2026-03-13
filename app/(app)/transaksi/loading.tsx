import { Skeleton } from "@/components/ui/skeleton"

export default function TransaksiLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>
      {(["row-0", "row-1", "row-2", "row-3", "row-4"] as const).map((id) => (
        <Skeleton key={id} className="h-12 w-full" />
      ))}
    </div>
  )
}
