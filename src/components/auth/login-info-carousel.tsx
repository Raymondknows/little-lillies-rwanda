"use client";

import { useEffect, useState } from "react";

type LoginInfoCarouselProps = {
  tone: "purple" | "emerald" | "indigo";
};

type InfoItem = {
  label: string;
  content: string;
  href?: string;
};

const items: InfoItem[] = [
  {
    label: "📍 Location",
    content: "Rugarama village, Nyabisindu Cell\nRemera Sector, Gasabo District\nKigali, Rwanda",
  },
  { label: "📞 Contact Us", content: "+250 781 464 730", href: "tel:+250781464730" },
  { label: "📞 Contact Us", content: "+250 785 703 719", href: "tel:+250785703719" },
  { label: "✉️ Email Us", content: "littlelillies82@gmail.com", href: "mailto:littlelillies82@gmail.com" },
];

const toneClasses = {
  purple: { label: "text-fuchsia-100", link: "hover:text-amber-200" },
  emerald: { label: "text-emerald-100", link: "hover:text-cyan-200" },
  indigo: { label: "text-sky-100", link: "hover:text-rose-200" },
};

export function LoginInfoCarousel({ tone }: LoginInfoCarouselProps) {
  const [index, setIndex] = useState(0);
  const colors = toneClasses[tone];
  const item = items[index];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="login-info-carousel mx-auto mt-16 w-full text-center" aria-live="polite">
      <div key={item.label + item.content} className="login-info-single">
        <p className={`mb-3 text-xl font-bold tracking-wide ${colors.label}`}>{item.label}</p>
        {item.href ? (
          <a
            href={item.href}
            className={`whitespace-pre-line break-words text-xl font-normal text-white transition ${colors.link}`}
          >
            {item.content}
          </a>
        ) : (
          <p className="whitespace-pre-line text-xl font-normal leading-relaxed text-white">{item.content}</p>
        )}
      </div>
    </div>
  );
}
