import Link from "next/link";
import { CheckCircle2, ClipboardList, Mail, Phone } from "lucide-react";
import { PublicPageShell } from "@/components/public-page-shell";

const steps = [
  { title: "Submit enquiry", text: "Contact the school to express interest in admission and receive guidance on the process." },
  { title: "Complete forms", text: "Fill in the required student information and supporting details for the application." },
  { title: "School review", text: "Our team reviews the application and communicates the next steps and dates." },
  { title: "Enrollment", text: "Successful applicants complete enrollment and begin their learning journey with us." },
];

export default function AdmissionsPage() {
  return (
    <PublicPageShell
      eyebrow="Admissions"
      title="A simple and welcoming admissions process"
      subtitle="We make it easy for families to understand the process and take the next step with confidence."
      ctaLabel="Contact the school"
      ctaHref="/contact"
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {steps.map(({ title, text }) => (
          <div key={title} className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-4 inline-flex rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
              {title}
            </div>
            <p className="text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-2xl font-bold text-foreground">Admission requirements</h2>
          <ul className="mt-6 space-y-4 text-muted">
            {[
              "Completed admission inquiry or application form",
              "Previous school records or transfer documents where applicable",
              "Birth certificate or legal identification",
              "Parent or guardian contact information",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-2xl font-bold text-foreground">Need help?</h2>
          <div className="mt-6 space-y-4 text-sm text-muted">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-brand" />
              <a href="tel:+250781464730" className="hover:text-brand">0781464730</a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-brand" />
              <a href="mailto:littlelillies82@gmail.com" className="hover:text-brand">littlelillies82@gmail.com</a>
            </div>
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-brand" />
              <span>Visit the school office for enrollment guidance</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-brand/20 bg-brand/5 p-8 text-center">
        <h3 className="text-2xl font-bold text-foreground">Ready to begin the journey?</h3>
        <p className="mt-3 text-muted">
          We would be happy to answer your questions and walk you through the next steps.
        </p>
        <Link href="/contact" className="mt-6 inline-flex items-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand/90">
          Contact admissions
        </Link>
      </div>
    </PublicPageShell>
  );
}
