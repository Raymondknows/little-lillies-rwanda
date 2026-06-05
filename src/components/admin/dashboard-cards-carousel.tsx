"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, CreditCard, GraduationCap, Users, Layers } from "lucide-react";

interface DashboardCard {
  label: string;
  value: string;
  sub: string;
  href: string;
  iconName: "creditcard" | "graduationcap" | "users" | "layers";
}

interface DashboardCardsCarouselProps {
  stats: DashboardCard[];
}

const iconMap = {
  creditcard: CreditCard,
  graduationcap: GraduationCap,
  users: Users,
  layers: Layers,
};

export function DashboardCardsCarousel({ stats }: DashboardCardsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 4;
  const totalCards = stats.length;
  const maxIndex = Math.max(0, totalCards - cardsPerView);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleCards = stats.slice(currentIndex, currentIndex + cardsPerView);

  return (
    <div>
      {/* Desktop carousel view */}
      <div className="hidden sm:flex items-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex-shrink-0 p-2 rounded-lg border border-border bg-surface hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous cards"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-4 gap-4">
            {visibleCards.map(({ label, value, sub, href, iconName }) => {
              const Icon = iconMap[iconName];
              return (
                <Link
                  key={label}
                  href={href}
                  className="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border">
                      <Icon className="h-5 w-5 text-brand" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-4 text-sm text-muted">{label}</p>
                  <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
                  <p className="mt-1 text-xs text-muted">{sub}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === maxIndex}
          className="flex-shrink-0 p-2 rounded-lg border border-border bg-surface hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next cards"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Mobile grid view */}
      <div className="sm:hidden grid gap-4 grid-cols-1">
        {stats.map(({ label, value, sub, href, iconName }) => {
          const Icon = iconMap[iconName];
          return (
            <Link
              key={label}
              href={href}
              className="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-4 text-sm text-muted">{label}</p>
              <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
              <p className="mt-1 text-xs text-muted">{sub}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
