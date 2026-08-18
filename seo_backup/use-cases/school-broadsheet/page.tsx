import { Metadata } from 'next'
import { CheckCircle, BarChart3, AlertCircle, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Digital Broadsheet & Grade Book | SchoolBase',
  description:
    'Create digital broadsheets with automatic calculations. Track student performance across subjects and terms. Export professional reports.',
  keywords: [
    'school broadsheet software',
    'digital broadsheet',
    'grade book app',
    'academic broadsheet',
    'student performance tracking',
    'class broadsheet',
  ],
  openGraph: {
    title: 'Digital Broadsheet & Grade Book | SchoolBase',
    description: 'Professional digital broadsheets with automatic calculations and analytics',
  },
}

export default function SchoolBroadsheetPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Professional Digital Broadsheets
          </h1>
          <p className="text-xl text-[#bfdbfe] mb-8">
            No more Excel. Create beautiful broadsheets with automatic calculations, weighted scoring, and instant analytics.
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

      {/* The Problem */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">The Excel Broadsheet Problem</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: AlertCircle,
                title: 'Formula Errors',
                description: 'One wrong formula and all calculations are broken. Hours spent debugging.'
              },
              {
                icon: Users,
                title: 'Version Confusion',
                description: 'Teachers keep sending different versions. You don\'t know which is the latest.'
              },
              {
                icon: TrendingUp,
                title: 'No Insights',
                description: 'Raw data doesn\'t show patterns. You can\'t identify struggling students quickly.'
              },
              {
                icon: BarChart3,
                title: 'Hard to Share',
                description: 'Can\'t easily show parents. Difficult to print professionally. Merging results takes forever.'
              },
            ].map((problem, idx) => (
              <div key={idx} className="p-6 bg-white border-l-4 border-[#0A66C2] rounded-lg shadow-sm">
                <problem.icon className="w-8 h-8 text-[#0A66C2] mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">{problem.title}</h3>
                <p className="text-slate-600">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            SchoolBase Broadsheets: Smart, Automatic, Professional
          </h2>
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Set Up Your Broadsheet',
                description: 'Define subjects, weightings, grading scale. No formulas needed—SchoolBase handles it all.'
              },
              {
                step: '2',
                title: 'Teachers Enter Scores',
                description: 'Teachers enter test scores, assignments, class work. Calculations happen automatically.'
              },
              {
                step: '3',
                title: 'Instant Analytics',
                description: 'See class averages, identify top/bottom performers, spot grade trends. All in real-time.'
              },
              {
                step: '4',
                title: 'Professional Reports',
                description: 'Export beautiful PDF broadsheets, class reports, or individual report cards. Ready to share.'
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#0A66C2] text-white font-bold">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Broadsheet Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Smart Calculations',
                items: ['Weighted scoring', 'Auto-totals', 'Grade assignment', 'Percentage conversion', 'Rank calculations']
              },
              {
                title: 'Performance Analytics',
                items: ['Class statistics', 'Grade distribution', 'Student ranking', 'Progress tracking', 'Comparative data']
              },
              {
                title: 'Easy Data Entry',
                items: ['Quick input forms', 'Bulk upload', 'Mobile entry', 'Auto-save', 'Edit history']
              },
              {
                title: 'Professional Output',
                items: ['PDF export', 'Print-ready', 'Custom templates', 'Report cards', 'Summary sheets']
              },
            ].map((section, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, iidx) => (
                    <li key={iidx} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Who Uses SchoolBase Broadsheets?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                role: 'Class Teachers',
                uses: [
                  'Track student performance in class subjects',
                  'Calculate continuous assessment scores',
                  'Monitor progress throughout the term',
                  'Generate parent report cards'
                ]
              },
              {
                role: 'School Admins',
                uses: [
                  'Review school-wide performance',
                  'Compare class performance',
                  'Generate management reports',
                  'Plan interventions for struggling students'
                ]
              },
              {
                role: 'Subject Heads',
                uses: [
                  'Monitor subject performance across classes',
                  'Identify teaching gaps',
                  'Compare performance year-on-year',
                  'Support struggling classes'
                ]
              },
              {
                role: 'Principals',
                uses: [
                  'Get instant school performance overview',
                  'Make data-driven decisions',
                  'Report to board on academics',
                  'Identify areas needing support'
                ]
              },
            ].map((section, idx) => (
              <div key={idx} className="p-6 bg-white rounded-lg border border-slate-200">
                <h3 className="font-bold text-[#0A66C2] mb-4 text-lg">{section.role}</h3>
                <ul className="space-y-2">
                  {section.uses.map((use, uidx) => (
                    <li key={uidx} className="text-slate-700 flex gap-2">
                      <span className="text-green-500">✓</span>
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0A66C2] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">What Schools Achieve</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '60%',
                label: 'Less Time on Grading'
              },
              {
                number: '100%',
                label: 'Calculation Accuracy'
              },
              {
                number: '5 min',
                label: 'To Export Reports'
              },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <p className="text-[#bfdbfe]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0A66C2] to-[#084a9a] text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Say Goodbye to Excel Broadsheets</h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            Create professional broadsheets in minutes. Get insights instantly. Export reports with one click.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/purchase"
              className="bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-semibold hover:bg-[#eff6ff] transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#084a9a] transition-colors"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
