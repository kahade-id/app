"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  User, ArrowRight, ArrowLeft, X,
  ShoppingCart, Wrench, Desktop, Package,
  CheckCircle,
} from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CurrencyInput } from "@/components/shared"
import { FeeCalculator } from "./FeeCalculator"
import { useCreateTransaction, useCalculateFee } from "@/lib/hooks/use-transactions"
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations/transaction.schema"
import { getApiErrorMessage } from "@/lib/api"
import { formatIDR } from "@/lib/currency"
import type { FeeBreakdown } from "@/types/transaction"

// ── Tokens ────────────────────────────────────────────────────
const SHEET_PAD = 20

// ── Role option ───────────────────────────────────────────────
const ROLES = [
  { value: "BUYER",  label: "Pembeli",  desc: "Saya akan membayar"  },
  { value: "SELLER", label: "Penjual",  desc: "Saya akan menerima"  },
] as const

// ── Order type option ─────────────────────────────────────────
const ORDER_TYPES = [
  { value: "PHYSICAL_GOODS", label: "Barang Fisik",    icon: ShoppingCart },
  { value: "DIGITAL_GOODS",  label: "Barang Digital",  icon: Desktop      },
  { value: "SERVICE",        label: "Jasa",            icon: Wrench       },
  { value: "OTHER",          label: "Lainnya",         icon: Package      },
] as const

// ── Fee responsibility option ─────────────────────────────────
const FEE_OPTIONS = [
  { value: "BUYER",  label: "Pembeli" },
  { value: "SELLER", label: "Penjual" },
  { value: "SPLIT",  label: "Bagi Rata" },
] as const

// ── Step indicator ────────────────────────────────────────────
function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 justify-center" style={{ marginBottom: 4 }}>
      {[1, 2, 3].map((s) => (
        <motion.div
          key={s}
          animate={{
            width:      s === step ? 20 : 6,
            background: s === step ? "#0f0f0f" : s < step ? "#0f0f0f" : "#e0e0e0",
            opacity:    s <= step ? 1 : 0.4,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 36 }}
          style={{ height: 6, borderRadius: 999 }}
        />
      ))}
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10.5, fontWeight: 700,
      color: "#9e9e9e", letterSpacing: "0.08em",
      textTransform: "uppercase", marginBottom: 10,
    }}>
      {children}
    </p>
  )
}

