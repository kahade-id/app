"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateBankAccount } from "@/lib/hooks/use-bank-accounts"
import { addBankAccountSchema, type AddBankAccountInput } from "@/lib/validations/bank-account.schema"

const BANKS = [
  { code: "BCA", name: "Bank Central Asia" },
  { code: "BNI", name: "Bank Negara Indonesia" },
  { code: "BRI", name: "Bank Rakyat Indonesia" },
  { code: "MANDIRI", name: "Bank Mandiri" },
  { code: "CIMB", name: "CIMB Niaga" },
  { code: "PERMATA", name: "Bank Permata" },
  { code: "BSI", name: "Bank Syariah Indonesia" },
  { code: "BTN", name: "Bank Tabungan Negara" },
  { code: "OTHER", name: "Bank Lainnya" },
]

interface AddBankAccountFormProps {
  // #13 FIX: Pilih satu pola kontrol dialog — gunakan controlled pattern (open/onOpenChange)
  // secara konsisten dan hapus DialogTrigger internal yang konflik.
  // Parent bertanggung jawab atas state open/close dan tombol trigger-nya.
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBankAccountForm({ open, onOpenChange }: AddBankAccountFormProps) {
  const createAccount = useCreateBankAccount()

  const form = useForm<AddBankAccountInput>({
    resolver: zodResolver(addBankAccountSchema),
    defaultValues: { bankCode: "", bankName: "", accountNumber: "", accountName: "" },
  })

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) form.reset()
  }, [open, form])

  const handleAdd = (data: AddBankAccountInput) => {
    createAccount.mutate(data, {
      onSuccess: () => { onOpenChange(false) },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Rekening Bank</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-5">
            <FormField control={form.control} name="bankCode" render={({ field }) => (
              <FormItem>
                <FormLabel>Bank</FormLabel>
                <Select onValueChange={(v) => {
                  field.onChange(v)
                  const bank = BANKS.find((b) => b.code === v)
                  if (bank) form.setValue("bankName", bank.name)
                }} value={field.value}>
                  <FormControl><SelectTrigger data-testid="select-bank"><SelectValue placeholder="Pilih bank" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {BANKS.map((b) => (<SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>))}
                  </SelectContent>
                  <p className="text-xs text-muted-foreground">Jika bank Anda tidak ada dalam daftar, pilih &quot;Bank Lainnya&quot;</p>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="accountNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Rekening</FormLabel>
                <FormControl><Input placeholder="Masukkan nomor rekening" data-testid="input-account-number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="accountName" render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pemilik Rekening</FormLabel>
                <FormControl><Input placeholder="Masukkan nama pemilik" data-testid="input-account-name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={createAccount.isPending} data-testid="button-submit-bank-account">
              {createAccount.isPending ? "Menyimpan..." : "Simpan Rekening"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Convenience trigger button untuk dipakai oleh parent
export function AddBankAccountTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} data-testid="button-add-bank-account">
      <Plus className="mr-2 size-4" />Tambah Rekening
    </Button>
  )
}
