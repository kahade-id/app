"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OrderParty } from "@/types/transaction"

interface TransactionPartiesProps {
  // NOTE-L05 FIX: Props typed as potentially undefined to match runtime reality
  // (optional chaining was used inside, indicating null is possible from API).
  buyer: OrderParty | null | undefined
  seller: OrderParty | null | undefined
}

export function TransactionParties({ buyer, seller }: TransactionPartiesProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Pihak Terlibat</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground mb-1">Pembeli</p>
          <p className="font-medium">{buyer?.fullName}</p>
          <p className="text-sm text-muted-foreground">@{buyer?.username || "-"}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground mb-1">Penjual</p>
          <p className="font-medium">{seller?.fullName}</p>
          <p className="text-sm text-muted-foreground">@{seller?.username || "-"}</p>
        </div>
      </CardContent>
    </Card>
  )
}
