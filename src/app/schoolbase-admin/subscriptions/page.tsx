import { prisma } from '@/lib/db';
import { requirePlatformAdminSession } from '@/lib/auth';
import SubscriptionsPageClient from './subscriptions-client';

export default async function SubscriptionsPage() {
  await requirePlatformAdminSession();

  const schools = await prisma.school.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return (
    <SubscriptionsPageClient schools={schools} />
  );
}
