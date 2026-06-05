import { Metadata } from 'next'
import { BookOpen, Clock, MessageSquare, TrendingUp, Users, Zap, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Teacher Solutions | SchoolBase',
  description:
    'Publish results in minutes, track student progress, and communicate with parents. Free teachers from paperwork.',
  keywords: [
    'teacher management system',
    'result publishing platform',
    'teacher communication app',
    'grade management system',
  ],
  openGraph: {
    title: 'Teacher Solutions | SchoolBase',
    description: 'Focus on teaching, let SchoolBase handle the paperwork',
  },
}

const features = [
  {
    icon: TrendingUp,
    title: 'One-Click Result Publishing',
    description: 'Enter grades once and publish to parents, students, and staff instantly.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Parent Communication',
    description: 'Reach parents directly on WhatsApp for important updates and notifications.',
  },
  {
    icon: BookOpen,
    title: 'Grade Management',
    description: 'Track student performance across subjects, terms, and years.',
  },
  {
    icon: Clock,
    title: 'Automated Grading',
    description: 'Configure grading scales and let SchoolBase calculate grades automatically.',
  },
  {
    icon: Users,
    title: 'Class Management',
    description: 'Manage your class roster, attendance, and subject assignments in one place.',
  },
  {
    icon: Zap,
    title: 'Bulk Operations',
    description: 'Upload grades via CSV or enter manually. SchoolBase adapts to your workflow.',
  },
]

export default function TeachersPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Focus on Teaching. We'll Handle the Paperwork.
          </h1>
          <p className="text-xl text-[#dbeafe] mb-8">
            Publish results in minutes, communicate with parents effortlessly, and spend less time on admin work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/purchase"
              className="bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-semibold hover:bg-[#eff6ff] transition-colors"
            >
              Get Started Free
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

      {/* Pain Points */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            The Teacher's Dilemma
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Manual Grade Entry',
                description: 'Hours spent entering grades into spreadsheets and reporting forms.',
              },
              {
                title: 'No Direct Parent Contact',
                description: 'Can\'t reach parents quickly about student performance or important updates.',
              },
              {
                title: 'Admin Overload',
                description: 'Spending more time on paperwork than actually teaching.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded">
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
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
            Designed for Teachers
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

      {/* Workflow */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Your New Workflow
          </h2>
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Enter Grades',
                description: 'Upload CSV or enter grades manually into SchoolBase.',
              },
              {
                step: '2',
                title: 'Review & Finalize',
                description: 'Review grades, add comments, and finalize results.',
              },
              {
                step: '3',
                title: 'One-Click Publish',
                description: 'Publish to parents, students, and staff instantly.',
              },
              {
                step: '4',
                title: 'Communicate on WhatsApp',
                description: 'Send updates and celebrate achievements with parents directly.',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="bg-[#0A66C2] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-white py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#0A66C2' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Reclaim Your Time
          </h2>
          <p className="text-[#dbeafe] mb-8 text-lg">
            Teachers using SchoolBase spend 5+ hours less per term on paperwork. What will you do with that time?
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
