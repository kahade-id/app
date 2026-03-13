"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User } from "@phosphor-icons/react"
import { formatDate } from "@/lib/date"
import { MEMBERSHIP_RANK_LABELS } from "@/lib/constants"
import type { AuthUser } from "@/types/auth"

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  PERSONAL: "Personal",
  BUSINESS: "Bisnis",
}

// #016 FIX: Integrated Zod schema — replaces manual validation.
// #030 FIX: Standardised fullName max to 60 chars (matches registerSchema).
// Using 60 to stay consistent with what the database column was created with.
const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(60, "Nama maksimal 60 karakter"),
  bio: z.string().max(500, "Bio maksimal 500 karakter").optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  user: AuthUser
  onSave: (data: { fullName: string; bio?: string }) => void
  isPending: boolean
}

export function ProfileForm({ user, onSave, isPending }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user.fullName ?? "",
      bio: user.bio ?? "",
    },
  })

  // #029 FIX: Use primitive values (id + specific fields) as deps, not the whole user object.
  // Previously `[user]` caused the form to reset on every background TanStack Query refetch
  // because each refetch produces a new object reference, wiping unsaved edits.
  React.useEffect(() => {
    reset({
      fullName: user.fullName ?? "",
      bio: user.bio ?? "",
    })
  }, [user.id, user.fullName, user.bio, reset])

  const bio = watch("bio") ?? ""
  const fullName = watch("fullName") ?? ""

  const onSubmit = (values: ProfileFormValues) => {
    onSave({ fullName: values.fullName, bio: values.bio || undefined })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
            <User className="size-4 text-foreground/70" />
          </div>
          Informasi Profil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
            <Input value={user.email} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Username</Label>
            <Input value={user.username || "-"} disabled className="bg-muted/50" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="fullName"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Nama Lengkap
            </Label>
            {/* #087 FIX: Added character counter for fullName field */}
            <span className="text-xs text-muted-foreground">{fullName.length}/60</span>
          </div>
          <Input
            id="fullName"
            {...register("fullName")}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            className={errors.fullName ? "border-destructive" : ""}
            data-testid="input-full-name"
          />
          {errors.fullName && (
            <p id="fullName-error" role="alert" className="text-xs text-destructive">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="bio"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Bio
            </Label>
            <span className="text-xs text-muted-foreground">{bio.length}/500</span>
          </div>
          <Textarea
            id="bio"
            {...register("bio")}
            placeholder="Tulis bio Anda..."
            rows={3}
            maxLength={500}
            aria-invalid={!!errors.bio}
            aria-describedby={errors.bio ? "bio-error" : undefined}
            data-testid="textarea-bio"
          />
          {errors.bio && (
            <p id="bio-error" role="alert" className="text-xs text-destructive">
              {errors.bio.message}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tipe Akun</p>
            <p className="text-sm font-medium">{ACCOUNT_TYPE_LABELS[user.accountType] || user.accountType}</p>
          </div>
          <div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Membership</p>
            <p className="text-sm font-medium">{MEMBERSHIP_RANK_LABELS[user.membershipRank] || user.membershipRank}</p>
          </div>
          <div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bergabung</p>
            <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending || !isDirty}
            data-testid="button-save-profile"
          >
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
