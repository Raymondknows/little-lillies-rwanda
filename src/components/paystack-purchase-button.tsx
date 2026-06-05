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

    const existing = document.querySelector(
      "script[src='https://js.paystack.co/v1/inline.js']",
    );

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

interface PaystackPurchaseButtonProps {
  amountMinor: number;
  currency: string;
  email: string;
  name: string;
  plan: string;
  schoolName: string;
  slug?: string;
  phone: string;
  disabled?: boolean;
  isSubscription?: boolean;
}

export function PaystackPurchaseButton({
  amountMinor,
  currency,
  email,
  name,
  plan,
  schoolName,
  slug,
  phone,
  disabled = false,
  isSubscription = false,
}: PaystackPurchaseButtonProps) {
  // For subscriptions, use ClickBase's dedicated key; for school fees, use the general key
  const envPublicKey = isSubscription 
    ? process.env.NEXT_PUBLIC_PAYSTACK_SUBSCRIPTION_PUBLIC_KEY 
    : process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  const [publicKey, setPublicKey] = useState<string | null>(envPublicKey ?? null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  const callbackUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/paystack/purchase`;
    }
    return `${appUrl}/api/paystack/purchase`;
  }, [appUrl]);

  useEffect(() => {
    // For subscription payments, only use ClickBase's public key (never fetch school keys)
    // For school fee payments, try to fetch per-school public key; fall back to env key
    let mounted = true;
    
    if (!isSubscription) {
      fetch("/api/admin/settings")
        .then((r) => r.json())
        .then((d) => {
          if (!mounted) return;
          const cfgKey = d?.config?.paystackPublic ?? null;
          if (cfgKey) setPublicKey(cfgKey);
        })
        .catch(() => {});
    }

    if (!publicKey) return;
    loadPaystackScript()
      .then(() => setReady(true))
      .catch((err) => setError(err.message));

    if (!country) {
      fetch('/api/country/config')
        .then(r => r.json())
        .then(d => setCountry(d?.country ?? null))
        .catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, [publicKey, isSubscription]);

  const verifyPayment = useCallback(
    async (reference: string) => {
      try {
        const verify = await fetch(callbackUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference,
            plan,
            schoolName,
            // include slug if provided for provisioning
            slug: slug ?? undefined,
            email,
            name,
            phone,
            currency,
            amountMinor,
          }),
        });
        const data = await verify.json();
        if (data.success) {
          window.location.href = "/purchase/success";
          return;
        }
        setError(data.error || "Could not verify payment.");
      } catch (err) {
        setError((err as Error).message || "Verification failed.");
      } finally {
        setLoading(false);
      }
    },
    [amountMinor, callbackUrl, currency, email, name, phone, plan, schoolName],
  );

  const pay = useCallback(async () => {
    if (!publicKey) return;
    setError(null);
    setLoading(true);

    try {
      if (isSubscription) {
        // Use server-side initialization and redirect to Paystack hosted checkout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        try {
          const res = await fetch("/api/paystack/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amountMinor, email, plan, schoolName, name, phone, currency }),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          
          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || `HTTP ${res.status}: Failed to initialize Paystack.`);
          }
          
          const data = await res.json();
          if (!data.authorization_url) {
            throw new Error("No payment URL returned from server.");
          }
          
          // Redirect user to Paystack hosted payment page
          // The authorization_url already contains all necessary parameters
          window.location.href = data.authorization_url;
          return;
        } catch (fetchErr: unknown) {
          clearTimeout(timeout);
          if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
            throw new Error("Payment initialization timed out. Please check your connection and try again.");
          }
          throw fetchErr;
        }
      }

      // Fallback: inline checkout for non-subscription (per-school) payments
      await loadPaystackScript();
      if (!window.PaystackPop) {
        throw new Error("Paystack checkout is unavailable.");
      }

      window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: amountMinor,
        currency,
        ref: `SUB-${Date.now()}-${Math.round(Math.random() * 1000000)}`,
        metadata: {
          custom_fields: [
            { display_name: "Plan", variable_name: "plan", value: plan },
            { display_name: "School name", variable_name: "school_name", value: schoolName },
            { display_name: "School slug", variable_name: "school_slug", value: ("" + (slug ?? "")).trim() },
            { display_name: "Contact", variable_name: "contact_name", value: name },
            { display_name: "Contact email", variable_name: "contact_email", value: email },
            { display_name: "Contact phone", variable_name: "contact_phone", value: phone },
            { display_name: "Country", variable_name: "country", value: country ?? "" },
          ],
        },
        onClose: () => {
          setLoading(false);
        },
        callback(response: { reference: string }) {
          verifyPayment(response.reference);
        },
      });
    } catch (err) {
      setError((err as Error).message || "Unable to start payment.");
      setLoading(false);
    }
  }, [amountMinor, callbackUrl, currency, email, name, phone, plan, publicKey, schoolName, verifyPayment]);

  if (!publicKey) {
    return (
      <p className="text-sm text-muted">
        Paystack is not configured. Please contact the SchoolBase team to enable online subscriptions.
      </p>
    );
  }

  return (
    <div className="space-y-2 text-right">
      <Button
        type="button"
        onClick={pay}
        disabled={disabled || loading || !ready}
        className="bg-[#0A66C2] hover:bg-[#004182] text-white"
      >
        {loading ? "Processing…" : "Pay now"}
      </Button>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