// ── Chip selector ─────────────────────────────────────────────
function ChipGroup<T extends string>({
  options, value, onChange,
}: {
  options: readonly { value: T; label: string; desc?: string; icon?: React.ElementType }[]
  value: T | undefined
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = value === opt.value
        const Icon = opt.icon
        return (
          <motion.button
            key={opt.value}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(opt.value)}
            style={{
              flex: opt.desc ? 1 : "unset",
              minWidth: opt.desc ? 120 : "unset",
              display: "flex",
              flexDirection: opt.desc ? "column" : "row",
              alignItems: opt.desc ? "flex-start" : "center",
              gap: opt.icon && !opt.desc ? 6 : 4,
              padding: opt.desc ? "12px 14px" : "8px 14px",
              borderRadius: 14,
              border: `1.5px solid ${active ? "#0f0f0f" : "#e8e8e8"}`,
              background: active ? "#0f0f0f" : "#fafafa",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {Icon && (
              <Icon
                size={opt.desc ? 18 : 16}
                weight={active ? "fill" : "bold"}
                style={{ color: active ? "#fff" : "#757575", marginBottom: opt.desc ? 4 : 0 }}
              />
            )}
            <span style={{
              fontSize: opt.desc ? 13 : 12.5,
              fontWeight: 600,
              color: active ? "#fff" : "#0f0f0f",
              lineHeight: 1.2,
            }}>
              {opt.label}
            </span>
            {opt.desc && (
              <span style={{ fontSize: 11, color: active ? "rgba(255,255,255,0.7)" : "#9e9e9e" }}>
                {opt.desc}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
interface CreateTransactionSheetProps {
  open: boolean
  onClose: () => void
}

export function CreateTransactionSheet({ open, onClose }: CreateTransactionSheetProps) {
  const [step, setStep] = React.useState(1)
  const [feeData, setFeeData] = React.useState<FeeBreakdown | null>(null)
  const [dir, setDir] = React.useState(1) // 1=forward, -1=back

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
  const feeMutation    = useCalculateFee()

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1)
        setFeeData(null)
        form.reset()
      }, 350)
    }
  }, [open, form])

  function goTo(next: number) {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  async function handleStep1Next() {
    const valid = await form.trigger(["role", "counterpartUsername"])
    if (!valid) return
    goTo(2)
  }

  async function handleStep2Next() {
    const valid = await form.trigger([
      "title", "description", "orderType",
      "orderValue", "deliveryDeadlineDays", "feeResponsibility",
    ])
    if (!valid) return

    const values = form.getValues()
    feeMutation.mutate(
      {
        orderValue: values.orderValue,
        feeResponsibility: values.feeResponsibility,
        voucherCode: values.voucherCode || undefined,
      },
      {
        onSuccess: ({ data: res }) => {
          if (res.data) setFeeData(res.data)
          goTo(3)
        },
      }
    )
  }

  async function handleConfirm() {
    const valid = await form.trigger()
    if (!valid) return
    const values = form.getValues()
    createMutation.mutate({
      title:                values.title,
      description:          values.description,
      orderType:            values.orderType,
      orderValue:           values.orderValue,
      deliveryDeadlineDays: values.deliveryDeadlineDays,
      counterpartUsername:  values.counterpartUsername,
      role:                 values.role,
      feeResponsibility:    values.feeResponsibility,
      voucherCode:          values.voucherCode || undefined,
    }, {
      onSuccess: () => onClose(),
    })
  }

  const STEP_TITLES = ["Peran & Lawan Transaksi", "Detail Transaksi", "Konfirmasi"]
  const STEP_SUBS   = ["Tentukan posisi Anda", "Lengkapi informasi", "Periksa & buat transaksi"]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            key="sheet-scrim"
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onPointerDown={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Buat Transaksi Baru"
            className="fixed bottom-0 left-0 right-0 z-[60]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 40, mass: 1 }}
            style={{
              background:           "rgba(255,255,255,0.98)",
              backdropFilter:       "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderTopLeftRadius:  28,
              borderTopRightRadius: 28,
              boxShadow:            "0 -8px 40px rgba(0,0,0,0.14)",
              maxHeight:            "90dvh",
              display:              "flex",
              flexDirection:        "column",
            }}
          >
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 999, background: "#e0e0e0" }} />
            </div>

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "flex-start",
              padding: `10px ${SHEET_PAD}px 14px`,
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}>
              <div style={{ flex: 1 }}>
                <StepDots step={step} />
                <p style={{ fontSize: 17, fontWeight: 700, color: "#0f0f0f", marginTop: 8, lineHeight: 1.2 }}>
                  {STEP_TITLES[step - 1]}
                </p>
                <p style={{ fontSize: 12.5, color: "#9e9e9e", marginTop: 3 }}>
                  {STEP_SUBS[step - 1]}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 999,
                  background: "#f2f2f2", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 16, flexShrink: 0,
                }}
                aria-label="Tutup"
              >
                <X size={16} weight="bold" style={{ color: "#525252" }} />
              </button>
            </div>

            {/* Step content */}
            <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}>
              <AnimatePresence mode="wait" custom={dir}>
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -40 }}
                    transition={{ type: "spring", stiffness: 480, damping: 38 }}
                    style={{ padding: `${SHEET_PAD}px ${SHEET_PAD}px 0` }}
                  >
                    <Form {...form}>
                      <div className="space-y-5">
                        {/* Role */}
                        <FormField control={form.control} name="role" render={({ field }) => (
                          <FormItem>
                            <SectionLabel>Peran Anda</SectionLabel>
                            <ChipGroup
                              options={ROLES}
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Counterpart */}
                        <FormField control={form.control} name="counterpartUsername" render={({ field }) => (
                          <FormItem>
                            <SectionLabel>Username Lawan Transaksi</SectionLabel>
                            <div style={{ position: "relative" }}>
                              <User
                                size={16} weight="bold"
                                style={{
                                  position: "absolute", left: 12, top: "50%",
                                  transform: "translateY(-50%)", color: "#9e9e9e",
                                  pointerEvents: "none",
                                }}
                              />
                              <FormControl>
                                <Input
                                  placeholder="contoh: budi_santoso"
                                  data-testid="input-counterpart-username"
                                  {...field}
                                  style={{ paddingLeft: 34 }}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </Form>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -40 }}
                    transition={{ type: "spring", stiffness: 480, damping: 38 }}
                    style={{ padding: `${SHEET_PAD}px ${SHEET_PAD}px 0` }}
                  >
                    <Form {...form}>
                      <div className="space-y-5">
                        {/* Title */}
                        <FormField control={form.control} name="title" render={({ field }) => (
                          <FormItem>
                            <SectionLabel>Judul Transaksi</SectionLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Pembelian iPhone 15 Pro" data-testid="input-transaction-title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Description */}
                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem>
                            <SectionLabel>Deskripsi</SectionLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Deskripsi detail transaksi..."
                                data-testid="textarea-transaction-description"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Order type */}
                        <FormField control={form.control} name="orderType" render={({ field }) => (
                          <FormItem>
                            <SectionLabel>Jenis Transaksi</SectionLabel>
                            <ChipGroup
                              options={ORDER_TYPES}
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Value */}
                        <FormField control={form.control} name="orderValue" render={({ field }) => (
                          <FormItem>
                            <SectionLabel>Nilai Transaksi</SectionLabel>
                            <FormControl>
                              <CurrencyInput
                                value={field.value}
                                onChange={field.onChange}
                                min={10000}
                                max={1000000000}
                                data-testid="input-order-value"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Deadline */}
                        <FormField control={form.control} name="deliveryDeadlineDays" render={({ field }) => (
                          <FormItem>
                            <SectionLabel>Batas Waktu Pengiriman (hari)</SectionLabel>
                            <FormControl>
                              <Input
                                type="number" min={1} max={30}
                                data-testid="input-delivery-deadline"
                                {...field}
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

                        {/* Fee responsibility */}
                        <FormField control={form.control} name="feeResponsibility" render={({ field }) => (
                          <FormItem>
                            <SectionLabel>Penanggung Biaya</SectionLabel>
                            <ChipGroup
                              options={FEE_OPTIONS}
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Voucher */}
                        <FormField control={form.control} name="voucherCode" render={({ field }) => (
                          <FormItem>
                            <SectionLabel>Kode Voucher (Opsional)</SectionLabel>
                            <FormControl>
                              <Input
                                placeholder="Masukkan kode voucher"
                                className="uppercase"
                                data-testid="input-voucher-code"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {feeMutation.isError && (
                          <p style={{ fontSize: 12.5, color: "#dc2626" }}>
                            {getApiErrorMessage(feeMutation.error, "Gagal menghitung biaya.")}
                          </p>
                        )}
                      </div>
                    </Form>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -40 }}
                    transition={{ type: "spring", stiffness: 480, damping: 38 }}
                    style={{ padding: `${SHEET_PAD}px ${SHEET_PAD}px 0` }}
                  >
                    <div className="space-y-4">
                      {/* Summary */}
                      <div style={{ background: "#f7f7f7", borderRadius: 16, padding: "14px 16px" }}>
                        <SectionLabel>Ringkasan</SectionLabel>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            ["Peran",        form.getValues("role") === "BUYER" ? "Pembeli" : "Penjual"],
                            ["Lawan",        `@${form.getValues("counterpartUsername")}`],
                            ["Judul",        form.getValues("title")],
                            ["Jenis",        ORDER_TYPES.find(t => t.value === form.getValues("orderType"))?.label ?? "-"],
                            ["Nilai",        formatIDR(form.getValues("orderValue"))],
                            ["Deadline",     `${form.getValues("deliveryDeadlineDays")} hari`],
                            ["Penanggung",   FEE_OPTIONS.find(f => f.value === form.getValues("feeResponsibility"))?.label ?? "-"],
                          ].map(([label, val]) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                              <span style={{ color: "#9e9e9e" }}>{label}</span>
                              <span style={{ fontWeight: 600, color: "#0f0f0f", textAlign: "right", maxWidth: "60%" }}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fee breakdown */}
                      <FeeCalculator feeData={feeData} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer CTA */}
            <div style={{
              padding: `14px ${SHEET_PAD}px`,
              paddingBottom: `calc(14px + env(safe-area-inset-bottom))`,
              borderTop: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              gap: 10,
            }}>
              {step > 1 && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goTo(step - 1)}
                  style={{
                    width: 48, height: 52, borderRadius: 14,
                    border: "1.5px solid #e8e8e8", background: "#fafafa",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", flexShrink: 0,
                  }}
                  aria-label="Kembali"
                >
                  <ArrowLeft size={18} weight="bold" style={{ color: "#525252" }} />
                </motion.button>
              )}

              {step === 1 && (
                <Button
                  type="button"
                  className="flex-1 h-[52px] rounded-2xl text-[15px] font-semibold"
                  onClick={handleStep1Next}
                  data-testid="button-step1-next"
                >
                  Lanjutkan <ArrowRight size={16} weight="bold" />
                </Button>
              )}

              {step === 2 && (
                <Button
                  type="button"
                  className="flex-1 h-[52px] rounded-2xl text-[15px] font-semibold"
                  onClick={handleStep2Next}
                  disabled={feeMutation.isPending}
                  data-testid="button-step2-next"
                >
                  {feeMutation.isPending ? "Menghitung biaya..." : <>Hitung Biaya <ArrowRight size={16} weight="bold" /></>}
                </Button>
              )}

              {step === 3 && (
                <Button
                  type="button"
                  className="flex-1 h-[52px] rounded-2xl text-[15px] font-semibold"
                  onClick={handleConfirm}
                  disabled={createMutation.isPending}
                  data-testid="button-create-transaction"
                >
                  {createMutation.isPending
                    ? "Membuat transaksi..."
                    : <><CheckCircle size={18} weight="fill" /> Buat Transaksi</>
                  }
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
