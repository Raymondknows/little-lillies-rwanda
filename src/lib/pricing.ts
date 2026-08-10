/**
 * Simple fixed NGN pricing for all countries
 * Everyone pays ₦60,000 (Starter) or ₦85,000 (Growth) regardless of selected country
 */

export interface PlanConfig {
  amountMinor: number;
  priceLabel: string;
}

export interface CountryPlans {
  starter: PlanConfig;
  standard: PlanConfig;
  group: PlanConfig;
}

export const PLAN_STUDENT_LIMITS: Record<string, number | null> = {
  FREE: null,
  TRIAL: null,
  STARTER: 150,
  GROWTH: 600,
  ENTERPRISE: null,
};

export function getPlanStudentLimit(plan: string): number | null {
  return PLAN_STUDENT_LIMITS[plan] ?? null;
}

export function getPricingByCurrency(currencyCode: string): CountryPlans {
  // Fixed NGN prices for everyone
  const starterNGN = 60000;
  const growthNGN = 85000;

  return {
    starter: {
      amountMinor: starterNGN * 100, // Minor units for Paystack
      priceLabel: `₦${starterNGN.toLocaleString()} / term`,
    },
    standard: {
      amountMinor: growthNGN * 100, // Minor units for Paystack
      priceLabel: `₦${growthNGN.toLocaleString()} / term`,
    },
    group: {
      amountMinor: 0,
      priceLabel: 'Custom from ₦150,000 / term',
    },
  };
}

export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    NGN: '₦',
    GHS: 'GHS',
    KES: 'KSh',
    UGX: 'USh',
    ZAR: 'R',
    USD: '$',
    GBP: '£',
    EUR: '€',
  };
  return symbols[currencyCode] || currencyCode;
}
