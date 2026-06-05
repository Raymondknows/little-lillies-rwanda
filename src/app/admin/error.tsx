"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isAuthError = error.message.includes("log in again") || 
                      error.message.includes("UNAUTHORIZED") ||
                      error.message.includes("session");
  
  return (
    <div className="rounded-xl border border-error/30 bg-surface p-8 text-center">
      <h2 className="text-lg font-semibold text-foreground">
        {isAuthError ? "Session Expired" : "Something went wrong"}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {isAuthError 
          ? "Your session has expired. Please log in again to continue."
          : error.message.includes("not found")
          ? "Database may be empty. Run: npm run db:seed"
          : error.message.includes("Encryption key")
          ? "Server configuration error: Missing encryption key. Contact your administrator."
          : error.message.includes("Unable to load")
          ? error.message
          : error.message.includes("School not found")
          ? "Could not load your school information. Please ensure you're accessing the correct URL."
          : "Check that the database is running and .env is correct."}
      </p>
      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-xs text-muted">Debug info</summary>
          <pre className="mt-2 overflow-auto rounded bg-background p-2 text-xs">{error.message}</pre>
        </details>
      )}
      <div className="mt-6 flex gap-4 justify-center">
        {isAuthError ? (
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        ) : (
          <Button onClick={reset}>Try again</Button>
        )}
      </div>
    </div>
  );
}

