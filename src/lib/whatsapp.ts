// Logging is handled by backend; avoid writing local files from frontend.
// Prisma removed - use backend API instead
import { decryptText } from "@/lib/crypto";

export function createFeeReminderMessage(
  firstName: string,
  lastName: string,
  invoiceNo: string,
  balanceMinor: number,
  dueDate: Date | null,
  schoolName: string,
  currency = "NGN",
) {
  const balance = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(balanceMinor / 100);
  const dueText = dueDate
    ? `due ${dueDate.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`
    : "due soon";

  return `Hello ${firstName} ${lastName},\n
Your invoice ${invoiceNo} for ${schoolName} is ${balance} and is ${dueText}.\n
Please pay on time or contact the school if you need help.`;
}

type WhatsAppConfig =
  | {
      provider: "cloud";
      source: "school" | "env";
      accessToken: string;
      phoneNumberId: string;
    }
  | {
      provider: "twilio";
      source: "school" | "env";
      accountSid: string;
      authToken: string;
      from: string;
    };

function normalizePhoneNumber(value: string) {
  const normalized = value.trim().replace(/[^+\d]/g, "");
  if (!normalized.startsWith("+")) {
    return `+${normalized}`;
  }
  return normalized;
}

function normalizeWhatsAppToForTwilio(value: string) {
  let recipient = value.trim();
  if (!recipient.startsWith("whatsapp:")) {
    recipient = normalizePhoneNumber(recipient);
    return `whatsapp:${recipient}`;
  }
  return recipient;
}

function normalizeWhatsAppToForCloud(value: string) {
  let recipient = value.trim();
  if (recipient.startsWith("whatsapp:")) {
    recipient = recipient.slice("whatsapp:".length);
  }
  recipient = recipient.replace(/[^+\d]/g, "");
  if (recipient.startsWith("+")) {
    recipient = recipient.slice(1);
  }
  return recipient;
}

async function getWhatsAppConfig(schoolId?: string): Promise<WhatsAppConfig | null> {
  const school = schoolId
    ? await prisma.school.findUnique({
        where: { id: schoolId },
        select: {
          waCloudAccessTokenEncrypted: true,
          waCloudPhoneNumberIdEncrypted: true,
          twilioSidEncrypted: true,
          twilioTokenEncrypted: true,
          whatsappFromEncrypted: true,
        },
      })
    : null;

  if (school?.waCloudAccessTokenEncrypted && school?.waCloudPhoneNumberIdEncrypted) {
    const accessToken = decryptText(school.waCloudAccessTokenEncrypted);
    const phoneNumberId = decryptText(school.waCloudPhoneNumberIdEncrypted);
    if (accessToken && phoneNumberId) {
      return {
        provider: "cloud",
        source: "school",
        accessToken,
        phoneNumberId,
      };
    }
  }

  if (process.env.WA_CLOUD_ACCESS_TOKEN && process.env.WA_CLOUD_PHONE_NUMBER_ID) {
    return {
      provider: "cloud",
      source: "env",
      accessToken: process.env.WA_CLOUD_ACCESS_TOKEN,
      phoneNumberId: process.env.WA_CLOUD_PHONE_NUMBER_ID,
    };
  }

  if (school?.twilioSidEncrypted && school?.twilioTokenEncrypted && school?.whatsappFromEncrypted) {
    const accountSid = decryptText(school.twilioSidEncrypted);
    const authToken = decryptText(school.twilioTokenEncrypted);
    const from = decryptText(school.whatsappFromEncrypted);
    if (accountSid && authToken && from) {
      return {
        provider: "twilio",
        source: "school",
        accountSid,
        authToken,
        from,
      };
    }
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.WHATSAPP_FROM) {
    return {
      provider: "twilio",
      source: "env",
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      from: process.env.WHATSAPP_FROM,
    };
  }

  return null;
}

async function sendViaTwilio(
  to: string,
  body: string,
  config: Extract<WhatsAppConfig, { provider: "twilio" }>,
) {
  const recipient = normalizeWhatsAppToForTwilio(to);
  const payload = new URLSearchParams({
    Body: body,
    From: config.from,
    To: recipient,
  });

  return fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  });
}

async function sendViaWhatsAppCloud(
  to: string,
  body: string,
  config: Extract<WhatsAppConfig, { provider: "cloud" }>,
) {
  const recipient = normalizeWhatsAppToForCloud(to);
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipient,
    type: "text",
    text: {
      body,
    },
  };

  return fetch(`https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function sendWhatsAppMessage(
  to: string,
  body: string,
  schoolId?: string,
): Promise<boolean> {
  const config = await getWhatsAppConfig(schoolId);
  const logEntry: any = {
    time: new Date().toISOString(),
    to,
    body: body.slice(0, 200),
    success: false,
    reason: null,
    provider: config?.provider ?? null,
    providerSource: config?.source ?? null,
    schoolId: schoolId ?? null,
  };

  if (!config) {
    logEntry.reason = "missing-credentials";
    // backend should record missing credentials and delivery attempts
    return false;
  }

  try {
    const response =
      config.provider === "cloud"
        ? await sendViaWhatsAppCloud(to, body, config)
        : await sendViaTwilio(to, body, config);

    logEntry.success = response.ok;
    logEntry.status = response.status;

    if (!response.ok) {
      try {
        const text = await response.text();
        logEntry.reason = text.slice(0, 500);
      } catch (err) {
        logEntry.reason = "response-read-failed";
      }
    }

    // backend should record delivery results; skip local write
    return response.ok;
  } catch (err: any) {
    logEntry.success = false;
    logEntry.reason = err?.message ?? String(err);
    // skip local log write
    return false;
  }
}
