import { prisma } from "@/lib/db";
import { getCurrentSchool } from "@/lib/school";
import SettingsPageClient from "./settings-client";
import { Suspense } from "react";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const isOnboarding = resolvedSearchParams?.onboarding === "1";
  const school = await getCurrentSchool();

  const staff = await prisma.user.findMany({
    where: { schoolId: school.id },
    orderBy: { name: "asc" },
  });

  const paystackConfigured = Boolean(
    process.env.PAYSTACK_SECRET_KEY && process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  );
  const whatsappConfigured = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.WHATSAPP_FROM,
  );

  return (
    <SettingsPageClient
      school={school as any}
      staff={staff}
      paystackConfigured={paystackConfigured}
      whatsappConfigured={whatsappConfigured}
      isOnboarding={isOnboarding}
    />
  );
}
