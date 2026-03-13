import { Skeleton } from "@/components/ui/skeleton"

export default function NotifikasiLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      {(["notif-0", "notif-1", "notif-2", "notif-3", "notif-4"] as const).map((id) => (
        <Skeleton key={id} className="h-20 w-full" />
      ))}
    </div>
  )
}
