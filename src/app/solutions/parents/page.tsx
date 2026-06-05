import { Metadata } from 'next'
import { Bell, DollarSign, TrendingUp, Users, CheckCircle, Smartphone } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Parent Solutions | SchoolBase',
  description:
    'Stay connected with your child\'s school. Get fee notifications on WhatsApp, track results in real-time, and never miss important updates.',
  keywords: [
    'parent communication app',
    'school portal parents',
    'fee notification app',
    'student results tracking',
  ],
  openGraph: {
    title: 'Parent Solutions | SchoolBase',
    description: 'Stay connected with your child\'s school on WhatsApp',
  },
}

const features = [
  {
    icon: DollarSign,
    title: 'Instant Fee Notifications',
    description: 'Get fee reminders on WhatsApp with exact amounts and due dates.',
  },
  {
    icon: TrendingUp,
    title: 'Track Results in Real-Time',
    description: 'See your child\'s grades, performance, and progress immediately after publication.',
  },
  {
    icon: Bell,
    title: 'School Announcements',
    description: 'Receive important school updates, events, and announcements on WhatsApp.',
  },
  {
    icon: Smartphone,
    title: 'Easy Fee Payments',
    description: 'Pay school fees directly through the parent app with multiple payment options.',
  },
  {
    icon: Users,
    title: 'Direct Communication',
    description: 'Connect directly with teachers for updates on your child\'s progress.',
  },
  {
    icon: CheckCircle,
    title: 'Payment History',
    description: 'Track all your payments, receipts, and payment schedule in one place.',
  },
]

export default function ParentsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Stay Connected to Your Child's School
          </h1>
          <p className="text-xl text-[#bfdbfe] mb-8">
            Get school updates on WhatsApp, track your child's results, and manage fees—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/login"
              className="bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-semibold hover:bg-[#eff6ff] transition-colors"
            >
              Parent Login
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#084a9a] transition-colors"
            >
              Ask Your School
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            What Parents Love About SchoolBase
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                emoji: '📱',
                title: 'WhatsApp Updates',
                description: 'Get all school news on the messaging app you use every day.',
              },
              {
                emoji: '💰',
                title: 'Clear Fees',
                description: 'Always know exactly what fees are due and when they\'re due.',
              },
              {
                emoji: '📊',
                title: 'Real-Time Results',
                description: 'See your child\'s performance immediately after exam results are published.',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{item.emoji}</div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Features for Every Parent
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

      {/* Use Cases */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Common Scenarios
          </h2>
          <div className="space-y-6">
            {[
              {
                scenario: 'School announces a fee change',
                solution: 'You get a WhatsApp message with the new amount and due date.',
              },
              {
                scenario: 'Your child\'s results are published',
                solution: 'Instant notification on WhatsApp with a link to view detailed grades.',
              },
              {
                scenario: 'You want to pay fees quickly',
                solution: 'Pay directly from the app using your preferred payment method.',
              },
              {
                scenario: 'Teacher wants to discuss your child\'s progress',
                solution: 'You connect directly through SchoolBase for easy communication.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border-l-4 border-[#0A66C2]">
                <h3 className="font-bold text-slate-900 mb-2">{item.scenario}</h3>
                <p className="text-slate-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {item.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A66C2] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Your School is Using SchoolBase
          </h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            Ask your school to enable parent access so you can enjoy these features today.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-semibold hover:bg-[#eff6ff] transition-colors"
          >
            Contact Your School
          </Link>
        </div>
      </section>
    </main>
  )
}
