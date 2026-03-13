"use client"

import * as React from "react"
import { MagnifyingGlass, Question, Envelope, ChatCircle } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PageHeader, EmptyState, PageTransition } from "@/components/shared"
import { usePageTitle } from "@/lib/hooks/use-page-title"
import { usePublicConfig } from "@/lib/hooks/use-public-config"

const FAQ_ITEMS = [
  {
    q: "Bagaimana cara membuat transaksi escrow?",
    a: "Klik tombol 'Buat Transaksi' di dashboard, isi detail transaksi, review biaya, dan konfirmasi. Pihak lawan akan menerima notifikasi untuk mengkonfirmasi.",
  },
  {
    q: "Berapa biaya platform Kahade?",
    a: "Biaya platform adalah 1.5% untuk pengguna biasa dan 1% untuk pengguna Kahade+. Biaya bisa ditanggung pembeli, penjual, atau dibagi rata.",
  },
  {
    q: "Bagaimana cara top up wallet?",
    a: "Buka menu Wallet > Top Up, pilih nominal dan metode pembayaran (Virtual Account, QRIS, atau E-Wallet), lalu ikuti instruksi pembayaran.",
  },
  {
    q: "Bagaimana cara menarik dana?",
    a: "Buka menu Wallet > Tarik Dana, masukkan nominal dan pilih rekening bank tujuan. Anda perlu memasukkan PIN wallet dan verifikasi OTP email.",
  },
  {
    q: "Apa itu escrow dan bagaimana cara kerjanya?",
    a: "Escrow adalah sistem penjaminan dana. Pembeli membayar, dana ditahan oleh Kahade, penjual mengirim barang/jasa, setelah pembeli konfirmasi, dana dilepaskan ke penjual.",
  },
  {
    q: "Bagaimana cara mengajukan dispute?",
    a: "Pada halaman detail transaksi, klik 'Ajukan Dispute'. Jelaskan masalah Anda secara detail. Tim kami akan mereview dan memberikan keputusan.",
  },
  {
    q: "Berapa lama proses verifikasi KYC?",
    a: "Proses verifikasi KYC memakan waktu 1-3 hari kerja. Pastikan foto KTP dan selfie Anda jelas dan tidak terpotong.",
  },
  {
    q: "Apa keuntungan Kahade+?",
    a: "Kahade+ memberikan biaya platform lebih rendah, badge khusus, prioritas customer support, dan limit transaksi yang lebih tinggi.",
  },
]

export default function BantuanPage() {
  usePageTitle("Bantuan")
  const { data: publicConfigs } = usePublicConfig()
  const [search, setSearch] = React.useState("")

  const supportEmail = (publicConfigs as Array<{ key: string; value: string }> | undefined)?.find((c) => c.key === "supportEmail")?.value ?? "support@kahade.id"
  const supportPhone = (publicConfigs as Array<{ key: string; value: string }> | undefined)?.find((c) => c.key === "supportPhone")?.value ?? "+62 812-3456-7890"
  const supportWhatsApp = supportPhone.replace(/[^0-9+]/g, "").replace(/^\+/, "")

  const filteredFaq = FAQ_ITEMS.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Pusat Bantuan" description="Temukan jawaban untuk pertanyaan Anda" />

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pertanyaan..."
          className="pl-9"
          data-testid="input-bantuan-search"
        />
      </div>

      <Card className="py-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
              <Question className="size-5 text-foreground/70" />
            </div>
            <CardTitle>Pertanyaan yang Sering Diajukan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFaq.length === 0 ? (
            <EmptyState
              title="Tidak Ditemukan"
              description="Tidak ada pertanyaan yang sesuai dengan pencarian Anda."
              icon={<Question className="size-8" />}
            />
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaq.map((item) => (
                <AccordionItem key={item.q} value={item.q} className="border-b border-border last:border-0">
                  <AccordionTrigger className="py-4 text-left text-sm font-medium hover:no-underline">{item.q}</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader>
          <CardTitle>Hubungi Kami</CardTitle>
          <CardDescription>Masih butuh bantuan? Tim kami siap membantu Anda</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <a href={`mailto:${supportEmail}`} className="group flex items-center gap-4 rounded-xl border-2 border-border p-5 transition-all hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm" data-testid="link-support-email">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
              <Envelope className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Email</p>
              <p className="text-xs text-muted-foreground">{supportEmail}</p>
            </div>
          </a>
          <a href={`https://wa.me/${supportWhatsApp}`} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-xl border-2 border-border p-5 transition-all hover:bg-emerald-500/5 hover:border-emerald-500/30 hover:shadow-sm" data-testid="link-support-whatsapp">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/15">
              <ChatCircle className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">WhatsApp</p>
              <p className="text-xs text-muted-foreground">{supportPhone}</p>
            </div>
          </a>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
