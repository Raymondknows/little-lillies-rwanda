"use client";

import { useEffect, useState } from "react";
import { playCloseTone, playOpenTone } from "@/lib/sounds";
import { PaystackPurchaseButton } from "@/components/paystack-purchase-button";
import { FlutterwavePurchaseButton } from "@/components/flutterwave-purchase-button";
import { Check, Zap, Users, BarChart3, MessageSquare, Globe, CreditCard, ToggleRight } from "lucide-react";
import { UserGuide, type PageHelpGuide } from "@/components/ui/user-guide";
import AdminSkeleton from "@/components/ui/skeleton";

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
    description: "For schools that want a dependable digital foundation",
    amountMinor: 6000000,
    priceLabel: "₦60,000",
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
    description: "For growing institutions that need full automation and parent engagement",
    amountMinor: 8500000,
    priceLabel: "₦85,000",
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
    priceLabel: "Custom from ₦150,000",
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

const HELP_GUIDE: PageHelpGuide = {
  title: "Choosing Your SchoolBase Plan",
  overview: "Select the perfect subscription plan for your school. Each plan offers different features and capacity to match your school's size and needs.",
  steps: [
    "Review the features and pricing of each plan.",
    "Choose the plan that best fits your school's size and requirements.",
    "Click 'Subscribe Now' to proceed with payment.",
    "Complete the payment process using Paystack.",
    "Your subscription activates immediately after successful payment.",
  ],
  commonTasks: [
    {
      title: "Compare Plans",
      description: "Understand the differences between subscription tiers.",
      tips: [
        "STARTER is best for small schools with up to 150 students",
        "GROWTH (Standard) supports up to 600 students with advanced features",
        "ENTERPRISE is customizable for large institutions",
        "All plans include parent portal access and email support",
      ],
    },
    {
      title: "Subscribe to a Plan",
      description: "Purchase a subscription for your school.",
      tips: [
        "Select your desired plan from the list below",
        "Click 'Subscribe Now' on your chosen plan",
        "Enter your email address for the payment",
        "Complete payment and your school gains immediate access",
      ],
    },
    {
      title: "Upgrade Your Plan",
      description: "Move to a higher tier during your subscription.",
      tips: [
        "Go to your Subscription page anytime",
        "Click 'Upgrade Plan' to view higher tiers",
        "Complete the upgrade payment",
        "Your new plan features activate immediately",
      ],
    },
  ],
  faqs: [
    {
      question: "What's included in all plans?",
      answer: "All plans include student management, fee collection basics, parent portal access, and email support. Higher plans add more features like WhatsApp integration, results publishing, and advanced analytics.",
    },
    {
      question: "How long does a subscription last?",
      answer: "Each subscription is billed for a full term from the payment date. You can renew at the start of the next term, and you'll receive reminders before renewal.",
    },
    {
      question: "Can I change plans later?",
      answer: "Yes! You can upgrade to a higher plan anytime from your subscription dashboard. Downgrades take effect at your next renewal period.",
    },
    {
      question: "What payment methods are accepted?",
      answer: "SchoolBase uses Paystack for secure payments. You can pay using bank transfers, cards, USSD, or other methods supported by Paystack in your region.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! New schools get a free 7-day trial with all features unlocked. You can explore the platform before choosing a paid plan.",
    },
  ],
};

