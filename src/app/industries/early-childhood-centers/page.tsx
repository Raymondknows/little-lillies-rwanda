import Link from "next/link";
import { Heart, Users, TrendingUp, CheckCircle } from "lucide-react";

export const metadata = {
  title: "SchoolBase for Early Childhood Centers | Pre-School Management",
  description:
    "Solutions for ECCs: simple results entry, parent communication, attendance tracking, development milestones, age-appropriate reporting.",
};

export default function EarlyChildhoodPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium text-brand">FOR EARLY CHILDHOOD</p>
            <h1 className="text-4xl font-bold text-foreground">
              Management Software for Early Childhood Centers
            </h1>
            <p className="mt-4 text-lg text-muted">
              Development milestones. Behavioral tracking. Parent communication. Attendance. Designed for Nursery through Kg2.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Unique Needs of ECCs</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Development Tracking",
              desc: "Not grades but milestones. Can child read? Count? Follow instructions? Track development areas.",
            },
            {
              title: "Behavioral Observations",
              desc: "Note-taking on behavior, attitude, social skills. Monthly reports on development.",
            },
            {
              title: "Parent Communication",
              desc: "Daily updates. Photos from class. Activity reports. Parents want to see what child did.",
            },
            {
              title: "Attendance Critical",
              desc: "Daily attendance needed for regulations. Fee calculation based on attendance.",
            },
            {
              title: "Age Groups",
              desc: "Nursery 1/2, KG1/2. Different milestones per age. Must account for age variations.",
            },
            {
              title: "Wellness & Safety",
              desc: "Record dietary needs. Allergies. Medications. Emergency contacts. Safety is paramount.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Features for ECCs</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: <Heart className="h-8 w-8 text-brand" />,
                title: "Development Milestones",
                desc: "Pre-built milestones by age. Teachers check off. Monthly report shows progress.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "Behavioral Notes",
                desc: "Add daily behavioral observations. System compiles into monthly report.",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-brand" />,
                title: "Daily Attendance",
                desc: "Quick daily check-in. Tracks full/part-day attendance. Fee calculation based on attendance.",
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-brand" />,
                title: "Parent Portal",
                desc: "Parents see daily report. Attendance. Milestone progress. Photos/updates.",
              },
              {
                icon: <Heart className="h-8 w-8 text-brand" />,
                title: "Wellness Tracking",
                desc: "Record dietary needs, allergies, medications, emergency contacts. All in one place.",
              },
              {
                icon: <Users className="h-8 w-8 text-brand" />,
                title: "Activity Logging",
                desc: "Log activities done daily. System generates activity report for parents.",
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

      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-8">Age Groups Supported</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              level: "Nursery 1",
              age: "1-2 years",
              focus: "Basic milestones: movement, communication, socialization",
            },
            {
              level: "Nursery 2",
              age: "2-3 years",
              focus: "Advanced milestones: fine motor, language, independence",
            },
            {
              level: "KG 1",
              age: "3-4 years",
              focus: "Pre-literacy: letter recognition, numbers, social skills",
            },
            {
              level: "KG 2",
              age: "4-5 years",
              focus: "Literacy: reading, writing readiness, problem-solving",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-6">
              <p className="font-bold text-foreground">{item.level}</p>
              <p className="text-sm text-muted mt-1"><strong>Age:</strong> {item.age}</p>
              <p className="text-sm text-muted mt-2"><strong>Focus:</strong> {item.focus}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">What Parents Love</h2>
          <div className="space-y-4">
            {[
              "✅ Daily updates on what child did (not just: 'fine')",
              "✅ Photos from class activities",
              "✅ Milestone progress visible (can see development happening)",
              "✅ Dietary/allergy tracking (safety peace of mind)",
              "✅ Attendance visible (transparent fee calculation)",
              "✅ Direct messaging to teachers about concerns",
            ].map((item, i) => (
              <p key={i} className="text-muted text-sm bg-white border border-border rounded-lg p-4">
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-brand text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-3xl font-bold">Early Childhood Management Simplified</h2>
          <p className="mt-4 text-lg text-brand/80">
            Development tracking. Parent updates. Attendance. All in one simple dashboard.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="rounded-lg bg-white px-6 py-3 font-medium text-brand hover:bg-white/90">
              See Demo
            </button>
            <Link
              href="/contact"
              className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
