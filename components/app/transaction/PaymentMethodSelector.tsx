"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import type { Control, FieldValues, Path } from "react-hook-form"
import { usePaymentMethods } from "@/lib/hooks/use-wallet"

interface PaymentMethodSelectorProps<T extends FieldValues> {
  control: Control<T>
  // BUG-M07 FIX: name is now required (no default) so the caller must explicitly
  // provide the correct field path. The previous default ("paymentMethod" as Path<T>)
  // defeated TypeScript checks — any form without a paymentMethod field would
  // silently compile but produce a runtime/RHF error.
  name: Path<T>
  label?: string
}

export function PaymentMethodSelector<T extends FieldValues>({ control, name, label = "Metode Pembayaran" }: PaymentMethodSelectorProps<T>) {
  const { data: paymentMethods, isLoading } = usePaymentMethods()

  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select onValueChange={field.onChange} value={field.value as string | undefined} disabled={isLoading}>
          <FormControl><SelectTrigger data-testid="select-payment-method"><SelectValue placeholder={isLoading ? "Memuat..." : "Pilih metode pembayaran"} /></SelectTrigger></FormControl>
          <SelectContent>
            {(paymentMethods ?? []).filter((pm) => pm.enabled).map((pm) => (
              <SelectItem key={pm.id} value={pm.id}>
                {PAYMENT_METHOD_LABELS[pm.id] || pm.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />
  )
}
