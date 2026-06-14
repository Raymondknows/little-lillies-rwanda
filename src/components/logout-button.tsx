'use client';

import { Button } from '@/components/ui/button';

export function LogoutButton({ redirectUrl = "/login" }: { redirectUrl?: string }) {
  return (
    <form action={`/api/auth/logout-handler?redirectUrl=${encodeURIComponent(redirectUrl)}`} method="POST" className="w-full">
      <Button type="submit" variant="ghost" className="w-full justify-start gap-2 text-sm">
        Sign out
      </Button>
    </form>
  );
}
