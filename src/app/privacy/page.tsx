import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | SchoolBase',
  description:
    'Learn how SchoolBase protects your school data and privacy. Our commitment to data security and compliance.',
  openGraph: {
    title: 'Privacy Policy | SchoolBase',
    description:
      'Learn how SchoolBase protects your school data and privacy.',
    url: 'https://schoolbase.live/privacy',
    type: 'website',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-muted">Last updated: May 23, 2026</p>

        <div className="mt-12 space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-bold">1. Introduction</h2>
            <p className="mt-4 text-muted leading-relaxed">
              SchoolBase ("we," "us," or "our") operates the SchoolBase platform.
              This page informs you of our policies regarding the collection, use,
              and disclosure of personal data when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">2. Data Collection</h2>
            <p className="mt-4 text-muted leading-relaxed">
              We collect personal data that you voluntarily provide, including:
            </p>
            <ul className="mt-3 space-y-2 text-muted">
              <li>• School name and contact information</li>
              <li>• Administrator name and email</li>
              <li>• Student and parent information (as you input)</li>
              <li>• Payment information (processed securely via Paystack)</li>
              <li>• Usage analytics and logs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">3. Data Usage</h2>
            <p className="mt-4 text-muted leading-relaxed">
              Your data is used to:
            </p>
            <ul className="mt-3 space-y-2 text-muted">
              <li>• Provide and maintain the SchoolBase service</li>
              <li>• Process payments and billing</li>
              <li>• Send transactional and administrative emails</li>
              <li>• Improve and optimize our platform</li>
              <li>• Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">4. Data Security</h2>
            <p className="mt-4 text-muted leading-relaxed">
              We implement industry-standard security measures to protect your data,
              including encryption, secure authentication, and regular security audits.
              However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">5. Data Retention</h2>
            <p className="mt-4 text-muted leading-relaxed">
              We retain your personal data for as long as your account is active or
              as needed to provide services. You can request deletion of your data at
              any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">6. Third-Party Services</h2>
            <p className="mt-4 text-muted leading-relaxed">
              We use third-party services including:
            </p>
            <ul className="mt-3 space-y-2 text-muted">
              <li>• Paystack (payment processing)</li>
              <li>• Brevo (email delivery)</li>
              <li>• WhatsApp Business API (messaging)</li>
            </ul>
            <p className="mt-3 text-muted">
              These services have their own privacy policies governing data handling.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">7. Your Rights</h2>
            <p className="mt-4 text-muted leading-relaxed">
              You have the right to:
            </p>
            <ul className="mt-3 space-y-2 text-muted">
              <li>• Access your personal data</li>
              <li>• Correct inaccurate data</li>
              <li>• Request deletion of your data</li>
              <li>• Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">8. Contact Us</h2>
            <p className="mt-4 text-muted leading-relaxed">
              If you have questions about this privacy policy, please contact us at:
            </p>
            <p className="mt-3 text-muted">
              Email: support@schoolbase.live
              <br />
              Company: ClickBase Technologies Ltd
            </p>
          </section>

          <section className="rounded-lg border border-border bg-surface p-6">
            <p className="text-sm text-muted">
              This Privacy Policy may be updated from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page and
              updating the "Last updated" date.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
