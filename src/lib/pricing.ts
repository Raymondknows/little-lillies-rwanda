/**
 * Simple fixed NGN pricing for all countries
 * Everyone pays ₦35,000 (Starter) or ₦45,000 (Growth) regardless of selected country
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

export function getPricingByCurrency(currencyCode: string): CountryPlans {
  // Fixed NGN prices for everyone
  const starterNGN = 35000;
  const growthNGN = 45000;

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
      priceLabel: 'Custom pricing',
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
