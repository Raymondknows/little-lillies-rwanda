import { Metadata } from 'next'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'School Management by Industry | SchoolBase',
  description:
    'Solutions tailored for different school types: primary schools, secondary schools, international schools, and more.',
  keywords: [
    'primary school management software',
    'secondary school software',
    'international school management',
    'private school software',
  ],
  openGraph: {
    title: 'School Management by Industry | SchoolBase',
    description: 'SchoolBase solutions for every school type',
  },
}

const industries = [
  {
    title: 'Primary Schools',
    description:
      'Manage younger students with simplified workflows and parent-focused communication.',
    href: '/industries/primary-schools',
    icon: '🎒',
    features: [
      'Simplified grade system for younger students',
      'Daily attendance tracking',
      'Parent communication in plain language',
      'Monthly fee structures',
    ],
  },
  {
    title: 'Secondary Schools',
    description:
      'Handle complex curricula, multiple teachers, and exam management systems.',
    href: '/industries/secondary-schools',
    icon: '📚',
    features: [
      'Multiple subjects per student',
      'Complex grading systems (WAEC, JAMB, etc.)',
      'Multiple exam sessions',
      'Advanced analytics & performance tracking',
    ],
  },
  {
    title: 'International Schools',
    description:
      'Support global curricula (IB, Cambridge, AP) with multi-currency payments.',
    href: '/industries/international-schools',
    icon: '🌍',
    features: [
      'International curriculum support (IB, Cambridge, AP)',
      'Multi-currency fee management',
      'Transcript generation',
      'Global parent communication',
    ],
  },
  {
    title: 'Private Schools',
    description:
      'Advanced financial tracking and custom pricing for boutique school operations.',
    href: '/industries/private-schools',
    icon: '💎',
    features: [
      'Custom fee structures and pricing',
      'Advanced financial reporting',
      'Scholarship management',
      'Alumni tracking',
    ],
  },
]

export default function IndustriesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Solutions for Every School Type
          </h1>
          <p className="text-xl text-[#bfdbfe]">
            Whether you're a primary school, secondary school, or international school, SchoolBase adapts to your needs.
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {industries.map((industry, idx) => (
              <Link
                key={idx}
                href={industry.href}
                className="group bg-white rounded-lg p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-[#0A66C2]"
              >
                <div className="text-5xl mb-4">{industry.icon}</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#0A66C2] transition-colors">
                  {industry.title}
                </h2>
                <p className="text-slate-600 mb-6">{industry.description}</p>
                <ul className="space-y-2 mb-6">
                  {industry.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-purple-600 font-semibold">
                  Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Common Needs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            What All Schools Need
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Fee Management',
                description: 'Track payments, send reminders, reduce defaults.',
              },
              {
                title: 'Parent Communication',
                description: 'Reach parents on WhatsApp for updates and announcements.',
              },
              {
                title: 'Result Publishing',
                description: 'Publish grades quickly and efficiently.',
              },
              {
                title: 'Data Security',
                description: 'Keep student and financial data safe and backed up.',
              },
              {
                title: 'Team Collaboration',
                description: 'Let teachers, admins, and staff work together.',
              },
              {
                title: 'Analytics',
                description: 'Get insights into school performance and operations.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg">
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A66C2] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Find Your Solution Today
          </h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            Explore SchoolBase solutions built for your school type.
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
