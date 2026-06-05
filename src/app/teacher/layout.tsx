import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth";
import { getCurrentSchool } from "@/lib/school";
import { staffLogoutAction } from "@/app/auth/actions";
import SharedLayout from "@/components/shared-layout";

const navItems = [
  { href: "/teacher", label: "Dashboard", icon: "LayoutDashboard", section: "Teacher workspace" },
  { href: "/teacher/teaching", label: "My Teaching", icon: "BookOpen", section: "Teacher workspace" },
  { href: "/teacher/results", label: "Results", icon: "FileText", section: "Teacher workspace" },
  { href: "/teacher/attendance", label: "Attendance", icon: "ClipboardList", section: "Teacher workspace" },
  { href: "/teacher/students", label: "Students", icon: "Users", section: "Teacher workspace" },
  { href: "/teacher/school", label: "My school", icon: "FileText", section: "Teacher workspace" },
  { href: "/teacher/profile", label: "Profile", icon: "UserCircle", section: "Teacher settings" },
];

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const school = await getCurrentSchool();

  return (
    <SharedLayout
      navItems={navItems}
      school={school}
      session={session}
      logoHref="/teacher"
      logoutAction={staffLogoutAction}
    >
      {children}
    </SharedLayout>
  );
}
