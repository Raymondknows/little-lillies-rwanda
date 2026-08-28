export const brand = {
  name: "Little Lillies School",
  tagline: "Connected school management for Little Lillies School.",
  colors: {
    primary: "#0A66C2",
    primaryHover: "#004182",
    primaryLight: "#E8F4FC",
    accent: "#70B5F9",
    success: "#057642",
    warning: "#915907",
    error: "#CC1016",
    text: "#191919",
    textMuted: "#666666",
    border: "#E0E0E0",
    surface: "#FFFFFF",
    background: "#F3F2EF",
  },
} as const;

export function formatMoney(amountMinor: number, currency = "NGN") {
  const value = amountMinor / 100;
  try {
    return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}
