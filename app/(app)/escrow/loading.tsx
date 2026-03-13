// H-1 FIX: File was empty (0 bytes). Next.js renders this as a Suspense fallback
// for the /escrow route — an empty file produces a blank white screen.
import { Skeleton } from "@/shared/components/ui/skeleton"

export default function EscrowLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48 rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["e1", "e2", "e3"].map((k) => (
          <Skeleton key={k} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
