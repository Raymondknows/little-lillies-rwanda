"use client";

import { useEffect, useState } from "react";
import { Globe, Phone, Mail, MapPin, Users, Clock, AlertCircle } from "lucide-react";
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
}

export default function SchoolPage() {
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setLoading(false);
      } catch (err) {
        console.error("Error loading school:", err);
        setError(err instanceof Error ? err.message : 'Failed to load school information');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-muted">Loading school information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="rounded-lg border border-error bg-error/10 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Error</h3>
            <p className="text-sm text-error/80 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">School Information</h1>
        <p className="mt-1 text-muted">Contact details and important information</p>
      </div>

      {school ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-lg border border-border bg-gradient-to-r from-brand/10 to-brand/5 p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{school.name}</h2>
                {school.motto && (
                  <p className="text-muted italic text-sm">"{school.motto}"</p>
                )}
              </div>
              {school.logo && (
                <div className="w-16 h-16 bg-white rounded-lg p-2 border border-border">
                  <img src={school.logo} alt="School Logo" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Location</h3>
                  <p className="text-sm text-muted leading-relaxed">{school.address}</p>
                  {school.country && (
                    <p className="text-xs text-muted/70 mt-2">📍 {school.country}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                  {school.phone ? (
                    <a href={`tel:${school.phone}`} className="text-sm text-brand hover:text-brand/80 transition">
                      {school.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-muted">Not available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  {school.email ? (
                    <a href={`mailto:${school.email}`} className="text-sm text-brand hover:text-brand/80 transition">
                      {school.email}
                    </a>
                  ) : (
                    <p className="text-sm text-muted">Not available</p>
                  )}
                </div>
              </div>
            </div>

            {/* School Hours */}
            {school.schoolHours && (
              <div className="rounded-lg border border-border bg-surface p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">School Hours</h3>
                    <p className="text-sm text-foreground">
                      {school.schoolHours.start} - {school.schoolHours.end}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Principal Info */}
          {school.principal && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Principal</h3>
                  <p className="text-sm text-foreground">{school.principal}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button className="bg-brand text-white rounded-lg px-6 py-3 font-semibold hover:bg-brand/90 transition-colors shadow-sm">
              📞 Call School
            </button>
            <button className="bg-background text-foreground border border-border rounded-lg px-6 py-3 font-semibold hover:border-brand/50 transition-colors">
              💬 Send Message
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <Globe className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-muted">School information not available</p>
        </div>
      )}
    </div>
  );
}
