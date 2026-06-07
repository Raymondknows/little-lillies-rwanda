import { NextResponse } from "next/server";
import { getParentSession } from "@/lib/auth";
// Database access removed - use backend API instead

export async function POST(request: Request, context: any) {
  const rawParams = context?.params;
  const params = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;

  try {
    const session = await getParentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const invoiceId = params.id;
    if (!invoiceId) {
      return NextResponse.json({ success: false, message: "Missing invoice id" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        schoolId: session.schoolId,
        pupil: {
          guardians: {
            some: { guardianId: session.guardianId },
          },
        },
      },
      select: {
        id: true,
        parentMarkedPaid: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found." }, { status: 404 });
    }

    if (invoice.parentMarkedPaid) {
      return NextResponse.json({ success: false, message: "This invoice is already marked as paid by the parent." }, { status: 400 });
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        parentMarkedPaid: true,
        parentMarkedPaidAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Parent confirm paid error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
