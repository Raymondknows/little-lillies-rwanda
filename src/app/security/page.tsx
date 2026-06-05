import { Metadata } from 'next'
import { Lock, Shield, Eye, CheckCircle, Server, Zap } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Security & Data Protection | SchoolBase',
  description:
    'Enterprise-grade security. Your school\'s data is encrypted, backed up daily, and protected with industry-leading practices.',
  keywords: [
    'school data security',
    'student information protection',
    'GDPR compliance school',
    'data encryption school',
  ],
  openGraph: {
    title: 'Security & Data Protection | SchoolBase',
    description: 'Your school\'s data security is our top priority',
  },
}

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Enterprise-Grade Security for Your School
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Your student and financial data is encrypted, backed up, and protected with bank-level security.
          </p>
        </div>
      </section>

      {/* Security Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            How We Protect Your Data
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: 'Encryption',
                description: 'All data encrypted in transit (SSL/TLS) and at rest (AES-256)',
              },
              {
                icon: Server,
                title: 'Infrastructure',
                description: 'Hosted on secure, ISO 27001 certified data centers',
              },
              {
                icon: Shield,
                title: 'Access Control',
                description: 'Role-based permissions. Only authorized staff see sensitive data',
              },
              {
                icon: Eye,
                title: 'Monitoring',
                description: 'Real-time security monitoring and threat detection 24/7',
              },
              {
                icon: Zap,
                title: 'Backups',
                description: 'Automatic daily backups with point-in-time recovery',
              },
              {
                icon: CheckCircle,
                title: 'Compliance',
                description: 'GDPR, SOC 2, and education data protection compliant',
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <Icon className="w-10 h-10 text-[#0A66C2] mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Security Features in Detail
          </h2>
          <div className="space-y-6">
            {[
              {
                title: 'Data Encryption',
                points: [
                  'End-to-end encryption for sensitive student information',
                  'AES-256 encryption for data at rest',
                  'TLS 1.3 encryption for data in transit',
                  'Encrypted backups stored in geographically redundant locations',
                ],
              },
              {
                title: 'Access & Authentication',
                points: [
                  'Multi-factor authentication (2FA) for all accounts',
                  'Role-based access control (RBAC) for different user types',
                  'Audit logs of all data access and changes',
                  'Automatic session timeout for inactive users',
                  'API keys and tokens for integrations',
                ],
              },
              {
                title: 'Data Protection & Privacy',
                points: [
                  'GDPR compliant data processing',
                  'Student data protected under education privacy laws',
                  'Right to data export at any time',
                  'Data deletion on account termination',
                  'Privacy-by-design approach',
                ],
              },
              {
                title: 'Business Continuity',
                points: [
                  'Automatic daily backups (no data loss)',
                  'Point-in-time recovery available',
                  '99.9% uptime SLA',
                  'Disaster recovery procedures',
                  'Redundant systems across multiple data centers',
                ],
              },
            ].map((section, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.points.map((point, pidx) => (
                    <li key={pidx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-slate-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Compliance & Certifications
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'GDPR Compliant',
                description: 'Full GDPR compliance for schools in EU and EU-connected regions',
              },
              {
                title: 'SOC 2 Type II',
                description: 'Security and availability controls verified by independent auditors',
              },
              {
                title: 'ISO 27001',
                description: 'Information security management system certified',
              },
              {
                title: 'Education Privacy Laws',
                description: 'Compliant with FERPA and other education privacy regulations',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#eff6ff] p-6 rounded-lg border-l-4 border-[#0A66C2]">
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Parents & Teachers Can Expect */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            What Parents & Teachers Can Expect
          </h2>
          <div className="space-y-4">
            {[
              'Your child\'s grades and attendance are private and encrypted',
              'Only you can access your account with secure login',
              'We never share your data with third parties',
              'Your financial information (bank details, etc.) is never stored',
              'You have full control over your data at all times',
              'You can request all your data or have it deleted',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Your School's Security is Our Priority
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Trust SchoolBase with your school's most important data.
          </p>
          <Link
            href="/purchase"
            className="inline-block bg-[#0A66C2] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#084a9a] transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </main>
  )
}
