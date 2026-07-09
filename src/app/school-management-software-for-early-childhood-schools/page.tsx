import type { Metadata } from 'next'
import { Baby, CalendarCheck2, MessageSquareText, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { SeoPageShell } from '@/components/seo-page-shell'

export const metadata: Metadata = {
  title: 'School Management Software for Early Childhood Schools | SchoolBase',
  description:
    'Friendly school management software for early childhood schools. Simplify attendance, parent communication, and daily operations with a simple platform.',
  keywords: [
    'school management software for early childhood schools',
    'nursery school management system',
    'preschool management software',
    'early childhood school software',
  ],
}

export default function EarlyChildhoodSchoolsPage() {
  return (
    <SeoPageShell
      eyebrow="EARLY CHILDHOOD SCHOOLS"
      title="School Management Software for Early Childhood Schools"
      description="SchoolBase helps nurseries and preschool schools run smoother with simple attendance, parent updates, and operational tools that fit daily school life."
      highlights={['Nursery-friendly workflows', 'Parent updates', 'Simple onboarding', 'Secure records']}
      features={[
        {
          title: 'Easy Daily Operations',
          description: 'Support the rhythm of nursery and preschool life with simple tools for attendance, transitions, and communication.',
          icon: Baby,
        },
        {
          title: 'Clear Parent Communication',
          description: 'Keep parents informed with updates about attendance, school events, and important notices on WhatsApp and SMS.',
          icon: MessageSquareText,
        },
        {
          title: 'Attendance You Can Trust',
          description: 'Store daily attendance records clearly and give staff a simple way to manage punctuality and absence tracking.',
          icon: CalendarCheck2,
        },
        {
          title: 'A Friendly Platform for Staff',
          description: 'Give teachers and administrators a system that feels easy to adopt and simple to use every day.',
          icon: Users,
        },
        {
          title: 'Secure Student Records',
          description: 'Protect family and student information with permission-based access and dependable data backups.',
          icon: ShieldCheck,
        },
        {
          title: 'Built for Growth',
          description: 'As your school expands, SchoolBase helps you stay organized with records and communication in one place.',
          icon: Sparkles,
        },
      ]}
      proofItems={[
        {
          title: 'Purpose-built for daily school life',
          detail: 'Simplify the repeat tasks that take too much time in early childhood settings.',
        },
        {
          title: 'Parents stay connected',
          detail: 'Send updates that help families feel informed and involved in school life.',
        },
        {
          title: 'Less admin, more attention to learning',
          detail: 'Reduce paperwork so teachers can invest more time in children and classroom routines.',
        },
        {
          title: 'Practical for West African schools',
          detail: 'Supports the communication and record needs of growing early childhood schools across the region.',
        },
      ]}
      primaryCtaLabel="Schedule a Demo"
      primaryHref="/demo"
      secondaryCtaLabel="See the Platform"
      secondaryHref="/features"
    />
  )
}
