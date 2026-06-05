import { Metadata } from 'next'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Use Cases | SchoolBase',
  description:
    'Discover how SchoolBase solves real school challenges: fee collection, parent communication, result publishing, and more.',
  keywords: [
    'school management software use cases',
    'school software use cases',
    'school management platform',
    'fee collection software',
    'parent communication solution',
    'results publishing platform',
    'attendance management software',
    'school broadsheet software',
  ],
  openGraph: {
    title: 'Use Cases | SchoolBase',
    description: 'See how SchoolBase solves your school\'s biggest challenges',
  },
}

const useCases = [
  {
    title: 'Fee Collection & Management',
    description: 'Stop chasing parents for fees. Automate collection and reduce defaulters.',
    href: '/use-cases/fee-collection',
    benefits: [
      'Reduce fee collection time by 80%',
      'Automated WhatsApp reminders',
      'Clear payment tracking',
      'Detailed financial reports',
    ],
    icon: '💰',
  },
  {
    title: 'Parent Communication',
    description: 'Reach every parent instantly on WhatsApp with school updates.',
    href: '/use-cases/parent-communication',
    benefits: [
      'Direct WhatsApp messaging',
      'Bulk announcements',
      'Two-way conversations',
      'Delivery tracking',
    ],
    icon: '💬',
  },
  {
    title: 'Result Publishing & Reporting',
    description: 'Publish grades in minutes. Every parent gets their child\'s results.',
    href: '/use-cases/results-publishing',
    benefits: [
      'One-click publishing',
      'Automatic grade calculations',
      'Parent & student notifications',
      'Result archives',
    ],
    icon: '📊',
  },
  {
    title: 'Student Attendance Management',
    description: 'Digital attendance tracking with automatic reports and parent alerts.',
    href: '/use-cases/student-attendance',
    benefits: [
      'One-tap marking',
      'Automatic summaries',
      'Parent WhatsApp alerts',
      'Trend analysis',
    ],
    icon: '✓',
  },
  {
    title: 'Digital Broadsheet & Grade Book',
    description: 'Professional broadsheets with automatic calculations and analytics.',
    href: '/use-cases/school-broadsheet',
    benefits: [
      'Automatic calculations',
      'Grade distribution',
      'Professional PDF export',
      'Performance analytics',
    ],
    icon: '📈',
  },
  {
    title: 'Data Management & Security',
    description: 'Keep all school data organized, backed up, and secure.',
    href: '/use-cases/data-management',
    benefits: [
      'Centralized database',
      'Automatic hourly backups',
      'Role-based security',
      'GDPR compliant',
    ],
    icon: '💾',
  },
]

export default function UseCasesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Built for Real School Challenges
          </h1>
          <p className="text-xl text-[#bfdbfe]">
            From fee collection to result publishing, SchoolBase handles everything your school needs.
          </p>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, idx) => (
              <Link
                key={idx}
                href={useCase.href}
                className="group bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-[#0A66C2]"
              >
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#0A66C2] transition-colors">
                  {useCase.title}
                </h2>
                <p className="text-slate-600 mb-6">{useCase.description}</p>
                <ul className="space-y-2 mb-6">
                  {useCase.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-[#0A66C2] font-semibold">
                  Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            All Use Cases. One Platform.
          </h2>
          <p className="text-slate-600 mb-8 text-lg">
            Unlike other school software, SchoolBase brings all these solutions together. No need for multiple apps or systems.
          </p>
          <Link
            href="/features"
            className="inline-block bg-[#0A66C2] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#084a9a] transition-colors"
          >
            See All Features
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A66C2] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Solve Your School Challenges?
          </h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            Start your 14-day free trial today. No credit card required.
          </p>
          <Link
            href="/purchase"
            className="inline-block bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-semibold hover:bg-[#eff6ff] transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </main>
  )
}
