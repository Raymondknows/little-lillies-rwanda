import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth";
import { getCurrentSchoolId } from "@/lib/school";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = await getCurrentSchoolId();
    const school = await prisma.school.findUnique({ where: { id: schoolId } });

    const envPublic = Boolean(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);
    const envSecret = Boolean(process.env.PAYSTACK_SECRET_KEY);

    const paystack = {
      perSchool: {
        hasPublic: Boolean(school?.paystackPublicEncrypted),
        hasSecret: Boolean(school?.paystackSecretEncrypted),
      },
      env: { hasPublic: envPublic, hasSecret: envSecret },
      effective: school?.paystackSecretEncrypted || school?.paystackPublicEncrypted ? "per-school" : envSecret && envPublic ? "env" : "none",
    };

    const twilio = {
      perSchool: {
        hasSid: Boolean(school?.twilioSidEncrypted),
        hasToken: Boolean(school?.twilioTokenEncrypted),
        hasWhatsappFrom: Boolean(school?.whatsappFromEncrypted),
      },
      env: {
        hasSid: Boolean(process.env.TWILIO_ACCOUNT_SID),
        hasToken: Boolean(process.env.TWILIO_AUTH_TOKEN),
        hasWhatsappFrom: Boolean(process.env.WHATSAPP_FROM),
      },
      effective: school?.twilioSidEncrypted || school?.twilioTokenEncrypted || school?.whatsappFromEncrypted ? "per-school" : process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.WHATSAPP_FROM ? "env" : "none",
    };

    const whatsappCloud = {
      perSchool: {
        hasAccessToken: Boolean(school?.waCloudAccessTokenEncrypted),
        hasPhoneNumberId: Boolean(school?.waCloudPhoneNumberIdEncrypted),
      },
      env: {
        hasAccessToken: Boolean(process.env.WA_CLOUD_ACCESS_TOKEN),
        hasPhoneNumberId: Boolean(process.env.WA_CLOUD_PHONE_NUMBER_ID),
      },
      effective: school?.waCloudAccessTokenEncrypted && school?.waCloudPhoneNumberIdEncrypted ? "per-school" : process.env.WA_CLOUD_ACCESS_TOKEN && process.env.WA_CLOUD_PHONE_NUMBER_ID ? "env" : "none",
    };

    return NextResponse.json({ success: true, paystack, twilio, whatsappCloud });
  } catch (err) {
    console.error("Settings status error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
