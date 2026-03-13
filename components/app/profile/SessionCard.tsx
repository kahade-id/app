"use client"

import { Monitor, DeviceMobile, DeviceTablet, Trash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRelative } from "@/lib/date"
import type { UserSession } from "@/types/auth"

function parseDeviceInfo(raw?: string | null): string {
  if (!raw) return "Perangkat tidak dikenal"
  const ua = raw.toLowerCase()
  let browser = "Browser"
  if (ua.includes("edg/") || ua.includes("edge")) browser = "Edge"
  else if (ua.includes("opr/") || ua.includes("opera")) browser = "Opera"
  else if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome"
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari"
  else if (ua.includes("firefox")) browser = "Firefox"
  let os = ""
  if (ua.includes("windows")) os = "Windows"
  else if (ua.includes("macintosh") || ua.includes("mac os")) os = "macOS"
  else if (ua.includes("iphone")) os = "iPhone"
  else if (ua.includes("ipad")) os = "iPad"
  else if (ua.includes("android")) os = "Android"
  else if (ua.includes("linux")) os = "Linux"
  if (!os) return raw.length > 50 ? `${browser}` : raw
  return `${browser} · ${os}`
}

function isMobileDevice(deviceInfo?: string | null): boolean {
  if (!deviceInfo) return false
  const ua = deviceInfo.toLowerCase()
  return ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")
}

function isTabletDevice(deviceInfo?: string | null): boolean {
  if (!deviceInfo) return false
  const ua = deviceInfo.toLowerCase()
  return ua.includes("tablet") || ua.includes("ipad")
}

interface SessionCardProps {
  session: UserSession
  onRevoke: (id: string) => void
}

export function SessionCard({ session, onRevoke }: SessionCardProps) {
  const mobile = isMobileDevice(session.deviceInfo)
  const tablet = isTabletDevice(session.deviceInfo)

  return (
    <Card className="py-0 transition-colors hover:border-foreground/20">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
            {mobile ? (
              <DeviceMobile className="size-5 text-foreground/70" />
            ) : tablet ? (
              <DeviceTablet className="size-5 text-foreground/70" />
            ) : (
              <Monitor className="size-5 text-foreground/70" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{parseDeviceInfo(session.deviceInfo)}</p>
              {!session.isCurrentSession && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  {mobile ? "Mobile" : tablet ? "Tablet" : "Desktop"}
                </Badge>
              )}
              {session.isCurrentSession && (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Sesi Ini</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">IP: {session.ipAddress ? session.ipAddress.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, "$1.$2.***.$4") : "-"}</p>
            <p className="text-xs text-muted-foreground">Terakhir aktif {formatRelative(session.lastActiveAt)}</p>
          </div>
        </div>
        {!session.isCurrentSession && (
          <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:bg-destructive/10" onClick={() => onRevoke(session.id)} data-testid={`button-revoke-session-${session.id}`}>
            <Trash className="size-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export { parseDeviceInfo }
