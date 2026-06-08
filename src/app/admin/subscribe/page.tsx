"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PaystackPurchaseButton } from "@/components/paystack-purchase-button";
import { Check, Zap, Users, FileText, BarChart3, MessageSquare } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 bg-slate-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-white rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg text-slate-600">
            Unlock powerful features to grow your school. All plans include core features.
          </p>
        </div>

        {/* School Info Banner */}
        {schoolData && (
          <div className="mb-8 bg-white rounded-lg border border-blue-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Managing School</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{schoolName}</h2>
                {currentSubscription && (
                  <p className="text-sm text-slate-600 mt-2">
                    Current Status:{" "}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ml-2 ${
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
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => !plan.disabled && setSelectedPlan(plan)}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
                selectedPlan.id === plan.id
                  ? "ring-2 ring-blue-500 shadow-2xl scale-105"
                  : "shadow-lg hover:shadow-xl"
              } ${plan.disabled ? "opacity-60 cursor-not-allowed" : ""} ${
                plan.id === "standard" ? "md:scale-105" : ""
              }`}
              style={{
                background:
                  selectedPlan.id === plan.id
                    ? "linear-gradient(135deg, #0052CC 0%, #0066FF 100%)"
                    : plan.id === "standard"
                      ? "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"
                      : "white",
              }}
            >
              {plan.id === "standard" && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-2 text-xs font-bold rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="mb-6">
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      selectedPlan.id === plan.id
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      selectedPlan.id === plan.id
                        ? "text-blue-100"
                        : "text-slate-600"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-opacity-20 border-current">
                  <div
                    className={`text-4xl font-bold mb-2 ${
                      selectedPlan.id === plan.id
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    {plan.priceLabel}
                    {plan.id !== "enterprise" && (
                      <span
                        className={`text-lg font-normal ml-2 ${
                          selectedPlan.id === plan.id
                            ? "text-blue-100"
                            : "text-slate-600"
                        }`}
                      >
                        / term
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-3 text-sm ${
                        selectedPlan.id === plan.id
                          ? "text-blue-50"
                          : "text-slate-600"
                      }`}
                    >
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          selectedPlan.id === plan.id
                            ? "text-white"
                            : "text-blue-500"
                        }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                {plan.disabled ? (
                  <a
                    href="mailto:hello@schoolbase.com"
                    className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition-colors ${
                      selectedPlan.id === plan.id
                        ? "bg-white text-blue-600 hover:bg-blue-50"
                        : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                    }`}
                  >
                    Contact Sales
                  </a>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan);
                    }}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      selectedPlan.id === plan.id
                        ? "bg-white text-blue-600 hover:bg-blue-50"
                        : "bg-blue-500 text-white hover:bg-blue-600"
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
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Ready to upgrade?
              </h3>
              <p className="text-slate-600">
                Complete your subscription to{" "}
                <span className="font-semibold text-blue-600">
                  {selectedPlan.name}
                </span>
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">School</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {schoolName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Admin</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {adminName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Email</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {adminEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Plan</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {selectedPlan.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-b border-slate-200 py-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">{selectedPlan.name} Plan</span>
                <span className="font-semibold text-slate-900">
                  {selectedPlan.priceLabel}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 text-sm">
                <span>Per term subscription</span>
              </div>
            </div>

            {/* Payment Button */}
            <div className="flex gap-4">
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
                className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            </div>

            {/* Features Highlight */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-600 mb-4">
                What's included:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-700">Instant activation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-700">
                    Full parent access
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-700">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-700">Analytics included</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
