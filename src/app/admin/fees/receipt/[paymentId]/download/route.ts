import { prisma } from "@/lib/db";
import { getCurrentSchool } from "@/lib/school";
import { PDFDocument, StandardFonts } from "pdf-lib";

async function embedSchoolLogo(pdfDoc: any, page: any, logoUrl: string, x: number, y: number) {
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return 0;

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default || sharpModule;
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();
    const logoImage = await pdfDoc.embedPng(pngBuffer);
    const logoDims = logoImage.scale(120 / logoImage.width);

    page.drawImage(logoImage, {
      x,
      y: y - logoDims.height + 12,
      width: logoDims.width,
      height: logoDims.height,
    });

    return logoDims.width + 12;
  } catch (error) {
    console.warn("Unable to embed school logo in fee receipt PDF:", error);
    return 0;
  }
}

export async function GET(request: Request, context: any) {
  const rawParams = context?.params;
  const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
  const paymentId = params?.paymentId as string;
  const school = await getCurrentSchool();

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, invoice: { schoolId: school.id } },
    include: { invoice: { include: { pupil: { include: { class: true } }, school: true } } },
  });

  if (!payment) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  const inv = payment.invoice;
  if (!inv) return new Response(JSON.stringify({ error: "Invoice not found" }), { status: 404 });

  // Build a simple PDF using pdf-lib (avoids fontkit/pdfkit bundling issues)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSizeTitle = 18;
  const fontSize = 12;

  let y = 800;
  let x = 50;

  if (school.logoUrl) {
    x += await embedSchoolLogo(pdfDoc, page, school.logoUrl, x, y);
  }

  page.drawText(school.name ?? "", { x, y, size: fontSizeTitle, font: helvetica });
  y -= fontSizeTitle + 8;
  if (school.address) {
    page.drawText(school.address, { x, y, size: fontSize, font: helvetica });
    y -= fontSize + 6;
  }

  y -= 8;
  page.drawText("Fee Receipt", { x: 50, y, size: 16, font: helvetica });
  y -= 24;

  page.drawText(`Receipt No: ${payment.id.slice(-8).toUpperCase()}`, { x: 50, y, size: fontSize, font: helvetica });
  y -= fontSize + 4;
  page.drawText(`Invoice: ${inv.invoiceNo}`, { x: 50, y, size: fontSize, font: helvetica });
  y -= fontSize + 4;
  page.drawText(`Student: ${inv.pupil.firstName} ${inv.pupil.lastName}`, { x: 50, y, size: fontSize, font: helvetica });
  y -= fontSize + 4;
  page.drawText(`Class: ${inv.pupil.class?.name ?? ""} ${inv.pupil.class?.arm ?? ""}`, { x: 50, y, size: fontSize, font: helvetica });
  y -= fontSize + 8;

  const amountPaid = (payment.amount / 100).toFixed(2);
  const amountDue = (inv.amountDue / 100).toFixed(2);
  const balance = ((inv.amountDue - inv.amountPaid) / 100).toFixed(2);

  page.drawText(`Amount paid: ${amountPaid} ${school.currency}`, { x: 50, y, size: fontSize, font: helvetica });
  y -= fontSize + 4;
  page.drawText(`Amount due: ${amountDue} ${school.currency}`, { x: 50, y, size: fontSize, font: helvetica });
  y -= fontSize + 4;
  page.drawText(`Balance: ${balance} ${school.currency}`, { x: 50, y, size: fontSize, font: helvetica });
  y -= fontSize + 4;
  page.drawText(`Method: ${payment.method}`, { x: 50, y, size: fontSize, font: helvetica });
  y -= fontSize + 4;
  page.drawText(`Date: ${payment.paidAt.toISOString().slice(0, 10)}`, { x: 50, y, size: fontSize, font: helvetica });

  y -= fontSize + 12;
  page.drawText("Thank you for your payment.", { x: 50, y, size: fontSize, font: helvetica });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${payment.id}.pdf"`,
    },
  });
}
