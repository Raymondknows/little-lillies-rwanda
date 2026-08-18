/**
 * Currency-aware pricing for different regions
 * Supports NGN (Nigeria), RWF (Rwanda), and other currencies
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
  // Currency-specific pricing
  if (currencyCode === 'RWF') {
    // Rwanda Francs pricing (approximately 50,000-60,000 RWF equivalent)
    const starterRWF = 50000;
    const growthRWF = 70000;
    return {
      starter: {
        amountMinor: starterRWF * 100,
        priceLabel: `${starterRWF.toLocaleString()} RWF / term`,
      },
      standard: {
        amountMinor: growthRWF * 100,
        priceLabel: `${growthRWF.toLocaleString()} RWF / term`,
      },
      group: {
        amountMinor: 0,
        priceLabel: 'Custom from 150,000 RWF / term',
      },
    };
  }

  // Default NGN pricing for Nigeria and other regions
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
    RWF: 'FRw',
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
