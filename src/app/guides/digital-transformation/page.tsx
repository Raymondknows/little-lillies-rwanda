import Link from "next/link";
import { CheckCircle, TrendingUp, Zap } from "lucide-react";

export const metadata = {
  title: "School Digital Transformation Guide | SchoolBase",
  description:
    "4-step guide to transform your school digitally: planning, implementation, change management, measuring ROI.",
};

export default function DigitalTransformationGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <p className="mb-2 text-sm font-medium text-brand">GUIDE</p>
          <h1 className="text-4xl font-bold text-foreground">
            School Digital Transformation: A 4-Step Guide
          </h1>
          <p className="mt-4 text-lg text-muted">
            Move from paper/Excel to digital systems. Plan, implement, manage change, measure ROI.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Digital Transformation?</h2>
            <p className="text-muted mb-4">
              Schools that go digital report: 70% time savings in admin, 40% improvement in fee collection, 90% increase in parent engagement. This guide walks you through the complete journey.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Phase 1: Planning (Week 1)</h2>
            <div className="bg-brand/5 p-6 rounded-lg space-y-4">
              <div>
                <p className="font-bold text-foreground mb-2">Step 1: Assess Current State</p>
                <p className="text-muted text-sm">What are you currently using? Excel? Paper? Multiple systems? Document all current processes.</p>
              </div>
              <div>
                <p className="font-bold text-foreground mb-2">Step 2: Identify Pain Points</p>
                <p className="text-muted text-sm">What takes too long? What causes errors? Talk to staff about their biggest frustrations.</p>
              </div>
              <div>
                <p className="font-bold text-foreground mb-2">Step 3: Set Goals</p>
                <p className="text-muted text-sm">Specific measurable goals. Not "save time" but "reduce results publishing from 14 days to 1 day".</p>
              </div>
              <div>
                <p className="font-bold text-foreground mb-2">Step 4: Choose System</p>
                <p className="text-muted text-sm">Research options. Get demos. Involve staff in selection. Buy-in is crucial.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Phase 2: Implementation (Weeks 2-4)</h2>
            <div className="space-y-4">
              {[
                {
                  week: "Week 2: Setup",
                  tasks: [
                    "Configure system (school details, class structure)",
                    "Import student data (or manual entry for small schools)",
                    "Setup fee schedules, payment methods",
                    "Configure grading scales",
                  ],
                },
                {
                  week: "Week 3: Training",
                  tasks: [
                    "Train admin staff (fee management, reporting)",
                    "Train teachers (results entry, attendance)",
                    "Train principals (dashboard usage)",
                    "Create user guides & quick reference cards",
                  ],
                },
                {
                  week: "Week 4: Go Live",
                  tasks: [
                    "Soft launch with one class/department",
                    "Fix issues quickly",
                    "Full school launch",
                    "Daily support for first 2 weeks",
                  ],
                },
              ].map((item, i) => (
                <div key={i} className="border-l-4 border-brand pl-4 py-3">
                  <p className="font-bold text-foreground">{item.week}</p>
                  <ul className="text-muted text-sm mt-2 space-y-1">
                    {item.tasks.map((task, j) => (
                      <li key={j}>• {task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Phase 3: Change Management</h2>
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg space-y-3">
              <p className="font-bold text-foreground">Challenge: Staff Resistance</p>
              <p className="text-muted text-sm">Most staff fear change. Solution: Show them benefits early and often.</p>
              
              <p className="font-bold text-foreground mt-4">✅ Celebrate Quick Wins</p>
              <p className="text-muted text-sm">First results published in 1 day (was 2 weeks)? Celebrate! Build momentum.</p>
              
              <p className="font-bold text-foreground mt-4">✅ Provide Support</p>
              <p className="text-muted text-sm">24/7 support in first month. Staff needs to feel safe. Fast problem resolution = trust.</p>
              
              <p className="font-bold text-foreground mt-4">✅ Ongoing Training</p>
              <p className="text-muted text-sm">Not one training session. Weekly tips. Monthly advanced features. Continuous learning.</p>
              
              <p className="font-bold text-foreground mt-4">✅ Get Champions</p>
              <p className="text-muted text-sm">Identify early adopters. Make them champions. They influence others.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Phase 4: Measure ROI</h2>
            <div className="space-y-4">
              {[
                {
                  metric: "Time Savings",
                  measure: "Track hours before and after. Target: 70% admin time reduction.",
                },
                {
                  metric: "Fee Collection",
                  measure: "Compare this year vs last year. Target: 30-40% improvement in collection rate.",
                },
                {
                  metric: "Parent Engagement",
                  measure: "Track portal logins, WhatsApp opens. Target: 80%+ parent engagement.",
                },
                {
                  metric: "Staff Satisfaction",
                  measure: "Survey staff after 3 months. Monitor satisfaction scores.",
                },
                {
                  metric: "Financial Savings",
                  measure: "Calculate time cost + error costs + lost fees. Compare to system cost.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-border p-4 rounded">
                  <p className="font-bold text-foreground">{item.metric}</p>
                  <p className="text-muted text-sm mt-2">{item.measure}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Common Pitfalls to Avoid</h2>
            <div className="space-y-3">
              {[
                "❌ Rushing implementation. Give staff time to adjust.",
                "❌ Insufficient training. Invest heavily in training.",
                "❌ No ongoing support. First month needs 24/7 support.",
                "❌ Ignoring staff feedback. Listen and fix quickly.",
                "❌ Forgetting parents. They need communication too.",
                "❌ Trying to do everything at once. Phase implementation.",
              ].map((item, i) => (
                <p key={i} className="text-muted text-sm bg-red-50 border border-red-200 p-3 rounded">
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Success Checklist</h2>
            <div className="space-y-2">
              {[
                "✅ Clear goals defined before starting",
                "✅ Staff trained and confident",
                "✅ First 2 weeks have dedicated support",
                "✅ Parent communication plan in place",
                "✅ Success metrics defined and tracked",
                "✅ Champion staff identified",
                "✅ Regular staff check-ins scheduled",
                "✅ Quick wins celebrated publicly",
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 bg-green-50 rounded">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-muted text-sm">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-brand text-white p-12 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform?</h3>
            <p className="mb-6 text-brand/80">Download the complete transformation checklist and timeline.</p>
            <Link href="/contact" className="inline-block bg-white text-brand px-6 py-3 rounded-lg hover:bg-white/90 font-medium">
              Get Started Today
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
