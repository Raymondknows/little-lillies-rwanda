import { Metadata } from 'next'
import { ArrowRight, CheckCircle, TrendingUp, Users, Clock, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Solutions for Schools | SchoolBase',
  description:
    'Tailored solutions for school owners, teachers, parents, and administrators. Streamline operations and improve communication with SchoolBase.',
  keywords: [
    'school management solutions',
    'school management software',
    'school software',
    'school administration system',
    'fee collection system',
    'parent communication app',
  ],
  openGraph: {
    title: 'Solutions for Schools | SchoolBase',
    description: 'Tailored solutions for every role in your school',
    images: [
      { url: 'https://schoolbase.live/og-solutions.png', width: 1200, height: 630 },
    ],
  },
}

const solutions = [
  {
    title: 'For School Owners',
    icon: Users,
    href: '/solutions/school-owners',
    benefits: [
      'Complete visibility into school finances',
      'Real-time fee payment tracking',
      'Automated payment reminders',
      'Revenue reports and analytics',
      'Multi-staff account management',
    ],
    description: 'Run your school like a business with complete financial control and insights.',
  },
  {
    title: 'For Administrators',
    icon: Zap,
    href: '/solutions/administrators',
    benefits: [
      'Centralized data management',
      'Bulk operations and automation',
      'Staff role management',
      'Academic calendar control',
      'Backup and data security',
    ],
    description: 'Automate routine tasks and keep your school organized.',
  },
  {
    title: 'For Teachers',
    icon: TrendingUp,
    href: '/solutions/teachers',
    benefits: [
      'Publish student results in minutes',
      'Track student progress',
      'Communicate with parents via WhatsApp',
      'Generate grade reports',
      'Manage class information',
    ],
    description: 'Focus on teaching while SchoolBase handles the paperwork.',
  },
  {
    title: 'For Parents',
    icon: Clock,
    href: '/solutions/parents',
    benefits: [
      'View school fees and due dates',
      'Get payment reminders on WhatsApp',
      'Track student results in real-time',
      'Receive school announcements',
      'Pay fees from anywhere',
    ],
    description: 'Stay connected with your child\'s school and never miss important updates.',
  },
]

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Built for Every Role in Your School
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Whether you're a school owner, administrator, teacher, or parent, SchoolBase has a solution tailored to your needs.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {solutions.map((solution) => {
              const Icon = solution.icon
              return (
                <div
                  key={solution.title}
                className="bg-slate-700 rounded-lg p-8 hover:bg-slate-650 transition-all duration-300 border border-slate-600 hover:border-[#0A66C2]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-8 h-8 text-[#0A66C2]" />
                    <h2 className="text-2xl font-bold text-white">{solution.title}</h2>
                  </div>
                  <p className="text-slate-300 mb-6">{solution.description}</p>
                  <ul className="space-y-3 mb-8">
                    {solution.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-200">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={solution.href}
                    className="inline-flex items-center gap-2 bg-[#0A66C2] hover:bg-[#084a9a] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Learn More <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )
            })}
          </div>

          {/* CTA Section */}
          <div className="bg-[#0A66C2] rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your School?</h2>
            <p className="text-[#bfdbfe] mb-8 max-w-2xl mx-auto">
              Start your 7-day free trial today. No credit card required. See how SchoolBase can make a difference for every member of your school community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/purchase"
                className="bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                Start Free Trial
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#084a9a] transition-colors"
              >
                Talk to Our Team
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
