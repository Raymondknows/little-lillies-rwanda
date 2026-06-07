import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentSchoolId } from '@/lib/school'
import { getStaffSession } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Assessment Broadsheet | SchoolBase',
  description: 'View and export class assessment broadsheet',
}

export default async function BroadsheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ classId?: string }>
}) {
  const session = await getStaffSession()

  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/results" className="text-sm font-medium text-brand hover:underline">
          ← Back to results
        </Link>
        <div className="flex gap-2">
          <Button href="/admin/results" variant="secondary">
            All assessments
          </Button>
        </div>
      </div>

      <article className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="border-b border-border pb-5">
          <h1 className="text-2xl font-semibold text-foreground">Assessment Broadsheet</h1>
          <p className="mt-2 text-sm text-muted">Broadsheet data available from backend API</p>
        </div>
      </article>
    </div>
  )
}
