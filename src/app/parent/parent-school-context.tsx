"use client";

import { createContext, useContext, type ReactNode } from "react";

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
