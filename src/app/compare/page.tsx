import { Metadata } from 'next'
import { CheckCircle, X } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Why SchoolBase | Compare Alternatives',
  description:
    'See why SchoolBase is better than spreadsheets, expensive enterprise software, and competing school management platforms.',
  keywords: [
    'best school management software',
    'SchoolBase vs alternatives',
    'school software comparison',
    'affordable school management',
  ],
  openGraph: {
    title: 'Why SchoolBase | Compare to Alternatives',
    description: 'See why schools choose SchoolBase over other solutions',
  },
}

const comparison = [
  {
    feature: 'Implementation Time',
    spreadsheets: '4-6 weeks of manual setup',
    enterprise: '8-12 weeks with IT consultants',
    schoolbase: 'Live in 48 hours',
  },
  {
    feature: 'Setup Cost',
    spreadsheets: 'Free but requires staff time',
    enterprise: '₦500K-₦1M+ for implementation',
    schoolbase: 'Free to start',
  },
  {
    feature: 'Monthly Cost',
    spreadsheets: 'Only software cost (but time)',
    enterprise: '₦50K-₦200K+ with support',
    schoolbase: '₦35K-₦100K all-in',
  },
  {
    feature: 'Fee Collection',
    spreadsheets: '✗ Manual tracking only',
    enterprise: '✓ Available but complex setup',
    schoolbase: '✓ Automated reminders included',
  },
  {
    feature: 'WhatsApp Integration',
    spreadsheets: '✗ Manual messaging only',
    enterprise: '✓ Expensive add-on (extra cost)',
    schoolbase: '✓ Built-in, included',
  },
  {
    feature: 'Result Publishing',
    spreadsheets: '✗ Must print or email manually',
    enterprise: '✓ Available but complex',
    schoolbase: '✓ One-click publish',
  },
  {
    feature: 'Parent Portal',
    spreadsheets: '✗ Not available',
    enterprise: '✓ Available but limited',
    schoolbase: '✓ Full-featured',
  },
  {
    feature: 'Mobile App',
    spreadsheets: '✗ Not available',
    enterprise: '✓ Available but expensive',
    schoolbase: '✓ Android & iOS included',
  },
  {
    feature: 'Support Quality',
    spreadsheets: '✗ None',
    enterprise: 'Business hours only',
    schoolbase: '✓ 24/5 support via WhatsApp',
  },
  {
    feature: 'Updates & New Features',
    spreadsheets: '✗ You build yourself',
    enterprise: 'Slow, requires requests',
    schoolbase: '✓ Weekly improvements',
  },
]

