"use client";

import { getBackendUrl } from "@/lib/backend-url";




import { useState } from "react";
import { Button } from "@/components/ui/button";

export function WhatsAppRetryButton({ disabled }: { disabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRetry() {
    setLoading(true);
    setMessage(null);
    try {
        const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/whatsapp/retry`, {
        method: "POST",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? `Retry failed (${response.status})`);
      } else {
        setMessage(`Retried ${data.retried ?? 0} failed deliveries.`);
      }
    } catch (error) {
      setMessage(`Retry request failed: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleRetry} disabled={disabled || loading}>
        {loading ? "Retrying…" : "Retry failed sends"}
      </Button>
      {message ? <p className="text-xs text-muted">{message}</p> : null}
    </div>
  );
}
