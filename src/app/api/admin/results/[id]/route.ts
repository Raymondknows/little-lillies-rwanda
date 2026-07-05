import { getStaffSession } from "@/lib/auth";
import { buildApiUrl } from "@/lib/api-client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getStaffSession();
    if (!session?.schoolId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(buildApiUrl(`/admin/results/${id}`), {
      headers: {
        "x-school-id": session.schoolId,
        cookie: req.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json(error, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return Response.json({ error: "Failed to fetch assessment" }, { status: 500 });
  }
}
