"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { House, ArrowLeft } from "@phosphor-icons/react";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(ROUTES.DASHBOARD);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-background flex items-center">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mx-auto mb-8 border border-border">
            <span className="text-5xl font-bold text-muted-foreground">
              404
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-muted-foreground mb-8">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={ROUTES.DASHBOARD}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <House className="w-4 h-4" />
              Ke Dashboard
            </Link>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke halaman sebelumnya
          </button>
        </div>
      </div>
    </main>
  );
}
