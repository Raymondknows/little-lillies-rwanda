'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBackendUrl } from '@/lib/backend-url';

export function LogoutButton({ redirectUrl = "/login" }: { redirectUrl?: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setPending(true);

    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('Logout failed with status:', response.status);
      }

      // Redirect after logout completes
      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      console.error('Logout request failed:', error);
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="primary"
      onClick={handleLogout}
      disabled={pending}
      className="cursor-pointer w-full justify-center gap-2 text-sm py-3"
    >
      <LogOut className="h-4 w-4" />
      {pending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
