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
  showSpinner?: boolean;
  className?: string;
}

export function AppLogo({
  href,
  size = "md",
  showText = true,
  showSpinner = false,
  className = "",
}: AppLogoProps) {
  const { box, img, text } = sizeMap[size];

  const mark = (
    <span className="relative flex shrink-0 items-center justify-center" style={{ width: box, height: box }}>
      <span className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-border" />

      <span className="relative z-10 flex items-center justify-center rounded-full overflow-hidden" style={{ width: box, height: box }}>
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

      {showSpinner ? (
        <svg className="absolute inset-0 w-full h-full z-20 animate-spin" viewBox={`0 0 ${box} ${box}`} xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <circle
            cx={box / 2}
            cy={box / 2}
            r={(box - 6) / 2}
            fill="none"
            stroke="#0A66C2"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${Math.round(Math.PI * (box - 6) * 0.25)}, ${Math.round(Math.PI * (box - 6) * 0.75)}`}
            strokeOpacity={0.9}
          />
        </svg>
      ) : null}
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
