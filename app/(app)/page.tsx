// Phase 2 FIX: Dashboard dipindah ke /beranda.
// File ini sebagai safety redirect jika ada yang mengakses / langsung
// (bookmark lama, link hardcoded, dll).
import { redirect } from "next/navigation"

export default function OldDashboardRoot() {
  redirect("/beranda")
}
