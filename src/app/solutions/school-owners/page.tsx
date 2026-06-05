import { Metadata } from 'next'
import { Zap, TrendingUp, PieChart, AlertCircle, DollarSign, Users, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'School Owner Solutions | SchoolBase',
  description:
    'Complete financial control and visibility for school owners. Track fees, automate reminders, and grow your school with data-driven insights.',
  keywords: [
    'school owner software',
    'school financial management',
    'fee collection school',
    'school analytics',
  ],
  openGraph: {
    title: 'School Owner Solutions | SchoolBase',
    description: 'Run your school like a business with complete financial control',
  },
}

const features = [
  {
    icon: DollarSign,
    title: 'Real-Time Financial Dashboard',
    description: 'See exactly how much you\'ve collected, what\'s outstanding, and your cash flow at a glance.',
  },
  {
    icon: TrendingUp,
    title: 'Advanced Analytics & Reports',
    description: 'Generate comprehensive reports on fees, enrollment, revenue trends, and school performance.',
  },
  {
    icon: AlertCircle,
    title: 'Automated Payment Reminders',
    description: 'Reduce outstanding fees with automatic WhatsApp reminders to parents.',
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Control what each staff member can see and do with role-based access.',
  },
  {
    icon: Zap,
    title: 'Bulk Operations',
    description: 'Update fees, create accounts, and publish results for hundreds of students at once.',
  },
  {
    icon: PieChart,
    title: 'Revenue Forecasting',
    description: 'Predict revenue based on enrollment and fee collection patterns.',
  },
]

const benefits = [
  'Reduce fee collection time from weeks to days',
  'Eliminate manual fee tracking spreadsheets',
  'Improve parent communication',
  'Make data-driven decisions',
  'Scale your school without adding staff',
  'Secure data with automatic backups',
  '48-hour onboarding with dedicated support',
]

export default function SchoolOwnersPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Run Your School Like a Business
          </h1>
          <p className="text-xl text-[#bfdbfe] mb-8">
            Get complete visibility into your school's finances, reduce fee collection time by 80%, and make data-driven decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
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
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            We Know Your Challenges
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Fee Collection Headaches',
                description: 'Tracking who paid, who didn\'t, and chasing defaulters takes endless time.',
              },
              {
                title: 'No Financial Visibility',
                description: 'Spreadsheets and manual records make it hard to know your true cash position.',
              },
              {
                title: 'Poor Parent Communication',
                description: 'Parents don\'t know fees are due until it\'s too late.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Features Built for School Owners
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
                  <Icon className="w-10 h-10 text-[#0A66C2] mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits List */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Benefits You'll See Immediately
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-slate-700 text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="bg-[#0A66C2] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Thousands of School Owners Trust SchoolBase
          </h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            See why schools like yours are saving time and collecting more fees with SchoolBase.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-semibold hover:bg-[#eff6ff] transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </section>
    </main>
  )
}
