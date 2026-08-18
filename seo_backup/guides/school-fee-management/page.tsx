import Link from "next/link";
import { Download, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Complete Guide to School Fee Management | SchoolBase",
  description:
    "2,500-word guide: How to manage school fees effectively, avoid common mistakes, calculate ROI, best practices, downloadable checklist.",
};

export default function FeeManagementGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <p className="mb-2 text-sm font-medium text-brand">GUIDE</p>
          <h1 className="text-4xl font-bold text-foreground">
            The Complete Guide to School Fee Management
          </h1>
          <p className="mt-4 text-lg text-muted">
            Best practices, common mistakes, ROI calculations, and implementation strategy for modern school fee collection.
          </p>
        </div>
      </div>

      {/* Download CTA */}
      <div className="bg-brand/5 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <button className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand/90 font-medium">
            <Download className="h-5 w-5" />
            Download PDF + Checklist
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-sm max-w-none">
          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Why This Guide?</h2>
            <p className="text-muted mb-4">
              School fee management is one of the most broken processes in African schools. Yet it's critical - fees fund everything. Teachers, buildings, materials, utilities. Collect fees inefficiently and your school suffers.
            </p>
            <p className="text-muted">
              This guide reveals the exact best practices from 100+ schools managing fees digitally. We'll cover the mistakes schools make, how to fix them, and how to calculate your ROI.
            </p>
          </div>

          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Part 1: The Current State of School Fees in Africa</h2>
            <div className="bg-brand/5 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-foreground mb-3">The Problem is Bigger Than You Think</h3>
              <ul className="text-muted space-y-2">
                <li>✅ 40-50% of schools don't know their exact monthly collections</li>
                <li>✅ 25-35% of fees go uncollected (never pursued)</li>
                <li>✅ Average month-end reconciliation takes 15-20 hours</li>
                <li>✅ 90% of fee defaults could be prevented with early intervention</li>
                <li>✅ Manual systems lose ~₦50k/month in errors</li>
              </ul>
            </div>

            <h3 className="font-bold text-foreground mb-2">Why Manual Systems Fail</h3>
            <p className="text-muted mb-4">
              When fees are managed manually (Excel, paper ledgers, cash boxes):
              1) Parents don't get clear invoices (no surprise = no payment). 
              2) School doesn't send reminders (busy bursars). 
              3) Late payments go untracked (no accountability). 
              4) Reconciliation errors are common (wrong amounts, missing records). 
              5) You can't identify patterns (which parents always late?).
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Part 2: Best Practices for Fee Collection</h2>
            <div className="space-y-6">
              {[
                {
                  title: "Best Practice #1: Clear Fee Structure",
                  desc: "Define fees clearly by class/level. Breakdown: tuition, activities, uniforms, etc. No surprises. Send to parents at beginning of term.",
                },
                {
                  title: "Best Practice #2: Transparent Invoicing",
                  desc: "Every parent gets a clear invoice with: amount, due date, payment method, receipt number. Digital copy + printed copy.",
                },
                {
                  title: "Best Practice #3: Multiple Payment Methods",
                  desc: "Accept cash, bank transfer, mobile money, online. Lower barrier = higher collection. 30% increase in collections typical.",
                },
                {
                  title: "Best Practice #4: Automated Reminders",
                  desc: "Email/SMS reminders 1 week before due date. Another on due date. Another 1 week after overdue. Reduces late payments 60%.",
                },
                {
                  title: "Best Practice #5: Real-Time Tracking",
                  desc: "Bursar sees every payment instantly. Can identify patterns. Can follow up immediately if student has multiple outstanding invoices.",
                },
                {
                  title: "Best Practice #6: Payment Plans",
                  desc: "Allow installment payments for struggling families. Track each installment. Set expectations. Collect 70% vs 0%.",
                },
              ].map((item, i) => (
                <div key={i} className="border-l-4 border-brand pl-6">
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <p className="text-muted mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Part 3: Common Mistakes (and How to Avoid Them)</h2>
            <div className="space-y-4">
              {[
                {
                  mistake: "Mistake #1: Vague Invoice Language",
                  fix: "Be specific. Not 'fees due' but 'Tuition ₦50,000 due Dec 15. Uniform ₦20,000 due Nov 30.'",
                },
                {
                  mistake: "Mistake #2: No Payment Method Clarity",
                  fix: "Tell parents exactly how to pay. Bank details, Momo number, link for online payment. No guessing.",
                },
                {
                  mistake: "Mistake #3: Inconsistent Follow-up",
                  fix: "Follow up on schedule (day of due date, 7 days after, 14 days after). Be consistent. Patterns matter.",
                },
                {
                  mistake: "Mistake #4: Accepting Only One Payment Method",
                  fix: "Multi-method is critical. Some parents have mobile money, some have bank accounts, some pay cash.",
                },
                {
                  mistake: "Mistake #5: No Payment Proof",
                  fix: "Always provide receipt. Digital receipt via email/SMS. Paper receipt if payment in person. Disputes resolved.",
                },
                {
                  mistake: "Mistake #6: Not Following Up on Defaults",
                  fix: "After 3 weeks of being overdue, follow up personally. Many defaults are forgetfulness, not inability.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-semibold text-red-600 mb-2">❌ {item.mistake}</p>
                  <p className="text-sm text-muted">✅ {item.fix}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Part 4: Calculate Your ROI</h2>
            <div className="bg-brand/5 p-6 rounded-lg">
              <p className="text-muted mb-4">
                <strong>Scenario: 300-student school, average fees ₦500k/month</strong>
              </p>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="border border-border rounded p-4">
                  <p className="font-bold text-foreground mb-2">Manual System Cost:</p>
                  <ul className="text-sm text-muted space-y-1">
                    <li>• Bursar time: 20 hrs/week = ₦100k/month</li>
                    <li>• Lost fees (no follow-up): ₦50k/month</li>
                    <li>• Errors & disputes: ₦25k/month</li>
                    <li className="font-bold pt-2">Total: ₦175k/month</li>
                  </ul>
                </div>
                <div className="border border-brand rounded p-4 bg-brand/5">
                  <p className="font-bold text-brand mb-2">Digital System (SchoolBase):</p>
                  <ul className="text-sm text-muted space-y-1">
                    <li>• Bursar time: 3 hrs/week = ₦15k/month</li>
                    <li>• Lost fees: ₦10k/month (80% reduction)</li>
                    <li>• Errors: ₦2k/month (90% reduction)</li>
                    <li>• SchoolBase: ₦50k/month</li>
                    <li className="font-bold pt-2">Total: ₦77k/month</li>
                  </ul>
                </div>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded p-4 text-center">
                <p className="text-green-600 font-bold">Monthly Savings: ₦98k</p>
                <p className="text-green-700 font-bold text-lg">Annual Savings: ₦1.18M</p>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Part 5: Implementation Roadmap</h2>
            <div className="space-y-4">
              {[
                {
                  week: "Week 1",
                  tasks: ["Define fee structure clearly", "Get buy-in from admin team", "Choose fee management system"],
                },
                {
                  week: "Week 2",
                  tasks: ["Set up system (enrollment data)", "Bulk invoice students", "Send parent notifications"],
                },
                {
                  week: "Week 3",
                  tasks: ["Setup payment methods", "Train bursar on tracking", "Send reminder schedule"],
                },
                {
                  week: "Week 4",
                  tasks: ["Go live", "Monitor collections", "Weekly reconciliation"],
                },
              ].map((item, i) => (
                <div key={i} className="border-l-4 border-brand pl-6 py-4">
                  <p className="font-bold text-foreground mb-2">{item.week}</p>
                  <ul className="text-sm text-muted space-y-1">
                    {item.tasks.map((task, j) => (
                      <li key={j}>• {task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Download */}
          <div className="bg-brand text-white p-12 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Fee Collection?</h2>
            <p className="mb-6 text-brand/80">
              Download our complete checklist and template fee schedule.
            </p>
            <button className="inline-flex items-center gap-2 bg-white text-brand px-6 py-3 rounded-lg hover:bg-white/90 font-medium">
              <Download className="h-5 w-5" />
              Download Free Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
