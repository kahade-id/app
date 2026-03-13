"use client"

import { CreateTransactionForm } from "@/components/app/transaction/CreateTransactionForm"
import { usePageTitle } from "@/lib/hooks/use-page-title"

export default function BuatTransaksiPage() {
  usePageTitle("Buat Transaksi")
  return <CreateTransactionForm />
}
