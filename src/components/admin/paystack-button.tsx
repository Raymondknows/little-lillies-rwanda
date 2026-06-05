"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => void;
    };
  }
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Window is undefined"));
    }
    if (window.PaystackPop) {
      return resolve();
    }
    const existing = document.querySelector("script[src='https://js.paystack.co/v1/inline.js']");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Paystack script failed to load.")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Paystack script failed to load."));
    document.body.appendChild(script);
  });
}

interface PaystackButtonProps {
  invoiceId: string;
  amountMinor: number;
  currency: string;
  invoiceNo: string;
  email: string;
  name: string;
}

export function PaystackButton({
  invoiceId,
  amountMinor,
  currency,
  invoiceNo,
  email,
  name,
}: PaystackButtonProps) {
  const envPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  const [publicKey, setPublicKey] = useState<string | null>(envPublicKey ?? null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountKobo = useMemo(() => amountMinor, [amountMinor]);
  const callbackUrl = useMemo(
    () => `${appUrl}/api/paystack/verify`,
    [appUrl],
  );

  useEffect(() => {
    let mounted = true;
    // Try to fetch per-school public key (requires staff session)
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        const cfgKey = d?.config?.paystackPublic ?? null;
        if (cfgKey) setPublicKey(cfgKey);
      })
      .catch(() => {});

    if (!publicKey) return;
    loadPaystackScript()
      .then(() => setReady(true))
      .catch((err) => setError(err.message));

    return () => {
      mounted = false;
    };
  }, [publicKey]);

  const pay = useCallback(async () => {
    if (!publicKey) return;
    setError(null);
    setLoading(true);

    try {
      await loadPaystackScript();
      if (!window.PaystackPop) {
        throw new Error("Paystack checkout is unavailable.");
      }

      window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: amountKobo,
        currency,
        ref: `${invoiceNo}-${Date.now()}`,
        metadata: {
          custom_fields: [
            { display_name: "Invoice", variable_name: "invoice_no", value: invoiceNo },
            { display_name: "Invoice ID", variable_name: "invoice_id", value: invoiceId },
          ],
        },
        onClose: () => {
          setLoading(false);
        },
        callback: async (response: { reference: string }) => {
          try {
            const verify = await fetch(callbackUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                reference: response.reference,
                invoiceId,
              }),
            });
            const data = await verify.json();
            if (data.success) {
              window.location.href = "/admin/fees";
              return;
            }
            setError(data.error || "Could not verify payment.");
          } catch (err) {
            setError((err as Error).message || "Verification failed.");
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (err) {
      setError((err as Error).message || "Unable to start payment.");
      setLoading(false);
    }
  }, [amountKobo, callbackUrl, currency, email, invoiceId, invoiceNo, publicKey]);

  if (!publicKey) return null;

  return (
    <div className="space-y-2 text-right">
      <Button type="button" onClick={pay} disabled={loading || !ready} variant="secondary">
        {loading ? "Opening Paystack…" : "Pay online"}
      </Button>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
