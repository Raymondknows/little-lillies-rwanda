import type { Metadata } from 'next'
import { BookOpen, ClipboardCheck, MessageSquareText, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { SeoPageShell } from '@/components/seo-page-shell'

export const metadata: Metadata = {
  title: 'School Management Software for Primary Schools | SchoolBase',
  description:
    'Simple and powerful school management software for primary schools. Manage attendance, fee reports, parent communication, and results with ease.',
  keywords: [
    'school management software for primary schools',
    'primary school management system',
    'school software for primary schools',
    'primary school admin software',
  ],
}

export default function PrimarySchoolsPage() {
  return (
    <SeoPageShell
      eyebrow="PRIMARY SCHOOLS"
      title="School Management Software for Primary Schools"
      description="SchoolBase gives primary schools a simpler way to manage class records, attendance, fees, and parent updates without overwhelming staff or parents."
      highlights={['Easy teacher adoption', 'Attendance tracking', 'Parent updates', 'Fast setup']}
      features={[
        {
          title: 'Simple for Teachers',
          description: 'Teachers can record attendance, enter marks, and share updates using a clean interface that feels familiar from the first day.',
          icon: BookOpen,
        },
        {
          title: 'Attendance That Parents Can Trust',
          description: 'Send absence alerts automatically and keep daily records in one secure place that school leaders can review quickly.',
          icon: ClipboardCheck,
        },
        {
          title: 'Clear Communication with Families',
          description: 'Use WhatsApp and SMS to send reminders, school news, and academic updates without manual follow-up.',
          icon: MessageSquareText,
        },
        {
          title: 'Affordable and Practical',
          description: 'Get the core school management features you need without the cost and complexity of enterprise platforms.',
          icon: Sparkles,
        },
        {
          title: 'Shared Access Across Roles',
          description: 'Principals, class teachers, and admins can work from the same data without duplicate spreadsheets.',
          icon: Users,
        },
        {
          title: 'Secure Record Keeping',
          description: 'Protect student data with permission-based access and dependable backups that school owners can trust.',
          icon: ShieldCheck,
        },
      ]}
      proofItems={[
        {
          title: 'Less paperwork for busy school teams',
          detail: 'Replace paper registers and scattered files with a digital workflow that saves time every week.',
        },
        {
          title: 'Smart reporting for school heads',
          detail: 'Monitor attendance trends, fee balances, and academic progress in one place.',
        },
        {
          title: 'Better parent engagement',
          detail: 'Parents receive timely updates and can keep track of their child’s progress from their phone.',
        },
        {
          title: 'Made for practical school operations',
          detail: 'SchoolBase supports the day-to-day realities of schools in West Africa, from classroom management to administration.',
        },
      ]}
      primaryCtaLabel="See SchoolBase in Action"
      primaryHref="/demo"
      secondaryCtaLabel="Explore Features"
      secondaryHref="/features"
    />
  )
}
