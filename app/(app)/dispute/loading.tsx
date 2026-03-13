import { Skeleton } from "@/components/ui/skeleton"

export default function DisputeLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-48" />
      {(["dispute-0", "dispute-1", "dispute-2"] as const).map((id) => (
        <Skeleton key={id} className="h-20 w-full" />
      ))}
    </div>
  )
}
