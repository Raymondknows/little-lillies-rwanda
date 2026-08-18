'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { getBackendUrl } from '@/lib/backend-url';

interface ClientAuthWrapperProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

export function ClientAuthWrapper({
  children,
  requiredRole,
  fallback,
}: ClientAuthWrapperProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${getBackendUrl()}/api/admin/verify`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          setAuthenticated(false);
          router.push('/login');
          return;
        }

        const data = await response.json();
        setAuthenticated(true);
        setUserRole(data.session?.role);

        // Check role if required
        if (requiredRole && data.session?.role !== requiredRole) {
          router.push('/unauthorized');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthenticated(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  // Show fallback while loading
  if (authenticated === null) {
    return fallback || <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Show nothing if not authenticated (will redirect)
  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
