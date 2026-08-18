import { escapeHtml } from "@/lib/email-utils";
import { brand } from "@/lib/brand";

const COLORS = {
  outerBg: brand.colors.background,
  cardBg: brand.colors.surface,
  headerBg: brand.colors.primary,
  accent: brand.colors.accent,
  text: brand.colors.text,
  muted: brand.colors.textMuted,
  footerBg: "#F8FAFC",
  border: brand.colors.border,
  success: brand.colors.success,
};

export type EmailCta = {
  label: string;
  href: string;
  variant?: "primary" | "success" | "whatsapp";
};

export type EmailLayoutOptions = {
  title: string;
  headerTitle?: string;
  // Optional logo to render in the header (full absolute URL)
  headerLogoUrl?: string;
  // Optional link for the header logo (defaults to home root if provided)
  headerLogoHref?: string;
  preheader?: string;
  heroTitle: string;
  heroSubtitle?: string;
  bodyHtml: string;
  ctas?: EmailCta[];
  variant?: "default" | "success" | "alert";
  // When true, render a flat, card-less email template (no rounded card or shadow)
  cardless?: boolean;
};

function ctaStyles(variant: EmailCta["variant"] = "primary"): string {
  switch (variant) {
    case "success":
      return `background:${COLORS.success};color:#ffffff;`;
    case "whatsapp":
      return "background:#25d366;color:#ffffff;";
    default:
      return `background:${COLORS.accent};color:#ffffff;`;
  }
}

export function buildEmailCtaButton(cta: EmailCta): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">
      <tr>
        <td align="center">
          <a href="${escapeHtml(cta.href)}" style="display:inline-block;min-width:200px;${ctaStyles(cta.variant)}text-decoration:none;padding:14px 28px;border-radius:4px;font-size:15px;font-weight:700;text-align:center;">
            ${escapeHtml(cta.label)}
          </a>
        </td>
      </tr>
    </table>`;
}

export function buildEmailInfoPanel(label: string, valueHtml: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;">
      <tr>
        <td style="padding:16px 18px;background:#f8f9fb;border:1px solid ${COLORS.border};border-radius:4px;">
          <p style="margin:0 0 6px 0;font-size:11px;color:${COLORS.muted};font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(label)}</p>
          <div style="margin:0;font-size:15px;color:${COLORS.text};line-height:1.55;">${valueHtml}</div>
        </td>
      </tr>
    </table>`;
}

export function buildDerivStyleEmail(opts: EmailLayoutOptions): string {
  const accentColor = opts.variant === "success" ? COLORS.success : COLORS.accent;
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(opts.preheader)}</div>`
    : "";
  const ctaBlock = (opts.ctas ?? []).map((c) => buildEmailCtaButton(c)).join("");
  const subtitle = opts.heroSubtitle
    ? `<p style="margin:0;font-size:16px;color:${COLORS.muted};line-height:1.6;">${opts.heroSubtitle.includes("<") ? opts.heroSubtitle : escapeHtml(opts.heroSubtitle)}</p>`
    : "";
  const headerTitle = opts.headerTitle ? escapeHtml(opts.headerTitle) : "Little Lillies School";

  // Cardless variant: render a simpler, flat layout (no rounded card or shadow)
  if (opts.cardless) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
  <style>@media (max-width:620px){.email-pad{padding-left:20px!important;padding-right:20px!important}}</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.outerBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${COLORS.text};">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.outerBg}">
<tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
    <tr>
      <td style="padding:18px 16px 12px;background:${COLORS.headerBg};text-align:left;color:#fff;">
        <div style="display:flex;align-items:center;gap:12px;">
          ${opts.headerLogoUrl ? `<a href="${escapeHtml(opts.headerLogoHref ?? "/")}" style="display:inline-flex;align-items:center;justify-content:center;line-height:0;margin-right:8px;padding:8px;background:#ffffff;border-radius:9999px;"><img src="${escapeHtml(opts.headerLogoUrl)}" alt="${escapeHtml(headerTitle)} logo" style="height:28px;display:block;border-radius:9999px;"/></a>` : ""}
          <h2 style="margin:0;font-size:18px;font-weight:800;">${headerTitle}</h2>
        </div>
      </td>
    </tr>
    <tr>
      <td style="height:6px;background:${accentColor};font-size:0">&nbsp;</td>
    </tr>
    <tr>
      <td class="email-pad" style="padding:22px 18px 12px;text-align:left;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${COLORS.text};">${escapeHtml(opts.heroTitle)}</h1>
        ${subtitle}
      </td>
    </tr>
    <tr>
      <td class="email-pad" style="padding:0 18px 18px;font-size:15px;line-height:1.7;color:${COLORS.text};">${opts.bodyHtml}</td>
    </tr>
    ${ctaBlock ? `<tr><td class="email-pad" style="padding:0 18px 20px">${ctaBlock}</td></tr>` : ""}
    <tr>
      <td style="background:${COLORS.footerBg};padding:18px;text-align:center;font-size:13px;color:${COLORS.muted};">
        <p style="margin:0 0 8px 0;">Need support? Reply to this email or contact your school administrator.</p>
        <p style="margin:0;">© ${new Date().getFullYear()} ${headerTitle}</p>
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
  <style>@media (max-width:620px){.email-pad{padding-left:20px!important;padding-right:20px!important}}</style>
</head>
<body style="margin:0;padding:0;background:${COLORS.outerBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.outerBg}">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${COLORS.cardBg};border-radius:20px;overflow:hidden;box-shadow:0 20px 80px rgba(0,0,0,0.08);">
<tr><td style="background:${COLORS.headerBg};padding:26px 24px;text-align:center">
  ${opts.headerLogoUrl ? `<a href="${escapeHtml(opts.headerLogoHref ?? "/")}" style="display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;padding:14px;background:#ffffff;border-radius:9999px;"><img src="${escapeHtml(opts.headerLogoUrl)}" alt="${escapeHtml(headerTitle)} logo" style="height:36px;display:block;border-radius:9999px;"/></a>` : ""}
  <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Official school notice</p>
  <h1 style="margin:10px 0 0;font-size:28px;line-height:1.1;color:#ffffff;font-weight:800;">${headerTitle}</h1>
</td></tr>
<tr><td style="height:4px;background:${accentColor};font-size:0">&nbsp;</td></tr>
<tr><td class="email-pad" style="padding:36px 32px 14px;text-align:center">
<h2 style="margin:0 0 10px;font-size:26px;font-weight:700;color:${COLORS.text};">${escapeHtml(opts.heroTitle)}</h2>
${subtitle}
</td></tr>
<tr><td class="email-pad" style="padding:0 32px 24px;font-size:15px;line-height:1.7;color:${COLORS.text};">${opts.bodyHtml}</td></tr>
${ctaBlock ? `<tr><td class="email-pad" style="padding:0 32px 28px">${ctaBlock}</td></tr>` : ""}
<tr><td style="background:${COLORS.footerBg};padding:24px 28px;text-align:center;font-size:13px;color:${COLORS.muted};">
<p style="margin:0 0 8px 0;">Need support? Reply to this email or contact your school administrator.</p>
<p style="margin:0;">© ${new Date().getFullYear()} ${headerTitle} via SchoolBase</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
