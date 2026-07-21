"use client";

import { createElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { resolveSchoolAssetUrl } from "@/lib/asset-urls";
import {
  Home,
  LayoutDashboard,
  BookOpen,
  BookMarked,
  FileText,
  ClipboardList,
  Users,
  Bell,
  Mail,
  UserCircle,
  CreditCard,
  GraduationCap,
  BarChart3,
  Settings,
  Globe,
  Layers,
  HelpCircle,
  MessageSquare,
  PenTool,
  Building2,
  Baby,
  Eye,
  ClipboardCheck,
  TrendingUp,
  Award,
  Megaphone,
  Send,
  Sparkles,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/icons";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  section?: string;
};

const icons: Record<string, any> = {
  Home,
  LayoutDashboard,
  BookOpen,
  BookMarked,
  FileText,
  ClipboardList,
  Users,
  Bell,
  Mail,
  UserCircle,
  CreditCard,
  GraduationCap,
  WhatsApp: WhatsAppIcon,
  BarChart3,
  Settings,
  Globe,
  Layers,
  HelpCircle,
  MessageSquare,
  PenTool,
  Building2,
  Baby,
  Eye,
  ClipboardCheck,
  TrendingUp,
  Award,
  Megaphone,
  Send,
  Sparkles,
};

export default function Sidebar({
  navItems,
  school,
  session,
  logoHref = "/",
  logoutRedirectUrl = "/login",
  isMobile = false,
  onClose,
}: {
  navItems: NavItem[];
  school?: { name?: string | null; city?: string | null; country?: string | null; logoUrl?: string | null } | null;
  session?: { name?: string } | null;
  logoHref?: string;
  logoutRedirectUrl?: string;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  let lastSection: string | undefined;
  const schoolLogo = school?.logoUrl ? resolveSchoolAssetUrl(school.logoUrl) : null;
  const schoolName = school?.name || "SchoolBase";

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className={`w-56 h-screen flex flex-col border-r border-border bg-surface overflow-hidden print:hidden ${
      isMobile ? "" : "hidden md:flex"
    }`}>
      <div className="border-b border-border px-4 py-4 flex-shrink-0">
        <Link href={logoHref} className="flex items-center gap-2.5 rounded-lg px-1 py-1 hover:bg-accent/40 transition-colors">
          {schoolLogo ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white shadow-sm">
              <img src={schoolLogo} alt={schoolName} className="h-full w-full object-contain p-1" />
            </div>
          ) : (
            <AppLogo size="md" showText={false} href={null} />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{schoolName}</p>
            <p className="truncate text-xs text-muted">{session?.name ?? "Staff"} · {school?.city ?? school?.country}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 p-2 overflow-y-auto">
        {navItems.map(({ href, label, icon, section }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const showSection = section && section !== lastSection;
          lastSection = section;

          return (
            <div key={href}>
              {showSection ? (
                <div className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  {section}
                </div>
              ) : null}
              <Link
                href={href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-muted hover:bg-brand-light hover:text-brand"
                }`}
              >
                {icons[icon] ? createElement(icons[icon], { className: "h-4 w-4" }) : null}
                {label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3 space-y-2 flex-shrink-0">
        <LogoutButton redirectUrl={logoutRedirectUrl} />
        <Link 
          href="/demo" 
          onClick={handleNavClick}
          className="mb-1 flex items-center gap-2 text-sm text-brand hover:underline"
        >
          Public website
        </Link>
        <Link 
          href="/" 
          onClick={handleNavClick}
          className="flex items-center gap-2 text-sm text-muted hover:text-brand"
        >
          SchoolBase home
        </Link>
      </div>
    </aside>
  );
}
