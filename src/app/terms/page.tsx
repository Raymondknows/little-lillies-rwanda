import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | SchoolBase',
  description:
    'Read the terms and conditions for using SchoolBase school management platform.',
  openGraph: {
    title: 'Terms of Service | SchoolBase',
    description: 'Terms and conditions for SchoolBase platform usage.',
    url: 'https://schoolbase.live/terms',
    type: 'website',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
        <p className="mt-2 text-muted">Last updated: May 23, 2026</p>

        <div className="mt-12 space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
            <p className="mt-4 text-muted leading-relaxed">
              By accessing and using SchoolBase, you accept and agree to be bound by
              the terms and provision of this agreement. If you do not agree to abide
              by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">2. Use License</h2>
            <p className="mt-4 text-muted leading-relaxed">
              Permission is granted to temporarily download one copy of the materials
              (information or software) on SchoolBase for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer
              of title, and under this license you may not:
            </p>
            <ul className="mt-3 space-y-2 text-muted">
              <li>• Modify or copy the materials</li>
              <li>• Use the materials for any commercial purpose or for any public display</li>
              <li>• Attempt to decompile or reverse engineer any software contained</li>
              <li>• Remove any copyright or other proprietary notations</li>
              <li>• Transfer the materials to another person or "mirror" the materials</li>
              <li>• Use the materials for any illegal purpose or in violation of regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">3. Disclaimer</h2>
            <p className="mt-4 text-muted leading-relaxed">
              The materials on SchoolBase are provided on an 'as is' basis. SchoolBase
              makes no warranties, expressed or implied, and hereby disclaims and
              negates all other warranties including, without limitation, implied
              warranties or conditions of merchantability, fitness for a particular
              purpose, or non-infringement of intellectual property or other violation
              of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">4. Limitations</h2>
            <p className="mt-4 text-muted leading-relaxed">
              In no event shall SchoolBase or its suppliers be liable for any damages
              (including, without limitation, damages for loss of data or profit, or
              due to business interruption) arising out of the use or inability to use
              the materials on SchoolBase, even if SchoolBase or an authorized
              representative has been notified orally or in writing of the possibility
              of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">5. Accuracy of Materials</h2>
            <p className="mt-4 text-muted leading-relaxed">
              The materials appearing on SchoolBase could include technical,
              typographical, or photographic errors. SchoolBase does not warrant that
              any of the materials on the site are accurate, complete, or current.
              SchoolBase may make changes to the materials contained on the site at
              any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">6. Links</h2>
            <p className="mt-4 text-muted leading-relaxed">
              SchoolBase has not reviewed all of the sites linked to its website and
              is not responsible for the contents of any such linked site. The
              inclusion of any link does not imply endorsement by SchoolBase of the
              site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">7. Modifications</h2>
            <p className="mt-4 text-muted leading-relaxed">
              SchoolBase may revise these terms of service for the website at any
              time without notice. By using this website, you are agreeing to be bound
              by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">8. Governing Law</h2>
            <p className="mt-4 text-muted leading-relaxed">
              These terms and conditions are governed by and construed in accordance
              with the laws of Nigeria and you irrevocably submit to the exclusive
              jurisdiction of the courts located in Lagos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">9. Subscription Terms</h2>
            <p className="mt-4 text-muted leading-relaxed">
              Subscriptions are charged per term (usually 3 months per academic term).
              Renewal is automatic unless cancelled before the renewal date.
            </p>
            <ul className="mt-3 space-y-2 text-muted">
              <li>• You must cancel before the renewal date to avoid charges</li>
              <li>• Refunds are not available for partial terms</li>
              <li>• We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">10. Acceptable Use</h2>
            <p className="mt-4 text-muted leading-relaxed">
              You agree not to:
            </p>
            <ul className="mt-3 space-y-2 text-muted">
              <li>• Use the platform for any illegal purpose</li>
              <li>• Harass, abuse, or harm others</li>
              <li>• Attempt to gain unauthorized access</li>
              <li>• Transmit viruses or malicious code</li>
              <li>• Use the platform to send spam or unsolicited messages</li>
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-surface p-6">
            <p className="text-sm text-muted">
              If you have any questions about these terms, please contact:
              <br />
              support@schoolbase.live
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
