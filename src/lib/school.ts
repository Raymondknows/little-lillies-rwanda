import { getStaffSession } from "@/lib/auth";
import { getBackendUrl } from "@/lib/backend-url";

// Fetch school data from the backend API instead of direct database access
async function fetchSchoolFromAPI(schoolId: string) {
  const baseUrl = getBackendUrl();

  try {
    const url = `${baseUrl.replace(/\/$/, "")}/api/admin/school/${schoolId}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    try {
      const nextHeaders = require("next/headers");
      const jar = nextHeaders.cookies();
      const cookieHeader = jar
        .getAll()
        .map((cookie: any) => `${cookie.name}=${encodeURIComponent(cookie.value)}`)
        .join("; ");

      if (cookieHeader) {
        headers.cookie = cookieHeader;
      }
    } catch {
      // Not in server context or next/headers unavailable.
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(
        `Failed to fetch school ${schoolId} from ${url}: ${response.status}`,
        body,
      );
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching school ${schoolId} from ${baseUrl}:`, error);
    return null;
  }
}

export async function getCurrentSchool() {
  const session = await getStaffSession();

  if (!session) {
    throw new Error("No session found. Please log in.");
  }

  if (!session.schoolId) {
    console.error("Staff session has no schoolId:", session);
    throw new Error("Your session is invalid. Please log in again.");
  }

  const school = await fetchSchoolFromAPI(session.schoolId);
  if (!school) {
    console.error(`School not found or backend unavailable for staff session: ${session.schoolId}`);
    throw new Error("Your school information could not be loaded. Please log in again.");
  }

  return school;
}

export async function getCurrentSchoolId() {
  const school = await getCurrentSchool();
  return school.id;
}
