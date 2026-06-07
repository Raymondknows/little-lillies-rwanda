import { NextResponse } from "next/server";
// Database access removed - use backend API instead
import { generateReceiptPDF } from "@/lib/pdf-generator";

/**
 * GET /api/pdf/receipt/[paymentId]
 * Download payment receipt as PDF
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;

  try {
    // Fetch payment with invoice details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: {
          include: {
            pupil: true,
            school: true,
          },
        },
      },
    });

    if (!payment || !payment.invoice) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const invoice = payment.invoice;
    const school = invoice.school;
    const pupil = invoice.pupil;

    // Generate PDF
    const pdfBuffer: Uint8Array = await generateReceiptPDF({
      schoolName: school.name,
      schoolLogo: school.logoUrl || undefined,
      pupilName: `${pupil.firstName} ${pupil.lastName}`,
      admissionNo: pupil.admissionNo || "N/A",
      invoiceNo: invoice.invoiceNo,
      amount: payment.amount,
      currency: school.currency,
      paymentDate: payment.paidAt,
      paymentMethod: payment.method,
      reference: payment.reference || undefined,
      note: payment.note || undefined,
    });

    // Return as file download
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(pdfBuffer);
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${invoice.invoiceNo}.pdf"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("[PDF] Receipt generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
