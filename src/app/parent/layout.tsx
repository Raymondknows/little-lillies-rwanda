export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { parentLogoutAction } from "@/app/auth/actions";
import SharedLayout from "@/components/shared-layout";
import { getParentSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getParentSession();

  if (!session) {
    return <>{children}</>;
  }

  const school = await prisma.school.findUnique({
    where: { id: session.schoolId },
  });

  if (!school) {
    return <>{children}</>;
  }

  return (
    <SharedLayout
      navItems={[
        { href: "/parent", label: "Dashboard", icon: "LayoutDashboard", section: "Parent portal" },
        { href: "/parent/school", label: "School details", icon: "FileText", section: "Parent portal" },
        { href: "/parent/children", label: "Children", icon: "Users", section: "Parent portal" },
        { href: "/parent/results", label: "Results", icon: "BookOpen", section: "Parent portal" },
        { href: "/parent/announcements", label: "Announcements", icon: "Bell", section: "Parent portal" },
        { href: "/parent/payments", label: "Payments", icon: "CreditCard", section: "Parent portal" },
      ]}
      school={school}
      session={session}
      logoHref="/parent"
      logoutAction={parentLogoutAction}
    >
      {children}
    </SharedLayout>
  );
}
