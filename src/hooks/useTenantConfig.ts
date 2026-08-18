'use client';

import { useEffect, useState } from 'react';

export interface TenantConfig {
  name?: string;
  appName?: string;
  slug?: string;
  domain?: string;
  logo_path?: string;
  currency?: string;
  colors?: { primary?: string; secondary?: string; accent?: string };
  phones?: string[];
  emails?: string[];
  address?: string;
  proprietor?: string;
  [k: string]: any;
}

const FALLBACK_CONFIG: TenantConfig = {
  appName: 'Little Lillies School',
  currency: 'NGN',
  name: 'Little Lillies School',
};

/**
 * Hook to load tenant configuration from JSON file.
 * Reads from /public/tenants/{slug}.json
 */
export function useTenantConfig(slug = 'little-lillies'): TenantConfig {
  const [config, setConfig] = useState<TenantConfig>(FALLBACK_CONFIG);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`/tenants/${slug}.json`);
        if (!mounted || !res.ok) return;
        const data: TenantConfig = await res.json();
        setConfig({
          ...FALLBACK_CONFIG,
          ...data,
          // Ensure appName defaults to name if not specified
          appName: data.appName || data.name || FALLBACK_CONFIG.appName,
        });
      } catch (err) {
        console.warn('Failed to load tenant config', err);
        setConfig(FALLBACK_CONFIG);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  return config;
}

/**
 * Get default currency for a slug (synchronous, uses hardcoded defaults).
 * Use this for server-side or when you need sync access.
 */
export function getTenantCurrencySync(slug = 'little-lillies'): string {
  const currencyMap: Record<string, string> = {
    'little-lillies': 'RWF',
    'greenfield': 'USD',
    'default': 'NGN',
  };
  return currencyMap[slug] || currencyMap.default;
}

/**
 * Get default app name for a slug (synchronous, uses hardcoded defaults).
 * Use this for server-side or when you need sync access.
 */
export function getTenantAppNameSync(slug = 'little-lillies'): string {
  const nameMap: Record<string, string> = {
    'little-lillies': 'Little Lillies School',
    'greenfield': 'Greenfield Academy',
    'default': 'Little Lillies School',
  };
  return nameMap[slug] || nameMap.default;
}