export default function SubscribePage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [selectedPlan, setSelectedPlan] = useState<Plan>(defaultPlans[1]);
  const [currency, setCurrency] = useState("NGN");
  const [countryCode, setCountryCode] = useState("NG");
  const [countryName, setCountryName] = useState("Nigeria");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolSlug, setSchoolSlug] = useState("");
  const [schoolData, setSchoolData] = useState<any>(null);
  const [showBankPanel, setShowBankPanel] = useState(false);

  const openBankModal = () => {
    setShowBankPanel(true);
    playOpenTone();
  };

  const closeBankModal = () => {
    playCloseTone();
    setShowBankPanel(false);
  };

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

        const resolvedCountryCode = countryData?.country || "NG";
        const resolvedCountryName = configData?.name || "Nigeria";
        const resolvedCurrency = configData?.currency || "NGN";

        setCountryCode(resolvedCountryCode);
        setCountryName(resolvedCountryName);
        setCurrency(resolvedCurrency);

        if (configData?.plans) {
          const updatedPlans = defaultPlans.map((p) => ({
            ...p,
            amountMinor: configData.plans[p.id]?.amountMinor ?? p.amountMinor,
            priceLabel: configData.plans[p.id]?.priceLabel ?? p.priceLabel,
          }));

          setPlans(updatedPlans);
          setSelectedPlan((current) =>
            updatedPlans.find((plan) => plan.id === current.id) ?? updatedPlans[1]
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

  const paymentProvider = countryCode === "NG" ? "Paystack" : "Flutterwave";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSkeleton />
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {/* Pricing Location */}
        <div className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted flex items-center gap-2">
          <div className="relative group">
            <Globe size={16} color="#0A66C2" className="cursor-help flex-shrink-0" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Pricing shown for
            </div>
          </div>
          <span className="font-semibold text-foreground">{countryName} · {currency}</span>
        </div>

        {/* Payment Provider */}
        <div className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted flex items-center gap-2">
          <div className="relative group">
            <CreditCard size={16} color="#0A66C2" className="cursor-help flex-shrink-0" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Payment provider
            </div>
          </div>
          <span className="font-semibold text-foreground">{paymentProvider}</span>
        </div>

        {/* Alternative Payment Toggle */}
        <button
          type="button"
          onClick={openBankModal}
          className="rounded-full px-4 py-2 text-sm font-semibold text-white bg-brand shadow-md hover:bg-brand/90 transition-colors flex items-center gap-2 ring-2 ring-brand/20"
        >
          <div className="relative group">
            <ToggleRight size={16} color="#ffffff" className="cursor-help flex-shrink-0" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Show alternative payment
            </div>
          </div>
          <span className="text-white">Show alternative payment</span>
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
            <p className="mt-2 text-sm text-muted">
              Prices are displayed in {currency} for {countryName}. Checkout uses {paymentProvider} for this market.
            </p>
          </div>

          {countryCode === "NG" ? (
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
          ) : (
            <FlutterwavePurchaseButton
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
          )}
        </div>
      )}

      {bankAccountNumber && showBankPanel ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4" onClick={closeBankModal}>
          <style>{`
            @keyframes classes_modal_enter { from { transform: translateX(36px) scale(.98); opacity: 0 } to { transform: translateX(0) scale(1); opacity: 1 } }
          `}</style>

          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(10,102,194,0.16)]"
            style={{ animation: `classes_modal_enter 320ms cubic-bezier(.2,.9,.2,1)` }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-100 px-6 py-5" style={{ background: "linear-gradient(90deg, rgba(10,102,194,0.12), rgba(10,102,194,0.04))" }}>
              <div className="flex items-start justify-between gap-4">
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
                  onClick={closeBankModal}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-background transition-colors"
                  aria-label="Close alternative payment modal"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="px-6 py-8">
              <p className="text-sm leading-6 text-muted text-center">
                Use the account details below and write your school name as the payment description. Email your payment receipt to <a className="text-brand" href="mailto:sales@schoolbase.live">sales@schoolbase.live</a> so we can confirm receipt and continue onboarding.
              </p>

              <div className="mt-6 text-center">
                <div className="mb-6">
                  <div className="text-xs text-muted uppercase tracking-wider">Account name</div>
                  <div className="text-2xl font-semibold text-foreground mt-1">{bankAccountName}</div>
                </div>

                <div className="mb-6">
                  <div className="text-xs text-muted uppercase tracking-wider">Account number</div>
                  <div className="text-3xl font-bold font-mono text-foreground mt-1">{bankAccountNumber}</div>
                </div>

                <div>
                  <div className="text-xs text-muted uppercase tracking-wider">Bank</div>
                  <div className="text-2xl font-semibold text-foreground mt-1">{bankName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Help & Guide */}
      <UserGuide guide={HELP_GUIDE} />
    </div>
  );
}