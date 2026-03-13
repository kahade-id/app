"use client"

import * as React from "react"
import { Wallet } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CurrencyInput, LoadingState } from "@/components/shared"
import { formatIDR } from "@/lib/currency"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { usePaymentMethods } from "@/lib/hooks/use-wallet"

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000]

interface TopUpModalProps {
  amount: number
  onAmountChange: (amount: number) => void
  method: string
  onMethodChange: (method: string) => void
  onSubmit: () => void
  isPending: boolean
}

export function TopUpModal({ amount, onAmountChange, method, onMethodChange, onSubmit, isPending }: TopUpModalProps) {
  const { data: paymentMethods, isLoading: methodsLoading } = usePaymentMethods()

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
              <Wallet className="size-4 text-foreground/70" />
            </div>
            Jumlah Top Up
          </CardTitle>
          <CardDescription>Minimal top up Rp 10.000</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CurrencyInput value={amount} onChange={onAmountChange} min={10000} data-testid="input-topup-amount" />
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((a) => (
              <Button key={a} variant={amount === a ? "default" : "outline"} size="sm" onClick={() => onAmountChange(a)} className="transition-colors" data-testid={`button-quick-amount-${a}`}>
                {formatIDR(a, { compact: true })}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Metode Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          {methodsLoading ? (
            <LoadingState text="Memuat metode pembayaran..." />
          ) : (
            <RadioGroup value={method} onValueChange={onMethodChange} className="space-y-2">
              {(paymentMethods ?? []).filter((pm) => pm.enabled).map((pm) => (
                <div key={pm.id} className={`flex items-center space-x-3 rounded-lg border p-3.5 transition-colors hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${method === pm.id ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value={pm.id} id={pm.id} className="focus-visible:ring-0 focus-visible:ring-offset-0" />
                  <Label htmlFor={pm.id} className="flex-1 cursor-pointer text-sm">
                    {PAYMENT_METHOD_LABELS[pm.id] || pm.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" disabled={!amount || !method || isPending} onClick={onSubmit} data-testid="button-submit-topup">
        {isPending ? "Memproses..." : amount > 0 ? `Top Up ${formatIDR(amount)}` : "Top Up"}
      </Button>
    </>
  )
}
