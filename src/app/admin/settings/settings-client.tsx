"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, FileText, Upload, Save, AlertCircle } from "lucide-react";
import countriesData from "../../../../config/countries.json";
import { resolveSchoolAssetUrl } from "@/lib/asset-urls";

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
    enabledPhases: Array<{ phase: string }>;
    partner?: { name: string } | null;
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
  const [address, setAddress] = useState(school.address ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedSchoolName, setSavedSchoolName] = useState(school.name);
  const [savedInitials, setSavedInitials] = useState(school.initials ?? "");
  const [savedCountry, setSavedCountry] = useState(school.country ?? "NG");
  const [savedCurrency, setSavedCurrency] = useState(school.currency ?? "NGN");
  const [paystackPublic, setPaystackPublic] = useState("");
  const [paystackSecret, setPaystackSecret] = useState("");
  const [waCloudAccessToken, setWaCloudAccessToken] = useState("");
  const [waCloudPhoneNumberId, setWaCloudPhoneNumberId] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [principalComment, setPrincipalComment] = useState("");
  const [manualPaymentAccountName, setManualPaymentAccountName] = useState("");
  const [manualPaymentAccountNumber, setManualPaymentAccountNumber] = useState("");
  const [manualPaymentBankName, setManualPaymentBankName] = useState("");
  const [principalSignatureUrl, setPrincipalSignatureUrl] = useState<string | null>(null);
  const [stampUrl, setStampUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [uploadingStamp, setUploadingStamp] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [showWhatsAppHelp, setShowWhatsAppHelp] = useState(false);

  const phases = useMemo(
    () =>
      school.enabledPhases
        .map((phase) => phase.phase.replace(/_/g, " ").toLowerCase())
        .map((value) => value.charAt(0).toUpperCase() + value.slice(1)),
    [school.enabledPhases],
  );

  const previewPrefix = initials.trim() || "ABC";
  const currentYear = new Date().getFullYear();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          initials: initials.trim().toUpperCase(),
          country,
          currency,
          address: address.trim() || null,
          principalName: principalName.trim() || null,
          principalComment: principalComment.trim() || null,
          manualPaymentAccountName: manualPaymentAccountName.trim() || null,
          manualPaymentAccountNumber: manualPaymentAccountNumber.trim() || null,
          manualPaymentBankName: manualPaymentBankName.trim() || null,
          principalSignatureUrl: principalSignatureUrl || null,
          stampUrl: stampUrl || null,
          paystackPublic: paystackPublic.trim() || null,
          paystackSecret: paystackSecret.trim() || null,
          waCloudAccessToken: waCloudAccessToken.trim() || null,
          waCloudPhoneNumberId: waCloudPhoneNumberId.trim() || null,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let data;
        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`);
        }
        throw new Error(data?.message || "Unable to save settings.");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data?.message || "Unable to save settings.");
      }

      setSavedSchoolName(name.trim() || school.name);
      setSavedInitials(initials.trim().toUpperCase());
      setSavedCountry(country);
      setSavedCurrency(currency);
      setShowSuccess(true);

      // If onboarding, redirect to subscribe page after a brief delay to show success
      if (isOnboarding) {
        setTimeout(() => {
          router.push("/admin/subscribe");
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: "signature" | "stamp" | "logo") => {
    setUploadError(null);
    if (type === "signature") {
      setUploadingSignature(true);
    } else if (type === "stamp") {
      setUploadingStamp(true);
    } else if (type === "logo") {
      setUploadingLogo(true);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch(`/api/admin/settings/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Upload failed";
        if (contentType?.includes("application/json")) {
          const data = await response.json();
          errorMessage = data?.message || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.success && data.url) {
        if (type === "signature") {
          setPrincipalSignatureUrl(data.url);
        } else if (type === "stamp") {
          setStampUrl(data.url);
        } else if (type === "logo") {
          setLogoUrl(data.url);
        }
      } else {
        throw new Error(data?.message || "Upload failed");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (type === "signature") {
        setUploadingSignature(false);
      } else if (type === "stamp") {
        setUploadingStamp(false);
      } else if (type === "logo") {
        setUploadingLogo(false);
      }
    }
  };


  useEffect(() => {
    let mounted = true;
    const loadConfig = async () => {
      try {
        const response = await fetch(`/api/admin/settings`);
        if (!response.ok) {
          console.error(`Failed to fetch config: ${response.status}`);
          return;
        }
        const d = await response.json();
        if (!mounted) return;
        if (d?.config) {
          setPaystackPublic(d.config.hasPaystackPublic ? "(configured)" : "");
          setPaystackSecret(d.config.hasPaystackSecret ? "(configured)" : "");
          setWaCloudAccessToken(d.config.hasWaCloudAccessToken ? "(configured)" : "");
          setWaCloudPhoneNumberId(d.config.hasWaCloudPhoneNumberId ? "(configured)" : "");
          setPrincipalName(d.config.principalName || "");
          setPrincipalComment(d.config.principalComment || "");
          setManualPaymentAccountName(d.config.manualPaymentAccountName || "");
          setManualPaymentAccountNumber(d.config.manualPaymentAccountNumber || "");
          setManualPaymentBankName(d.config.manualPaymentBankName || "");
          setPrincipalSignatureUrl(resolveSchoolAssetUrl(d.config.principalSignatureUrl) || null);
          setStampUrl(resolveSchoolAssetUrl(d.config.stampUrl) || null);
          setLogoUrl(resolveSchoolAssetUrl(d.config.logoUrl) || null);
          setAddress(d.config.address || "");
        }
      } catch (err) {
        console.error("Error loading config:", err);
      }
    };

    const loadStatus = async () => {
      try {
        const response = await fetch(`/api/admin/settings/status`);
        if (!response.ok) {
          console.error(`Failed to fetch status: ${response.status}`);
          return;
        }
        const d = await response.json();
        if (!mounted) return;
        setStatus(d?.paystack ? d : null);
      } catch (err) {
        console.error("Error loading status:", err);
      }
    };

    loadConfig();
    loadStatus();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full min-h-screen">
      {isOnboarding && (
        <div className="mb-6 rounded-xl border border-[#0A66C2]/20 bg-[#0A66C2]/5 p-4">
          <p className="text-sm font-semibold text-[#0A66C2]">🎯 Complete Your Setup</p>
          <p className="mt-2 text-sm text-[#0A66C2]/80">
            Set your school's location and currency so we can show you the correct subscription pricing. After saving, you'll be guided to select a plan and complete payment.
          </p>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#0A66C2]">Configuration</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">School Settings</h1>
            <p className="mt-2 text-sm text-gray-600">Manage your school profile, location, and system configuration</p>
          </div>
          <Button 
            href="/admin/settings/academic-years" 
            variant="secondary" 
            className="text-sm self-start"
          >
            Manage Academic Years
          </Button>
        </div>

        {/* Status Section */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={status?.paystack?.effective === "per-school" || status?.paystack?.effective === "env" ? "success" : "default"}>
            {status?.paystack?.effective === "per-school"
              ? "✓ Paystack (Per-School)"
              : status?.paystack?.effective === "env"
              ? "✓ Paystack (Enabled)"
              : "Paystack Not Configured"}
          </Badge>
          <Badge variant={status?.twilio?.effective === "per-school" || status?.twilio?.effective === "env" ? "success" : "default"}>
            {status?.twilio?.effective === "per-school"
              ? "✓ WhatsApp (Per-School)"
              : status?.twilio?.effective === "env"
              ? "✓ WhatsApp (Enabled)"
              : "WhatsApp Not Configured"}
          </Badge>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">{error}</p>
            </div>
          </div>
        )}
        
        {showSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-900">✓ Settings saved successfully</p>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* School Profile Section */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-[#0A66C2]/5 to-[#0A66C2]/2 px-6 py-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-[#0A66C2]" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">School Profile</h2>
                  <p className="text-sm text-gray-600">Name, location, and identification</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* School Name and Initials */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name *
                  </label>
                  <input
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Greenfield Academy"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Initials *
                  </label>
                  <div>
                    <input
                      name="initials"
                      value={initials}
                      maxLength={6}
                      onChange={(event) => setInitials(event.target.value.toUpperCase())}
                      placeholder="GFA"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Used as prefix for admission numbers: {previewPrefix}-2025-0001
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Address
                </label>
                <textarea
                  name="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="e.g. 123 Education Street, Lagos, Nigeria"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                />
              </div>

              {/* Country and Currency */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1 text-[#0A66C2]" />
                    Country *
                  </label>
                  <select
                    name="country"
                    value={country}
                    onChange={(event) => {
                      const nextCountry = event.target.value;
                      setCountry(nextCountry);
                      const nextCurrency = (countriesData as any).countries[nextCountry]?.currency ?? currency;
                      setCurrency(nextCurrency);
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                  >
                    {Object.entries(countriesData.countries).map(([code, countryConfig]) => (
                      <option key={code} value={code}>
                        {countryConfig.name} ({code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1 text-[#0A66C2]" />
                    Currency
                  </label>
                  <input
                    name="currency"
                    value={currency}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Principal Information Section */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-[#0A66C2]/5 to-[#0A66C2]/2 px-6 py-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#0A66C2]" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Principal Information</h2>
                  <p className="text-sm text-gray-600">Details for result sheets and official documents</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principal/Head of School Name
                </label>
                <input
                  name="principalName"
                  value={principalName}
                  onChange={(event) => setPrincipalName(event.target.value)}
                  placeholder="e.g. Mr. John Okafor"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">Name appears on student result sheets</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principal's Comment
                </label>
                <textarea
                  name="principalComment"
                  value={principalComment}
                  onChange={(event) => setPrincipalComment(event.target.value)}
                  placeholder="e.g. Keep up the good work and strive for excellence."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">This comment appears on each student's result sheet</p>
              </div>

              {/* Signature and Stamp Upload */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Upload className="inline h-4 w-4 mr-1 text-[#0A66C2]" />
                    Principal's Signature
                  </label>
                  <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                    {principalSignatureUrl ? (
                      <div className="space-y-3">
                        <img 
                          src={principalSignatureUrl} 
                          alt="Principal Signature" 
                          className="h-20 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => setPrincipalSignatureUrl(null)}
                          className="w-full text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingSignature}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, "signature");
                          }}
                          className="hidden"
                        />
                        <div className="text-center py-4">
                          <Upload className="h-6 w-6 text-[#0A66C2] mx-auto mb-2 opacity-40" />
                          <p className="text-sm font-medium text-gray-700">
                            {uploadingSignature ? "Uploading..." : "Upload signature"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Upload className="inline h-4 w-4 mr-1 text-[#0A66C2]" />
                    School Stamp/Seal
                  </label>
                  <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                    {stampUrl ? (
                      <div className="space-y-3">
                        <img 
                          src={stampUrl} 
                          alt="School Stamp" 
                          className="h-20 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => setStampUrl(null)}
                          className="w-full text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingStamp}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, "stamp");
                          }}
                          className="hidden"
                        />
                        <div className="text-center py-4">
                          <Upload className="h-6 w-6 text-[#0A66C2] mx-auto mb-2 opacity-40" />
                          <p className="text-sm font-medium text-gray-700">
                            {uploadingStamp ? "Uploading..." : "Upload stamp"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-[#0A66C2]/5 to-[#0A66C2]/2 px-6 py-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-[#0A66C2]" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Bank Payment Details</h2>
                  <p className="text-sm text-gray-600">Account information for manual payments</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name
                  </label>
                  <input
                    name="manualPaymentAccountName"
                    value={manualPaymentAccountName}
                    onChange={(event) => setManualPaymentAccountName(event.target.value)}
                    placeholder="School account name"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    name="manualPaymentAccountNumber"
                    value={manualPaymentAccountNumber}
                    onChange={(event) => setManualPaymentAccountNumber(event.target.value)}
                    placeholder="1234567890"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    name="manualPaymentBankName"
                    value={manualPaymentBankName}
                    onChange={(event) => setManualPaymentBankName(event.target.value)}
                    placeholder="First Bank, GTBank, etc."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-[#0A66C2]/5 to-[#0A66C2]/2 px-6 py-4">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-[#0A66C2]" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">School Logo</h2>
                  <p className="text-sm text-gray-600">Used on invoices and official documents</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
                {logoUrl ? (
                  <div className="space-y-4 text-center">
                    <img 
                      src={logoUrl} 
                      alt="School Logo" 
                      className="h-24 mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => setLogoUrl(null)}
                      className="inline-block text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded"
                    >
                      Replace Logo
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingLogo}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, "logo");
                      }}
                      className="hidden"
                    />
                    <div className="text-center py-8">
                      <Upload className="h-8 w-8 text-[#0A66C2] mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium text-gray-700">
                        {uploadingLogo ? "Uploading..." : "Upload school logo"}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Paystack Configuration */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-[#0A66C2]/5 to-[#0A66C2]/2 px-6 py-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-[#0A66C2]" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Paystack Configuration</h2>
                  <p className="text-sm text-gray-600">Payment gateway credentials (optional)</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Key
                  </label>
                  <input
                    type="password"
                    value={paystackPublic}
                    onChange={(event) => setPaystackPublic(event.target.value)}
                    placeholder="pk_live_... or leave blank"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    value={paystackSecret}
                    onChange={(event) => setPaystackSecret(event.target.value)}
                    placeholder="sk_live_... or leave blank"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Leave blank to use system default. <span className="font-medium">Max 50 characters</span>
              </p>
            </div>
          </div>

          {/* WhatsApp Configuration */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-[#0A66C2]/5 to-[#0A66C2]/2 px-6 py-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#0A66C2]" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">WhatsApp Cloud Configuration</h2>
                  <p className="text-sm text-gray-600">Meta WhatsApp Business API credentials (optional)</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={waCloudAccessToken}
                    onChange={(event) => setWaCloudAccessToken(event.target.value)}
                    placeholder="Access token or leave blank"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number ID
                  </label>
                  <input
                    type="password"
                    value={waCloudPhoneNumberId}
                    onChange={(event) => setWaCloudPhoneNumberId(event.target.value)}
                    placeholder="Phone number ID or leave blank"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsAppHelp(!showWhatsAppHelp)}
                className="text-sm text-[#0A66C2] hover:text-[#0A66C2]/80 font-medium"
              >
                {showWhatsAppHelp ? "Hide setup instructions" : "Show setup instructions"}
              </button>
              
              {showWhatsAppHelp && (
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 text-sm space-y-3 text-gray-700">
                  <p className="font-medium text-blue-900">WhatsApp Cloud API Setup Instructions</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to <span className="font-mono font-semibold">https://developers.facebook.com</span></li>
                    <li>Create a new WhatsApp app and enable Cloud API</li>
                    <li>Get your Access Token and Phone Number ID</li>
                    <li>Paste the credentials above and save</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sticky bottom-6">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 justify-center"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          {uploadError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">{uploadError}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}