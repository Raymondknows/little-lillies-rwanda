import { Mail, MapPin, Phone } from "lucide-react";
import { PublicPageShell } from "@/components/public-page-shell";

export default function ContactPage() {
  return (
    <PublicPageShell
      eyebrow="Contact"
      title="We would love to hear from you"
      subtitle="Whether you want to enquire about admissions, ask about the school, or schedule a visit, our team is here to help."
      ctaLabel="Call the school"
      ctaHref="tel:+250781464730"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-2xl font-bold text-foreground">Contact details</h2>
          <div className="mt-6 space-y-5 text-muted">
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-brand" />
              <div>
                <p className="font-semibold text-foreground">Phone</p>
                <a href="tel:+250781464730" className="hover:text-brand">0781464730</a>
                <br />
                <a href="tel:+250785703719" className="hover:text-brand">0785703719</a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 text-brand" />
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <a href="mailto:littlelillies82@gmail.com" className="hover:text-brand">littlelillies82@gmail.com</a>
                <br />
                <a href="mailto:namfla86@gmail.com" className="hover:text-brand">namfla86@gmail.com</a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-brand" />
              <div>
                <p className="font-semibold text-foreground">Visit us</p>
                <p>Rugarama village, Nyabisindu Cell, Remera Sector, Gasabo District (KG 8 AVE HOUSE 98), Kigali, Rwanda</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-2xl font-bold text-foreground">School hours</h2>
          <div className="mt-6 space-y-4 text-muted">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span>Monday - Friday</span>
              <span className="font-medium text-foreground">7:30 AM - 4:00 PM</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span>Saturday</span>
              <span className="font-medium text-foreground">By appointment</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Sunday</span>
              <span className="font-medium text-foreground">Closed</span>
            </div>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
