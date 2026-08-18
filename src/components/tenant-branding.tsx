"use client";
import React, { useEffect } from "react";

type Tenant = {
  name?: string;
  appName?: string;
  slug?: string;
  logo_path?: string;
  currency?: string;
  colors?: { primary?: string; secondary?: string; accent?: string };
  [k: string]: any;
};

export default function TenantBranding({ slug = "little-lillies" }: { slug?: string }) {
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`/tenants/${slug}.json`);
        if (!mounted || !res.ok) return;
        const data: Tenant = await res.json();
        const root = document.documentElement;
        
        // Apply colors
        if (data.colors) {
          if (data.colors.primary) root.style.setProperty("--brand", data.colors.primary);
          if (data.colors.secondary) root.style.setProperty("--brand-accent", data.colors.secondary);
          if (data.colors.accent) root.style.setProperty("--brand-hover", data.colors.accent);
        }
        
        // Set app name in title and metadata
        const appName = data.appName || data.name || "Little Lillies School";
        if (appName) {
          try {
            const base = document.title || "Little Lillies School";
            if (!base.includes(appName)) {
              document.title = `${appName} — ${base}`;
            }
          } catch (e) {
            /* ignore */
          }
        }
        
        // Store app name and currency in window for global access
        (window as any).__tenantConfig = {
          appName: appName,
          currency: data.currency || "NGN",
          slug: data.slug || slug,
        };
        
        // Set favicon
        if (data.logo_path) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
          if (link) link.href = data.logo_path;
        }
      } catch (err) {
        // fail silently — branding is optional
        // eslint-disable-next-line no-console
        console.warn("TenantBranding load failed", err);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  return null;
}
