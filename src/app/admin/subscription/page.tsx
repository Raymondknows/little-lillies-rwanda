"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, CreditCard, RefreshCw, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserGuide, type PageHelpGuide } from "@/components/ui/user-guide";

interface SubscriptionStatus {
  subscriptionStatus: string;
  schoolName: string;
  currentPlan: string;
  status: string;
  trialEndsAt: string | null;
  subscriptionExpiresAt: string | null;
  daysRemaining: number;
  message: string;
  canRenew: boolean;
  canUpgrade: boolean;
}

const planDetails: Record<string, { description: string; price: string; accent: string }> = {
  STARTER: {
    description: "Perfect for small schools",
    price: "₦35,000/month",
    accent: "from-blue-500 to-blue-600",
  },
  GROWTH: {
    description: "For growing institutions",
    price: "₦45,000/month",
    accent: "from-green-500 to-green-600",
  },
  ENTERPRISE: {
    description: "Custom solution",
    price: "Custom pricing",
    accent: "from-purple-500 to-purple-600",
  },
  FREE: {
    description: "Free plan",
    price: "Free",
    accent: "from-slate-400 to-slate-500",
  },
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string; badge: string }> = {
  ACTIVE: {
    icon: <CheckCircle className="h-5 w-5" />,
    color: "text-green-600",
    badge: "bg-green-100 text-green-800",
  },
  TRIAL: {
    icon: <Clock className="h-5 w-5" />,
    color: "text-blue-600",
    badge: "bg-blue-100 text-blue-800",
  },
  EXPIRED: {
    icon: <AlertCircle className="h-5 w-5" />,
    color: "text-red-600",
    badge: "bg-red-100 text-red-800",
  },
  TRIAL_EXPIRED: {
    icon: <AlertCircle className="h-5 w-5" />,
    color: "text-red-600",
    badge: "bg-red-100 text-red-800",
  },
  SUSPENDED: {
    icon: <AlertCircle className="h-5 w-5" />,
    color: "text-orange-600",
    badge: "bg-orange-100 text-orange-800",
  },
  CANCELLED: {
    icon: <AlertCircle className="h-5 w-5" />,
    color: "text-slate-600",
    badge: "bg-slate-100 text-slate-800",
  },
  PENDING: {
    icon: <Clock className="h-5 w-5" />,
    color: "text-amber-600",
    badge: "bg-amber-100 text-amber-800",
  },
};

