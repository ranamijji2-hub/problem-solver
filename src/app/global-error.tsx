"use client";

/**
 * Catches errors in the root layout itself (a rarer case than error.tsx,
 * which only catches errors in page content below the layout). Next.js
 * requires this file to render its own <html>/<body> since the layout
 * that would normally provide them is what's failing. Deliberately
 * minimal — this can't depend on the app's own layout, fonts, or theme
 * provider, since any of those could be what's broken.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ marginTop: "0.5rem", color: "#666", maxWidth: "24rem" }}>
            This wasn&apos;t your fault. Try again, or head back to the homepage.
          </p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={reset}
              style={{ padding: "0.625rem 1.25rem", background: "#2B3A67", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{ padding: "0.625rem 1.25rem", border: "1px solid #ccc", borderRadius: "3px", color: "inherit", textDecoration: "none" }}
            >
              Go to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
