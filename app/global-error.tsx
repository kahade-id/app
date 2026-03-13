"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // L-8 FIX: Error tracking is required in production. Currently only console.error
    // in development — production errors are invisible without a monitoring service.
    // TODO: Install @sentry/nextjs and replace the comment below with:
    //   import * as Sentry from '@sentry/nextjs'
    //   Sentry.captureException(error)
    // See: https://docs.sentry.io/platforms/javascript/guides/nextjs/
    if (process.env.NODE_ENV !== "production") {
      console.error("[GlobalError]", error)
    }
    // PRODUCTION ERROR TRACKING NOT YET CONFIGURED — add Sentry here
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          colorScheme: "light dark",
          backgroundColor: "Canvas",
          color: "CanvasText",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div style={{ maxWidth: 400, textAlign: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "color-mix(in srgb, red 10%, Canvas)",
                border: "1px solid color-mix(in srgb, red 25%, Canvas)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <svg
                width="32"
                height="32"
                fill="none"
                stroke="red"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Terjadi Kesalahan Kritis
            </h1>
            <p style={{ opacity: 0.7, marginBottom: "0.5rem" }}>
              Aplikasi mengalami masalah tak terduga. Coba muat ulang halaman.
            </p>
            {error.digest && (
              <p
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.5,
                  background: "color-mix(in srgb, CanvasText 8%, Canvas)",
                  borderRadius: 8,
                  padding: "0.5rem 0.75rem",
                  fontFamily: "monospace",
                  marginBottom: "1.5rem",
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={reset}
                data-testid="button-retry-error"
                style={{
                  background: "CanvasText",
                  color: "Canvas",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Coba Lagi
              </button>
              <a
                href="/"
                data-testid="link-go-dashboard"
                style={{
                  background: "Canvas",
                  color: "CanvasText",
                  border: "1px solid color-mix(in srgb, CanvasText 20%, Canvas)",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                Ke Dashboard
              </a>
            </div>
            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid color-mix(in srgb, CanvasText 10%, Canvas)" }}>
              <p style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                Butuh bantuan?{" "}
                <a href="mailto:support@kahade.id" style={{ color: "CanvasText", textDecoration: "underline" }}>
                  support@kahade.id
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
