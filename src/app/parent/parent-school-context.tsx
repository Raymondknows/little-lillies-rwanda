"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getBackendUrl } from "@/lib/backend-url";

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

    const resolvedCurrency = school?.currency || "NGN";
    if (active) {
      setCurrency(resolvedCurrency);
    }

    return () => {
      active = false;
    };
  }, [school?.currency]);

  return currency;
}
