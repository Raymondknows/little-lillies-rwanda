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
}

export default function SchoolPage() {
  const [school, setSchool] = useState<SchoolInfo | null>(null);
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
        setLoading(false);
      } catch (err) {
        console.error("Error loading school:", err);
        setError(err instanceof Error ? err.message : 'Failed to load school information');
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">{school.name}</h1>
        {school.motto && (
          <p className="mt-2 text-sm text-slate-600 italic">"{school.motto}"</p>
        )}
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* School Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Logo & Status */}
          <div className="md:col-span-1">
            <div className="space-y-4">
              {school.logo ? (
                <img 
                  src={school.logo} 
                  alt="School Logo" 
                  className="w-full rounded-lg border border-slate-200 object-contain p-4 bg-white aspect-square"
                />
              ) : (
                <div className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 aspect-square">
                  <span className="text-6xl">🏫</span>
                </div>
              )}
              {school.principal && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Principal</p>
                  <p className="text-sm font-medium text-slate-900">{school.principal}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {school.address && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Address</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{school.address}</p>
                </div>
              )}
              {school.country && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Country</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{school.country}</p>
                </div>
              )}
              {school.schoolHours && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">School Hours</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {school.schoolHours.start} - {school.schoolHours.end}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              {school.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm text-slate-900">{school.phone}</p>
                  </div>
                </div>
              )}
              {school.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Email</p>
                    <a href={`mailto:${school.email}`} className="text-sm text-blue-600 hover:text-blue-700 truncate">
                      {school.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-200 pt-6 flex gap-3">
          <button
            onClick={handleCallSchool}
            disabled={!school.phone || calling}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Phone className="h-4 w-4" />
            {calling ? "Calling..." : "Call School"}
          </button>
          {school.email && (
            <a
              href={`mailto:${school.email}`}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors border border-slate-200"
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
