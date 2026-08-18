import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ | SchoolBase Frequently Asked Questions',
  description:
    'Get answers to frequently asked questions about SchoolBase school management platform, pricing, features, and support.',
  openGraph: {
    title: 'FAQ | SchoolBase',
    description: 'Frequently asked questions about SchoolBase.',
    url: 'https://schoolbase.live/faq',
    type: 'website',
  },
}

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How long does it take to set up SchoolBase?',
        a: 'We can have you live in 48 hours. Our onboarding team guides you through data entry, teacher setup, and goes live when you are ready.',
      },
      {
        q: 'Do I need technical skills to use SchoolBase?',
        a: 'No. SchoolBase is designed for school owners, not IT people. If you can use WhatsApp and email, you can use SchoolBase.',
      },
      {
        q: 'Can I try SchoolBase for free?',
        a: 'Yes! We offer a 7-day free trial with full access to all features. No credit card required.',
      },
    ],
  },
  {
    category: 'Pricing',
    questions: [
      {
        q: 'How much does SchoolBase cost?',
        a: 'Plans start from ₦60,000/term for schools up to 150 pupils. Growth is ₦85,000/term for schools up to 600 pupils. Larger and multi-campus schools can contact us for custom pricing from ₦150,000/term.',
      },
      {
        q: 'Is billing per term or annual?',
        a: 'We charge per term (usually 3 months). You can also arrange annual billing for a discount.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept Paystack (card/bank transfer), direct bank transfers, and cash payments. Contact our team to arrange payment.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes. Cancel anytime before your renewal date to avoid charges. We do not offer refunds for partial terms.',
      },
    ],
  },
  {
    category: 'Features',
    questions: [
      {
        q: 'Can I track fees paid in cash and bank transfers?',
        a: 'Yes. SchoolBase tracks all payment methods: Paystack, bank transfers, and cash. Generate receipts for each payment.',
      },
      {
        q: 'Does SchoolBase integrate with WhatsApp?',
        a: 'Yes. Send fee reminders and notifications directly to parent WhatsApp numbers. Fully automated or manual.',
      },
      {
        q: 'How do I publish student results?',
        a: 'Teachers enter marks, you approve, then release to parents with one click. No confusion, no leaks.',
      },
      {
        q: 'Is the school website included?',
        a: 'Yes. Every school gets a professional website for news, admissions, and contact info. No separate Wix bill.',
      },
      {
        q: 'Can parents view their fees and results?',
        a: 'Yes. Parents can log in to view fees, balance, results, and attendance via web or mobile app.',
      },
    ],
  },
  {
    category: 'Data & Security',
    questions: [
      {
        q: 'Is my data secure?',
        a: 'Yes. We use industry-standard encryption, secure authentication, and regular backups. Your data is backed up daily.',
      },
      {
        q: 'Where is my data stored?',
        a: 'Your data is stored on secure cloud servers. We comply with data protection standards.',
      },
      {
        q: 'Can I export my data?',
        a: 'Yes. You can export student data, fees, results, and more at any time.',
      },
      {
        q: 'What happens if I cancel?',
        a: 'Your data remains yours. You can export it anytime. We will delete it upon request.',
      },
    ],
  },
  {
    category: 'Support',
    questions: [
      {
        q: 'What support do you offer?',
        a: 'We provide email support, WhatsApp chat, and phone support during business hours. Response time is typically under 24 hours.',
      },
      {
        q: 'Is there training provided?',
        a: 'Yes. During setup, our team trains your staff on how to use SchoolBase.',
      },
      {
        q: 'Can you help us migrate from our old system?',
        a: 'Yes. We can help import student data and historical records. Talk to our team about your specific needs.',
      },
      {
        q: 'Do you have a mobile app?',
        a: 'Yes. Parents can download the SchoolBase app on iOS and Android to view fees, results, and attendance.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Get answers to common questions about SchoolBase.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-16">
          {faqs.map((category) => (
            <div key={category.category}>
              <h2 className="text-2xl font-bold text-foreground">
                {category.category}
              </h2>
              <div className="mt-6 space-y-4">
                {category.questions.map((item, idx) => (
                  <details
                    key={idx}
                    className="group rounded-lg border border-border bg-surface transition-all hover:border-brand"
                  >
                    <summary className="cursor-pointer p-4 font-semibold text-foreground flex items-center justify-between select-none">
                      {item.q}
                      <span className="inline-block transition-transform group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    <p className="border-t border-border px-4 py-3 text-muted leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground">
              Didn't find your answer?
            </h3>
            <p className="mt-3 text-muted">
              Get in touch with our support team. We're here to help.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold bg-brand text-white hover:bg-brand-hover"
              >
                Contact Support
              </a>
              <a
                href="https://wa.me/2348000000000"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold bg-white text-brand border border-brand hover:bg-brand-light"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
