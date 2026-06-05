import { NextResponse } from "next/server";
import { retryFailedNotifications, getNotificationStats } from "@/lib/notification-service";

/**
 * POST /api/notifications/retry
 *
 * Retry failed notifications with exponential backoff
 * Protected by X-Process-Secret header (for background workers)
 *
 * Request headers:
 *   X-Process-Secret: PAYSTACK_PROCESS_SECRET (required)
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-process-secret");
  const expectedSecret = process.env.PAYSTACK_PROCESS_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    console.warn("[Notifications] Unauthorized retry attempt");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await retryFailedNotifications();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[Notifications] Retry error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
