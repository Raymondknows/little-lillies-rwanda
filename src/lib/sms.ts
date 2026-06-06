// Logging is handled by backend; avoid writing local files from frontend.

export async function sendSMS(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.SMS_FROM || process.env.TWILIO_SMS_FROM;

  const logEntry: any = {
    time: new Date().toISOString(),
    to,
    body: body.slice(0, 200),
    success: false,
    reason: null,
  };

  if (!accountSid || !authToken || !from) {
    logEntry.reason = "missing-credentials";
    // backend should record missing credentials and delivery attempts
    return false;
  }

  let recipient = to.replace(/[^\d+]/g, "").trim();
  if (!recipient.startsWith("+")) {
    recipient = `+${recipient}`;
  }

  const payload = new URLSearchParams({
    Body: body,
    From: from,
    To: recipient,
  });

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload,
      }
    );

    logEntry.success = response.ok;
    logEntry.status = response.status;
    if (!response.ok) {
      try {
        const text = await response.text();
        logEntry.reason = text.slice(0, 500);
      } catch (e) {
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
