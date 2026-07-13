import QRCode from "qrcode";

export interface PinPrintCardData {
  schoolName?: string;
  schoolLogoUrl?: string | null;
  schoolId?: string | null;
  schoolCode: string;
  studentName: string;
  admissionNo: string;
  session: string;
  term: string;
  pin: string;
  printedAt: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function buildPinCardHtml(data: PinPrintCardData): Promise<string> {
  const payload = JSON.stringify({
    schoolCode: data.schoolCode,
    studentName: data.studentName,
    admissionNo: data.admissionNo,
    session: data.session,
    term: data.term,
    pin: data.pin,
    printedAt: data.printedAt,
  });

  const qrSvg = await QRCode.toString(payload, {
    type: "svg",
    width: 120,
    margin: 1,
    color: { dark: "#111827", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });

  const logoSource = data.schoolLogoUrl || (data.schoolId ? `/api/school-logo/${encodeURIComponent(data.schoolId)}` : null);
  const resolvedLogoUrl = logoSource
    ? (() => {
        if (/^https?:\/\//.test(logoSource)) return logoSource;
        if (typeof window !== "undefined" && window.location?.origin) {
          try {
            return new URL(logoSource, window.location.origin).toString();
          } catch {
            return logoSource;
          }
        }
        return logoSource;
      })()
    : null;

  return `<!DOCTYPE html>
    <html>
      <head>
        <title>Result Access PIN Sheet</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 12px; color: #111827; background: #ffffff; }
          .card { border: 2px solid #111827; border-radius: 12px; padding: 14px 16px; max-width: 740px; min-height: 280px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
          .header { display: flex; align-items: center; justify-content: flex-start; gap: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 8px; }
          .schoolBlock { display: flex; align-items: center; gap: 10px; min-width: 0; }
          .logoBox { width: 48px; height: 48px; border-radius: 10px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #64748b; text-align: center; background: #ffffff; overflow: hidden; padding: 4px; flex-shrink: 0; }
          .logoImage { width: 100%; height: 100%; object-fit: contain; display: block; background: #ffffff; }
          .schoolName { font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: 0.01em; line-height: 1.2; }
          .schoolCodeLabel { font-size: 11px; color: #64748b; margin-top: 2px; font-weight: 600; }
          .content { display: flex; gap: 18px; align-items: flex-start; justify-content: space-between; }
          .details { flex: 1; min-width: 0; }
          .title { text-align: left; font-size: 18px; font-weight: 700; margin-bottom: 8px; color: #111827; }
          .field { margin: 6px 0; font-size: 14px; }
          .label { font-weight: 700; }
          .pin { font-size: 24px; font-weight: 700; letter-spacing: 0.28em; margin-top: 8px; margin-bottom: 6px; }
          .meta { font-size: 12px; color: #6b7280; margin-top: 6px; }
          .qr { margin-top: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .qr svg { width: 110px !important; height: 110px !important; }
          .hint { margin-top: 8px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="schoolBlock">
              <div class="logoBox">
                ${resolvedLogoUrl ? `<img class="logoImage" src="${escapeHtml(resolvedLogoUrl)}" alt="${escapeHtml(data.schoolName || data.schoolCode || "School logo")}" onerror="this.style.display='none'; this.parentElement.innerHTML='School<br />Logo';" />` : "School<br />Logo"}
              </div>
              <div>
                <div class="schoolName">${escapeHtml(data.schoolName || data.schoolCode || "School Name")}</div>
                <div class="schoolCodeLabel">Result Access PIN Card</div>
              </div>
            </div>
          </div>
          <div class="title">Result Access PIN Sheet</div>
          <div class="content">
            <div class="details">
              <div class="field"><span class="label">School code:</span> ${escapeHtml(data.schoolCode)}</div>
              <div class="field"><span class="label">Student:</span> ${escapeHtml(data.studentName)}</div>
              <div class="field"><span class="label">Admission number:</span> ${escapeHtml(data.admissionNo)}</div>
              <div class="field"><span class="label">Session:</span> ${escapeHtml(data.session)}</div>
              <div class="field"><span class="label">Term:</span> ${escapeHtml(data.term)}</div>
              <div class="field"><span class="label">PIN:</span></div>
              <div class="pin">${escapeHtml(data.pin)}</div>
              <div class="meta">Printed at: ${escapeHtml(data.printedAt)}</div>
              <div class="hint">Scan the QR code to verify the record details and print timestamp.</div>
            </div>
            <div class="qr">${qrSvg}</div>
          </div>
        </div>
      </body>
    </html>`;
}
