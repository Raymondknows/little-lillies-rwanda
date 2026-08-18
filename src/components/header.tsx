"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const hasSessionCookie = /(?:^|;\s*)schoolbase_session=/.test(document.cookie)
      || /(?:^|;\s*)schoolbase_staff=/.test(document.cookie)
      || /(?:^|;\s*)staff_session=/.test(document.cookie);

    setIsLoggedIn(
      hasSessionCookie 
      || pathname.startsWith("/admin") 
      || pathname.startsWith("/teacher") 
      || pathname.startsWith("/parent") 
      || pathname.startsWith("/schoolbase-admin")
      || pathname === "/login"
      || pathname === "/parent/login"
      || pathname === "/schoolbase-admin/login"
    );
  }, [pathname]);

  if (isLoggedIn) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur print:hidden">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between">
          <AppLogo showSpinner />

          {/* Desktop Navigation */}
          <nav className="hidden flex-wrap items-center justify-center gap-4 text-sm font-medium text-muted md:flex md:gap-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-brand">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Sign In */}
          <Link
            href="/login"
            className="hidden rounded-md border border-brand/20 bg-brand/5 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand hover:text-white focus:outline-none focus:ring-2 focus:ring-brand/40 md:inline-flex md:items-center md:justify-center"
          >
            Sign in
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-brand/10 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="mt-4 space-y-1 border-t border-border pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-brand/10 hover:text-brand transition"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-brand hover:bg-brand/10 transition"
              >
                Sign in
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

