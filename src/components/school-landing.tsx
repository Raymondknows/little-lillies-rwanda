'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Clock, Star, BookOpen, Users, Award } from 'lucide-react';

interface TenantInfo {
  appName?: string;
  name?: string;
  email?: string;
  emails?: string[];
  phones?: string[];
  address?: string;
  proprietor?: string;
  currency?: string;
  colors?: Record<string, string>;
  slug?: string;
  logo_path?: string;
}

interface SchoolLandingProps {
  tenantSlug?: string;
}

export function SchoolLanding({ tenantSlug = 'little-lillies' }: SchoolLandingProps) {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenant() {
      try {
        const res = await fetch(`/tenants/${tenantSlug}.json`);
        if (res.ok) {
          const data = await res.json();
          setTenant(data);
        }
      } catch (err) {
        console.error('Failed to load tenant config', err);
      } finally {
        setLoading(false);
      }
    }
    loadTenant();
  }, [tenantSlug]);

  if (loading || !tenant) {
    return null;
  }

  const schoolName = tenant.appName || tenant.name || 'Little Lillies School';
  const email = tenant.email || tenant.emails?.[0];
  const phones = tenant.phones || [];
  const address = tenant.address;
  const proprietor = tenant.proprietor;
  const logoPath = tenant.logo_path;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-surface to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-32">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              {/* School Logo */}
              {logoPath && (
                <div className="mb-8 flex justify-start">
                  <img 
                    src={logoPath} 
                    alt={schoolName} 
                    className="h-24 w-24 rounded-lg object-cover shadow-lg"
                  />
                </div>
              )}
              
              <div className="mb-4 inline-block rounded-full border border-brand/20 bg-brand/10 px-4 py-1 text-sm font-semibold text-brand">
                Welcome to Our School
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl md:leading-tight">
                {schoolName}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Committed to excellence in education and holistic development of our students. Empowering minds and building futures through quality education.
              </p>
              
              <div className="mt-10 flex flex-wrap gap-4">
                <Button href="/login" className="gap-2">
                  Staff Portal
                </Button>
                <Button href="/parent/login" variant="secondary" className="gap-2">
                  Parent Portal
                </Button>
                <Button href="#contact" variant="secondary" className="gap-2">
                  Contact Us
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              {[
                { icon: Users, label: 'Students', value: 'Excellence' },
                { icon: BookOpen, label: 'Programs', value: 'Comprehensive' },
                { icon: Award, label: 'Quality', value: 'Guaranteed' },
                { icon: Clock, label: 'Since', value: 'Established' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
                  <div className="rounded-lg bg-brand/10 p-3">
                    <Icon className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted">{label}</p>
                    <p className="text-lg font-semibold text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              About {schoolName}
            </h2>
            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
              Dedicated to providing quality education and developing well-rounded individuals
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-8">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Our Mission
              </h3>
              <p className="text-muted leading-relaxed">
                To provide accessible, quality education that empowers students with knowledge, skills, and values needed to thrive in a rapidly changing world. We foster intellectual curiosity, critical thinking, and compassion in all our learners.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-8">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Our Vision
              </h3>
              <p className="text-muted leading-relaxed">
                To be a leading educational institution recognized for academic excellence, innovative teaching methods, and the holistic development of students who become responsible global citizens and agents of positive change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features / Services */}
      <section className="border-y border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            What We Offer
          </h2>
          <p className="mb-12 max-w-2xl text-lg text-muted">
            Comprehensive services designed to support student success and family engagement.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Quality Education',
                description: 'Rigorous curriculum delivered by qualified educators with modern teaching methods',
                icon: BookOpen,
              },
              {
                title: 'Digital Learning',
                description: 'Online fee management, result checking, and secure parent-school communication',
                icon: Award,
              },
              {
                title: 'Holistic Development',
                description: 'Extracurricular activities, sports, and character development programs',
                icon: Users,
              },
              {
                title: 'Parent Engagement',
                description: 'Regular updates, attendance alerts, and progress reports via parent portal',
                icon: Mail,
              },
              {
                title: 'Safe Environment',
                description: 'Secure, welcoming campus with focus on student safety and wellbeing',
                icon: Award,
              },
              {
                title: 'Academic Excellence',
                description: 'Proven track record of student achievement and success in examinations',
                icon: Star,
              },
            ].map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="group rounded-xl border border-border bg-background p-6 shadow-sm transition-all hover:border-brand hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-brand/10 p-3 group-hover:bg-brand/20 transition">
                  <Icon className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border border-border bg-surface p-8 sm:p-12">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Get In Touch
            </h2>
            <p className="mb-12 max-w-2xl text-lg text-muted">
              Have questions? We'd love to hear from you. Contact us anytime.
            </p>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Contact Information */}
              <div className="space-y-6">
                {proprietor && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-brand/10 p-3">
                      <Users className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">School Proprietor</p>
                      <p className="text-muted">{proprietor}</p>
                    </div>
                  </div>
                )}

                {email && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-brand/10 p-3">
                      <Mail className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <a
                        href={`mailto:${email}`}
                        className="text-brand hover:underline break-all"
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                {phones.length > 0 && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-brand/10 p-3">
                      <Phone className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Phone</p>
                      <div className="space-y-1">
                        {phones.map((phone) => (
                          <a
                            key={phone}
                            href={`tel:${phone}`}
                            className="block text-brand hover:underline"
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {address && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-brand/10 p-3">
                      <MapPin className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Location</p>
                      <p className="text-muted">{address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Access */}
              <div className="space-y-3">
                <p className="mb-6 font-semibold text-foreground text-lg">Quick Access</p>
                <Button href="/login" className="w-full justify-center">
                  Staff Login
                </Button>
                <Button href="/parent/login" variant="secondary" className="w-full justify-center">
                  Parent Portal
                </Button>
                <Button href="/signup" variant="secondary" className="w-full justify-center">
                  New School Inquiry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
