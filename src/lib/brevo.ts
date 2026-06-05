export type BrevoSendParams = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type BrevoSendResult = {
  success: boolean;
  messageId?: string;
  response?: string;
  accepted?: string[];
  rejected?: string[];
  error?: string;
};

export async function sendViaBrevoAPI({
  to,
  subject,
  html,
  text,
  replyTo,
}: BrevoSendParams): Promise<BrevoSendResult> {
  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY not configured");
    }

    const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "noreply@schoolbase.live";
    const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "SchoolBase";

    const toArray = Array.isArray(to) ? to : [to];

    console.log(`[Brevo] Sending email via Brevo API to: ${toArray.join(", ")}, from: ${BREVO_SENDER_EMAIL}`);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL,
        },
        to: toArray.map((email) => ({ email })),
        replyTo: replyTo ? { email: replyTo } : undefined,
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    const responseBody = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        typeof responseBody === "object" && responseBody !== null && "message" in responseBody
          ? String((responseBody as { message: unknown }).message)
          : JSON.stringify(responseBody);
      const errorMsg = `Brevo API error: ${response.status} - ${message}`;
      console.error(`[Brevo] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    console.log(`[Brevo] Email sent successfully`);
    return {
      success: true,
      messageId: typeof responseBody === "object" && responseBody !== null && "messageId" in responseBody
        ? String((responseBody as { messageId?: string }).messageId)
        : undefined,
      response: response.statusText,
    };
  } catch (error) {
    console.error("[Brevo] API send failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
