'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SharedLayout from '@/components/shared-layout';
import { getBackendUrl } from '@/lib/backend-url';

const nav = [
  { href: "/parent", label: "Dashboard", icon: "Home" },
  { href: "/parent/children", label: "My Children", icon: "Users" },
  { href: "/parent/results", label: "Results", icon: "BarChart3" },
  { href: "/parent/invoices", label: "Invoices", icon: "FileText" },
  { href: "/parent/payments", label: "Payments", icon: "CreditCard" },
  { href: "/parent/publications", label: "Publications", icon: "BookOpen" },
  { href: "/parent/school", label: "School Info", icon: "Globe" },
];

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [school, setSchool] = useState<any>(null);

  useEffect(() => {
    // Skip verification for login page
    if (pathname === '/parent/login') {
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const backendUrl = getBackendUrl();
        
        // Verify parent session with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const verifyRes = await fetch(`${backendUrl}/api/parent/verify`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          const verifyData = await verifyRes.json();
          
          if (!verifyData.authenticated) {
            router.push('/parent/login');
            return;
          }

          setSession({
            id: verifyData.guardianId,
            name: verifyData.name,
            phone: verifyData.phone,
          });

          // Fetch school (non-critical)
          const schoolRes = await fetch(`${backendUrl}/api/parent/school`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (schoolRes.ok) {
            const schoolData = await schoolRes.json();
            setSchool(schoolData);
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          console.error('Verify error:', fetchErr);
          router.push('/parent/login');
          return;
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Layout error:', err);
        router.push('/parent/login');
      }
    }

    loadData();
  }, [router, pathname]);

  // For login page, just show children without layout
  if (pathname === '/parent/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SharedLayout
      navItems={nav}
      school={school}
      session={session}
    >
      {children}
    </SharedLayout>
  );
}
