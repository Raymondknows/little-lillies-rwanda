import Image from "next/image";
import Link from "next/link";
import { Linkedin, Mail, MessageCircle, Globe, Award, Users, Zap, Code2, Rocket } from "lucide-react";

export const metadata = {
  title: "Nwokpor Raymond Ikenna - Founder & CEO | ClickBase Group",
  description:
    "Meet Nwokpor Raymond Ikenna, Founder & CEO of TradeBase and ClickInvoice, Chairman of ClickBase Group. Building scalable SaaS platforms trusted by enterprises globally.",
};

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 to-white">
      {/* Hero Section */}
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Image */}
            <div className="flex justify-center">
              <div className="relative h-80 w-80 overflow-hidden rounded-3xl border border-border bg-brand/10 shadow-sm">
                <Image
                  src="/ray.png"
                  alt="Nwokpor Raymond Ikenna"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <p className="text-sm font-medium text-brand mb-2">TECHNOLOGY ENTREPRENEUR & SAAS ARCHITECT</p>
              <h1 className="text-4xl font-bold text-foreground mb-6">
                Nwokpor Raymond Ikenna
              </h1>
              <p className="text-lg text-muted mb-4">
                <strong className="text-foreground">Founder & CEO — TradeBase</strong>
              </p>
              <p className="text-lg text-muted mb-6">
                <strong className="text-foreground">Founder & CEO — ClickInvoice Ltd</strong>
              </p>
              <p className="text-lg text-muted mb-8">
                <strong className="text-foreground">Chairman — ClickBase Group</strong>
              </p>
              
              <p className="text-muted mb-6">
                Technology entrepreneur and innovation leader recognized for building scalable digital platforms 
                that streamline business operations, financial workflows, and cloud-based solutions for enterprises 
                across Africa and globally.
              </p>

              <blockquote className="border-l-4 border-brand pl-4 py-2 mb-8 text-foreground italic">
                "Technology should remove complexity from business. Scalable software drives growth, efficiency, and global impact."
              </blockquote>

              {/* Social Links */}
              <div className="flex gap-4 mb-8 flex-wrap">
                <a
                  href="https://www.linkedin.com/in/nwokpor-raymond-ikenna-652b9a151/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand/90"
                >
                  <Linkedin className="h-5 w-5" />
                  LinkedIn
                </a>
                <a
                  href="mailto:chairman@clickbasegroup.com"
                  className="flex items-center gap-2 border border-brand text-brand px-6 py-3 rounded-lg hover:bg-brand/5"
                >
                  <Mail className="h-5 w-5" />
                  Email
                </a>
                <a
                  href="https://wa.me/2349031368963"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-brand text-brand px-6 py-3 rounded-lg hover:bg-brand/5"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12">Vision & Mission</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-white p-8">
            <Rocket className="h-8 w-8 text-brand mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">Mission</h3>
            <p className="text-muted">
              Develop cloud-based SaaS platforms that streamline operations, automate workflows, and empower 
              companies to scale internationally—delivering tools that enable businesses to compete on a global stage.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white p-8">
            <Globe className="h-8 w-8 text-brand mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">Vision</h3>
            <p className="text-muted">
              Africa can lead in global software innovation. Building the future of AI-powered enterprise solutions 
              and trading technology with institutional-grade quality accessible to all businesses worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-brand/5 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12">Core Principles</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Code2 className="h-8 w-8 text-brand" />,
                title: "Technical Excellence",
                desc: "Building systems with clean architecture, scalable design, and institutional-grade reliability.",
              },
              {
                icon: <Zap className="h-8 w-8 text-brand" />,
                title: "Remove Complexity",
                desc: "Every feature solves a real problem. Simplicity is the mark of true innovation.",
              },
              {
                icon: <Globe className="h-8 w-8 text-brand" />,
                title: "Global Reach, Local Roots",
                desc: "Built in Africa for Africa first, then scaled globally with enterprise standards everywhere.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-white p-8">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leadership Positions */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12">Leadership Positions</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {
              title: "Founder & CEO — TradeBase",
              desc: "Creating the leading AI-powered multi-broker trading platform with institutional-grade signals, automation, and risk management. Bringing professional trading tools to traders globally.",
              link: "https://tradebase.live",
            },
            {
              title: "Founder & CEO — ClickInvoice Ltd",
              desc: "Cloud-based invoicing and business management solution trusted by startups, SMEs, and global clients for operational efficiency and financial automation.",
              link: "https://clickinvoice.app",
            },
            {
              title: "Chairman — ClickBase Group",
              desc: "Leading strategy, SaaS infrastructure development, and technological innovation. Overseeing multiple cloud platforms and digital solutions for African and global markets.",
              link: "https://clickbasegroup.com",
            },
            {
              title: "Founder & CEO — ClickBase Technologies Ltd",
              desc: "Delivering scalable SaaS platforms, automation workflows, and enterprise-level digital tools to ambitious businesses worldwide.",
              link: "https://clickbasegroup.com",
            },
          ].map((role, i) => (
            <a
              key={i}
              href={role.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border bg-white p-8 hover:shadow-lg transition"
            >
              <h3 className="font-bold text-foreground mb-3 text-lg">{role.title}</h3>
              <p className="text-muted text-sm">{role.desc}</p>
              <p className="text-brand text-sm font-semibold mt-4">Explore →</p>
            </a>
          ))}
        </div>
      </div>

      {/* Product Portfolio */}
      <div className="bg-white border-t border-border py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-foreground mb-4">Product Ecosystem</h2>
          <p className="text-muted mb-12 max-w-3xl">
            Under Raymond's leadership, ClickBase Group builds and owns scalable software platforms 
            designed for global markets—from trading intelligence to invoicing, school management, healthcare systems, and custom enterprise solutions.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                name: "TradeBase AI",
                desc: "AI trading signals and execution workspace",
                stats: "Institutional-grade • Multi-market • Real-time signals",
                link: "https://tradebase.live",
              },
              {
                name: "ClickInvoice",
                desc: "Professional invoicing and billing platform",
                stats: "50k+ businesses • 500k+ invoices • 4x faster payments",
                link: "https://clickinvoice.app",
              },
              {
                name: "SchoolBase",
                desc: "Complete school management platform",
                stats: "200+ schools • 50k+ parents • Fee management & results",
                link: "https://schoolbase.live",
              },
              {
                name: "EMR Suite",
                desc: "Hospital management and patient records",
                stats: "20+ hospitals • Comprehensive • Integrated billing",
                link: "https://clickbasegroup.com/marketplace/healthcare-management",
              },
            ].map((product, i) => (
              <a
                key={i}
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-white p-8 hover:shadow-lg transition"
              >
                <h3 className="font-bold text-foreground mb-2 text-lg">{product.name}</h3>
                <p className="text-muted text-sm mb-4">{product.desc}</p>
                <p className="text-xs text-brand font-semibold mb-4">{product.stats}</p>
                <p className="text-brand hover:underline text-sm font-semibold">Visit platform →</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Impact & Achievements */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12">Impact & Achievements</h2>
        <div className="grid gap-8 md:grid-cols-4">
          {[
            { metric: "4", label: "Live SaaS Products" },
            { metric: "50k+", label: "Active Users" },
            { metric: "8+", label: "Countries Served" },
            { metric: "20+", label: "Happy Clients" },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-8 text-center">
              <p className="text-4xl font-bold text-brand mb-2">{item.metric}</p>
              <p className="text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Management Philosophy */}
      <div className="bg-brand/5 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Leadership Philosophy</h2>
          <div className="space-y-6 text-muted">
            <p>
              <strong className="text-foreground">On Scalability:</strong> Software must be built to scale 
              internationally from day one. Architecture decisions made early determine whether a system remains 
              maintainable at 10x, 100x, or 1000x its current size.
            </p>
            <p>
              <strong className="text-foreground">On Execution:</strong> Strategy without execution is a daydream. 
              Raymond believes in disciplined execution, agile iteration, and shipping products that solve real 
              problems—not over-engineered solutions chasing perfection.
            </p>
            <p>
              <strong className="text-foreground">On Africa's Tech Future:</strong> Africa doesn't need to import 
              solutions. African entrepreneurs are building world-class software that solves local problems at global scale. 
              TradeBase, ClickInvoice, and SchoolBase prove this daily.
            </p>
            <p>
              <strong className="text-foreground">On Structure & Discipline:</strong> Scale requires structure. 
              Structure requires discipline. Discipline produces freedom to build systems that outlast individuals 
              and serve customers with consistency.
            </p>
          </div>
        </div>
      </div>

      {/* Team & Organization */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">Team & Organizational Culture</h2>
        <div className="bg-white border border-border rounded-lg p-8">
          <p className="text-muted mb-6">
            Raymond leads a talented, distributed team spanning Nigeria, Ghana, Kenya, Rwanda, South Africa, 
            the UK, US, and beyond. The team combines technical depth, strategic clarity, and delivery 
            discipline to execute SaaS products at scale.
          </p>
          
          <h3 className="font-bold text-foreground mb-4">Organizational Principles:</h3>
          <ul className="space-y-3 text-muted">
            <li className="flex gap-3">
              <span className="text-brand font-bold">✓</span>
              <div>
                <strong className="text-foreground">Technical Excellence</strong> — Clean code, comprehensive testing, 
                well-documented systems, and architectural rigor across all products.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-brand font-bold">✓</span>
              <div>
                <strong className="text-foreground">Customer Obsession</strong> — Deep understanding of customer problems 
                comes before feature development. Products solve real issues, not imagined ones.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-brand font-bold">✓</span>
              <div>
                <strong className="text-foreground">Speed & Agility</strong> — Fast iteration, quick decision-making, 
                and adaptation to market feedback within days, not quarters.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-brand font-bold">✓</span>
              <div>
                <strong className="text-foreground">Ownership</strong> — Team members own their work end-to-end. 
                Accountability drives quality.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-brand font-bold">✓</span>
              <div>
                <strong className="text-foreground">Transparency</strong> — Open communication, honest feedback, 
                and shared context across teams and time zones.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Connect */}
      <div className="bg-brand text-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Let's Connect</h2>
          <p className="text-brand/80 mb-8 text-lg">
            Interested in partnership, investment, or discussing the future of African SaaS? 
            Raymond welcomes conversations from founders, enterprises, and visionaries.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://www.linkedin.com/in/nwokpor-raymond-ikenna-652b9a151/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-brand px-6 py-3 rounded-lg hover:bg-white/90 font-medium"
            >
              <Linkedin className="h-5 w-5" />
              LinkedIn
            </a>
            <a
              href="mailto:chairman@clickbasegroup.com"
              className="flex items-center gap-2 border border-white px-6 py-3 rounded-lg hover:bg-white/10 font-medium"
            >
              <Mail className="h-5 w-5" />
              Email
            </a>
            <a
              href="https://wa.me/2349031368963"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-white px-6 py-3 rounded-lg hover:bg-white/10 font-medium"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>
            <a
              href="https://calendly.com/clickbasetechnologiesltd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-white px-6 py-3 rounded-lg hover:bg-white/10 font-medium"
            >
              <Globe className="h-5 w-5" />
              Book Call
            </a>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground mb-8">Explore the Ecosystem</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <a href="https://clickbasegroup.com/" target="_blank" rel="noopener noreferrer" className="p-6 border border-border rounded-lg hover:shadow-lg transition">
            <h3 className="font-semibold text-foreground mb-2">ClickBase Group</h3>
            <p className="text-sm text-muted">Full portfolio of SaaS products and enterprise services</p>
          </a>
          <a href="https://clickbasegroup.com/chairman" target="_blank" rel="noopener noreferrer" className="p-6 border border-border rounded-lg hover:shadow-lg transition">
            <h3 className="font-semibold text-foreground mb-2">Office of the Chairman</h3>
            <p className="text-sm text-muted">Strategic initiatives and governance at ClickBase Group</p>
          </a>
          <Link href="/about" className="p-6 border border-border rounded-lg hover:shadow-lg transition">
            <h3 className="font-semibold text-foreground mb-2">About SchoolBase</h3>
            <p className="text-sm text-muted">Our mission, vision, and commitment to education technology</p>
          </Link>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white border-t border-border py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h3 className="text-xl font-bold text-foreground mb-3">Building the Future of African SaaS</h3>
          <p className="text-muted mb-6">
            Join thousands of businesses, traders, schools, and enterprises using solutions built by ClickBase.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand/90 font-medium">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
