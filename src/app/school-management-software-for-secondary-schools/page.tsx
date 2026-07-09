import type { Metadata } from 'next'
import { BarChart3, BookMarked, ClipboardList, MessageSquareText, ShieldCheck, TrendingUp } from 'lucide-react'
import { SeoPageShell } from '@/components/seo-page-shell'

export const metadata: Metadata = {
  title: 'School Management Software for Secondary Schools | SchoolBase',
  description:
    'Powerful school management software for secondary schools with exam results, broadsheets, subject management, and parent communication.',
  keywords: [
    'school management software for secondary schools',
    'secondary school management system',
    'school software for secondary schools',
    'exam management software',
  ],
}

export default function SecondarySchoolsPage() {
  return (
    <SeoPageShell
      eyebrow="SECONDARY SCHOOLS"
      title="School Management Software for Secondary Schools"
      description="SchoolBase helps secondary schools manage class records, tests, fee balances, and parent communication with a platform designed for fast reporting and strong academic oversight."
      highlights={['Broadsheets', 'Exam results', 'Parent updates', 'Subject tracking']}
      features={[
        {
          title: 'Results That Are Easy to Release',
          description: 'Publish exam outcomes, calculate grades, and share report cards with parents in a few clicks.',
          icon: BarChart3,
        },
        {
          title: 'Broadsheets and Subject Reports',
          description: 'Create academic summaries that make it easier for principals and heads of department to review school performance.',
          icon: BookMarked,
        },
        {
          title: 'Structured Assessment Workflows',
          description: 'Organize classes, subjects, and marks entry so teachers can work clearly and consistently across terms.',
          icon: ClipboardList,
        },
        {
          title: 'Parent Communication at Scale',
          description: 'Send result slips, event reminders, and fee notices directly to families on WhatsApp or SMS.',
          icon: MessageSquareText,
        },
        {
          title: 'Live Insight into Student Performance',
          description: 'Spot trends early and follow up with students before small challenges become major setbacks.',
          icon: TrendingUp,
        },
        {
          title: 'Secure Academic Records',
          description: 'Protect student reports and confidential school data with reliable permissions and backups.',
          icon: ShieldCheck,
        },
      ]}
      proofItems={[
        {
          title: 'Faster exam release cycles',
          detail: 'Move from manual result compilation to a digital process that saves hours of administrative work.',
        },
        {
          title: 'Clearer communication with parents',
          detail: 'Keep families updated on performance, fees, and school events using channels they already use.',
        },
        {
          title: 'A better view for school leaders',
          detail: 'Review performance trends and manage school-wide reporting from one central dashboard.',
        },
        {
          title: 'Built for West African classrooms',
          detail: 'Support assessments, reporting styles, and school workflows that fit the realities of local schools.',
        },
      ]}
      primaryCtaLabel="Request a Demo"
      primaryHref="/demo"
      secondaryCtaLabel="View Results Features"
      secondaryHref="/results-publishing-software"
    />
  )
}
