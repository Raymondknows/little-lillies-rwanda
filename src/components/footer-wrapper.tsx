"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footer";

const hiddenFooterPaths = ["/admin", "/teacher", "/parent", "/schoolbase-admin"];

export default function FooterWrapper() {
  const pathname = usePathname() ?? "/";

  if (hiddenFooterPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return null;
  }

  return <Footer />;
}
