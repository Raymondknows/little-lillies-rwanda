// Exchange rate utilities - using exchangerate-api.com free tier
// Free tier: 1500 requests/month from single IP

const EXCHANGE_RATE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
let rateCache: Record<string, { rate: number; timestamp: number }> = {};

// Base prices in NGN
const BASE_PRICES = {
  starter: 35000,
  growth: 45000,
  enterprise: 0, // Custom pricing
};

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

/**
 * Get exchange rate from one currency to another
 * Uses cached rates when available, fetches fresh if older than 24 hours
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return 1;

  const cacheKey = `${fromCurrency}_${toCurrency}`;

  // Check if we have a valid cached rate
  if (rateCache[cacheKey]) {
    const cached = rateCache[cacheKey];
    if (Date.now() - cached.timestamp < EXCHANGE_RATE_CACHE_DURATION) {
      return cached.rate;
    }
  }

  try {
    // Using exchangerate-api.com free tier (1500 req/month)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
      { next: { revalidate: 86400 } } // Revalidate every 24 hours
    );

    if (!response.ok) {
      console.error(
        `Exchange rate API error: ${response.status} ${response.statusText}`
      );
      return getFallbackRate(fromCurrency, toCurrency);
    }

    const data = await response.json();
    const rate = data.rates[toCurrency];

    if (!rate) {
      console.warn(
        `Rate not found for ${fromCurrency} -> ${toCurrency}, using fallback`
      );
      return getFallbackRate(fromCurrency, toCurrency);
    }

    // Cache the rate
    rateCache[cacheKey] = {
      rate,
      timestamp: Date.now(),
    };

    return rate;
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    return getFallbackRate(fromCurrency, toCurrency);
  }
}

/**
 * Fallback rates (approximate, updated occasionally)
 * These are approximate rates - live rates come from exchangerate-api.com
 */
function getFallbackRate(from: string, to: string): number {
  // NGN to other African currencies
  const fallbackRates: Record<string, Record<string, number>> = {
    NGN: {
      GHS: 0.0074, // 1 NGN = 0.0074 GHS
      KES: 0.0806, // 1 NGN = 0.0806 KES
      UGX: 3.96, // 1 NGN = 3.96 UGX
      ZAR: 0.14, // 1 NGN = 0.14 ZAR
      USD: 0.00063,
      GBP: 0.0005,
      EUR: 0.00059,
    },
    GHS: {
      NGN: 135.14, // 1 GHS = 135.14 NGN
      KES: 10.87,
      UGX: 534.59,
      ZAR: 18.89,
    },
    KES: {
      NGN: 12.42, // 1 KES = 12.42 NGN
      GHS: 0.092,
      UGX: 49.18,
      ZAR: 1.74,
    },
    UGX: {
      NGN: 0.252, // 1 UGX = 0.252 NGN
      GHS: 0.0019,
      KES: 0.0203,
      ZAR: 0.0354,
    },
    ZAR: {
      NGN: 7.14, // 1 ZAR = 7.14 NGN
      GHS: 0.053,
      KES: 0.575,
      UGX: 28.25,
    },
  };

  return fallbackRates[from]?.[to] ?? 1;
}

/**
 * Convert NGN amount to target currency
 * @param amountNGN - Amount in NGN
 * @param targetCurrency - Target currency code (e.g., "GHS")
 * @returns Converted amount in target currency
 */
export async function convertNGNToLocal(
  amountNGN: number,
  targetCurrency: string
): Promise<number> {
  if (targetCurrency === "NGN") return amountNGN;

  const rate = await getExchangeRate("NGN", targetCurrency);
  return Math.round(amountNGN * rate * 100) / 100; // Round to 2 decimals
}

/**
 * Convert local currency amount to NGN for Paystack
 * @param localAmount - Amount in local currency
 * @param sourceCurrency - Source currency code (e.g., "GHS")
 * @returns Amount in NGN as integer (minor units for Paystack)
 */
export async function convertLocalToNGN(
  localAmount: number,
  sourceCurrency: string
): Promise<number> {
  if (sourceCurrency === "NGN") return localAmount * 100; // Convert to minor units

  const rate = await getExchangeRate(sourceCurrency, "NGN");
  const ngnAmount = localAmount * rate;
  return Math.round(ngnAmount * 100); // Convert to minor units for Paystack
}

/**
 * Get base plan price in local currency
 * @param plan - "starter" | "growth"
 * @param currency - Currency code (e.g., "GHS")
 * @returns Price in local currency
 */
export async function getPlanPriceInCurrency(
  plan: "starter" | "growth",
  currency: string
): Promise<number> {
  if (currency === "NGN") {
    return BASE_PRICES[plan];
  }

  const ngnPrice = BASE_PRICES[plan];
  return convertNGNToLocal(ngnPrice, currency);
}

/**
 * Get base plan price in NGN (minor units for Paystack)
 * @param plan - "starter" | "growth"
 * @returns Price in NGN as integer (minor units: 35000 NGN = 3500000 minor units)
 */
export function getPlanPriceInMinorUnits(plan: "starter" | "growth"): number {
  return BASE_PRICES[plan] * 100; // Convert to minor units
}
