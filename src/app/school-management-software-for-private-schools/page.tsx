import type { Metadata } from 'next'
import { Building2, GraduationCap, MessageSquareText, Receipt, ShieldCheck, Users } from 'lucide-react'
import { SeoPageShell } from '@/components/seo-page-shell'

export const metadata: Metadata = {
  title: 'School Management Software for Private Schools | SchoolBase',
  description:
    'Modern school management software for private schools in West Africa. Automate fees, results, parent communication and admissions with one trusted platform.',
  keywords: [
    'school management software for private schools',
    'private school management system',
    'school software for private schools',
    'education management software',
    'West African school software',
  ],
}

export default function PrivateSchoolsPage() {
  return (
    <SeoPageShell
      eyebrow="PRIVATE SCHOOLS"
      title="School Management Software for Private Schools"
      description="SchoolBase helps private schools run faster with admissions, fee automation, parent communication, and digital results in one secure platform built for West African teams."
      highlights={['Fee automation', 'Admissions workflow', 'Parent updates', 'Secure data access']}
      features={[
        {
          title: 'Admissions That Feel Effortless',
          description: 'Create a smooth intake process with online forms, student records, and a professional school website connected to your operations.',
          icon: Building2,
        },
        {
          title: 'Fee Collection Without the Chasing',
          description: 'Track invoices, collect payments, send reminders, and keep parents informed with clear balances and instant receipts.',
          icon: Receipt,
        },
        {
          title: 'Results and Reports in Minutes',
          description: 'Publish marks, generate report cards, and share performance updates with teachers, parents, and school leadership automatically.',
          icon: GraduationCap,
        },
        {
          title: 'Parent Communication That Gets Read',
          description: 'Send announcements, reminders, and results on WhatsApp and SMS so parents stay informed without extra effort.',
          icon: MessageSquareText,
        },
        {
          title: 'Role-Based Access for Staff',
          description: 'Give principals, bursars, teachers, and admins exactly the tools they need while protecting sensitive school data.',
          icon: Users,
        },
        {
          title: 'Built for Trust and Growth',
          description: 'From onboarding to reporting, SchoolBase supports private schools that want dependable systems and a better parent experience.',
          icon: ShieldCheck,
        },
      ]}
      proofItems={[
        {
          title: 'Go live in days, not months',
          detail: 'Schools can switch from spreadsheets and paper records to a live platform in a short implementation window.',
        },
        {
          title: 'One system for every department',
          detail: 'Keep academics, finance, admissions, and parent communication connected from one dashboard.',
        },
        {
          title: 'Clear visibility for school leaders',
          detail: 'Get real-time reporting on fees, attendance, student performance, and communication without manual work.',
        },
        {
          title: 'Built for West African operations',
          detail: 'Support local workflows and practical finance processes for schools in Nigeria, Ghana, Liberia, Sierra Leone, and The Gambia.',
        },
      ]}
      primaryCtaLabel="Start Free Trial"
      primaryHref="/signup"
      secondaryCtaLabel="Book a Demo"
      secondaryHref="/demo"
    />
  )
}
