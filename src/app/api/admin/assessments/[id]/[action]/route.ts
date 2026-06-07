import { getStaffSession } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const session = await getStaffSession();
    if (!session?.schoolId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action } = await params;

    const response = await fetch(
      `${API_BASE}/api/admin/assessments/${id}/${action}`,
      {
        method: "POST",
        headers: {
          "x-school-id": session.schoolId,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return Response.json(error, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error performing assessment action:", error);
    return Response.json({ error: "Action failed" }, { status: 500 });
  }
}
