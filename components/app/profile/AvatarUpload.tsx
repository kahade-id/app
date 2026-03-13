"use client"

import * as React from "react"
import Image from "next/image"
import { Camera, Trash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUploadAvatar, useConfirmAvatar, useDeleteAvatar } from "@/lib/hooks/use-user"
import { ACCEPTED_IMAGE_TYPES, MAX_AVATAR_SIZE_MB } from "@/lib/constants"
import { toast } from "sonner"

interface AvatarUploadProps {
  avatarUrl: string | null
  fullName: string
}

export function AvatarUpload({ avatarUrl, fullName }: AvatarUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [showDialog, setShowDialog] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const uploadAvatar = useUploadAvatar()
  const confirmAvatar = useConfirmAvatar()
  const deleteAvatar = useDeleteAvatar()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.")
      return
    }

    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran file melebihi batas ${MAX_AVATAR_SIZE_MB}MB`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
      setSelectedFile(file)
      setShowDialog(true)
    }
    reader.readAsDataURL(file)
  }

  const handleConfirm = () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append("avatar", selectedFile)
    uploadAvatar.mutate(formData, {
      onSuccess: (res) => {
        // #001 FIX: Use fileKey (storage path) NOT avatarUrl (public CDN URL).
        // avatarUrl is the CDN link; fileKey is the internal storage identifier
        // required by the /users/me/avatar/confirm endpoint.
        const key = res?.data?.data?.fileKey
        if (key) {
          confirmAvatar.mutate({ fileKey: key }, {
            onSuccess: () => {
              setShowDialog(false)
              setPreview(null)
              setSelectedFile(null)
            },
          })
        } else {
          toast.error("Gagal mendapatkan file key. Silakan coba lagi.")
        }
      },
    })
  }

  // #068 FIX: Safe initials — filter empty tokens and guard against missing char
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
          {avatarUrl ? (
            // #042 FIX: Use Next.js <Image> for optimization (WebP, lazy loading)
            <Image
              src={avatarUrl}
              alt={`Avatar ${fullName}`}
              width={64}
              height={64}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-muted-foreground">{initials}</span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute -bottom-1 -right-1 size-7 rounded-full"
          onClick={() => inputRef.current?.click()}
          data-testid="button-upload-avatar"
        >
          <Camera className="size-3.5" />
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {avatarUrl && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => deleteAvatar.mutate()}
          disabled={deleteAvatar.isPending}
          data-testid="button-delete-avatar"
        >
          <Trash className="mr-1.5 size-3.5" />
          Hapus
        </Button>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Avatar</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {preview && (
              // #042 FIX: use Next.js Image for preview too
              <Image
                src={preview}
                alt={`Preview avatar ${fullName}`}
                width={128}
                height={128}
                className="size-32 rounded-full object-cover"
              />
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowDialog(false)} data-testid="button-cancel-avatar">
              Batal
            </Button>
            <Button className="flex-1" onClick={handleConfirm} disabled={uploadAvatar.isPending || confirmAvatar.isPending} data-testid="button-confirm-avatar">
              {uploadAvatar.isPending ? "Mengunggah..." : confirmAvatar.isPending ? "Menyimpan..." : "Konfirmasi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
