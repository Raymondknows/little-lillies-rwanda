"use client";

import { ReactNode, useState } from "react";
import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  section?: string;
};

export default function SharedLayout({
  children,
  navItems,
  school,
  session,
  logoHref = "/",
  logoutRedirectUrl = "/login",
}: {
  children: ReactNode;
  navItems: NavItem[];
  school?: { name?: string | null; city?: string | null; country?: string | null } | null;
  session?: { name?: string } | null;
  logoHref?: string;
  logoutRedirectUrl?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const hideSidebar = pathname?.startsWith("/login");

  if (hideSidebar) {
    return (
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6 md:p-8 print:overflow-visible print:p-0">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        navItems={navItems}
        school={school}
        session={session}
        logoHref={logoHref}
        logoutRedirectUrl={logoutRedirectUrl}
      />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden print:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen w-56 transform bg-surface md:hidden print:hidden transition-transform duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          navItems={navItems}
          school={school}
          session={session}
          logoHref={logoHref}
          logoutRedirectUrl={logoutRedirectUrl}
          isMobile
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header */}
        <div className="border-b border-border bg-surface px-4 py-3 md:hidden flex items-center gap-2 print:hidden">
          <Button
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 h-auto w-auto"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <h1 className="text-sm font-semibold text-foreground">{school?.name}</h1>
        </div>

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6 md:p-8 print:overflow-visible print:p-0">{children}</main>
      </div>
    </div>
  );
}
