"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PaystackPurchaseButton } from "@/components/paystack-purchase-button";

interface PurchaseFormProps {
  initialPlan?: string;
  success?: boolean;
}

const defaultPlans = [
  {
    id: "starter",
    name: "Starter",
    description: "For smaller schools that want a dependable digital foundation",
    amountMinor: 6000000,
    priceLabel: "₦60,000 / term",
  },
  {
    id: "standard",
    name: "Standard",
    description: "For growing schools that need automation, parent engagement, and results control",
    amountMinor: 8500000,
    priceLabel: "₦85,000 / term",
  },
  {
    id: "group",
    name: "Group",
    description: "Multiple campuses",
    amountMinor: 0,
    priceLabel: "Custom from ₦150,000 / term",
    disabled: true,
  },
];

export function PurchaseForm({ initialPlan = "starter", success = false }: PurchaseFormProps) {
  const [plans, setPlans] = useState(defaultPlans);
  const [currency, setCurrency] = useState("NGN");

  useEffect(() => {
    let mounted = true;
    fetch("/api/country/config")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const countryData = data?.data;
        if (!countryData?.plans) return;
        if (countryData.currency) setCurrency(countryData.currency);
        setPlans((prev) =>
          prev.map((p) => ({
            ...p,
            amountMinor: countryData.plans[p.id]?.amountMinor ?? p.amountMinor,
            priceLabel: countryData.plans[p.id]?.priceLabel ?? p.priceLabel,
          })),
        );
      })
      .catch(() => {})
      .finally(() => {
        /* noop */
      });
    return () => {
      mounted = false;
    };
  }, []);

  const [schoolName, setSchoolName] = useState("");
  const [slug, setSlug] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(
    plans.find((plan) => plan.id === initialPlan) ?? plans[0],
  );

  // keep selectedPlan in sync when plans update
  useEffect(() => {
    setSelectedPlan((prev) => plans.find((p) => p.id === prev.id) ?? plans[0]);
  }, [plans]);

  const canPay = useMemo(
    () =>
      !!schoolName && !!contactName && !!email && !!selectedPlan && !selectedPlan.disabled,
    [contactName, email, schoolName, selectedPlan],
  );

  const [trialLoading, setTrialLoading] = useState(false);
  const [trialStarted, setTrialStarted] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);

  const bankAccountName = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME;
  const bankAccountNumber = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER;
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME;

  if (success) {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-sm text-green-900">
        <p className="text-lg font-semibold">Thanks! Your payment is confirmed.</p>
        <p className="mt-3">
          Your Little Lillies School subscription purchase is complete. A member of our team will contact you for onboarding and next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="rounded-none bg-background p-4 shadow-none sm:rounded-3xl sm:p-8 sm:shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            Secure your school subscription
          </p>
          <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
            Start with the plan that fits your school.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Choose a term plan, tell us who to contact, and pay ClickBase Technologies Ltd securely via Paystack.
          </p>
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan)}
              disabled={plan.disabled}
              className={`rounded-3xl px-5 py-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                selectedPlan.id === plan.id
                  ? "bg-white shadow-sm"
                  : "bg-surface/90 hover:bg-surface"
              } ${plan.disabled ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <div>
                <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted">{plan.description}</p>
              </div>
              <div className="mt-4 rounded-full bg-background px-3 py-2 text-xs font-semibold text-muted">
                {plan.priceLabel}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <label className="block text-sm font-medium">
            School name
            <input
              value={schoolName}
              onChange={(event) => setSchoolName(event.target.value)}
              type="text"
              placeholder="Greenfield School"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
            />
          </label>
            <label className="block text-sm font-medium">
              School slug (for your dashboard URL)
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="greenfield"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
              />
              <p className="text-xs text-muted mt-1">Lowercase letters, numbers and hyphens only.</p>
            </label>
          <label className="block text-sm font-medium">
            Contact name
            <input
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              type="text"
              placeholder="Aisha Bello"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Contact email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="admin@example.com"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Contact phone
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              type="tel"
              placeholder="+234 801 234 5678"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Payment details</p>
            <p className="mt-1 text-sm text-muted">
              {selectedPlan.name} plan · {selectedPlan.priceLabel}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedPlan.disabled ? (
              <Button href="mailto:hello@schoolbase.com" variant="secondary">
                Contact sales
              </Button>
            ) : (
              <PaystackPurchaseButton
                amountMinor={selectedPlan.amountMinor}
                currency={currency}
                email={email}
                name={contactName}
                plan={selectedPlan.name}
                schoolName={schoolName}
                // include slug for provisioning on payment verification
                // if empty, the server will derive one from the school name
                slug={slug}
                phone={phone}
                disabled={!canPay}
                isSubscription={true}
              />
            )}

            {/* Free trial CTA for Starter plan */}
            {selectedPlan.id === "starter" && !selectedPlan.disabled ? (
              <button
                type="button"
                disabled={trialLoading || trialStarted || !schoolName || !contactName || !email}
                onClick={async () => {
                  setTrialError(null);
                  setTrialLoading(true);
                  try {
                    const res = await fetch("/api/trial/start", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        plan: selectedPlan.name,
                        schoolName,
                        name: contactName,
                        email,
                        phone,
                        trialDays: 7,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Could not start trial.");
                    setTrialStarted(true);
                  } catch (err) {
                    setTrialError((err as Error).message || "Failed to start trial.");
                  } finally {
                    setTrialLoading(false);
                  }
                }}
                className="ml-2 rounded-lg bg-white border border-border px-4 py-2 text-sm font-semibold text-foreground shadow-sm disabled:opacity-70"
              >
                {trialLoading ? "Starting…" : trialStarted ? "Trial started" : "Start free trial"}
              </button>
            ) : null}
          </div>
        </div>

        <p className="mt-3 text-xs text-muted">
          {trialStarted
            ? "Your free trial has started. Check your email for confirmation."
            : canPay
            ? "Click the button to proceed with Paystack checkout."
            : "Fill in all contact fields to enable payment."}
        </p>

        {trialError ? <p className="mt-2 text-xs text-error">{trialError}</p> : null}
      </div>

      {bankAccountNumber ? (
        <div className="rounded-none bg-background p-4 text-sm text-foreground shadow-none sm:rounded-3xl sm:p-6 sm:shadow-sm">
          <p className="font-semibold">Prefer bank transfer?</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            You can also complete payment by bank transfer. Please use your school name as the payment description, then email your payment receipt to <a className="text-brand" href="mailto:sales@schoolbase.live">sales@schoolbase.live</a> so we can confirm your payment and continue onboarding.
          </p>
          <div className="mt-4 grid gap-3 text-xs text-muted sm:grid-cols-3">
            <div>
              <div className="font-semibold text-foreground">Account name</div>
              {bankAccountName}
            </div>
            <div>
              <div className="font-semibold text-foreground">Account number</div>
              {bankAccountNumber}
            </div>
            <div>
              <div className="font-semibold text-foreground">Bank</div>
              {bankName}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
