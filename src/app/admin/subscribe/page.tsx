"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [selectedPlan, setSelectedPlan] = useState<Plan>(defaultPlans[1]); // Default to Standard
  const [currency, setCurrency] = useState("NGN");

  // Admin and school data
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolSlug, setSchoolSlug] = useState("");
  const [schoolData, setSchoolData] = useState<any>(null);
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetch("/api/country/config").then((r) => r.json()),
      fetch("/api/admin/verify", { method: "POST" }).then((r) => r.json()),
    ])
      .then(([countryData, adminData]) => {
        if (!mounted) return;

        // Update plans from country config
        const configData = countryData?.data;
        if (configData?.plans) {
          if (configData.currency) setCurrency(configData.currency);
          setPlans((prev) =>
            prev.map((p) => ({
              ...p,
              amountMinor: configData.plans[p.id]?.amountMinor ?? p.amountMinor,
              priceLabel: configData.plans[p.id]?.priceLabel ?? p.priceLabel,
            }))
          );
        }

        // Update admin data from session
        if (adminData?.authenticated && adminData?.session) {
          const session = adminData.session;
          setAdminName(session.name || "");
          setAdminEmail(session.email || "");

          // Fetch school data
          if (session.schoolId) {
            fetch(`/api/admin/school/${session.schoolId}`)
              .then((r) => r.json())
              .then((schoolData) => {
                if (mounted && schoolData) {
                  setSchoolName(schoolData.name || "");
                  setSchoolSlug(schoolData.slug || "");
                  setSchoolData(schoolData);

                  // Determine current subscription from school status
                  if (schoolData.status === "TRIAL") {
                    setCurrentSubscription("trial");
                  } else if (schoolData.plan) {
                    setCurrentSubscription(schoolData.plan);
                  }
                }
              })
              .catch((err) => console.error("Failed to fetch school data:", err));
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load subscription data:", err);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Choose Your Plan</h1>
          <p className="text-slate-600 mt-2">Loading subscription information...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Choose Your Plan</h1>
        <p className="text-slate-600">
          Select the right plan for your school and unlock powerful features.
        </p>
      </div>

      {/* School Info */}
      {schoolData && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Managing School</p>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{schoolName}</h2>
              {currentSubscription && (
                <p className="text-sm text-slate-600 mt-2">
                  Current Status:{" "}
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-semibold ml-2 ${
                      currentSubscription === "trial"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {currentSubscription === "trial" ? "Trial Active" : "Subscribed"}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => !plan.disabled && setSelectedPlan(plan)}
            className={`rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden ${
              selectedPlan.id === plan.id
                ? "border-[#0A66C2] bg-slate-50 shadow-md ring-2 ring-[#0A66C2] ring-opacity-20"
                : "border-slate-200 bg-white hover:shadow-sm hover:border-slate-300"
            } ${plan.disabled ? "opacity-60 cursor-not-allowed" : ""} ${
              plan.id === "standard" ? "md:ring-2 md:ring-[#0A66C2] md:ring-opacity-20 md:shadow-sm" : ""
            }`}
          >
            {plan.id === "standard" && (
              <div className="bg-[#0A66C2] text-white px-4 py-2 text-xs font-bold text-center">
                MOST POPULAR
              </div>
            )}

            <div className="p-6">
              {/* Plan Header */}
              <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
              <p className="text-sm text-slate-600 mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <div className="text-3xl font-bold text-slate-900">
                  {plan.priceLabel}
                  {plan.id !== "enterprise" && (
                    <span className="text-sm font-normal text-slate-600 ml-2">/term</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#0A66C2]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              {plan.disabled ? (
                <a
                  href="mailto:hello@schoolbase.com"
                  className="block w-full py-2 px-4 rounded text-center text-sm font-semibold text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Contact Sales
                </a>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan);
                  }}
                  className={`w-full py-2 px-4 rounded text-sm font-semibold transition-colors ${
                    selectedPlan.id === plan.id
                      ? "bg-[#0A66C2] text-white hover:bg-[#004999]"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {selectedPlan.id === plan.id ? "Selected" : "Select Plan"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Section */}
      {!selectedPlan.disabled && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Checkout</h3>
          <p className="text-slate-600 mb-6">
            Upgrading <span className="font-semibold text-slate-900">{schoolName}</span> to{" "}
            <span className="font-semibold text-[#0A66C2]">{selectedPlan.name}</span>
          </p>

          {/* Order Summary */}
          <div className="bg-slate-50 rounded p-4 mb-6 border border-slate-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">School</p>
                <p className="font-semibold text-slate-900 mt-1">{schoolName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Admin</p>
                <p className="font-semibold text-slate-900 mt-1">{adminName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Email</p>
                <p className="font-semibold text-slate-900 mt-1">{adminEmail}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Plan</p>
                <p className="font-semibold text-slate-900 mt-1">{selectedPlan.name}</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-b border-slate-200 py-4 mb-6 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-900 font-semibold">{selectedPlan.name} Plan</span>
              <span className="text-lg font-bold text-[#0A66C2]">{selectedPlan.priceLabel}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 text-xs mt-1">
              <span>Per term subscription</span>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="flex gap-4 mb-6">
            <PaystackPurchaseButton
              amountMinor={selectedPlan.amountMinor}
              currency={currency}
              email={adminEmail}
              name={adminName}
              plan={selectedPlan.id}
              schoolName={schoolName}
              slug={schoolSlug}
              phone=""
              disabled={!adminName || !adminEmail || !schoolName}
              isSubscription={true}
            />
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-2 border border-slate-300 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
          </div>

          {/* Features Included */}
          <div className="pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-900 uppercase mb-4">What's Included:</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0A66C2]" />
                <span className="text-slate-700">Instant activation</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0A66C2]" />
                <span className="text-slate-700">Full parent access</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0A66C2]" />
                <span className="text-slate-700">Priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0A66C2]" />
                <span className="text-slate-700">Analytics included</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
