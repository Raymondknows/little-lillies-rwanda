'use client';

import { useEffect, useState } from 'react';
import countriesData from '../../config/countries.json';

interface CurrencySwitcherProps {
  currentCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
}

export function CurrencySwitcher({ currentCurrency = 'NGN', onCurrencyChange }: CurrencySwitcherProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentCurrency);

  const currencyOptions = Array.from(
    new Set(
      Object.values((countriesData.countries as any) || {}).map(
        (country: any) => country.currency
      )
    )
  ).sort();

  const handleSelect = (currency: string) => {
    setSelected(currency);
    onCurrencyChange?.(currency);
    setOpen(false);

    // Store in cookie for persistence
    document.cookie = `school_currency=${currency}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-50"
      >
        <span>💱 {selected}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
          <div className="p-2">
            {currencyOptions.map((currency) => (
              <button
                key={currency}
                onClick={() => handleSelect(currency as string)}
                className={`block w-full text-left px-3 py-2 rounded text-sm transition ${
                  selected === currency
                    ? 'bg-brand text-white font-semibold'
                    : 'hover:bg-slate-100 text-foreground'
                }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
