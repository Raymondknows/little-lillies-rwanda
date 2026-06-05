import { Metadata } from 'next'
import { Lock, Zap, Users, Database, BarChart3, RefreshCw, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Administrator Solutions | SchoolBase',
  description:
    'Centralize school operations with powerful admin tools. Manage data, automate workflows, and keep your school running smoothly.',
  keywords: [
    'school administration software',
    'school data management',
    'admin dashboard school',
    'school operations platform',
  ],
  openGraph: {
    title: 'Administrator Solutions | SchoolBase',
    description: 'Centralize and automate school operations',
  },
}

const features = [
  {
    icon: Database,
    title: 'Centralized Data Hub',
    description: 'All school data in one place: students, staff, fees, results, attendance.',
  },
  {
    icon: Users,
    title: 'User & Role Management',
    description: 'Create accounts, assign roles, and control permissions for all users.',
  },
  {
    icon: Zap,
    title: 'Bulk Operations',
    description: 'Upload 1000s of students, publish results, update fees all at once.',
  },
  {
    icon: RefreshCw,
    title: 'Automated Workflows',
    description: 'Automate recurring tasks: fee reminders, notifications, data backups.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track fee collection, student performance, enrollment trends in detail.',
  },
  {
    icon: Lock,
    title: 'Security & Backups',
    description: 'Automatic daily backups, role-based access, encrypted data storage.',
  },
]

export default function AdministratorsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Powerful Tools for School Admins
          </h1>
          <p className="text-xl text-[#bfdbfe] mb-8">
            Centralize operations, automate workflows, and keep perfect records. All with a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/purchase"
              className="bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-semibold hover:bg-[#eff6ff] transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/demo"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#084a9a] transition-colors"
            >
              See Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Challenges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Common Admin Struggles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Data Scattered Everywhere',
                description: 'Student info in one system, fees in another, results in spreadsheets.',
              },
              {
                title: 'Manual, Repetitive Tasks',
                description: 'Hours spent uploading data, sending notifications, generating reports.',
              },
              {
                title: 'Limited Visibility',
                description: 'Hard to track overall school performance and operational metrics.',
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

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Admin Superpowers
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

      {/* Typical Admin Tasks */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Tasks Made Simple
          </h2>
          <div className="space-y-4">
            {[
              'Upload 500 new students → Done in 5 minutes with CSV import',
              'Create staff accounts → Bulk create with role-based permissions',
              'Publish exam results → One-click publish to all stakeholders',
              'Send fee reminders → Automatic WhatsApp reminders to 1000+ parents',
              'Generate reports → Detailed analytics on demand',
              'Backup data → Automatic daily backups',
              'Monitor school metrics → Real-time dashboard with KPIs',
              'Export data → Get data in any format you need',
            ].map((task, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#eff6ff]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Enterprise-Grade Security
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              'Automatic daily backups',
              'Role-based access control',
              'Data encryption at rest & in transit',
              'Audit logs for all activities',
              'GDPR-compliant data handling',
              'Multi-factor authentication',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#0A66C2] flex-shrink-0 mt-1" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A66C2] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Simplify School Operations?
          </h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            Join school administrators using SchoolBase to manage operations more efficiently.
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
