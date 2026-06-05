import { Metadata } from 'next'
import { CheckCircle, AlertCircle, TrendingUp, Users, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Choose School Management Software | SchoolBase Guide',
  description:
    'Complete guide to selecting school management software. Compare features, pricing, and implementation. Free checklist for school leaders.',
  keywords: [
    'school management software',
    'choose school software',
    'school software comparison',
    'best school management systems',
    'school software guide',
  ],
  openGraph: {
    title: 'How to Choose School Management Software',
    description: 'A practical guide for school leaders and administrators',
  },
}

export default function SchoolSoftwareGuidePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            How to Choose School Management Software
          </h1>
          <p className="text-xl text-[#bfdbfe] mb-8">
            The ultimate guide for school leaders. Learn what features matter, how to evaluate options, and make the right choice for your school.
          </p>
          <Link
            href="#checklist"
            className="inline-block bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-semibold hover:bg-[#eff6ff] transition-colors"
          >
            Download Free Checklist
          </Link>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Are You Choosing the Right School Software?
          </h2>
          <p className="text-lg text-slate-700 mb-6">
            Choosing school management software is one of the most important decisions you'll make as a school leader. The wrong choice can waste money, frustrate your staff, and leave parents confused. The right choice transforms how your school operates.
          </p>
          <p className="text-lg text-slate-700">
            This guide walks you through the exact process we recommend to school leaders and administrators.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Why This Decision Matters</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: AlertCircle,
                title: 'Common Mistakes',
                items: [
                  'Choosing based on price alone',
                  'Not involving staff in evaluation',
                  'Ignoring integration capabilities',
                  'Overlooking mobile experience',
                  'Not checking support quality'
                ]
              },
              {
                icon: TrendingUp,
                title: 'What Great Schools Do',
                items: [
                  'Define needs first, then compare',
                  'Involve teachers and parents',
                  'Test with your actual data',
                  'Plan implementation carefully',
                  'Choose partner-ready vendors'
                ]
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <item.icon className="w-6 h-6 text-[#0A66C2]" />
                  <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                </div>
                <ul className="space-y-2">
                  {item.items.map((i, idx) => (
                    <li key={idx} className="text-slate-700 flex gap-2">
                      <span className="text-slate-400">•</span>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-step Guide */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">The 5-Step Selection Process</h2>
          <div className="space-y-12">
            {[
              {
                step: 1,
                title: 'Define Your Needs',
                description: 'What problems are you solving? What\'s your current system? What size is your school?',
                checklist: [
                  'List current pain points (3-5 biggest)',
                  'Number of students, staff, classes',
                  'Features you absolutely need',
                  'Budget range',
                  'Implementation timeline'
                ]
              },
              {
                step: 2,
                title: 'Research Options',
                description: 'Look for software that fits your needs. Read reviews from similar schools.',
                checklist: [
                  'Search for "[your region] school software"',
                  'Check Google reviews and testimonials',
                  'Ask peer schools which they use',
                  'Request demos from top 3 options',
                  'Check pricing and support options'
                ]
              },
              {
                step: 3,
                title: 'Evaluate Features',
                description: 'Compare how each option handles your specific needs.',
                checklist: [
                  'Does it have the core features you need?',
                  'How is the user interface? (Important!)',
                  'Mobile app quality',
                  'Integration with other tools',
                  'Reporting and analytics capabilities'
                ]
              },
              {
                step: 4,
                title: 'Test With Your Team',
                description: 'Let teachers, admins, and parents try the software.',
                checklist: [
                  'Arrange free trial or demo',
                  'Have staff test with real data',
                  'Get feedback from multiple roles',
                  'Test on mobile phones',
                  'Ask about ongoing training'
                ]
              },
              {
                step: 5,
                title: 'Make the Decision',
                description: 'Choose based on features, value, and team comfort.',
                checklist: [
                  'Compare total cost of ownership',
                  'Check vendor stability and support',
                  'Read the contract carefully',
                  'Plan your implementation',
                  'Schedule training for staff'
                ]
              },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-14 w-14 rounded-full bg-[#0A66C2] text-white font-bold text-xl">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-700 mb-4">{item.description}</p>
                    <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-6 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-3">Checklist for this step:</h4>
                      <ul className="space-y-2">
                        {item.checklist.map((check, cidx) => (
                          <li key={cidx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{check}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Essential Features Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left py-3 px-4 font-bold text-slate-900">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Critical?</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">What to Look For</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: 'Fee Management',
                    critical: 'YES',
                    details: 'Automated tracking, parent notifications, payment integration'
                  },
                  {
                    feature: 'Parent Communication',
                    critical: 'YES',
                    details: 'WhatsApp or SMS, bulk messaging, delivery tracking'
                  },
                  {
                    feature: 'Attendance',
                    critical: 'YES',
                    details: 'Quick marking, reports, alerts for absences'
                  },
                  {
                    feature: 'Grade Management',
                    critical: 'YES',
                    details: 'Grade entry, auto-calculations, report cards'
                  },
                  {
                    feature: 'Mobile Apps',
                    critical: 'HIGH',
                    details: 'Teacher and parent apps, offline capability'
                  },
                  {
                    feature: 'Data Security',
                    critical: 'HIGH',
                    details: 'Backups, encryption, compliance certifications'
                  },
                  {
                    feature: 'Support',
                    critical: 'HIGH',
                    details: 'Live chat, email, phone, local support team'
                  },
                  {
                    feature: 'Training',
                    critical: 'MEDIUM',
                    details: 'Onboarding, video tutorials, documentation'
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-white transition-colors">
                    <td className="py-3 px-4 text-slate-900 font-semibold">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        row.critical === 'YES' ? 'bg-red-100 text-red-800' :
                        row.critical === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {row.critical}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{row.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Questions to Ask */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Questions to Ask Vendors</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Technical',
                questions: [
                  'How is data backed up and how often?',
                  "What's your uptime guarantee?",
                  'Is there an API for integrations?',
                  'Can you export my data if you leave?',
                  'How do you handle security and compliance?'
                ]
              },
              {
                title: 'Implementation',
                questions: [
                  'How long does setup typically take?',
                  'What training do you provide?',
                  'Can you help migrate from our old system?',
                  "What's the typical cost beyond subscription?",
                  'Do you have local support staff?'
                ]
              },
              {
                title: 'Support & Service',
                questions: [
                  'What are your support hours?',
                  "What's the response time for urgent issues?",
                  'How often do you release updates?',
                  'What happens if I want to cancel?',
                  'Can you provide references from similar schools?'
                ]
              },
              {
                title: 'Pricing & Contract',
                questions: [
                  "What's included in the base price?",
                  'Are there per-student or per-staff fees?',
                  'What discounts are available for longer contracts?',
                  'Can I pause or downgrade if enrollment changes?',
                  "What's the contract termination policy?"
                ]
              },
            ].map((section, idx) => (
              <div key={idx} className="p-6 bg-white rounded-lg border border-slate-200">
                <h3 className="font-bold text-[#0A66C2] mb-4 text-lg">{section.title}</h3>
                <ul className="space-y-3">
                  {section.questions.map((q, qidx) => (
                    <li key={qidx} className="flex gap-3">
                      <span className="text-[#0A66C2] font-bold flex-shrink-0">Q:</span>
                      <span className="text-slate-700">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#0A66C2] to-[#084a9a] text-white rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Choose the Right Software?</h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            SchoolBase is trusted by 500+ schools. Start your 30-day free trial and see if we're the right fit for your school.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
    </main>
  )
}
