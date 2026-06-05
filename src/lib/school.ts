import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getCurrentSchool() {
  const session = await getStaffSession();

  // If a staff session exists, use its schoolId (staff are scoped to a school)
  if (session) {
    const school = await prisma.school.findUnique({
      where: { id: session.schoolId as string },
      include: { partner: true, enabledPhases: true },
    });
    if (!school) {
      // School not found - this shouldn't happen in normal operation
      // Return a fallback to prevent crashes
      console.error(`School not found for staff session: ${session.schoolId}`);
      throw new Error("Your school information could not be loaded. Please log in again.");
    }
    return school;
  }

  // Otherwise check for a `schoolSlug` cookie (set by middleware from subdomain)
  const cookieStore = await cookies();
  const signedCookieName = "schoolSlug_v2";
  const legacyCookieName = "schoolSlug";

  let slug = process.env.SCHOOL_SLUG ?? "greenfield";

  // Prefer the signed v2 cookie
  const signedToken = cookieStore.get(signedCookieName)?.value;
  if (signedToken) {
    try {
      const { payload } = await jwtVerify(
        signedToken,
        new TextEncoder().encode(process.env.SESSION_SECRET ?? "schoolbase-dev-secret-change-me"),
      );
      if (payload && typeof payload === "object" && "slug" in payload) {
        slug = String((payload as any).slug);
      }
    } catch (e) {
      // Log minimal info for detection of tampering or misconfiguration,
      // but do not expose sensitive token contents.
      console.warn("getCurrentSchool: invalid signed schoolSlug_v2 token");
    }
  } else {
    // Support legacy plain cookie as a last-resort fallback to avoid breaking older deployments.
    const legacy = cookieStore.get(legacyCookieName)?.value;
    if (legacy && /^[a-z0-9-]+$/.test(legacy)) {
      slug = legacy;
    }
  }

  const school = await prisma.school.findUnique({
    where: { slug },
    include: { partner: true, enabledPhases: true },
  });

  if (!school) {
    console.error(`School not found for slug: ${slug}`);
    throw new Error("School not found. Please ensure you're accessing the correct URL.");
  }

  return school;
}

export async function getCurrentSchoolId() {
  const school = await getCurrentSchool();
  return school.id;
}
