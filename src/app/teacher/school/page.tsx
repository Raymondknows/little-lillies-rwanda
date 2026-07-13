import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSchool } from "@/lib/school";
import { getStaffSession } from "@/lib/auth";
import { TeacherSchoolDetailsContent } from "./school-details-client";

export const metadata: Metadata = {
  title: "School details | SchoolBase",
  description: "View your school’s contact information, payment account details, and logo in the teacher portal.",
};

export default async function TeacherSchoolPage() {
  const session = await getStaffSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const school = await getCurrentSchool();

  return <TeacherSchoolDetailsContent school={school} />;
}
