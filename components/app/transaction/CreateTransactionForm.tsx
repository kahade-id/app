"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CurrencyInput, PageHeader, PageTransition } from "@/components/shared"
import { getApiErrorMessage } from "@/lib/api"
import { OrderTypeSelector } from "./OrderTypeSelector"
import { FeeCalculator } from "./FeeCalculator"
import { useCreateTransaction, useCalculateFee } from "@/lib/hooks/use-transactions"
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations/transaction.schema"
import type { FeeBreakdown } from "@/types/transaction"

export function CreateTransactionForm() {
  const [step, setStep] = React.useState(1)
  const [feeData, setFeeData] = React.useState<FeeBreakdown | null>(null)

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      role: undefined,
      counterpartUsername: "",
      title: "",
      description: "",
      orderType: undefined,
      orderValue: 0,
      deliveryDeadlineDays: 7,
      feeResponsibility: undefined,
      voucherCode: "",
    },
  })

  const createMutation = useCreateTransaction()
  const feeMutation = useCalculateFee()

  const handleStep1Submit = async () => {
    const valid = await form.trigger(['title', 'description', 'orderType', 'orderValue', 'deliveryDeadlineDays', 'counterpartUsername', 'role', 'feeResponsibility'])
    if (!valid) return

    const values = form.getValues()
    feeMutation.mutate(
      { orderValue: values.orderValue, feeResponsibility: values.feeResponsibility, voucherCode: values.voucherCode },
      {
        onSuccess: ({ data: res }) => {
          if (res.data) {
            setFeeData(res.data)
          }
          setStep(2)
        },
      }
    )
  }

  const handleConfirm = async () => {
    // UX-014 FIX: Validate form before calling mutation — without this, if any
    // field is invalid the mutation is called with invalid data and will be rejected by API.
    const valid = await form.trigger()
    if (!valid) return

    const values = form.getValues()
    createMutation.mutate({
      title: values.title,
      description: values.description,
      orderType: values.orderType,
      orderValue: values.orderValue,
      deliveryDeadlineDays: values.deliveryDeadlineDays,
      counterpartUsername: values.counterpartUsername,
      role: values.role,
      feeResponsibility: values.feeResponsibility,
      voucherCode: values.voucherCode || undefined,
    })
  }

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Buat Transaksi Baru" description="Buat transaksi escrow yang aman" />

      <div className="flex items-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {s}
            </div>
            <span className="text-xs sm:text-sm font-medium">{s === 1 ? "Detail Transaksi" : "Konfirmasi & Biaya"}</span>
            {s < 2 && <div className="mx-2 h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Detail Transaksi</CardTitle>
            <CardDescription>Isi informasi transaksi Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4">
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peran Anda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-role"><SelectValue placeholder="Pilih peran" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="BUYER">Pembeli</SelectItem>
                        <SelectItem value="SELLER">Penjual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="counterpartUsername" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username Lawan Transaksi</FormLabel>
                    <FormControl><Input placeholder="Masukkan username" data-testid="input-counterpart-username" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Transaksi</FormLabel>
                    <FormControl><Input placeholder="Contoh: Pembelian iPhone 15 Pro" data-testid="input-transaction-title" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl><Textarea placeholder="Deskripsi detail transaksi..." data-testid="textarea-transaction-description" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <OrderTypeSelector control={form.control} />

                <FormField control={form.control} name="orderValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nilai Transaksi</FormLabel>
                    <FormControl>
                      <CurrencyInput value={field.value} onChange={field.onChange} min={10000} max={1000000000} data-testid="input-order-value" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="deliveryDeadlineDays" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batas Waktu Pengiriman (hari)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={30} data-testid="input-delivery-deadline" {...field}
                        // #19 FIX: Izinkan undefined/NaN saat user menghapus input agar Zod
                        // tidak langsung error "Minimal 1 hari". Validasi hanya terjadi saat submit.
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10)
                          field.onChange(isNaN(v) ? undefined : v)
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="feeResponsibility" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penanggung Biaya</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-fee-responsibility"><SelectValue placeholder="Pilih penanggung" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="BUYER">Pembeli</SelectItem>
                        <SelectItem value="SELLER">Penjual</SelectItem>
                        <SelectItem value="SPLIT">Bagi Rata</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="voucherCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Voucher (Opsional)</FormLabel>
                    <FormControl><Input placeholder="Masukkan kode voucher" className="uppercase" data-testid="input-voucher-code" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {feeMutation.isError && (
                  <p className="text-sm text-destructive">{getApiErrorMessage(feeMutation.error, 'Gagal menghitung biaya. Silakan periksa data dan coba lagi.')}</p>
                )}

                <Button type="button" className="w-full" onClick={handleStep1Submit} disabled={feeMutation.isPending} data-testid="button-next-step">
                  {feeMutation.isPending ? "Menghitung biaya..." : "Lanjutkan"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {step === 2 && feeData && (
        <Card>
          <CardHeader>
            <CardTitle>Konfirmasi & Rincian Biaya</CardTitle>
            <CardDescription>Periksa detail transaksi sebelum membuat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FeeCalculator feeData={feeData} />

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setStep(1); setFeeData(null) }} data-testid="button-back-step">Kembali</Button>
              <Button className="flex-1" onClick={handleConfirm} disabled={createMutation.isPending} data-testid="button-create-transaction">
                {createMutation.isPending ? "Membuat transaksi..." : "Buat Transaksi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageTransition>
  )
}
