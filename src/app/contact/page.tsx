import { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Contact SchoolBase | Get Support',
  description:
    "Get in touch with SchoolBase support. We're here to help with questions, feedback, or to schedule a demo.",
  openGraph: {
    title: 'Contact SchoolBase',
    description: 'Contact the SchoolBase team for support and inquiries.',
    url: 'https://schoolbase.live/contact',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-4xl font-bold text-foreground">Get in Touch</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Have questions? We'd love to hear from you. Our team is here to help.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Email</h3>
                <p className="mt-2 text-muted">
                  <a
                    href="mailto:support@schoolbase.live"
                    className="text-brand hover:underline"
                  >
                    support@schoolbase.live
                  </a>
                </p>
                <p className="mt-1 text-sm text-muted">
                  We typically respond within 24 hours
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground">Phone</h3>
                <p className="mt-2 text-muted">
                  <a
                    href="tel:+2349031368963"
                    className="text-brand hover:underline"
                  >
                    +234 903 136 8963
                  </a>
                </p>
                <p className="mt-1 text-sm text-muted">Monday-Friday, 9am-6pm WAT</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground">WhatsApp</h3>
                <p className="mt-2 text-muted">
                  <a
                    href="https://wa.me/2349031368963"
                    className="text-brand hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat with us on WhatsApp
                  </a>
                </p>
                <p className="mt-1 text-sm text-muted">
                  Quick responses to your questions
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground">Location</h3>
                <p className="mt-2 text-muted">
                  Abuja, Nigeria
                  <br />
                  ClickBase Technologies Ltd
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col justify-center gap-6 rounded-xl border border-border bg-surface p-8">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Ready to get started?
                </h3>
                <p className="mt-3 text-muted">
                  Stop wasting time on paper receipts and fee tracking. Start managing
                  your school smarter today.
                </p>
              </div>

              <div className="space-y-3">
                <Button href="/purchase" className="w-full">
                  Get Started
                </Button>
                <Button href="/demo" variant="secondary" className="w-full">
                  View Demo
                </Button>
              </div>

              <div className="rounded-lg bg-brand-light p-4 text-sm text-foreground">
                <p className="font-semibold">💡 Try free for 14 days</p>
                <p className="mt-1 text-muted">
                  No credit card required. Full access to all features.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="mt-16 rounded-xl border border-border bg-surface p-8">
            <h3 className="text-xl font-bold text-foreground">Quick Answers</h3>
            <p className="mt-2 text-muted">
              Check out our FAQ for answers to common questions:
            </p>
            <div className="mt-4">
              <a href="/faq" className="text-brand hover:underline font-semibold">
                Go to FAQ →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
