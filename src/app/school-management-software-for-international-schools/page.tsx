import type { Metadata } from 'next'
import { Globe2, GraduationCap, Languages, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { SeoPageShell } from '@/components/seo-page-shell'

export const metadata: Metadata = {
  title: 'School Management Software for International Schools | SchoolBase',
  description:
    'Flexible school management software for international schools. Manage admissions, fees, results, and parent communication with a modern platform.',
  keywords: [
    'school management software for international schools',
    'international school management system',
    'school software for international schools',
    'international school admin software',
  ],
}

export default function InternationalSchoolsPage() {
  return (
    <SeoPageShell
      eyebrow="INTERNATIONAL SCHOOLS"
      title="School Management Software for International Schools"
      description="SchoolBase helps international schools manage diverse academic processes, parent expectations, and fast-moving admin tasks in one flexible platform."
      highlights={['Flexible workflows', 'Parent engagement', 'Global-ready reporting', 'Fast onboarding']}
      features={[
        {
          title: 'Flexible School Administration',
          description: 'Support multiple curricula, class structures, and academic calendars without forcing your team into rigid templates.',
          icon: Globe2,
        },
        {
          title: 'Clear Parent Communication',
          description: 'Keep parents informed with updates, reminders, and result notices sent through the channels they already use.',
          icon: Users,
        },
        {
          title: 'Academic Reporting That Scales',
          description: 'Publish reports, track performance, and keep school leadership aligned with dependable academic visibility.',
          icon: GraduationCap,
        },
        {
          title: 'Support for Multilingual Communities',
          description: 'Create communication and reporting experiences that fit a diverse school community and modern expectations.',
          icon: Languages,
        },
        {
          title: 'Reliable Security',
          description: 'Protect staff, student, and parent data with secure access controls and dependable backups.',
          icon: ShieldCheck,
        },
        {
          title: 'A Smarter Way to Grow',
          description: 'Scale from one campus to many with software that helps school leadership stay organized and efficient.',
          icon: Sparkles,
        },
      ]}
      proofItems={[
        {
          title: 'Built for modern school operations',
          detail: 'Support day-to-day school management with flexibility, speed, and professional reporting.',
        },
        {
          title: 'One platform for finance and academics',
          detail: 'Connect student records, billing, communication, and results in one secure interface.',
        },
        {
          title: 'A better experience for parents',
          detail: 'Parents receive smooth, timely updates without relying on multiple disconnected systems.',
        },
        {
          title: 'Designed for West African realities',
          detail: 'SchoolBase supports practical workflows and communication needs for schools operating in the region.',
        },
      ]}
      primaryCtaLabel="Book a Demo"
      primaryHref="/demo"
      secondaryCtaLabel="Explore Features"
      secondaryHref="/features"
    />
  )
}
