export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { HideRootHeader } from "@/components/hide-root-header";
import { prisma } from "@/lib/db";

export default async function DemoSchoolPage() {
  const school = await prisma.school.findUnique({
    where: { slug: "greenfield" },
    include: {
      announcements: {
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 5,
      },
    },
  });

  if (!school) notFound();

  return (
    <div className="min-h-screen bg-surface">
      <HideRootHeader />
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <AppLogo href="/demo" size="md" showText={false} />
            <div>
              <p className="font-bold text-foreground">{school.name}</p>
              <p className="text-xs text-muted">
                {school.city} · Nursery to Secondary
              </p>
            </div>
          </div>
          <nav className="hidden gap-6 text-sm font-medium text-muted md:flex">
            <a href="#about" className="hover:text-brand">
              About
            </a>
            <a href="#news" className="hover:text-brand">
              News
            </a>
            <a href="#contact" className="hover:text-brand">
              Contact
            </a>
          </nav>
          <Button href="/admin" className="text-sm">
            Parent portal
          </Button>
        </div>
      </header>

      <section className="bg-brand-light" id="about">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {school.tagline ?? "Welcome to our school"}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            {school.address ?? `${school.city}, ${school.country}`}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button>Apply now</Button>
            <Button
              variant="secondary"
              href={school.phone ? `tel:${school.phone}` : "#contact"}
            >
              Call us
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16" id="news">
        <h2 className="text-xl font-bold text-foreground">Latest news</h2>
        <div className="mt-6 space-y-4">
          {school.announcements.map((a) => (
            <article
              key={a.id}
              className="rounded-xl border border-border p-6"
            >
              {a.publishedAt && (
                <p className="text-sm text-brand">
                  {a.publishedAt.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              <h3 className="mt-2 text-lg font-semibold">{a.title}</h3>
              <p className="mt-2 text-muted">{a.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="mx-auto max-w-5xl px-6 py-12 text-center text-muted"
        id="contact"
      >
        <p>{school.email}</p>
        <p className="mt-1">{school.phone}</p>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 text-sm text-muted md:flex-row md:justify-between">
          <AppLogo href="/" size="sm" />
          <p>
            Powered by SchoolBase · {school.slug}.schoolbase.app
          </p>
        </div>
      </footer>
    </div>
  );
}
