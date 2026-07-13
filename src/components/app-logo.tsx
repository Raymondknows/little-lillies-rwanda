import Image from "next/image";
import Link from "next/link";

type Size = "sm" | "md" | "lg";

/** Source asset: 247×230px (publish/logo.png) */
const LOGO_WIDTH = 247;
const LOGO_HEIGHT = 230;

const sizeMap: Record<Size, { box: number; img: number; text: string }> = {
  sm: { box: 40, img: 28, text: "text-base" },
  md: { box: 48, img: 34, text: "text-lg" },
  lg: { box: 60, img: 42, text: "text-xl" },
};

interface AppLogoProps {
  href?: string | null;
  size?: Size;
  showText?: boolean;
  className?: string;
}

export function AppLogo({
  href,
  size = "md",
  showText = true,
  className = "",
}: AppLogoProps) {
  const { box, img, text } = sizeMap[size];

  const mark = (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border"
      style={{ width: box, height: box }}
    >
      <Image
        src="/logo.png"
        alt="SchoolBase"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className="object-contain"
        style={{ width: img, height: Math.round(img * (LOGO_HEIGHT / LOGO_WIDTH)) }}
        priority={size === "lg"}
      />
    </span>
  );

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {mark}
      {showText && (
        <span
          className={`font-semibold tracking-tight text-foreground ${text}`}
        >
          SchoolBase
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex hover:opacity-90 transition-opacity">
      {content}
    </Link>
  );
}
