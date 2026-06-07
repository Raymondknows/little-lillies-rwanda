import { getStaffSession } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";

export async function GET(req: Request) {
  try {
    const session = await getStaffSession();
    if (!session?.schoolId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE}/api/admin/terms`, {
      headers: {
        "x-school-id": session.schoolId,
      },
    });

    if (!response.ok) {
      // Fallback: return empty if backend endpoint doesn't exist yet
      return Response.json({ terms: [] });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching terms:", error);
    // Return empty array on error (fallback)
    return Response.json({ terms: [] });
  }
}
