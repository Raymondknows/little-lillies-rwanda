import { PDFDocument, rgb, PDFPage } from "pdf-lib";

interface ReceiptData {
  schoolName: string;
  schoolLogo?: string;
  pupilName: string;
  admissionNo: string;
  invoiceNo: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  paymentMethod: string;
  reference?: string;
  dueDate?: Date;
  note?: string;
}

async function embedSchoolLogo(pdfDoc: any, page: any, schoolLogo: string, x: number, y: number) {
  try {
    const response = await fetch(schoolLogo);
    if (!response.ok) return 0;

    const fileBuffer = Buffer.from(await response.arrayBuffer());
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default || sharpModule;
    const pngBuffer = await sharp(fileBuffer).png().toBuffer();
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
    console.warn("Unable to embed school logo in PDF receipt:", error);
    return 0;
  }
}

/**
 * Generate a PDF receipt for a payment
 * Returns PDF as buffer (can be returned as file download or emailed)
 */
export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size in points
  const { width, height } = page.getSize();

  const primaryColor = rgb(10 / 255, 102 / 255, 194 / 255); // LinkedIn blue #0A66C2
  const textColor = rgb(25 / 255, 25 / 255, 25 / 255); // #191919
  const lightGray = rgb(102 / 255, 102 / 255, 102 / 255); // #666666

  let y = height - 60;
  const margin = 40;
  const lineHeight = 20;

  // Header
  let headerOffset = margin;
  if (data.schoolLogo) {
    headerOffset += await embedSchoolLogo(pdfDoc, page, data.schoolLogo, margin, y);
  }

  page.drawText(data.schoolName, {
    x: headerOffset,
    y,
    size: 28,
    color: primaryColor,
    font: await pdfDoc.embedFont("Helvetica-Bold"),
  });

  y -= 40;

  // Title
  page.drawText("PAYMENT RECEIPT", {
    x: margin,
    y,
    size: 16,
    color: textColor,
    font: await pdfDoc.embedFont("Helvetica-Bold"),
  });

  y -= 30;

  // Receipt details
  const details = [
    { label: "Receipt No.", value: data.invoiceNo },
    { label: "Student Name", value: data.pupilName },
    { label: "Admission No.", value: data.admissionNo },
    { label: "Payment Date", value: data.paymentDate.toLocaleDateString() },
    { label: "Amount Paid", value: formatCurrency(data.amount, data.currency) },
    { label: "Payment Method", value: data.paymentMethod },
  ];

  if (data.reference) {
    details.push({ label: "Reference", value: data.reference });
  }

  // Draw details table
  const labelWidth = 150;
  const valueX = margin + labelWidth + 20;

  for (const detail of details) {
    // Label
    page.drawText(detail.label, {
      x: margin,
      y,
      size: 10,
      color: lightGray,
      font: await pdfDoc.embedFont("Helvetica"),
    });

    // Value
    page.drawText(detail.value, {
      x: valueX,
      y,
      size: 11,
      color: textColor,
      font: await pdfDoc.embedFont("Helvetica-Bold"),
    });

    y -= lineHeight;
  }

  y -= 10;

  // Divider line
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    color: rgb(0.9, 0.9, 0.9),
    thickness: 1,
  });

  y -= 30;

  // Amount box
  page.drawRectangle({
    x: margin,
    y: y - 60,
    width: width - 2 * margin,
    height: 70,
    borderColor: primaryColor,
    borderWidth: 2,
  });

  page.drawText("Total Amount", {
    x: margin + 20,
    y: y - 20,
    size: 12,
    color: lightGray,
    font: await pdfDoc.embedFont("Helvetica"),
  });

  page.drawText(formatCurrency(data.amount, data.currency), {
    x: margin + 20,
    y: y - 45,
    size: 24,
    color: primaryColor,
    font: await pdfDoc.embedFont("Helvetica-Bold"),
  });

  y -= 90;

  // Note
  if (data.note) {
    page.drawText("Note:", {
      x: margin,
      y,
      size: 10,
      color: textColor,
      font: await pdfDoc.embedFont("Helvetica-Bold"),
    });
    y -= 15;
    page.drawText(data.note, {
      x: margin,
      y,
      size: 9,
      color: lightGray,
      font: await pdfDoc.embedFont("Helvetica"),
    });
    y -= 20;
  }

  // Footer
  y = 40;
  page.drawText("Thank you for your payment", {
    x: margin,
    y,
    size: 9,
    color: lightGray,
    font: await pdfDoc.embedFont("Helvetica-Oblique"),
  });

  page.drawText(new Date().toLocaleDateString(), {
    x: width - margin - 100,
    y,
    size: 8,
    color: lightGray,
    font: await pdfDoc.embedFont("Helvetica"),
  });

  return Buffer.from(await pdfDoc.save());
}

/**
 * Generate a PDF invoice for a fee payment
 */
export async function generateInvoicePDF(data: any): Promise<Buffer> {
  // Similar to receipt but includes itemization and balance
  // For MVP, we'll use the same receipt template
  return generateReceiptPDF(data);
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number, currency: string): string {
  // Amount in minor units (cents/kobo), convert to major
  const major = amount / 100;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(major);
}
