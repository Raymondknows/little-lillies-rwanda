"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ParentSchoolData = {
  id?: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  country?: string;
  currency?: string;
  logoUrl?: string;
};

const ParentSchoolContext = createContext<{ school: ParentSchoolData | null }>({ school: null });

export function ParentSchoolProvider({
  school,
  children,
}: {
  school: ParentSchoolData | null;
  children: ReactNode;
}) {
  return <ParentSchoolContext.Provider value={{ school }}>{children}</ParentSchoolContext.Provider>;
}

export function useParentSchool() {
  return useContext(ParentSchoolContext);
}

export function useEffectiveCurrency(school?: ParentSchoolData | null) {
  const [currency, setCurrency] = useState<string>(school?.currency || "NGN");

  useEffect(() => {
    let active = true;

    async function loadCurrency() {
      try {
        const response = await fetch("/api/country/config");
        if (!response.ok) {
          throw new Error("Country config request failed");
        }

        const config = await response.json();
        const resolvedCurrency = config?.data?.currency || school?.currency || "NGN";
        if (active) {
          setCurrency(resolvedCurrency);
        }
      } catch (error) {
        console.error("Error loading country config for parent currency:", error);
        if (active) {
          setCurrency(school?.currency || "NGN");
        }
      }
    }

    loadCurrency();
    return () => {
      active = false;
    };
  }, [school?.currency]);

  return currency;
}
