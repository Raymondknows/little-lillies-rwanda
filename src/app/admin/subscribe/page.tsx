"use client";

import { useEffect, useState } from "react";
import { PaystackPurchaseButton } from "@/components/paystack-purchase-button";
import { Check, Zap, Users, BarChart3, MessageSquare } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  amountMinor: number;
  priceLabel: string;
  features: string[];
  disabled?: boolean;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const defaultPlans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small schools",
    amountMinor: 3500000,
    priceLabel: "₦35,000",
    features: [
      "Up to 150 students",
      "Basic fee collection",
      "Student management",
      "Parent portal access",
      "Email support",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    description: "For growing institutions",
    amountMinor: 4500000,
    priceLabel: "₦45,000",
    features: [
      "Up to 600 students",
      "Advanced fee collection",
      "WhatsApp integration",
      "Results publishing",
      "Attendance tracking",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solution",
    amountMinor: 0,
    priceLabel: "Custom",
    features: [
      "Unlimited students",
      "Custom integrations",
      "Dedicated support",
      "API access",
      "Custom branding",
      "Advanced analytics",
    ],
    disabled: true,
  },
];

export default function SubscribePage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [selectedPlan, setSelectedPlan] = useState<Plan>(defaultPlans[1]);
  const [currency, setCurrency] = useState("NGN");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolSlug, setSchoolSlug] = useState("");
  const [schoolData, setSchoolData] = useState<any>(null);
  const [showBankPanel, setShowBankPanel] = useState(false);

  const bankAccountName = process.env.BANK_ACCOUNT_NAME ?? process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "ClickBase Technologies Ltd";
  const bankAccountNumber = process.env.BANK_ACCOUNT_NUMBER ?? process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "1228481040";
  const bankName = process.env.BANK_NAME ?? process.env.NEXT_PUBLIC_BANK_NAME ?? "Zenith";

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetch("/api/country/config").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/verify", { method: "POST" }).then((r) => r.json()).catch(() => ({})),
    ])
      .then(([countryData, adminData]) => {
        if (!mounted) return;

        const configData = countryData?.data;

        if (configData?.plans) {
          if (configData.currency) setCurrency(configData.currency);

          setPlans((prev) =>
            prev.map((p) => ({
              ...p,
              amountMinor:
                configData.plans[p.id]?.amountMinor ?? p.amountMinor,
              priceLabel:
                configData.plans[p.id]?.priceLabel ?? p.priceLabel,
            }))
          );
        }

        if (adminData?.authenticated && adminData?.session) {
          const session = adminData.session;

          setAdminName(session.name || "");
          setAdminEmail(session.email || "");

          if (session.schoolId) {
            fetch(`/api/admin/school/${session.schoolId}`)
              .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
              })
              .then((schoolData) => {
                if (!mounted) return;

                setSchoolName(schoolData.name || "");
                setSchoolSlug(schoolData.slug || "");
                setSchoolData(schoolData);
              })
              .catch((err) => {
                console.warn("Failed to fetch school data:", err.message);
                // Continue loading even if school data fails
              });
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load subscription page:", err);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-64 bg-black/5 rounded animate-pulse" />
          <div className="h-4 w-96 bg-black/5 rounded animate-pulse" />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 rounded-xl border border-black/10 bg-black/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-sm text-muted mt-2">
          Select the right plan for your school and unlock SchoolBase features
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowBankPanel((prev) => !prev)}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface/90"
        >
          {showBankPanel ? "Hide alternative payment" : "Show alternative payment"}
        </button>
      </div>

      {/* Plans */}
      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => !plan.disabled && setSelectedPlan(plan)}
            className={`rounded-xl border transition cursor-pointer p-5 flex flex-col
              ${
                selectedPlan.id === plan.id
                  ? "border-brand ring-2 ring-brand/20"
                  : "border-border hover:border-black/20"
              }
              bg-surface/60 backdrop-blur-sm
              ${plan.disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {/* Title */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="text-xs text-muted">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="mb-4">
              <p className="text-2xl font-bold">{plan.priceLabel}</p>
              <p className="text-xs text-muted">per term</p>
            </div>

            {/* Features */}
            <ul className="space-y-2 text-sm flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <Check className="w-4 h-4 text-brand mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* Action */}
            <div className="mt-6">
              {plan.disabled ? (
                <button className="w-full border border-border py-2 rounded text-sm">
                  Contact Sales
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan);
                  }}
                  className={`w-full py-2 rounded text-sm font-semibold
                    ${
                      selectedPlan.id === plan.id
                        ? "bg-brand text-white"
                        : "bg-black/5 hover:bg-black/10"
                    }`}
                >
                  {selectedPlan.id === plan.id ? "Selected" : "Select"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Checkout */}
      {!selectedPlan.disabled && (
        <div className="border border-border rounded-xl p-6 bg-surface/40">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Checkout</h3>
            <p className="text-sm text-muted">
              Upgrading <span className="font-semibold">{schoolName}</span> →
              <span className="text-brand font-semibold ml-1">
                {selectedPlan.name}
              </span>
            </p>
          </div>

          <PaystackPurchaseButton
            amountMinor={selectedPlan.amountMinor}
            currency={currency}
            email={adminEmail}
            name={adminName}
            plan={selectedPlan.id}
            schoolName={schoolName}
            slug={schoolSlug}
            phone=""
            disabled={!adminName || !adminEmail || !schoolName || !isValidEmail(adminEmail)}
            isSubscription={true}
          />
        </div>
      )}

      {bankAccountNumber ? (
        <>
          <div
            className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-surface p-6 shadow-2xl transition duration-300 ease-out sm:rounded-l-3xl ${
              showBankPanel ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                  Alternative payment option
                </p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">
                  Bank transfer details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowBankPanel(false)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground"
              >
                Close
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              Use the account details below and write your school name as the payment description. Email your payment receipt to <a className="text-brand" href="mailto:sales@schoolbase.live">sales@schoolbase.live</a> so we can confirm receipt and continue onboarding.
            </p>
            <div className="mt-6 space-y-4 text-sm text-foreground">
              <div>
                <div className="font-semibold">Account name</div>
                <div>{bankAccountName}</div>
              </div>
              <div>
                <div className="font-semibold">Account number</div>
                <div>{bankAccountNumber}</div>
              </div>
              <div>
                <div className="font-semibold">Bank</div>
                <div>{bankName}</div>
              </div>
            </div>
          </div>
          {showBankPanel ? (
            <button
              type="button"
              onClick={() => setShowBankPanel(false)}
              className="fixed inset-0 z-40 bg-black/30"
              aria-label="Close alternative payment panel"
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}