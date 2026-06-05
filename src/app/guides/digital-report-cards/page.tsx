import Link from "next/link";
import { Download, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Digital Report Cards Guide | SchoolBase",
  description:
    "How to create and manage digital report cards: best practices, grading systems, parent communication, and implementation.",
};

export default function ReportCardsGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <p className="mb-2 text-sm font-medium text-brand">GUIDE</p>
          <h1 className="text-4xl font-bold text-foreground">
            The Complete Guide to Digital Report Cards
          </h1>
          <p className="mt-4 text-lg text-muted">
            How to transition from paper to digital, design effective reports, automate distribution, and increase parent engagement.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Digital Report Cards?</h2>
            <p className="text-muted">
              Paper report cards take weeks to print, distribute, and often get lost. Digital report cards are available instantly, can include detailed analytics, and engage parents immediately. This guide covers the complete journey from paper to digital.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Chapter 1: What Should Be on a Report Card?</h2>
            <div className="bg-brand/5 p-6 rounded-lg space-y-3">
              <h3 className="font-bold text-foreground">Essential Components:</h3>
              <ul className="text-muted space-y-2">
                <li>✅ <strong>Student Information:</strong> Name, class, admission number, academic year</li>
                <li>✅ <strong>Subject Grades:</strong> Each subject, score, grade, remarks</li>
                <li>✅ <strong>Position in Class:</strong> Where student ranked (1st, 5th, 20th, etc.)</li>
                <li>✅ <strong>Class Statistics:</strong> Class average per subject, highest score, lowest</li>
                <li>✅ <strong>Attendance:</strong> Days present, days absent, percentage attendance</li>
                <li>✅ <strong>Teacher Remarks:</strong> Overall comment about student performance</li>
                <li>✅ <strong>Comparison:</strong> vs previous term (improved, same, declined)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Chapter 2: Designing Effective Grades</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Grade Scale Options",
                  desc: "A-F (90-0), 1-8 (KNEC Kenya), 1-5, or custom. Choose one that's familiar to parents and regulatory bodies.",
                },
                {
                  title: "Include Context",
                  desc: "Show student's score AND class average. A score of 65 looks different if class average is 50 vs 75.",
                },
                {
                  title: "Clear Remarks",
                  desc: "Don't just show grade. Add remark: 'Excellent progress' or 'Needs improvement in basics'",
                },
                {
                  title: "Highlight Trends",
                  desc: "Show term-to-term comparison: 'Improved from C to B' or 'Declining since last term'",
                },
              ].map((item, i) => (
                <div key={i} className="border-l-4 border-brand pl-4 py-2">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-muted text-sm mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Chapter 3: Implementation Strategy</h2>
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-4">
              <h3 className="font-bold text-foreground mb-3">4-Week Timeline</h3>
              <div className="space-y-3">
                <div className="pb-3 border-b">
                  <p className="font-semibold text-foreground">Week 1: Plan</p>
                  <p className="text-sm text-muted">Choose digital platform, design report card template</p>
                </div>
                <div className="pb-3 border-b">
                  <p className="font-semibold text-foreground">Week 2: Setup</p>
                  <p className="text-sm text-muted">Create grading scale, upload students, configure subjects</p>
                </div>
                <div className="pb-3 border-b">
                  <p className="font-semibold text-foreground">Week 3: Test</p>
                  <p className="text-sm text-muted">Teachers enter sample marks, review output, make adjustments</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Week 4: Launch</p>
                  <p className="text-sm text-muted">Generate final reports, send to parents, gather feedback</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Chapter 4: Parent Communication</h2>
            <p className="text-muted mb-4">
              How you deliver report cards matters as much as the content. Here's the proven strategy:
            </p>
            <div className="space-y-3">
              {[
                "Day 1: Announce report cards coming. WhatsApp notification.",
                "Day 2: Report cards available. Parents get WhatsApp link.",
                "Day 3: Follow-up: 'Have you seen your child's report card?'",
                "Day 7: Low performers: parents invited for discussion.",
                "Day 14: High performers: positive feedback & encouragement.",
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                  <p className="text-muted text-sm">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Chapter 5: Tools & Systems</h2>
            <div className="bg-brand/5 p-6 rounded-lg">
              <h3 className="font-bold text-foreground mb-3">What You Need:</h3>
              <ul className="text-muted text-sm space-y-2">
                <li>✅ Results entry system (teachers input marks)</li>
                <li>✅ Automated grading (system calculates grades)</li>
                <li>✅ Report generation (system creates report cards)</li>
                <li>✅ Parent distribution (email/WhatsApp/portal)</li>
                <li>✅ Analytics (track parent views, engagement)</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-brand text-white p-12 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Get the Digital Report Cards Checklist</h3>
            <button className="inline-flex items-center gap-2 bg-white text-brand px-6 py-3 rounded-lg hover:bg-white/90 font-medium">
              <Download className="h-5 w-5" />
              Download Free Checklist
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
