import { getStaffSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// Fetch school data from the backend API instead of direct database access
async function fetchSchoolFromAPI(schoolId: string) {
  const baseUrl = process.env.BACKEND_URL || "http://localhost:3006";
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/school/${schoolId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch school: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching school from API:", error);
    return null;
  }
}

export async function getCurrentSchool() {
  const session = await getStaffSession();

  // If a staff session exists, use its schoolId (staff are scoped to a school)
  if (session) {
    const school = await fetchSchoolFromAPI(session.schoolId as string);
    if (!school) {
      // School not found - this shouldn't happen in normal operation
      // Return a fallback to prevent crashes
      console.error(`School not found for staff session: ${session.schoolId}`);
      throw new Error("Your school information could not be loaded. Please log in again.");
    }
    return school;
  }

  // For non-authenticated users, we can't fetch school data without direct database access
  // This function should only be called from authenticated contexts
  throw new Error("No session found. Please log in.");
}

export async function getCurrentSchoolId() {
  const school = await getCurrentSchool();
  return school.id;
}
