import { getStaffSession } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";

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
    const response = await fetch(`${API_BASE}/api/assessments/setup/${id}`, {
      method: "GET",
      headers: {
        "x-school-id": session.schoolId,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      let errorBody;
      try {
        errorBody = JSON.parse(error);
      } catch {
        errorBody = { error };
      }
      return Response.json(errorBody, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching assessment setup proxy:", error);
    return Response.json({ error: "Failed to fetch assessment setup" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getStaffSession();
    if (!session?.schoolId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const response = await fetch(`${API_BASE}/api/assessments/setup/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-school-id": session.schoolId,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      let errorBody;
      try {
        errorBody = JSON.parse(error);
      } catch {
        errorBody = { error };
      }
      return Response.json(errorBody, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error saving assessment setup proxy:", error);
    return Response.json({ error: "Failed to save assessment setup" }, { status: 500 });
  }
}
