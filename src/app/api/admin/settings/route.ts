import { NextResponse } from "next/server";
// Database access removed - use backend API instead
import { getStaffSession } from "@/lib/auth";
import { getCurrentSchoolId } from "@/lib/school";
import { encryptText, decryptText } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = await getCurrentSchoolId();
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, message: "Invalid request payload." }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const initials = typeof body.initials === "string" ? body.initials.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) : "";
    const principalName = typeof body.principalName === "string" ? body.principalName.trim() : "";
    const principalSignatureUrl = typeof body.principalSignatureUrl === "string" ? body.principalSignatureUrl.trim() : "";
    const stampUrl = typeof body.stampUrl === "string" ? body.stampUrl.trim() : "";
    const principalComment = typeof body.principalComment === "string" ? body.principalComment.trim() : "";
    // Optional config fields
    const paystackPublic = typeof body.paystackPublic === "string" ? body.paystackPublic.trim() : "";
    const paystackSecret = typeof body.paystackSecret === "string" ? body.paystackSecret.trim() : "";
    const twilioSid = typeof body.twilioSid === "string" ? body.twilioSid.trim() : "";
    const twilioToken = typeof body.twilioToken === "string" ? body.twilioToken.trim() : "";
    const whatsappFrom = typeof body.whatsappFrom === "string" ? body.whatsappFrom.trim() : "";
    const waCloudAccessToken = typeof body.waCloudAccessToken === "string" ? body.waCloudAccessToken.trim() : "";
    const waCloudPhoneNumberId = typeof body.waCloudPhoneNumberId === "string" ? body.waCloudPhoneNumberId.trim() : "";
    const country = typeof body.country === "string" ? body.country.trim().toUpperCase() : "";
    const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const manualPaymentAccountName = typeof body.manualPaymentAccountName === "string" ? body.manualPaymentAccountName.trim() : "";
    const manualPaymentAccountNumber = typeof body.manualPaymentAccountNumber === "string" ? body.manualPaymentAccountNumber.trim() : "";
    const manualPaymentBankName = typeof body.manualPaymentBankName === "string" ? body.manualPaymentBankName.trim() : "";

    const data: any = {};
    if (name) data.name = name;
    if (initials) data.initials = initials;
    if (country) data.country = country;
    if (currency) data.currency = currency;
    if (address !== undefined) data.address = address || null;
    if (principalName !== undefined) data.principalName = principalName || null;
    if (principalSignatureUrl !== undefined) data.principalSignatureUrl = principalSignatureUrl || null;
    if (stampUrl !== undefined) data.stampUrl = stampUrl || null;
    if (principalComment !== undefined) data.principalComment = principalComment || null;
    if (manualPaymentAccountName !== undefined) data.manualPaymentAccountName = manualPaymentAccountName || null;
    if (manualPaymentAccountNumber !== undefined) data.manualPaymentAccountNumber = manualPaymentAccountNumber || null;
    if (manualPaymentBankName !== undefined) data.manualPaymentBankName = manualPaymentBankName || null;

    // Update school DB fields if provided
    if (Object.keys(data).length > 0) {
      await prisma.school.update({ where: { id: schoolId }, data });
    }

    // Encrypt and save per-school config to DB encrypted fields
    const updateConfig: any = {};
    if (paystackPublic) updateConfig.paystackPublicEncrypted = encryptText(paystackPublic);
    if (paystackSecret) updateConfig.paystackSecretEncrypted = encryptText(paystackSecret);
    if (twilioSid) updateConfig.twilioSidEncrypted = encryptText(twilioSid);
    if (twilioToken) updateConfig.twilioTokenEncrypted = encryptText(twilioToken);
    if (whatsappFrom) updateConfig.whatsappFromEncrypted = encryptText(whatsappFrom);
    if (waCloudAccessToken) updateConfig.waCloudAccessTokenEncrypted = encryptText(waCloudAccessToken);
    if (waCloudPhoneNumberId) updateConfig.waCloudPhoneNumberIdEncrypted = encryptText(waCloudPhoneNumberId);

    if (Object.keys(updateConfig).length > 0) {
      await prisma.school.update({ where: { id: schoolId }, data: updateConfig });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Settings POST error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = await getCurrentSchoolId();
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ success: false, message: "School not found" }, { status: 404 });
    }

    const config: any = {
      hasPaystackPublic: Boolean(school.paystackPublicEncrypted),
      hasPaystackSecret: Boolean(school.paystackSecretEncrypted),
      hasTwilioSid: Boolean(school.twilioSidEncrypted),
      hasTwilioToken: Boolean(school.twilioTokenEncrypted),
      hasWhatsappFrom: Boolean(school.whatsappFromEncrypted),
      hasWaCloudAccessToken: Boolean(school.waCloudAccessTokenEncrypted),
      hasWaCloudPhoneNumberId: Boolean(school.waCloudPhoneNumberIdEncrypted),
      principalName: school.principalName || "",
      principalSignatureUrl: school.principalSignatureUrl || "",
      stampUrl: school.stampUrl || "",
      logoUrl: school.logoUrl || "",
      principalComment: school.principalComment || "",
      address: school.address || "",
      manualPaymentAccountName: school.manualPaymentAccountName || "",
      manualPaymentAccountNumber: school.manualPaymentAccountNumber || "",
      manualPaymentBankName: school.manualPaymentBankName || "",
    };

    return NextResponse.json({ success: true, config });
  } catch (err) {
    console.error("Settings GET error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
