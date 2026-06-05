import { Metadata } from 'next'
import { CheckCircle, Users, TrendingUp, BookOpen, Globe } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SchoolBase for South African Schools | Primary & Secondary Software',
  description:
    'School management software built for South African schools. Support for CAPS curriculum, Matric reporting, fee collection in ZAR. 30 days free.',
  keywords: [
    'school management software South Africa',
    'South African school system',
    'CAPS curriculum management',
    'Matric results management',
    'South African school fees',
    'school software ZAR',
  ],
  openGraph: {
    title: 'SchoolBase for South African Schools',
    description: 'The school management platform built for SA schools',
  },
}

export default function SouthAfricaSchoolsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4 inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-[#bfdbfe] text-sm font-medium">
            🇿🇦 Built for South African Schools
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            School Management Software for South Africa
          </h1>
          <p className="text-xl text-[#bfdbfe] mb-8">
            Designed for CAPS curriculum, Matric systems, and South African schools. Fee collection in ZAR. Compliant with DBE requirements.
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
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Why South African Schools Choose SchoolBase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Built Specifically for SA Schools
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'CAPS Curriculum Support',
                description: 'Grade outcomes, learning areas, and assessment standards aligned with CAPS requirements.'
              },
              {
                icon: TrendingUp,
                title: 'Matric Management',
                description: 'Specialized workflows for Matric classes. NSC reporting templates. Grade 12 analytics.'
              },
              {
                icon: Globe,
                title: 'South African Pricing',
                description: 'Fees in ZAR. Pricing designed for South African school budgets. No hidden costs.'
              },
              {
                icon: Users,
                title: 'Local Support',
                description: 'Support team in South Africa. Understands SA school systems. Responds in SA hours.'
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-white border-l-4 border-[#0A66C2] rounded-lg shadow-sm">
                <item.icon className="w-8 h-8 text-[#0A66C2] mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features for SA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Features for South African Schools</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Curriculum',
                items: ['CAPS outcomes tracking', 'Grade levels G-R (K-12)', 'Learning area mapping', 'Term planner integration', 'Assessment schedules']
              },
              {
                title: 'Assessment & Reporting',
                items: ['NSC report generation', 'Matric subject tracking', 'Mark administration', 'Progress reports', 'School ranking']
              },
              {
                title: 'Financial Management',
                items: ['ZAR pricing & fees', 'School levy tracking', 'Fundraising management', 'Donor tracking', 'Financial reports']
              },
              {
                title: 'Compliance',
                items: ['DBE compliance', 'Data protection (POPIA)', 'Matric audit ready', 'School records retention', 'Regulatory alignment']
              },
            ].map((section, idx) => (
              <div key={idx} className="p-6 bg-white rounded-lg border border-slate-200">
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

      {/* Use Cases - SA Specific */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">How SA Schools Use SchoolBase</h2>
          <div className="space-y-6">
            {[
              {
                school: 'Primary Schools',
                uses: [
                  'Grade 0-6 management',
                  'Parent communication via WhatsApp',
                  'Monthly report cards',
                  'Attendance tracking',
                  'Fee collection'
                ]
              },
              {
                school: 'Secondary Schools',
                uses: [
                  'Grade 7-12 tracking',
                  'Subject performance analysis',
                  'Matric preparation & monitoring',
                  'NSC compliance',
                  'College placement tracking'
                ]
              },
              {
                school: 'Independent & Private Schools',
                uses: [
                  'Curriculum flexibility',
                  'Advanced reporting',
                  'Donor & alumni management',
                  'Fundraising tracking',
                  'Premium features'
                ]
              },
              {
                school: 'Multisite Schools',
                uses: [
                  'Campus management',
                  'Centralized reporting',
                  'Consistent grading',
                  'Teacher mobility',
                  'Resource sharing'
                ]
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-bold text-[#0A66C2] mb-4 text-lg">{item.school}</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {item.uses.map((use, uidx) => (
                    <div key={uidx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{use}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            South African School Pricing
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Transparent pricing in ZAR. No hidden costs. Scale with your school.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Small',
                students: 'Up to 200 students',
                price: 'R299',
                period: '/month',
                features: ['All features', 'Unlimited staff', 'WhatsApp integration', 'Email support', 'Mobile app']
              },
              {
                name: 'Medium',
                students: 'Up to 500 students',
                price: 'R699',
                period: '/month',
                popular: true,
                features: ['All features', 'Multiple campuses', 'Advanced reports', 'Priority support', 'Custom fields', 'API access']
              },
              {
                name: 'Large',
                students: '500+ students',
                price: 'Custom',
                period: 'quote',
                features: ['Everything', 'Dedicated support', 'Custom workflows', 'Integration', 'Training included', 'SLA guarantee']
              },
            ].map((plan, idx) => (
              <div key={idx} className={`rounded-lg border-2 overflow-hidden ${plan.popular ? 'border-[#0A66C2] bg-gradient-to-b from-blue-50 to-white shadow-lg' : 'border-slate-200 bg-white'}`}>
                {plan.popular && <div className="bg-[#0A66C2] text-white py-2 text-center font-semibold text-sm">MOST POPULAR</div>}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-600 mb-6">{plan.students}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600 ml-2">{plan.period}</span>
                  </div>
                  <Link
                    href="/purchase"
                    className={`w-full block text-center py-2 rounded-lg font-semibold mb-6 transition-colors ${
                      plan.popular
                        ? 'bg-[#0A66C2] text-white hover:bg-[#084a9a]'
                        : 'border-2 border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50'
                    }`}
                  >
                    Start Free Trial
                  </Link>
                  <ul className="space-y-3">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-3 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0A66C2] to-[#084a9a] text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Join South African Schools Using SchoolBase</h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            30 days free. No credit card. CAPS-compliant from day one.
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
              Request Demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
