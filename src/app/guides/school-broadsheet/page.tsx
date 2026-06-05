import Link from "next/link";
import { Download, BarChart3 } from "lucide-react";

export const metadata = {
  title: "School Broadsheet Guide | SchoolBase",
  description:
    "Complete guide to school broadsheets: what they are, how to use them, best practices, and how to interpret data.",
};

export default function BroadsheetGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <p className="mb-2 text-sm font-medium text-brand">GUIDE</p>
          <h1 className="text-4xl font-bold text-foreground">
            The School Broadsheet Guide
          </h1>
          <p className="mt-4 text-lg text-muted">
            What broadsheets are, how to read them, best practices for analysis, and how to use them to improve student outcomes.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What is a School Broadsheet?</h2>
            <p className="text-muted mb-4">
              A broadsheet is a table that shows: All students (rows) × All subjects (columns). Every cell contains the student's score/grade in that subject.
            </p>
            <div className="bg-brand/5 p-6 rounded-lg">
              <p className="font-bold text-foreground mb-3">Example (Form 3 Science Class):</p>
              <div className="overflow-x-auto">
                <table className="text-sm w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Position</th>
                      <th className="text-center p-2">Student</th>
                      <th className="text-center p-2">Eng</th>
                      <th className="text-center p-2">Math</th>
                      <th className="text-center p-2">Physics</th>
                      <th className="text-center p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">1</td>
                      <td className="p-2">Ahmed</td>
                      <td className="text-center">75</td>
                      <td className="text-center">82</td>
                      <td className="text-center">78</td>
                      <td className="text-center font-bold">235</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">2</td>
                      <td className="p-2">Zainab</td>
                      <td className="text-center">72</td>
                      <td className="text-center">79</td>
                      <td className="text-center">80</td>
                      <td className="text-center font-bold">231</td>
                    </tr>
                    <tr>
                      <td className="p-2">Class Avg</td>
                      <td className="p-2">-</td>
                      <td className="text-center font-bold text-brand">68</td>
                      <td className="text-center font-bold text-brand">71</td>
                      <td className="text-center font-bold text-brand">70</td>
                      <td className="text-center">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Broadsheets Matter</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "See the Full Picture",
                  desc: "Don't judge student by one subject. See performance across all subjects.",
                },
                {
                  title: "Identify Weak Subjects",
                  desc: "Class average for Math is 55 but English is 72. Math needs intervention.",
                },
                {
                  title: "Spot Struggling Students",
                  desc: "Student ranks 1st in Physics but 40th overall. Clear guidance needed.",
                },
                {
                  title: "Track Subject Trends",
                  desc: "Compare broadsheet from Term 1 vs Term 2. Which subjects improved?",
                },
              ].map((item, i) => (
                <div key={i} className="border-l-4 border-brand pl-4">
                  <p className="font-bold text-foreground">{item.title}</p>
                  <p className="text-muted text-sm mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How to Analyze a Broadsheet</h2>
            <div className="space-y-4">
              {[
                {
                  step: "Step 1: Look at Ranking",
                  desc: "Student ranked 1st overall? Strong performer. Ranked 45th in 50-student class? Needs help.",
                },
                {
                  step: "Step 2: Check Subject Performance",
                  desc: "Does ranking vary by subject? Student might excel in languages but struggle in math.",
                },
                {
                  step: "Step 3: Compare to Class Average",
                  desc: "Student scored 55 in Math. Class average 60. Below average. Needs support.",
                },
                {
                  step: "Step 4: Look for Patterns",
                  desc: "Science class: bottom 5 students all weak in Chemistry. Topic-specific teaching needed.",
                },
                {
                  step: "Step 5: Track Term-to-Term",
                  desc: "Same student: Term 1 rank 30, Term 2 rank 15. Improving. Continue current support.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-border p-4 rounded">
                  <p className="font-bold text-foreground">{item.step}</p>
                  <p className="text-muted text-sm mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Best Practices</h2>
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg space-y-3">
              <p className="font-bold text-foreground">✅ Review broadsheet quarterly</p>
              <p className="text-muted text-sm">Identify trends before they become serious problems.</p>
              
              <p className="font-bold text-foreground mt-4">✅ Share with teachers</p>
              <p className="text-muted text-sm">Each teacher gets their subject column. Can see how their class performs vs others.</p>
              
              <p className="font-bold text-foreground mt-4">✅ Identify intervention students</p>
              <p className="text-muted text-sm">Bottom 10% flagged for extra support. Individual meetings with them and parents.</p>
              
              <p className="font-bold text-foreground mt-4">✅ Celebrate high performers</p>
              <p className="text-muted text-sm">Public recognition. Awards. Motivation for class.</p>
              
              <p className="font-bold text-foreground mt-4">✅ Analyze weak subjects</p>
              <p className="text-muted text-sm">If Math class average is 45, investigate: teacher, curriculum, resources?</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Action Items from Broadsheets</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <BarChart3 className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                <p className="text-muted text-sm"><strong>Subject Weak:</strong> Schedule remedial classes. Add tutoring. Review curriculum.</p>
              </div>
              <div className="flex gap-3">
                <BarChart3 className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                <p className="text-muted text-sm"><strong>Student Struggling:</strong> Meet with student & parents. Create improvement plan. Monitor closely.</p>
              </div>
              <div className="flex gap-3">
                <BarChart3 className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                <p className="text-muted text-sm"><strong>Improvement Seen:</strong> Acknowledge. Continue strategy. Reward effort.</p>
              </div>
              <div className="flex gap-3">
                <BarChart3 className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                <p className="text-muted text-sm"><strong>Consistent High Performance:</strong> Challenge with advanced work. Develop as peer tutors.</p>
              </div>
            </div>
          </section>

          <section className="bg-brand text-white p-12 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Broadsheet Analysis Checklist</h3>
            <button className="inline-flex items-center gap-2 bg-white text-brand px-6 py-3 rounded-lg hover:bg-white/90 font-medium">
              <Download className="h-5 w-5" />
              Download PDF Checklist
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
