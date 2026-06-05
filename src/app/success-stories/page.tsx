import { Metadata } from 'next'
import { ArrowRight, TrendingUp, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Success Stories | SchoolBase',
  description:
    'See how schools across Nigeria are transforming operations with SchoolBase. Real stories, real results.',
  keywords: [
    'school success stories',
    'school case studies',
    'school software reviews',
    'school management testimonials',
  ],
  openGraph: {
    title: 'Success Stories | SchoolBase',
    description: 'See how schools are transforming with SchoolBase',
  },
}

const stories = [
  {
    school: 'Greenfield International School',
    location: 'Lagos, Nigeria',
    icon: '🌟',
    challenge: 'Manually tracking fees from 500+ students, spending 20+ hours per week on finance',
    solution: 'Implemented SchoolBase fee collection with automated WhatsApp reminders',
    results: [
      'Reduced fee collection time by 85% (20 hrs/week → 3 hrs/week)',
      'Increased collection rate from 75% to 95%',
      'Recovered ₦2.5M in previously uncollected fees',
      'Staff now focuses on education instead of chasing fees',
    ],
    quote:
      'SchoolBase saved us so much time and money. We\'re now collecting fees like a professional business, not fumbling with spreadsheets.',
    author: 'Dr. Ifeanyi Okonkwo, School Director',
  },
  {
    school: 'St. Mary\'s Academy',
    location: 'Abuja, Nigeria',
    icon: '📱',
    challenge: 'Parents didn\'t know exam results until weeks later. Poor communication channels.',
    solution: 'Deployed result publishing and WhatsApp notification system',
    results: [
      'Results published within 24 hours of exams',
      'Parents notified instantly on WhatsApp',
      'Parent satisfaction increased from 60% to 92%',
      'Teachers save 5+ hours per term on result processing',
    ],
    quote:
      'Parents now get their children\'s results almost instantly. It\'s transformed how we communicate with families.',
    author: 'Mrs. Adaobi Adeyemi, Academic Coordinator',
  },
  {
    school: 'Excellence Academy',
    location: 'Kano, Nigeria',
    icon: '⚡',
    challenge: 'Managing 1200+ students across multiple classes with manual data entry',
    solution: 'Centralized student data with bulk import and automation',
    results: [
      'Set up all student records in 1 day (previously took 2 weeks)',
      'Reduced admin staff time by 60%',
      'Error rate decreased from 8% to <0.5%',
      'Easy to add new students mid-term',
    ],
    quote:
      'SchoolBase turned what used to be a nightmare into a smooth, automated process. Best investment we made.',
    author: 'Engr. Chukwuma Nkemdilim, Principal',
  },
]

export default function SuccessStoriesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="text-white py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(90deg, #0A66C2 0%, #084a9a 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Schools Transforming With SchoolBase
          </h1>
          <p className="text-xl text-[#bfdbfe]">
            See real results from real schools using SchoolBase to manage operations better.
          </p>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {stories.map((story, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="md:grid md:grid-cols-3 gap-0">
                {/* Left Side - School Info */}
                <div className="bg-gradient-to-br from-[#0A66C2] to-[#084a9a] text-white p-8 flex flex-col justify-center">
                  <div className="text-5xl mb-4">{story.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{story.school}</h2>
                  <p className="text-[#bfdbfe] mb-6">{story.location}</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[#bfdbfe] text-sm mb-1">CHALLENGE</p>
                      <p className="font-semibold text-sm">{story.challenge}</p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Solution & Results */}
                <div className="md:col-span-2 p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">The Solution</h3>
                  <p className="text-slate-700 mb-6">{story.solution}</p>

                  <h3 className="text-lg font-bold text-slate-900 mb-3">Results</h3>
                  <ul className="space-y-2 mb-6">
                    {story.results.map((result, ridx) => (
                      <li key={ridx} className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{result}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-[#eff6ff] p-6 rounded-lg">
                    <p className="text-slate-800 italic mb-3">"{story.quote}"</p>
                    <p className="text-slate-600 font-semibold text-sm">— {story.author}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common Themes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            What All These Schools Have in Common
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: '100+ Students',
                description: 'Whether primary or secondary, managing 100+ students efficiently',
              },
              {
                icon: Zap,
                title: 'Time Savings',
                description: 'Reduced admin time by 70-85% compared to manual processes',
              },
              {
                icon: TrendingUp,
                title: 'Better Outcomes',
                description: 'Higher fee collection rates, happier parents, better communication',
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="bg-white p-8 rounded-lg text-center">
                  <Icon className="w-12 h-12 text-[#0A66C2] mx-auto mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            By The Numbers
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'Schools Trusting SchoolBase' },
              { number: '95%', label: 'Average Fee Collection Rate' },
              { number: '75%', label: 'Reduction in Admin Time' },
              { number: '99.9%', label: 'Platform Uptime' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div key={idx} className="text-4xl font-bold text-[#0A66C2] mb-2">{stat.number}</div>
                <p className="text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your School Next */}
      <section className="bg-[#0A66C2] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Could Your School Be Next?
          </h2>
          <p className="text-[#bfdbfe] mb-8 text-lg">
            Join 500+ schools transforming their operations with SchoolBase.
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