const HELP_GUIDE: PageHelpGuide = {
  title: "Managing Your Subscription",
  overview: "View and manage your school's subscription plan, billing dates, and renewal status. Stay informed about your trial period and subscription expiry dates for the active term.",
  steps: [
    "Check your current subscription status and plan details.",
    "Monitor your subscription expiry date and days remaining.",
    "Renew your subscription before the current term expires to maintain access.",
    "Upgrade to a higher plan for more features and capacity.",
    "Contact support if you have questions about your subscription.",
  ],
  commonTasks: [
    {
      title: "Renew Your Subscription",
      description: "Extend your school's subscription access for the next term.",
      tips: [
        "Click 'Renew Subscription' button on this page",
        "Select your plan and payment method",
        "Complete payment to activate the renewal",
        "Your subscription will be extended for the next school term",
      ],
    },
    {
      title: "Upgrade Your Plan",
      description: "Move to a higher plan tier for more features.",
      tips: [
        "Click 'Upgrade Plan' to view available plans",
        "Compare features between STARTER, GROWTH, and ENTERPRISE plans",
        "Select the plan that fits your school's needs",
        "Complete payment and your new plan activates immediately",
      ],
    },
    {
      title: "Check Subscription Status",
      description: "Monitor your subscription dates and status.",
      tips: [
        "View current plan details at the top of this page",
        "Check days remaining until your subscription expires",
        "See trial expiry date if you're on a trial plan",
        "Review renewal and upgrade options below",
      ],
    },
  ],
  faqs: [
    {
      question: "What happens when my subscription expires?",
      answer: "Your school will lose access to all SchoolBase features including student management, fees, attendance, and results publishing. You'll need to renew your subscription to regain access.",
    },
    {
      question: "How long does a subscription last?",
      answer: "Each subscription is tied to a school term and remains active until the term ends. You'll receive reminders before expiry, and you can renew anytime to extend your access for the next term.",
    },
    {
      question: "What's the difference between plans?",
      answer: "STARTER is ideal for small schools with basic features. GROWTH is for larger institutions with more students and advanced features. ENTERPRISE is customizable for your school's specific needs.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can upgrade anytime to access more features. Downgrades are also available but take effect at your next renewal period.",
    },
  ],
};

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      try {
        console.log('[Subscription] Loading subscription status...');
        const response = await fetch("/api/admin/subscription/status", {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('[Subscription] Response status:', response.status);

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          console.error('[Subscription] Backend error:', errorBody);
          throw new Error(
            errorBody?.error || 
            errorBody?.reason || 
            `Failed to load subscription status (${response.status})`
          );
        }

        const data = await response.json();
        console.log('[Subscription] Data loaded:', data);
        setSubscription(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load subscription";
        console.error('[Subscription] Error:', errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {/* Header Skeleton */}
        <div className="text-center space-y-3">
          <div className="h-10 bg-slate-200 rounded-xl w-48 mx-auto animate-pulse" />
          <div className="h-4 bg-slate-200 rounded-lg w-96 mx-auto animate-pulse" />
        </div>

        {/* Status Card Skeleton */}
        <div className="rounded-xl border border-border p-6 md:p-8 space-y-4 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-slate-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-20" />
              <div className="h-6 bg-slate-200 rounded w-40" />
              <div className="h-4 bg-slate-200 rounded w-56" />
            </div>
          </div>
        </div>

        {/* Plan & Time Grid Skeleton */}
        <div className="grid gap-5 md:grid-cols-2 animate-pulse">
          <div className="rounded-xl border border-border p-5 space-y-4">
            <div className="h-3 bg-slate-200 rounded w-24" />
            <div className="h-8 bg-slate-200 rounded w-32" />
            <div className="h-4 bg-slate-200 rounded w-48" />
            <div className="h-4 bg-slate-200 rounded w-32 mt-6 pt-4" />
          </div>
          <div className="rounded-xl border border-border p-5 space-y-4">
            <div className="h-3 bg-slate-200 rounded w-24" />
            <div className="h-16 bg-slate-200 rounded w-24 mx-auto" />
          </div>
        </div>

        {/* Dates Grid Skeleton */}
        <div className="grid gap-5 md:grid-cols-2 animate-pulse">
          <div className="rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="h-5 w-5 bg-slate-200 rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-20" />
              <div className="h-5 bg-slate-200 rounded w-40" />
            </div>
          </div>
          <div className="rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="h-5 w-5 bg-slate-200 rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-20" />
              <div className="h-5 bg-slate-200 rounded w-40" />
            </div>
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="rounded-xl border border-border p-6 space-y-3 animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-20" />
          <div className="space-y-3">
            <div className="h-10 bg-slate-200 rounded-lg" />
            <div className="h-10 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    // Check if it's a subscription-related error
    const isSubscriptionError = error?.includes('Subscription required') || 
                               error?.includes('not active') || 
                               error?.includes('403');
    
    return (
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Your Subscription</h1>
          <p className="text-sm text-muted mt-2">
            Manage your school's subscription plan and billing
          </p>
        </div>

        {/* Error Card */}
        <div className="rounded-xl border border-border p-6 bg-surface/60 backdrop-blur-sm space-y-4">
          <div className="flex items-start gap-4">
            <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isSubscriptionError ? 'text-orange-600' : 'text-red-600'}`} />
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-foreground">
                {isSubscriptionError ? 'Subscription Not Active' : 'Unable to Load Subscription'}
              </h3>
              <p className="text-sm text-muted mb-4">
                {error || "We couldn't retrieve your subscription information. Please try again."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    location.reload();
                  }}
                  className="px-4 py-2 bg-brand text-white font-medium rounded-lg hover:bg-brand/90 transition-colors text-sm"
                >
                  Try Again
                </button>
                {isSubscriptionError && (
                  <Link
                    href="/admin/subscribe"
                    className="px-4 py-2 border border-border text-foreground font-medium rounded-lg hover:bg-surface transition-colors text-sm"
                  >
                    Go to Subscribe
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="rounded-xl border border-border p-6 bg-surface/40">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Troubleshooting Tips</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-slate-400">•</span>
              <span>Ensure the backend server is running</span>
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400">•</span>
              <span>Check your internet connection</span>
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400">•</span>
              <span>Try refreshing the page</span>
            </li>
            {isSubscriptionError && (
              <li className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>Your subscription may have expired—renew it to regain access</span>
              </li>
            )}
            <li className="flex gap-2">
              <span className="text-slate-400">•</span>
              <span>Contact support if the issue persists</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  const status = subscription.subscriptionStatus;
  const config = statusConfig[status] || statusConfig.PENDING;
  const planConfig = planDetails[subscription.currentPlan] || planDetails.FREE;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Your Subscription</h1>
        <p className="text-sm text-muted mt-2">
          Manage your school's subscription plan and billing
        </p>
      </div>

      {/* Premium Status Hero Card */}
      <div className="rounded-xl border border-border p-6 md:p-8 bg-surface/60 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className={`${config.color} p-3 rounded-lg bg-white/50 flex-shrink-0`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">{subscription.schoolName}</h2>
            <p className="text-sm text-muted mb-3">{subscription.message}</p>
            <div className="inline-flex">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badge}`}>
                {status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan & Time Remaining Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Current Plan Card - Selected State */}
        <div className="rounded-xl border-2 border-brand ring-2 ring-brand/20 p-5 md:p-6 bg-surface/60 backdrop-blur-sm hover:border-brand transition-colors">
          <div className="space-y-4 h-full flex flex-col">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-2">Current Plan</p>
              <h3 className="text-2xl font-bold text-foreground">{subscription.currentPlan}</h3>
              <p className="text-sm text-muted mt-2">{planConfig.description}</p>
            </div>
            <div className="mt-auto pt-4 border-t border-border">
              <p className="text-sm font-semibold text-foreground">{planConfig.price}</p>
            </div>
          </div>
        </div>

        {/* Time Remaining Card */}
        {subscription.currentPlan !== "ENTERPRISE" && (
          <div className="rounded-xl border border-border p-5 md:p-6 bg-surface/60 backdrop-blur-sm hover:border-border/80 transition-colors flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-4">Time Remaining</p>
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <p className="text-5xl font-bold text-brand">{Math.max(0, subscription.daysRemaining)}</p>
              <p className="text-sm text-muted mt-3">days remaining</p>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Dates Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Trial End Date */}
        {subscription.trialEndsAt && (
          <div className="rounded-xl border border-border p-5 md:p-6 bg-surface/60 backdrop-blur-sm flex items-center gap-4">
            <Calendar className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-1">Trial Expires</p>
              <p className="text-lg font-semibold text-foreground">
                {new Date(subscription.trialEndsAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        )}

        {/* Subscription End Date */}
        {subscription.subscriptionExpiresAt && (
          <div className="rounded-xl border border-border p-5 md:p-6 bg-surface/60 backdrop-blur-sm flex items-center gap-4">
            <Calendar className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-1">Expires On</p>
              <p className="text-lg font-semibold text-foreground">
                {new Date(subscription.subscriptionExpiresAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="rounded-xl border border-border p-6 md:p-8 bg-surface/40">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Next Steps</h3>
        <div className="space-y-3">
          {subscription.canRenew && (
            <Link href="/admin/subscribe" className="block">
              <Button className="w-full gap-2 bg-brand hover:bg-brand/90 text-white font-semibold py-2.5 rounded-lg transition-colors">
                <RefreshCw className="h-4 w-4" />
                Renew Subscription
              </Button>
            </Link>
          )}

          {subscription.canUpgrade && (
            <Link href="/admin/subscribe" className="block">
              <Button 
                variant="outline" 
                className="w-full gap-2 font-semibold py-2.5 rounded-lg hover:bg-surface/80 transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                Upgrade Plan
              </Button>
            </Link>
          )}

          {!subscription.canRenew && !subscription.canUpgrade && (
            <Link href="/admin/subscribe" className="block">
              <Button 
                variant="outline" 
                className="w-full gap-2 font-semibold py-2.5 rounded-lg hover:bg-surface/80 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                View All Plans
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Support & Help Section */}
      <div className="rounded-xl border border-border p-6 md:p-8 bg-surface/40">
        <p className="text-sm text-foreground">
          <span className="font-semibold">Need assistance?</span> If you have questions about your subscription, plan features, or would like to contact support,{" "}
          <Link href="/admin/support" className="font-semibold text-brand hover:underline transition-colors">
            visit the support page
          </Link>
          .
        </p>
      </div>

      {/* Help & Guide */}
      <UserGuide guide={HELP_GUIDE} />
    </div>
  );
}
