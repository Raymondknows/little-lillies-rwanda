export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentSchool } from "@/lib/school";
import { getStaffSession } from "@/lib/auth";
import { staffLogoutAction } from "@/app/auth/actions";
import SharedLayout from "@/components/shared-layout";
import PendingSchoolModal from "@/components/pending-school-modal";
import { SubscriptionAlert } from "@/components/subscription-alert";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/fees", label: "Fees", icon: "CreditCard" },
  { href: "/admin/students", label: "Students", icon: "Users" },
  { href: "/admin/classes", label: "Classes", icon: "Layers" },
  { href: "/admin/teachers", label: "Teachers", icon: "Users" },
  // { href: "/admin/teacher-assignments", label: "Assignments", icon: "BookOpen" },
  { href: "/admin/subjects", label: "Subjects", icon: "BookOpen" },
  { href: "/admin/results", label: "Results", icon: "GraduationCap" },
  { href: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/admin/attendance", label: "Attendance", icon: "ClipboardList" },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: "WhatsApp" },
  { href: "/admin/notifications", label: "Notifications", icon: "Bell" },
  { href: "/admin/support", label: "Support", icon: "HelpCircle" },
  { href: "/admin/website", label: "Website", icon: "Globe" },
  { href: "/admin/subscribe", label: "Subscription", icon: "CreditCard" },
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();

  // If no valid session, redirect to login (middleware should catch this, but be defensive)
  if (!session) {
    redirect("/login");
  }

  if (session.role === "TEACHER") {
    redirect("/teacher");
  }

  const school = await getCurrentSchool();

  return (
    <>
      {school.status === "TRIAL" && <SubscriptionAlert />}
      <SharedLayout
        navItems={nav}
        school={school}
        session={session}
        logoHref="/admin"
        logoutAction={staffLogoutAction}
      >
        <PendingSchoolModal schoolStatus={school.status} schoolName={school.name} />
        {children}
      </SharedLayout>
    </>
  );
}