export default function ComparisonPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Why Choose SchoolBase?
          </h1>
          <p className="text-xl text-[#bfdbfe]">
            See how SchoolBase compares to spreadsheets, expensive enterprise software, and other school management platforms.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-6 py-4 text-left font-bold">Feature</th>
                  <th className="px-6 py-4 text-center font-bold">Spreadsheets</th>
                  <th className="px-6 py-4 text-center font-bold">Enterprise Software</th>
                  <th className="px-6 py-4 text-center font-bold bg-[#0A66C2]">SchoolBase</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-6 py-4 font-semibold text-slate-900 border-b">{row.feature}</td>
                    <td className="px-6 py-4 text-center border-b text-slate-600">
                      <span className="text-sm">{row.spreadsheets}</span>
                    </td>
                    <td className="px-6 py-4 text-center border-b text-slate-600">
                      <span className="text-sm">{row.enterprise}</span>
                    </td>
                    <td className="px-6 py-4 text-center border-b bg-[#eff6ff]">
                      <span className="text-sm font-semibold text-[#0A66C2]">{row.schoolbase}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Detailed Advantages */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            What Makes SchoolBase Different
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Built for Nigerian Schools',
                points: [
                  'Understands Nigerian payment systems',
                  'WhatsApp integration (how parents communicate here)',
                  'Local currency and payment methods',
                  'Pricing designed for Nigerian budgets',
                ],
              },
              {
                title: 'All-In-One Platform',
                points: [
                  'No need for separate apps or systems',
                  'Fee collection, communication, results publishing all together',
                  'Single unified dashboard for everything',
                  'Consistent experience across all features',
                ],
              },
              {
                title: 'Easy to Use',
                points: [
                  'No training needed - intuitive interface',
                  'Works without technical skills',
                  'Teachers can set it up themselves',
                  '48-hour implementation',
                ],
              },
              {
                title: 'Affordable',
                points: [
                  'No expensive setup fees',
                  'No hidden costs or surprise charges',
                  'Scales with your school size',
                  'Payment options built-in (free)',
                ],
              },
              {
                title: 'Fantastic Support',
                points: [
                  'Real people answering questions',
                  'WhatsApp support - reach us anytime',
                  'Quick response times',
                  'Dedicated success managers',
                ],
              },
              {
                title: 'Always Getting Better',
                points: [
                  'New features every week',
                  'We listen to school feedback',
                  'Regular updates at no extra cost',
                  'Continuous improvements',
                ],
              },
            ].map((section, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-slate-900 mb-6">{section.title}</h3>
                <ul className="space-y-3">
                  {section.points.map((point, pidx) => (
                    <li key={pidx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Wins */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Quick Wins With SchoolBase
          </h2>
          <div className="space-y-4">
            {[
              { emoji: '✨', text: 'Stop using spreadsheets within your first week' },
              { emoji: '⏱️', text: 'Recover 70+ hours per term from admin work' },
              { emoji: '💰', text: 'Collect 20% more fees with automated reminders' },
              { emoji: '📱', text: 'Reach parents on WhatsApp (they prefer it)' },
              { emoji: '🚀', text: 'Go live in 48 hours, not months' },
              { emoji: '📊', text: 'Get real-time insights into school operations' },
              { emoji: '👥', text: 'Better parent satisfaction and engagement' },
              { emoji: '🛡️', text: 'Keep student data secure with enterprise encryption' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white p-6 rounded-lg border-l-4 border-[#0A66C2]">
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-slate-800 font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Cost Comparison
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Spreadsheets Route',
                cost: '₦0 software but...',
                breakdown: ['1 admin @ ₦30K/month', 'Errors & defaults', 'No automation', 'Takes 20+ hours/week'],
                total: '₦300K+ annually in wasted time',
              },
              {
                title: 'Enterprise Software',
                cost: 'Implementation: ₦1M+',
                breakdown: ['Setup fees', '₦100K/month software', 'Training costs', 'Support fees'],
                total: '₦2.4M+ annually',
              },
              {
                title: 'SchoolBase',
                cost: 'Start at ₦35K/month',
                breakdown: ['Everything included', 'No setup fees', '24/5 support', 'All features'],
                total: '₦420K-₦600K annually',
                highlighted: true,
              },
            ].map((option, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-lg ${
                  option.highlighted
                    ? 'bg-[#0A66C2] text-white shadow-lg scale-105'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
              >
                <h3 className={`text-xl font-bold mb-3 ${option.highlighted ? 'text-[#bfdbfe]' : ''}`}>
                  {option.title}
                </h3>
                <div className="mb-6">
                  <p className={`text-sm ${option.highlighted ? 'text-[#bfdbfe]' : 'text-slate-600'}`}>Starting at:</p>
                  <p className={`text-2xl font-bold ${option.highlighted ? 'text-white' : 'text-[#0A66C2]'}`}>
                    {option.cost}
                  </p>
                </div>
                <ul className="space-y-2 mb-6">
                  {option.breakdown.map((item, bidx) => (
                    <li
                      key={bidx}
                      className={`text-sm flex items-center gap-2 ${
                        option.highlighted ? 'text-[#bfdbfe]' : 'text-slate-600'
                      }`}
                    >
                      {option.highlighted ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 flex-shrink-0" />
                      )}
                      {item}
                    </li>
                  ))}
                </ul>
                <p
                  className={`border-t ${option.highlighted ? 'border-[#0A66C2] text-[#bfdbfe]' : 'border-slate-200 text-slate-600'} pt-4 font-semibold`}
                >
                  {option.total}
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
            Ready to Switch to SchoolBase?
          </h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            See why 500+ schools have made the switch. Try it free for 14 days.
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
