import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PublicPageShellProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  children: React.ReactNode;
}

export function PublicPageShell({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref = "/contact",
  children,
}: PublicPageShellProps) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <div className="mb-10 rounded-3xl border border-border bg-surface p-8 shadow-sm md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{subtitle}</p>
        )}
        {ctaLabel && (
          <div className="mt-8">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
