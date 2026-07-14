import type { Metadata } from 'next'
import { BarChart3, ShieldCheck, Users, Shield, Printer, ClipboardList } from 'lucide-react'
import { SeoPageShell } from '@/components/seo-page-shell'

export const metadata: Metadata = {
  title: 'Result Checker & PIN Management | SchoolBase',
  description:
    'A secure result checker designed for parents and students, with an admin PIN settings page to generate, manage, and publish result access codes.',
  keywords: [
    'result checker',
    'result pin',
    'exam results access',
    'school result checker',
    'parent result access',
    'school pin management',
  ],
}

export default function ResultCheckerSeoPage() {
  return (
    <SeoPageShell
      eyebrow="RESULT CHECKER"
      title="Secure Result Checker with Admin PIN Management"
      description="SchoolBase helps schools publish exam results safely with a public PIN entry page and a powerful admin settings page for generating, tracking, and controlling result access codes."
      highlights={[
        'PIN-based access',
        'Admin PIN settings',
        'Scratch card support',
        'Bulk actions',
        'Parent self-service',
        'Secure audits',
      ]}
      features={[
        {
          title: 'Publish results with PIN control',
          description:
            'Use the admin result settings page to create student PINs, batch scratch cards, and keep result access secure while letting families view only their own published scores.',
          icon: ShieldCheck,
        },
        {
          title: 'Manage student and generic PINs',
          description:
            'Track student-linked PINs and generic scratch cards separately, so you can issue access codes for individuals or groups as needed.',
          icon: Users,
        },
        {
          title: 'Bulk actions for fast administration',
          description:
            'Select multiple PIN records to print, export, deactivate, or delete in one go, and keep your registry clean with easy batch management.',
          icon: ClipboardList,
        },
        {
          title: 'Print, export, and distribute easily',
          description:
            'Generate printable PIN sheets, export selected codes as text, and give staff or parents the materials they need for secure result release.',
          icon: Printer,
        },
        {
          title: 'Step-by-step result settings workflow',
          description:
            'Choose a student or class, set the term and assessment, generate PINs, then share the public result checker link with families.',
          icon: BarChart3,
        },
        {
          title: 'Built for parents, teachers, and admins',
          description:
            'The public result checker page is simple for families while the admin dashboard gives schools the control they need over access and audit history.',
          icon: Shield,
        },
      ]}
      proofItems={[
        {
          title: 'Faster result distribution',
          detail:
            'Let families self-serve exam access through a dedicated checker page instead of handling result requests manually.',
        },
        {
          title: 'More predictable school workflows',
          detail:
            'A consistent admin settings page ensures PIN generation, printing, and deactivation all happen in one place.',
        },
        {
          title: 'Safer access for student records',
          detail:
            'Only holders of valid result PINs can reach published result pages, reducing unauthorized access to sensitive data.',
        },
        {
          title: 'Clearer communication for families',
          detail:
            'When parents know where to go and how to use PIN access, they can check results quickly without calling the school.',
        },
      ]}
      primaryCtaLabel="Check Results"
      primaryHref="/results/check"
      secondaryCtaLabel="Configure Result PINs"
      secondaryHref="/admin/settings/result-pins"
    />
  )
}
