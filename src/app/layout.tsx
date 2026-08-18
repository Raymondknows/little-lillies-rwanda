import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import FooterWrapper from "@/components/footer-wrapper";
import TenantBranding from "@/components/tenant-branding";
import fs from "fs";
import path from "path";

// Read tenant config from public tenant JSON at build time (server)
let tenantDomain = "https://schoolbase.live";
let tenantAppName = "Little Lillies School";
let tenantCurrency = "NGN";
try {
  const tenantPath = path.join(process.cwd(), "public", "tenants", "little-lillies.json");
  if (fs.existsSync(tenantPath)) {
    const raw = fs.readFileSync(tenantPath, "utf8");
    const t = JSON.parse(raw);
    if (t) {
      if (t.domain) tenantDomain = t.domain;
      if (t.appName) tenantAppName = t.appName;
      if (t.currency) tenantCurrency = t.currency;
    }
  }
} catch (e) {
  // ignore and fall back to defaults
}

const tagline = "Everything your school needs in one simple platform";

export const metadata: Metadata = {
  title: `${tenantAppName} — ${tagline}`,
  description:
    "Collect fees, reach parents on WhatsApp, publish results, and run a beautiful school website. Live in 48 hours.",
  keywords: [
    "school management",
    "fee collection",
    "WhatsApp school communication",
    "student results",
    "school website",
    "attendance tracking",
    "parent communication",
    "school software",
    "education platform",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#0052cc",
    "google-site-verification": "cAqU-s5g0iU-8bvOexUa_zShdcpkNX7pMX7QKxLQM2A",
  },
  openGraph: {
    title: `${tenantAppName} — ${tagline}`,
    description:
      "Collect fees, reach parents on WhatsApp, publish results, and run a beautiful school website. Live in 48 hours.",
    url: tenantDomain,
    siteName: "Little Lillies School",
    images: [
      {
        url: `${tenantDomain.replace(/\/$/, "")}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Little Lillies School",
    description: "School management platform for fee collection and parent communication",
    images: [`${tenantDomain.replace(/\/$/, "")}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "t16cQxxS0inhasAplgIcn3t1KCZQMYhzt74Nk8zVFxQ",
  },
  alternates: {
    canonical: tenantDomain,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TenantBranding />
        <Header />
        <main className="flex-1">{children}</main>
        <FooterWrapper />
      </body>
    </html>
  );
}
