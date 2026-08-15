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
    <div className="rounded-[12px] border border-border bg-surface p-2 shadow-sm text-sm">
      <div className="flex items-center justify-between gap-3 px-2 py-1">
        <p className="text-sm font-semibold text-foreground">Theme</p>
        <span className="text-xs text-muted">{theme === "system" ? "Auto" : theme}</span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 px-2">
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
              className={optionClasses(active).replace('min-h-[44px]','min-h-[36px]').replace('px-3 py-2','px-2 py-1 text-xs')}
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{optionMeta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
