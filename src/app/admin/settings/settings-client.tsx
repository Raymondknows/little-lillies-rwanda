"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorModal } from "@/components/ui/error-modal";
import { Building2, MapPin, DollarSign, FileText, Upload, Save, AlertCircle, Zap, X, KeyRound } from "lucide-react";
import { UserGuide, type PageHelpGuide } from "@/components/ui/user-guide";
import countriesData from "../../../../config/countries.json";
import { resolveSchoolAssetUrl } from "@/lib/asset-urls";
import { getBackendUrl } from "@/lib/backend-url";

interface SchoolSettingsProps {
  school: {
    id: string;
    name: string;
    initials?: string | null;
    slug: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    currency?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    principalSignatureUrl?: string | null;
    stampUrl?: string | null;
    principalName?: string | null;
    principalComment?: string | null;
    manualPaymentAccountName?: string | null;
    manualPaymentAccountNumber?: string | null;
    manualPaymentBankName?: string | null;
    enabledPhases: Array<{ phase: string }>;
    partner?: { name: string } | null;
    resultAccess?: {
      enabled?: boolean;
      mode?: string;
      pinType?: string;
      pinValidity?: string;
      allowRegeneration?: boolean;
    };
  };
  staff: Array<{ id: string; name: string; role: string }>;
  paystackConfigured: boolean;
  whatsappConfigured: boolean;
  isOnboarding?: boolean;
}

