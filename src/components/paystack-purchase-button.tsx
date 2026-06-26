"use client";

import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { buildApiUrl } from "@/lib/api-client";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Window is undefined"));
    }
    if (window.PaystackPop) {
      return resolve();
    }

    const src = "https://js.paystack.co/v1/inline.js";
    const existing = document.querySelector(`script[src='${src}']`) as HTMLScriptElement | null;
    const timeout = window.setTimeout(() => {
      reject(new Error("Paystack script load timed out."));
    }, 15000);

    const cleanup = () => {
      window.clearTimeout(timeout);
    };

    const handleLoad = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(new Error("Paystack script failed to load."));
    };

    if (existing) {
      const existingScript = existing as HTMLScriptElement & { readyState?: string };
      const needsReload =
        existing.hasAttribute("crossorigin") ||
        existingScript.readyState === "error" ||
        ((existingScript.readyState === "complete" || existingScript.readyState === "loaded") && !window.PaystackPop);

      if (needsReload) {
        existing.remove();
      } else {
        if (window.PaystackPop) {
          cleanup();
          return resolve();
        }

        if (existingScript.readyState === "complete" || existingScript.readyState === "loaded") {
          cleanup();
          return resolve();
        }

        existing.addEventListener("load", handleLoad);
        existing.addEventListener("error", handleError);
        return;
      }
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
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
}: PaystackPurchaseButtonProps): ReactElement {
  const fallbackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? null;
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(isSubscription);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  const callbackUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/paystack/purchase`;
    }
    return `${appUrl}/api/paystack/purchase`;
  }, [appUrl]);

  useEffect(() => {
    let mounted = true;

    fetch("/api/admin/settings/data")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        const cfgKey = d?.config?.paystackPublicKey ?? d?.config?.paystackPublic ?? null;
        setPublicKey(String(cfgKey ?? fallbackPublicKey ?? "").trim() || null);
      })
      .catch(() => {
        if (!mounted) return;
        setPublicKey(fallbackPublicKey);
      });

    if (!publicKey) return;
    loadPaystackScript()
      .then(() => setReady(true))
      .catch((err) => setError(err.message));

    return () => {
      mounted = false;
    };
  }, [fallbackPublicKey, publicKey]);

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
    [amountMinor, callbackUrl, currency, email, name, phone, slug],
  );

  const pay = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      if (isSubscription) {
        const initUrl = buildApiUrl("/paystack/init");
        if (!isValidEmail(email)) {
          throw new Error("Please use a valid email address before checking out.");
        }

        // Set a timeout to reset loading state if redirect doesn't happen
        let redirectTimeout: number | null = null;
        redirectTimeout = window.setTimeout(() => {
          setError("Payment redirect timed out. Please try again.");
          setLoading(false);
        }, 5000); // 5 second timeout

        const response = await fetch(initUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            amountMinor,
            metadata: {
              plan,
              schoolName,
              name,
              phone,
            },
            callback_url: `${window.location.origin}/admin/subscription-success`,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          if (redirectTimeout !== null) window.clearTimeout(redirectTimeout);
          throw new Error(data.error || "Failed to initialize payment.");
        }

        const authorizationUrl = data?.authorization_url || data?.data?.authorization_url;
        if (!authorizationUrl) {
          if (redirectTimeout !== null) window.clearTimeout(redirectTimeout);
          throw new Error("Paystack authorization URL was not returned.");
        }

        // Attempt redirect
        try {
          window.location.href = authorizationUrl;
        } catch (redirectError) {
          if (redirectTimeout !== null) window.clearTimeout(redirectTimeout);
          setLoading(false);
          throw new Error("Unable to redirect to payment gateway. Please try again.");
        }
        return;
      }

      if (!publicKey) {
        throw new Error("Paystack configuration is unavailable.");
      }

      let checkoutTimeout: number | null = null;
      const clearCheckoutTimeout = () => {
        if (checkoutTimeout !== null) {
          window.clearTimeout(checkoutTimeout);
          checkoutTimeout = null;
        }
      };

      await loadPaystackScript();
      if (!window.PaystackPop) {
        throw new Error("Paystack checkout is unavailable.");
      }

      checkoutTimeout = window.setTimeout(() => {
        setError("Paystack checkout did not appear. Please try again.");
        setLoading(false);
      }, 12000);

      const handler = window.PaystackPop.setup({
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
          clearCheckoutTimeout();
          setLoading(false);
        },
        callback(response: { reference: string }) {
          clearCheckoutTimeout();
          verifyPayment(response.reference);
        },
      });
      handler.openIframe();
    } catch (err) {
      setError((err as Error).message || "Unable to start payment.");
      setLoading(false);
    }
  }, [amountMinor, callbackUrl, currency, email, isSubscription, name, phone, plan, publicKey, schoolName, verifyPayment]);

  if (!isSubscription && !publicKey) {
    return (
      <button
        disabled
        className="w-full py-3 px-4 rounded-lg font-bold bg-slate-200 text-slate-500 cursor-not-allowed"
        title="Paystack configuration in progress"
      >
        Setting up payment...
      </button>
    );
  }

  return (
    <div className="space-y-2 text-right">
      <Button
        type="button"
        onClick={pay}
        disabled={disabled || loading || !ready}
        className="w-full bg-[#0A66C2] hover:bg-[#004FA3] text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
      >
        {loading ? "Processing…" : "Pay now"}
      </Button>
      {error ? <p className="text-xs text-red-600 font-medium">{error}</p> : null}
    </div>
  );
}
