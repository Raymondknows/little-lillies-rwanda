export const SUPPORTED_LANGUAGES = ["en", "rw", "fr", "sw"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  rw: "Kinyarwanda",
  fr: "French",
  sw: "Swahili",
};

export const LANGUAGE_LOCALES: Record<SupportedLanguage, string> = {
  en: "en",
  rw: "rw",
  fr: "fr-FR",
  sw: "sw-KE",
};

export function normalizeLanguage(value: unknown): SupportedLanguage {
  return typeof value === "string" && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)
    ? value as SupportedLanguage
    : "en";
}