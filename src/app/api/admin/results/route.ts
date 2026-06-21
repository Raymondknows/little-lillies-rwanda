import { getStaffSession } from "@/lib/auth";
import { buildApiUrl } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const session = await getStaffSession();
    if (!session?.schoolId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const response = await fetch(buildApiUrl(`/admin/results`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-school-id": session.schoolId,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json(error, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error saving results:", error);
    return Response.json({ error: "Failed to save results" }, { status: 500 });
  }
}
