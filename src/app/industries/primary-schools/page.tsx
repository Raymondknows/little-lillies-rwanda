import { Metadata } from 'next'
import { Users, BookOpen, Heart, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Primary School Management Software | SchoolBase',
  description:
    'Built for primary schools. Simplified workflows, parent-focused communication, and easy-to-use fee management.',
  keywords: [
    'primary school management',
    'elementary school software',
    'primary school fees',
    'primary school parent app',
  ],
  openGraph: {
    title: 'Primary School Management Software | SchoolBase',
    description: 'Manage your primary school efficiently',
  },
}

export default function PrimarySchoolsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Primary School Management Made Simple
          </h1>
          <p className="text-xl text-[#bfdbfe] mb-8">
            Manage your primary school with workflows designed for young learners and their parents.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/purchase"
              className="bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-semibold hover:bg-[#eff6ff] transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/demo"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#084a9a] transition-colors"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Why Primary Schools Choose SchoolBase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Why Primary Schools Choose SchoolBase
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Users,
                title: 'Parent-Focused',
                description:
                  'Keep parents connected to their child\'s school journey with easy-to-understand updates and notifications.',
              },
              {
                icon: BookOpen,
                title: 'Simplified Learning Tracking',
                description:
                  'Track student progress without complex metrics. Simple letter grades or numeric scores.',
              },
              {
                icon: Heart,
                title: 'Child Safety Focus',
                description:
                  'Attendance tracking so you always know where students are throughout the day.',
              },
              {
                icon: CheckCircle,
                title: 'Straightforward Fees',
                description:
                  'Simple monthly or termly fees. Automated reminders reduce collection hassles.',
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="bg-white p-8 rounded-lg shadow-md">
                  <Icon className="w-10 h-10 text-[#0A66C2] mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features for Primary Schools */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Features Built for Primary Schools
          </h2>
          <div className="space-y-4">
            {[
              'Simple grade tracking (A-F, 1-5, or custom)',
              'Monthly or termly fee structures',
              'Daily attendance reports to parents',
              'Student progress reports in plain language',
              'Class-wide communication (teacher to all parents)',
              'Behavior tracking and notes',
              'Parent portal to view child\'s progress',
              'Automated end-of-year report generation',
              'Field trip permission tracking',
              'Parent-teacher communication tools',
              'Custom school calendar management',
              'Extracurricular activity tracking',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-[#0A66C2] flex-shrink-0" />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Scenarios */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            How Your Primary School Uses SchoolBase
          </h2>
          <div className="space-y-6">
            {[
              {
                scenario: 'Monday: Set fees for the term',
                description:
                  'Configure fees for all classes. SchoolBase automatically sends reminders to parents.',
              },
              {
                scenario: 'Tuesday: Teacher enters grades',
                description:
                  'Teachers enter test scores. SchoolBase calculates grades automatically.',
              },
              {
                scenario: 'Wednesday: Parents get notified',
                description:
                  'Parents receive WhatsApp updates about their child\'s performance.',
              },
              {
                scenario: 'Friday: Get a fee report',
                description:
                  'See how many parents paid, how many haven\'t, and your cash position.',
              },
              {
                scenario: 'End of term: Generate reports',
                description:
                  'Auto-generate professional report cards for all students.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#eff6ff] p-6 rounded-lg border-l-4 border-[#0A66C2]">
                <h3 className="font-bold text-slate-900 mb-2">{item.scenario}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A66C2] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Try SchoolBase for Your Primary School
          </h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            14-day free trial. No credit card required. Get started in minutes.
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
