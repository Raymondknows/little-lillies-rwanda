import Link from "next/link";
import { MessageSquare, Users, TrendingUp, Zap, CheckCircle, Bell, MessageCircle, BarChart3 } from "lucide-react";

export const metadata = {
  title: "Parent Communication & Student Results Sharing | SchoolBase",
  description:
    "Keep parents informed with automated result notifications, instant result access, and two-way communication. Increase parent engagement by 90%.",
};

export default function ParentCommunicationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">PARENT ENGAGEMENT</p>
            <h1 className="text-4xl font-bold text-foreground">
              Parent Communication & Results Sharing Platform
            </h1>
            <p className="mt-4 text-lg text-muted">
              Results published instantly to parent portal. Automatic WhatsApp/SMS notifications.
              Parents see results same-day instead of weeks later. Increases engagement by 90%.
            </p>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">The Parent Communication Gap</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Delayed Results",
              desc: "Parents wait weeks to see results printed and given to students. Engagement drops.",
            },
            {
              title: "No Notifications",
              desc: "Parents don't know results are ready. No reminder system. Low portal adoption.",
            },
            {
              title: "Poor Monitoring",
              desc: "Parents can't track progress term-to-term. Don't see patterns of struggle.",
            },
            {
              title: "Payment Confusion",
              desc: "Parents don't know fees owed. Manual reminders get lost. Late payments.",
            },
            {
              title: "No Two-Way Communication",
              desc: "Parents can't ask questions about results or fees. No support channel.",
            },
            {
              title: "Lost Context",
              desc: "Parents see grades but not explanations. Don't understand what grades mean.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Solution */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground">How SchoolBase Connects Parents</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <Bell className="h-8 w-8 text-brand" />,
                title: "Instant Notifications",
                desc: "When results published, parent gets WhatsApp/SMS same-day with link to portal.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "Parent Portal",
                desc: "Simple portal to view child's results, attendance, grades, and payment status.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-brand" />,
                title: "Progress Tracking",
                desc: "Parents see results term-by-term. Can track if child is improving or struggling.",
              },
              {
                icon: <MessageSquare className="h-8 w-8 text-brand" />,
                title: "Two-Way Chat",
                desc: "Parent can message teacher/bursar via WhatsApp for questions or clarification.",
              },
              {
                icon: <Zap className="h-8 w-8 text-brand" />,
                title: "Fee Notifications",
                desc: "Parents notified of invoices, payment due dates, and overdue reminders automatically.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Announcements",
                desc: "School sends announcements (holidays, events) to all parents via WhatsApp instantly.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-brand/20 bg-white p-6">
                <div className="mb-3">{item.icon}</div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">What Parents Say</h2>
        <div className="mt-8 space-y-6">
          {[
            {
              quote:
                "I used to wait 3 weeks for results. Now I see them same day on my phone. Finally know how my child is doing.",
              author: "Ama - Parent (Ghana)",
            },
            {
              quote:
                "The WhatsApp notifications mean I never miss fees or announcements. Much more engaged now.",
              author: "Chioma - Parent (Nigeria)",
            },
            {
              quote:
                "Can track my child's progress across all subjects in one place. See exactly where they need help.",
              author: "Kofi - Parent (Ghana)",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border-l-4 border-brand bg-white p-6">
              <p className="italic text-muted">"{item.quote}"</p>
              <p className="mt-3 text-sm font-semibold text-foreground">— {item.author}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground">Key Features</h2>
          <div className="mt-8 space-y-6">
            {[
              {
                title: "Instant Result Publishing",
                desc: "Admin approves results → System sends WhatsApp to all parents → Parents click link to portal in 10 seconds",
              },
              {
                title: "Parent Portal",
                desc: "Login once, see child's full academic history. Results, attendance, grades, fee status all in one place.",
              },
              {
                title: "WhatsApp & SMS Integration",
                desc: "Results, fees, attendance, announcements all sent via WhatsApp (preferred by parents in Africa)",
              },
              {
                title: "Term-by-Term Progress",
                desc: "Compare results across terms. See if child is improving, stable, or struggling.",
              },
              {
                title: "Payment Management",
                desc: "Parents see invoices in portal, get reminded of deadlines, pay online, track receipts.",
              },
              {
                title: "School Announcements",
                desc: "School sends announcements (holidays, exams dates, events) to all parents bulk via WhatsApp.",
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-6">
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">Results Schools Have Seen</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { stat: "90%", label: "Increase in parent engagement" },
            { stat: "85%", label: "Portal adoption rate" },
            { stat: "3x", label: "Fewer parent complaints" },
            { stat: "50%", label: "Faster fee collection" },
            { stat: "95%", label: "Parent satisfaction" },
            { stat: "24h", label: "Time to publish results" },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-white p-6 text-center">
              <p className="text-3xl font-bold text-brand">{item.stat}</p>
              <p className="mt-2 text-sm text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Resources (Internal Linking) */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Learn More</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/for-parents" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <Users className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">For Parents</h3>
            <p className="mt-2 text-sm text-muted">Experience instant results, fee reminders, and school updates on WhatsApp</p>
          </Link>

          <Link href="/for-principals" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <BarChart3 className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">For Principals</h3>
            <p className="mt-2 text-sm text-muted">Build parent trust and engagement with instant, professional communication</p>
          </Link>

          <Link href="/compare/edumis" className="rounded-lg border border-border bg-white p-6 hover:shadow-lg transition">
            <MessageCircle className="h-8 w-8 text-brand mb-3" />
            <h3 className="font-semibold text-foreground">vs Other Platforms</h3>
            <p className="mt-2 text-sm text-muted">See why schools choose SchoolBase for parent communication</p>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Engage Parents Better</h2>
          <p className="mt-4 text-lg text-brand/80">
            Instant notifications. Results published same-day. Two-way communication.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              Start Free Trial
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              See Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
