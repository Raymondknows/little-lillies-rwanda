"use client";

import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Users, Clock, AlertCircle } from "lucide-react";
import { getBackendUrl } from "@/lib/backend-url";

interface SchoolInfo {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  principal?: string;
  motto?: string;
  logo?: string;
  schoolHours?: {
    start: string;
    end: string;
  };
  country?: string;
  logoUrl?: string;
  city?: string;
  currency?: string;
  initials?: string;
  termCount?: number;
  principalComment?: string;
  manualPaymentAccountName?: string | null;
  manualPaymentAccountNumber?: string | null;
  manualPaymentBankName?: string | null;
  paymentInstructions?: string | null;
  tagline?: string | null;
}

export default function SchoolPage() {
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [schoolLogoUrl, setSchoolLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const backendUrl = getBackendUrl();
        
        const res = await fetch(`${backendUrl}/api/parent/school`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Failed to load school information');
        }

        const data = await res.json();
        setSchool(data);

        try {
          if (data?.id) {
            const logoRes = await fetch(`/api/school-logo/${encodeURIComponent(data.id)}`);

            if (logoRes.ok) {
              const blob = await logoRes.blob();
              setSchoolLogoUrl(URL.createObjectURL(blob));
            } else {
              setSchoolLogoUrl(null);
            }
          } else {
            setSchoolLogoUrl(null);
          }
        } catch (logoErr) {
          console.error("Error loading school logo:", logoErr);
          setSchoolLogoUrl(null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading school:", err);
        setError(err instanceof Error ? err.message : 'Failed to load school information');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (schoolLogoUrl) {
        URL.revokeObjectURL(schoolLogoUrl);
      }
    };
  }, [schoolLogoUrl]);

  const handleCallSchool = async () => {
    if (!school?.phone) {
      setCalling(false);
      return;
    }
    
    setCalling(true);
    try {
      // Initiate call with tel: protocol
      window.location.href = `tel:${school.phone}`;
      // Reset loading state after a short delay
      setTimeout(() => setCalling(false), 1500);
    } catch (err) {
      console.error("Error initiating call:", err);
      setCalling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading school information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
        <p className="text-slate-600">School information not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">School information</p>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">{school.name}</h1>
            {school.tagline ? (
              <p className="max-w-3xl text-sm text-muted">{school.tagline}</p>
            ) : school.motto ? (
              <p className="max-w-3xl text-sm italic text-muted">{school.motto}</p>
            ) : null}
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Contact</p>
            <p className="text-xs text-muted">{school.email || 'Not set'}</p>
            <p className="text-xs text-muted">{school.phone || 'Not set'}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-4">
            {schoolLogoUrl ? (
              <img
                src={schoolLogoUrl}
                alt="School Logo"
                className="mx-auto h-28 w-28 rounded-lg border border-border object-contain bg-surface p-3 shadow-sm md:h-32 md:w-32"
              />
            ) : (
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-lg border border-border bg-surface p-3 shadow-sm md:h-32 md:w-32">
                <span className="text-4xl">🏫</span>
              </div>
            )}

            {school.principal && (
              <div className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
                <p className="mb-1 text-xs font-semibold uppercase text-muted">Principal</p>
                <p className="text-sm font-medium text-foreground">{school.principal}</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
            <div className="border-l-4 border-brand pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">About the school</p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {school.principalComment || school.motto || `Keep up the good work and continue to thrive in excellence.`}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
                <p className="text-xs font-semibold uppercase text-muted">Address</p>
                <p className="mt-1 text-sm font-medium text-foreground">{school.address || 'Not provided'}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
                <p className="text-xs font-semibold uppercase text-muted">City</p>
                <p className="mt-1 text-sm font-medium text-foreground">{school.city || "-"}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
                <p className="text-xs font-semibold uppercase text-muted">Country</p>
                <p className="mt-1 text-sm font-medium text-foreground">{school.country || "-"}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
                <p className="text-xs font-semibold uppercase text-muted">Currency</p>
                <p className="mt-1 text-sm font-medium text-foreground">{school.currency || "-"}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
                <p className="text-xs font-semibold uppercase text-muted">Terms Per Session</p>
                <p className="mt-1 text-sm font-medium text-foreground">{typeof school.termCount === "number" ? school.termCount : "-"}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
                <p className="text-xs font-semibold uppercase text-muted">Contact information</p>
                <p className="mt-1 text-sm font-medium text-foreground">Available below</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
                <p className="text-xs font-semibold uppercase text-muted">Contact information</p>
                <div className="mt-3 space-y-3 text-sm text-foreground">
                  {school.phone ? (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 flex-shrink-0 text-muted" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted">Phone</p>
                        <p className="text-sm text-foreground">{school.phone}</p>
                      </div>
                    </div>
                  ) : null}

                  {school.email ? (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 flex-shrink-0 text-muted" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted">Email</p>
                        <a href={`mailto:${school.email}`} className="text-sm text-brand hover:opacity-80 truncate">
                          {school.email}
                        </a>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-xs text-muted">Address</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{[school.address, school.city, school.country].filter(Boolean).join(', ') || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md">
                <p className="text-xs font-semibold uppercase text-muted">Account & Payments</p>
                <div className="mt-3 space-y-3 text-sm text-foreground">
                  <p className="text-xs text-muted">Bank account for manual payments</p>
                  <p className="text-sm">
                    <span className="font-medium">Account name:</span> {school.manualPaymentAccountName || 'Not provided'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Bank:</span> {school.manualPaymentBankName || 'Not provided'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Account number:</span> {school.manualPaymentAccountNumber || 'Not provided'}
                  </p>
                  {school.paymentInstructions ? (
                    <div>
                      <p className="text-xs text-muted mt-2">Payment notes</p>
                      <p className="text-sm text-muted mt-1">{school.paymentInstructions}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleCallSchool}
                disabled={!school.phone || calling}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Phone className="h-4 w-4" />
                {calling ? "Calling..." : "Call School"}
              </button>
              {school.email && (
                <a
                  href={`mailto:${school.email}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-2.5 font-medium text-foreground transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <Mail className="h-4 w-4" />
                  Email School
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hidden gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <button
            onClick={handleCallSchool}
            disabled={!school.phone || calling}
            className="flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Phone className="h-4 w-4" />
            {calling ? "Calling..." : "Call School"}
          </button>
          {school.email && (
            <a
              href={`mailto:${school.email}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-2.5 font-medium text-foreground transition-colors hover:border-brand/40 hover:text-brand"
            >
              <Mail className="h-4 w-4" />
              Email School
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
