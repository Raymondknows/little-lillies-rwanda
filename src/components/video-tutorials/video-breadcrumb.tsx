import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface VideoBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function VideoBreadcrumb({ items }: VideoBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600 mb-8">
      <Link href="/" className="hover:text-slate-900 transition-colors">
        Home
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-slate-900 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
