import Link from "next/link";
import { Award, BookOpen, Heart, ShieldCheck, Users } from "lucide-react";
import { PublicPageShell } from "@/components/public-page-shell";

const values = [
  { icon: Heart, title: "Compassion", description: "We create a caring, safe environment where children feel seen, supported, and confident." },
  { icon: BookOpen, title: "Excellence", description: "We nurture curiosity, critical thinking, and strong academic foundations from the earliest years." },
  { icon: Users, title: "Community", description: "Families, teachers, and learners work together to build a joyful school culture." },
  { icon: ShieldCheck, title: "Integrity", description: "We model honesty, discipline, and responsibility in all that we do." },
];

const leadership = [
  { name: "School Leadership", role: "Academic direction and pastoral care", note: "Committed to excellent teaching, strong values, and a child-centered learning approach." },
  { name: "Teaching Team", role: "Dedicated educators", note: "Our teachers are passionate about helping every child grow in confidence and ability." },
  { name: "Parent Partnership", role: "Collaborative growth", note: "We work closely with families to support each child’s learning journey." },
];

export default function AboutPage() {
  return (
    <PublicPageShell
      eyebrow="About us"
      title="A nurturing school community built on excellence"
      subtitle="Little Lillies School is committed to helping every child grow academically, socially, and spiritually in a safe and joyful learning environment."
      ctaLabel="Book a school visit"
      ctaHref="/contact"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <div className="mb-4 inline-flex rounded-lg bg-brand/10 p-3 text-brand">
            <Award className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            To provide a purposeful, values-driven education that equips students with the knowledge,
            confidence, and character needed to thrive in school and in life.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8">
          <div className="mb-4 inline-flex rounded-lg bg-brand/10 p-3 text-brand">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Our Vision</h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            To be a leading school recognized for academic excellence, strong moral values,
            and a vibrant learning culture that prepares young people for a meaningful future.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-3xl font-bold text-foreground">Our values</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {values.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-6">
              <div className="mb-4 inline-flex rounded-lg bg-brand/10 p-3 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl font-bold text-foreground">What makes us different</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {leadership.map(({ name, role, note }) => (
            <div key={name} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-xl font-semibold text-foreground">{name}</h3>
              <p className="mt-2 text-sm font-medium text-brand">{role}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 rounded-2xl border border-brand/20 bg-brand/5 p-8 text-center">
        <h3 className="text-2xl font-bold text-foreground">We believe every child has greatness within</h3>
        <p className="mt-3 text-muted">
          We are proud to help learners discover their strengths, build confidence, and become responsible citizens.
        </p>
        <Link href="/admissions" className="mt-6 inline-flex items-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand/90">
          Learn about admissions
        </Link>
      </div>
    </PublicPageShell>
  );
}