export default function SettingsPageClient({
  school,
  staff,
  paystackConfigured,
  whatsappConfigured,
  isOnboarding = false,
}: SchoolSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(school.name);
  const [initials, setInitials] = useState(school.initials ?? "");
  const [country, setCountry] = useState(school.country ?? "NG");
  const [currency, setCurrency] = useState(school.currency ?? "NGN");
  const [detectedCountryName, setDetectedCountryName] = useState<string | null>(null);
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
  const [address, setAddress] = useState(school.address ?? "");
  const [email, setEmail] = useState(school.email ?? "");
  const [phone, setPhone] = useState(school.phone ?? "");
  const [principalName, setPrincipalName] = useState(school.principalName ?? "");
  const [principalComment, setPrincipalComment] = useState(school.principalComment ?? "");
  const [manualPaymentAccountName, setManualPaymentAccountName] = useState(school.manualPaymentAccountName ?? "");
  const [manualPaymentAccountNumber, setManualPaymentAccountNumber] = useState(school.manualPaymentAccountNumber ?? "");
  const [manualPaymentBankName, setManualPaymentBankName] = useState(school.manualPaymentBankName ?? "");
  
  const [logoUrl, setLogoUrl] = useState<string | null>(school.logoUrl ?? null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(school.principalSignatureUrl ?? null);
  const [stampUrl, setStampUrl] = useState<string | null>(school.stampUrl ?? null);
  
  useEffect(() => {
    let mounted = true;

    async function loadCountryConfig() {
      try {
        const response = await fetch("/api/country/config");
        if (!response.ok) return;
        const config = await response.json();
        if (!mounted) return;

        const resolvedCountry = config.country || school.country || "NG";
        const resolvedCurrency = config.data?.currency || school.currency || "NGN";
        setCountry(resolvedCountry);
        setCurrency(resolvedCurrency);

        setDetectedCountryName(config.data?.name || null);
        setDetectedCurrency(resolvedCurrency || null);
      } catch (err) {
        console.error("Error loading country config:", err);
      }
    }

    loadCountryConfig();
    return () => {
      mounted = false;
    };
  }, [school.country, school.currency]);

  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState<string | undefined>("Success");
  const [successModalMessage, setSuccessModalMessage] = useState<string>("Your settings were saved successfully.");
  const [status, setStatus] = useState<any>(null);
  const [resultAccessEnabled, setResultAccessEnabled] = useState(Boolean(school.resultAccess?.enabled));
  const [resultAccessMode, setResultAccessMode] = useState(school.resultAccess?.mode || "NONE");
  const [resultAccessPinType, setResultAccessPinType] = useState(school.resultAccess?.pinType || "NONE");
  const [resultAccessPinValidity, setResultAccessPinValidity] = useState(school.resultAccess?.pinValidity || "TERM");
  const [resultAccessAllowRegeneration, setResultAccessAllowRegeneration] = useState(Boolean(school.resultAccess?.allowRegeneration));

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/settings/status`, {
        credentials: "include",
      });
      if (response.ok) {
        const d = await response.json();
        setStatus(d);
      }
    } catch (err) {
      console.error("Error loading status:", err);
    }
  };

  const handleFileUpload = async (file: File, type: "logo" | "signature" | "stamp") => {
    if (!file) return;

    setUploading((prev) => ({ ...prev, [type]: true }));
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/settings/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      if (type === "logo") setLogoUrl(data.url);
      else if (type === "signature") setSignatureUrl(data.url);
      else if (type === "stamp") setStampUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/settings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          initials: initials.trim().toUpperCase(),
          address: address.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          principalName: principalName.trim() || null,
          principalComment: principalComment.trim() || null,
          manualPaymentAccountName: manualPaymentAccountName.trim() || null,
          manualPaymentAccountNumber: manualPaymentAccountNumber.trim() || null,
          manualPaymentBankName: manualPaymentBankName.trim() || null,
          principalSignatureUrl: signatureUrl,
          stampUrl: stampUrl,
          logoUrl: logoUrl,
          resultAccess: {
            enabled: resultAccessEnabled,
            mode: resultAccessMode,
            pinType: resultAccessPinType,
            pinValidity: resultAccessPinValidity,
            allowRegeneration: resultAccessAllowRegeneration,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Failed to save settings");
      }

      setShowSuccessModal(true);
      setSuccessModalTitle("Settings Saved");
      setSuccessModalMessage("Your school settings were updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const previewPrefix = initials.trim() || "ABC";
  const phases = useMemo(
    () =>
      school.enabledPhases
        .map((phase) => phase.phase.replace(/_/g, " ").toLowerCase())
        .map((value) => value.charAt(0).toUpperCase() + value.slice(1)),
    [school.enabledPhases],
  );

  const HELP_GUIDE: PageHelpGuide = {
    title: "Managing School Settings",
    overview: "Configure your school profile, branding, payment information, and system integrations.",
    steps: [
      "Update your school name, location, and contact information.",
      "Upload your school logo, principal signature, and school stamp.",
      "Configure payment details for manual bank transfers.",
      "Set up Paystack for online payments (if enabled).",
      "Configure WhatsApp integration for notifications.",
    ],
    commonTasks: [
      {
        title: "Update School Profile",
        description: "Change your school name, location, and contact details.",
        tips: [
          "School name is displayed on all official documents",
          "Initials appear on student result sheets and reports",
          "Country and currency settings affect fee calculations",
          "Contact information is visible to parents and staff",
        ],
      },
      {
        title: "Upload School Branding",
        description: "Add your logo, principal signature, and school stamp for documents.",
        tips: [
          "Logo appears at the top of all reports and certificates",
          "Principal signature is printed on student result sheets",
          "School stamp authenticates official documents",
          "Use high-quality images (PNG or JPG format recommended)",
        ],
      },
      {
        title: "Configure Payment Methods",
        description: "Set up bank account details for manual payment collection.",
        tips: [
          "Provide accurate bank details to receive payments",
          "Account name must match your school registration",
          "Account number should be verified before saving",
          "These details appear on generated invoices sent to parents",
        ],
      },
    ],
    faqs: [
      {
        question: "What image format should I use for uploads?",
        answer: "PNG (with transparency) or JPG formats work best. Recommended sizes: Logo (200x200px), Signature (400x100px), Stamp (150x150px). Ensure images have good resolution for printing.",
      },
      {
        question: "Can I change the currency after creation?",
        answer: "Yes, you can change the currency in settings. However, existing fees and transactions are recorded in the original currency. Plan currency changes carefully.",
      },
      {
        question: "What happens if I don't configure payment details?",
        answer: "Parents can still pay online via Paystack if configured. If not configured, students won't have a payment method available and you'll need to enter payments manually.",
      },
      {
        question: "How do I integrate Paystack payments?",
        answer: "Paystack integration is configured by your system administrator. Once configured, it will show as 'Configured' in the status badges.",
      },
      {
        question: "Can I update settings during the school year?",
        answer: "Yes, you can update most settings anytime. Changes take effect immediately. However, be cautious with currency changes as they may affect reports and calculations.",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Configuration</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">School Settings</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">Manage your school profile, location, branding, and system configuration</p>
          {detectedCountryName && detectedCurrency ? (
            <p className="mt-3 text-sm text-muted">
              Detected market: <span className="font-semibold text-foreground">{detectedCountryName}</span> · <span className="font-semibold text-brand">{detectedCurrency}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/settings/academic-years">
            <Button variant="secondary" className="text-sm">
              Manage Academic Years
            </Button>
          </Link>
          <Link href="/admin/settings/whatsapp">
            <Button variant="secondary" className="text-sm">
              WhatsApp Settings
            </Button>
          </Link>
          <Link href="/admin/settings/result-pins">
            <Button variant="secondary" className="text-sm">
              Result PINs
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={status?.paystack?.effective ? "success" : "default"}>
          {status?.paystack?.effective ? "✓ Paystack Configured" : "Paystack Not Configured"}
        </Badge>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <ErrorModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successModalTitle}
        message={successModalMessage}
        type="success"
        confirmLabel="Okay"
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School Profile Section */}
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="border-b border-border bg-background px-6 py-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-brand" />
            <div>
              <h2 className="font-semibold text-foreground">School Profile</h2>
              <p className="text-xs text-muted">Name, location, and identification</p>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">School Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Greenfield Academy"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Initials *</label>
                <input
                  type="text"
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="GFA"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
                <p className="text-xs text-muted mt-1">{previewPrefix}-2025-0001</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Education Street, Lagos"
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Country *</label>
                <select
                  value={country}
                  disabled
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground opacity-80 cursor-not-allowed focus:outline-none"
                >
                  {Object.entries(countriesData.countries).map(([code, data]) => (
                    <option key={code} value={code}>{(data as any).name}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-muted">
                  This market is locked to the country selected when you first visited SchoolBase. To change it, contact support so we can help you update it safely.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
                <input
                  type="text"
                  value={currency}
                  readOnly
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-muted cursor-not-allowed"
                />
                {!school.currency && detectedCurrency ? (
                  <p className="mt-2 text-xs text-muted">
                    Default currency for your region is {detectedCurrency}.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@school.edu"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 123 456 7890"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Principal Section */}
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="border-b border-border bg-background px-6 py-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-brand" />
            <div>
              <h2 className="font-semibold text-foreground">Principal Information</h2>
              <p className="text-xs text-muted">Details for documents and result sheets</p>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Principal Name</label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                placeholder="e.g. Mr. John Okafor"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
              <p className="text-xs text-muted mt-1">Appears on student result sheets</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Principal's Comment</label>
              <textarea
                value={principalComment}
                onChange={(e) => setPrincipalComment(e.target.value)}
                placeholder="e.g. Keep up the good work..."
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
              <p className="text-xs text-muted mt-1">Appears on each student's result sheet</p>
            </div>

            {/* File Uploads Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Logo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">School Logo</label>
                <div className="rounded-lg border border-border bg-background p-3 space-y-2">
                  {logoUrl && (
                    <div className="relative inline-block">
                      <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded" />
                      <button
                        type="button"
                        onClick={() => setLogoUrl(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-border rounded cursor-pointer hover:bg-background/50 transition">
                    <Upload className="h-4 w-4 text-muted" />
                    <span className="text-xs text-muted">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "logo")}
                      disabled={uploading.logo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Signature */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Signature</label>
                <div className="rounded-lg border border-border bg-background p-3 space-y-2">
                  {signatureUrl && (
                    <div className="relative inline-block">
                      <img src={signatureUrl} alt="Signature" className="h-12 w-24 object-contain rounded" />
                      <button
                        type="button"
                        onClick={() => setSignatureUrl(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-border rounded cursor-pointer hover:bg-background/50 transition">
                    <Upload className="h-4 w-4 text-muted" />
                    <span className="text-xs text-muted">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "signature")}
                      disabled={uploading.signature}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Stamp */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">School Stamp</label>
                <div className="rounded-lg border border-border bg-background p-3 space-y-2">
                  {stampUrl && (
                    <div className="relative inline-block">
                      <img src={stampUrl} alt="Stamp" className="h-16 w-16 object-contain rounded" />
                      <button
                        type="button"
                        onClick={() => setStampUrl(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-border rounded cursor-pointer hover:bg-background/50 transition">
                    <Upload className="h-4 w-4 text-muted" />
                    <span className="text-xs text-muted">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "stamp")}
                      disabled={uploading.stamp}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Access PIN Section */}
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="border-b border-border bg-background px-6 py-4 flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-brand" />
            <div>
              <h2 className="font-semibold text-foreground">Result Access PINs</h2>
              <p className="text-xs text-muted">Optional school-managed result access control for parents and public checker pages</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
              <input
                id="result-access-enabled"
                type="checkbox"
                checked={resultAccessEnabled}
                onChange={(e) => setResultAccessEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
              />
              <label htmlFor="result-access-enabled" className="text-sm font-medium text-foreground">
                Require a PIN to access results
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Result Access Mode</label>
                <select
                  value={resultAccessMode}
                  onChange={(e) => setResultAccessMode(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <option value="NONE">No PIN Required</option>
                  <option value="PARENT_PORTAL_ONLY">Parent Portal Only</option>
                  <option value="PUBLIC_CHECKER_ONLY">Public Result Checker Only</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">PIN Type</label>
                <select
                  value={resultAccessPinType}
                  onChange={(e) => setResultAccessPinType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <option value="NONE">None</option>
                  <option value="STUDENT">Student PIN</option>
                  <option value="GENERIC">Generic PIN Batch</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">PIN Validity</label>
                <select
                  value={resultAccessPinValidity}
                  onChange={(e) => setResultAccessPinValidity(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <option value="TERM">Entire Term</option>
                  <option value="SESSION">Entire Session</option>
                  <option value="CUSTOM">Custom Expiry Date</option>
                </select>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                <input
                  id="result-access-allow-regeneration"
                  type="checkbox"
                  checked={resultAccessAllowRegeneration}
                  onChange={(e) => setResultAccessAllowRegeneration(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                />
                <label htmlFor="result-access-allow-regeneration" className="text-sm font-medium text-foreground">
                  Allow PIN regeneration
                </label>
              </div>
            </div>

            <p className="text-sm text-muted">
              This setting is disabled by default. When left off, the current result experience remains unchanged for parents and staff.
            </p>
          </div>
        </div>

        {/* Payment Section */}
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="border-b border-border bg-background px-6 py-4 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-brand" />
            <div>
              <h2 className="font-semibold text-foreground">Payment Information</h2>
              <p className="text-xs text-muted">Manual payment details for invoices</p>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bank Name</label>
                <input
                  type="text"
                  value={manualPaymentBankName}
                  onChange={(e) => setManualPaymentBankName(e.target.value)}
                  placeholder="e.g. First Bank of Nigeria"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Account Name</label>
                <input
                  type="text"
                  value={manualPaymentAccountName}
                  onChange={(e) => setManualPaymentAccountName(e.target.value)}
                  placeholder="Account holder name"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
              <input
                type="text"
                value={manualPaymentAccountNumber}
                onChange={(e) => setManualPaymentAccountNumber(e.target.value)}
                placeholder="1234567890"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>

      {/* Help & Guide */}
      <UserGuide guide={HELP_GUIDE} />
    </div>
  );
}
