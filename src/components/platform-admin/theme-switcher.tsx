"use client";

import { useMemo } from "react";
import { Monitor, Moon, SunMedium } from "lucide-react";
import type { ThemeMode } from "@/lib/theme";

const themeOptions: Record<ThemeMode, { label: string; description: string; icon: typeof SunMedium }> = {
  light: { label: "Light", description: "Bright, high-contrast workspace.", icon: SunMedium },
  dark: { label: "Dark", description: "Deep focus with rich contrast.", icon: Moon },
  system: { label: "System", description: "Follow your device preference.", icon: Monitor },
};

function optionClasses(active: boolean) {
  return `inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
    active
      ? "border-brand bg-brand/10 text-brand shadow-sm"
      : "border-border bg-background text-foreground hover:border-brand hover:bg-brand/5"
  }`;
}

export function ThemeSwitcher({
  theme,
  onChange,
}: {
  theme: ThemeMode;
  onChange: (next: ThemeMode) => void;
}) {
  const statusText = useMemo(() => {
    if (theme === "system") return "Auto-following your OS preference.";
    if (theme === "dark") return "Dark mode stays active regardless of system setting.";
    return "Light mode stays active regardless of system setting.";
  }, [theme]);

  return (
    <div className="rounded-[28px] border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Theme</p>
          <p className="mt-1 text-xs text-muted">Select a polished visual style for the admin workspace.</p>
        </div>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
          {theme === "system" ? "Auto" : theme}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {(Object.keys(themeOptions) as ThemeMode[]).map((option) => {
          const optionMeta = themeOptions[option];
          const Icon = optionMeta.icon;
          const active = theme === option;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={optionClasses(active)}
            >
              <Icon className="h-4 w-4" />
              <span>{optionMeta.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-3xl border border-border/80 bg-background/90 px-4 py-3 text-xs text-muted">
        {statusText}
      </div>
    </div>
  );
}
