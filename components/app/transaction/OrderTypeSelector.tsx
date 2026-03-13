"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { Control } from "react-hook-form"
import type { CreateOrderInput } from "@/lib/validations/transaction.schema"

interface OrderTypeSelectorProps {
  control: Control<CreateOrderInput>
}

export function OrderTypeSelector({ control }: OrderTypeSelectorProps) {
  return (
    <FormField control={control} name="orderType" render={({ field }) => (
      <FormItem>
        <FormLabel>Jenis Transaksi</FormLabel>
        <Select onValueChange={field.onChange} value={field.value}>
          <FormControl><SelectTrigger data-testid="select-order-type"><SelectValue placeholder="Pilih jenis" /></SelectTrigger></FormControl>
          <SelectContent>
            <SelectItem value="PHYSICAL_GOODS">Barang Fisik</SelectItem>
            <SelectItem value="SERVICE">Jasa</SelectItem>
            <SelectItem value="DIGITAL_GOODS">Barang Digital</SelectItem>
            <SelectItem value="OTHER">Lainnya</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />
  )
}
