import { BookOpen, BrainCircuit, GraduationCap, Sparkles } from "lucide-react";
import { PublicPageShell } from "@/components/public-page-shell";

const pillars = [
  { icon: BookOpen, title: "Strong academics", description: "Our curriculum is designed to build deep understanding, strong literacy, and numeracy foundations." },
  { icon: BrainCircuit, title: "Critical thinking", description: "Students develop problem-solving skills and confidence in exploring ideas and asking questions." },
  { icon: GraduationCap, title: "Holistic growth", description: "We balance academic learning with creativity, leadership, and personal development." },
  { icon: Sparkles, title: "Creative learning", description: "Enrichment activities help students discover their interests and talents beyond the classroom." },
];

export default function AcademicsPage() {
  return (
    <PublicPageShell
      eyebrow="Academics"
      title="Learning that builds confidence and curiosity"
      subtitle="We provide a structured, engaging, and child-friendly learning experience designed to help every student achieve their full potential."
      ctaLabel="Speak with admissions"
      ctaHref="/admissions"
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {pillars.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 inline-flex rounded-lg bg-brand/10 p-3 text-brand">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-2xl font-bold text-foreground">Early years foundation</h2>
          <p className="mt-4 text-muted leading-relaxed">
            We help young learners build confidence, communication, and social skills in a warm and engaging environment.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-2xl font-bold text-foreground">Primary and senior levels</h2>
          <p className="mt-4 text-muted leading-relaxed">
            Our academic structure supports deeper subject mastery, independent thinking, and preparation for future learning goals.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-surface p-8">
        <h2 className="text-2xl font-bold text-foreground">Beyond the classroom</h2>
        <p className="mt-4 max-w-3xl text-muted leading-relaxed">
          Students also benefit from co-curricular activities, leadership opportunities, and a balanced school experience that supports personal growth and confidence.
        </p>
      </div>
    </PublicPageShell>
  );
}
