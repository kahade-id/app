"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { UploadSimple, X, File } from "@phosphor-icons/react"
import { Button } from "../ui/button"

interface FileUploadProps {
  value?: File | File[] | null
  onChange: (files: File | File[] | null) => void
  accept?: string[]
  maxSizeMB?: number
  multiple?: boolean
  label?: string
  description?: string
  className?: string
  disabled?: boolean
}

export function FileUpload({
  value,
  onChange,
  accept,
  maxSizeMB = 5,
  multiple = false,
  label = "Unggah File",
  description,
  className,
  disabled,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [dragActive, setDragActive] = React.useState(false)

  const files = value ? (Array.isArray(value) ? value : [value]) : []

  const matchesAccept = (fileType: string, acceptPatterns: string[]): boolean => {
    return acceptPatterns.some(pattern => {
      if (pattern.endsWith('/*')) {
        return fileType.startsWith(pattern.replace('/*', '/'))
      }
      return pattern === fileType
    })
  }

  const validateAndSet = (fileList: FileList | null) => {
    if (!fileList?.length) return
    setError(null)

    const selected = Array.from(fileList)
    for (const file of selected) {
      if (accept?.length && !matchesAccept(file.type, accept)) {
        setError("Tipe file tidak didukung")
        return
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Ukuran file maks ${maxSizeMB}MB`)
        return
      }
    }

    onChange(multiple ? selected : selected[0])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (!disabled) validateAndSet(e.dataTransfer.files)
  }

  const removeFile = (idx: number) => {
    const next = files.filter((_, i) => i !== idx)
    onChange(multiple ? (next.length ? next : null) : null)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !disabled) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload file area"
      >
        <UploadSimple className="mb-2 size-8 text-muted-foreground" />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {description ?? `Maks ${maxSizeMB}MB`}
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept?.join(",")}
          multiple={multiple}
          onChange={(e) => validateAndSet(e.target.files)}
          disabled={disabled}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 rounded-md border p-2 text-sm"
            >
              <File className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                aria-label={`Hapus file ${file.name}`}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
