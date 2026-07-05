import { getStaffSession } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";

export async function GET(req: Request) {
  try {
    const session = await getStaffSession();
    const schoolId = session?.schoolId || req.headers.get("x-school-id") || "";
    if (!schoolId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE}/api/admin/academic-years`, {
      headers: {
        "x-school-id": schoolId,
        cookie: req.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      // Fallback: return empty if backend endpoint doesn't exist yet
      return Response.json({ academicYears: [] });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching academic years:", error);
    // Return empty array on error (fallback)
    return Response.json({ academicYears: [] });
  }
}
