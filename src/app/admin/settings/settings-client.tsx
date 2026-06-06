"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      const response = await fetch("/api/admin/settings", {
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

  const handleImageUpload = async (file: File, type: "signature" | "stamp") => {
    setUploadError(null);
    if (type === "signature") {
      setUploadingSignature(true);
    } else {
      setUploadingStamp(true);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/admin/settings/upload", {
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
        } else {
          setStampUrl(data.url);
        }
      } else {
        throw new Error(data?.message || "Upload failed");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (type === "signature") {
        setUploadingSignature(false);
      } else {
        setUploadingStamp(false);
      }
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadError(null);
    setUploadingLogo(true);
    try {
      const MAX_BYTES = 3 * 1024 * 1024; // 3MB
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(file.type)) throw new Error("Unsupported file type. Use PNG, JPG or WEBP.");
      if (file.size > MAX_BYTES) throw new Error("File too large. Max 3MB.");

      const presignResp = await fetch("/api/admin/logo/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSize: file.size }),
      });
      if (!presignResp.ok) {
        const data = await presignResp.json().catch(() => null);
        throw new Error(data?.message || "Failed to get upload URL");
      }
      const presign = await presignResp.json();

      let url: string | null = null;
      if (presign.type === "local") {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResp = await fetch(presign.uploadUrl, { method: "POST", body: formData });
        if (!uploadResp.ok) {
          const data = await uploadResp.json().catch(() => null);
          throw new Error(data?.message || "Upload failed");
        }
        const uploadData = await uploadResp.json();
        if (!uploadData.success || !uploadData.url) {
          throw new Error(uploadData?.message || "Upload failed");
        }
        url = uploadData.url;
      } else {
        const uploadUrl = presign.url;
        const key = presign.key;

        const uploadResp = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (!uploadResp.ok) throw new Error("Upload failed");

        const confirmResp = await fetch("/api/admin/logo/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
        if (!confirmResp.ok) {
          const data = await confirmResp.json().catch(() => null);
          throw new Error(data?.message || "Confirm failed");
        }
        const confirm = await confirmResp.json();
        url = confirm?.url;
      }

      if (url) setLogoUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    // Load presence/preview of per-school config (do not expose secrets to client)
    let mounted = true;
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/admin/settings");
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
        const response = await fetch("/api/admin/settings/status");
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
    <div className="w-full">
      {isOnboarding && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">🎯 Complete Your Setup</p>
          <p className="mt-2 text-sm text-blue-800">
            Set your school's location and currency so we can show you the correct subscription pricing. After saving, you'll be guided to select a plan and complete payment.
          </p>
        </div>
      )}
      <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Settings</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">School configuration</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              Update your school profile, admission number prefix, and quick overview details.
              These settings are used across student records, invoices, and parent notifications.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button href="/admin/settings/academic-years" variant="secondary" className="w-full sm:w-auto text-sm">
              Manage academic years
            </Button>
            <Badge className="w-full sm:w-auto" variant={status?.paystack?.effective === "per-school" || status?.paystack?.effective === "env" ? "success" : "default"}>
              {status?.paystack?.effective === "per-school"
                ? "Paystack (per-school)"
                : status?.paystack?.effective === "env"
                ? "Paystack (enabled)"
                : "Paystack not configured"}
            </Badge>

            <Badge className="w-full sm:w-auto" variant={status?.twilio?.effective === "per-school" || status?.twilio?.effective === "env" ? "success" : "default"}>
              {status?.twilio?.effective === "per-school"
                ? "WhatsApp (per-school)"
                : status?.twilio?.effective === "env"
                ? "WhatsApp (enabled)"
                : "WhatsApp not configured"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-border bg-surface p-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">School profile</h2>
              <p className="mt-1 text-sm text-muted">
                Set the school name and initials used to generate admissions in the format
                <span className="font-semibold text-foreground"> PREFIX-YYYY-NNNN</span>.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <label className="block text-sm font-medium text-foreground">
              School name
              <input
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Greenfield Academy"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              School initials
              <input
                name="initials"
                value={initials}
                maxLength={6}
                onChange={(event) => setInitials(event.target.value.toUpperCase())}
                placeholder="GFA"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
              <p className="mt-2 text-sm text-muted">
                Used as the prefix for auto-generated pupil admission numbers. Example: {previewPrefix}-2025-0001.
              </p>
            </label>

            <label className="block text-sm font-medium text-foreground">
              School address
              <textarea
                name="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="e.g. 123 Education Street, City, State"
                rows={3}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">
                Country
                <select
                  name="country"
                  value={country}
                  onChange={(event) => {
                    const nextCountry = event.target.value;
                    setCountry(nextCountry);
                    const nextCurrency = (countriesData as any).countries[nextCountry]?.currency ?? currency;
                    setCurrency(nextCurrency);
                  }}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                >
                  {Object.entries(countriesData.countries).map(([code, countryConfig]) => (
                    <option key={code} value={code}>
                      {countryConfig.name} ({code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-foreground">
                Currency
                <input
                  name="currency"
                  value={currency}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-foreground">
              Principal/Head of School Name
              <input
                name="principalName"
                value={principalName}
                onChange={(event) => setPrincipalName(event.target.value)}
                placeholder="e.g. Mr. John Okafor"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
              <p className="mt-2 text-sm text-muted">
                Name will appear on student result sheets.
              </p>
            </label>

            <label className="block text-sm font-medium text-foreground">
              Principal&apos;s Comment
              <textarea
                name="principalComment"
                value={principalComment}
                onChange={(event) => setPrincipalComment(event.target.value)}
                placeholder="e.g. Keep up the good work and continue to strive for excellence."
                rows={4}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
              <p className="mt-2 text-sm text-muted">
                This comment will appear on each student&apos;s result sheet.
              </p>
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-medium text-foreground">
                Manual payment account name
                <input
                  name="manualPaymentAccountName"
                  value={manualPaymentAccountName}
                  onChange={(event) => setManualPaymentAccountName(event.target.value)}
                  placeholder="e.g. Greenfield Academy"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Account number
                <input
                  name="manualPaymentAccountNumber"
                  value={manualPaymentAccountNumber}
                  onChange={(event) => setManualPaymentAccountNumber(event.target.value)}
                  placeholder="e.g. 1234567890"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Bank name
                <input
                  name="manualPaymentBankName"
                  value={manualPaymentBankName}
                  onChange={(event) => setManualPaymentBankName(event.target.value)}
                  placeholder="e.g. First Bank"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Principal&apos;s Signature
                </label>
                <div className="rounded-xl border-2 border-dashed border-border bg-background p-4">
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
                        className="w-full text-sm text-error hover:text-error/80"
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
                        <p className="text-sm text-muted">
                          {uploadingSignature ? "Uploading..." : "Click to upload signature"}
                        </p>
                        <p className="text-xs text-muted mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted">
                  Upload a clean signature image. Will appear on all result sheets.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  School Stamp/Seal
                </label>
                <div className="rounded-xl border-2 border-dashed border-border bg-background p-4">
                  {stampUrl ? (
                    <div className="space-y-3">
                      <img 
                        src={stampUrl} 
                        alt="School Stamp" 
                        className="h-20 w-20 mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => setStampUrl(null)}
                        className="w-full text-sm text-error hover:text-error/80"
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
                        <p className="text-sm text-muted">
                          {uploadingStamp ? "Uploading..." : "Click to upload school stamp"}
                        </p>
                        <p className="text-xs text-muted mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted">
                  Upload your school&apos;s official stamp or seal. Will appear on all result sheets.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">School logo</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
                    {logoUrl ? <img src={logoUrl} alt="logo" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm text-muted">No logo</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleLogoUpload(f);
                      }}
                      className="text-sm"
                    />
                    {uploadingLogo && <span className="text-sm text-muted">Uploading...</span>}
                    {uploadError && <span className="text-sm text-red-600">{uploadError}</span>}
                  </div>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="rounded-2xl border border-error/20 bg-error/10 p-4 text-sm text-error">
                {uploadError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">
                Paystack public key
                <input
                  name="paystackPublic"
                  value={paystackPublic}
                  onChange={(e) => setPaystackPublic(e.target.value)}
                  placeholder={paystackConfigured ? "Using environment key" : "pk_test_xxx or pk_live_xxx"}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Paystack secret key
                <input
                  name="paystackSecret"
                  value={paystackSecret}
                  onChange={(e) => setPaystackSecret(e.target.value)}
                  placeholder={paystackConfigured ? "Using environment key" : "sk_test_xxx or sk_live_xxx"}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-border bg-muted p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">WhatsApp Cloud API</p>
                  <p className="mt-2 text-sm text-muted">
                    Enter the school-specific WhatsApp Cloud API credentials below. These override the default environment credentials when set.
                  </p>
                </div>
                <div className="shrink-0">
                  <Button type="button" variant="secondary" onClick={() => setShowWhatsAppHelp(true)} className="text-sm">
                    How to get credentials
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">
                WhatsApp Cloud access token
                <input
                  name="waCloudAccessToken"
                  value={waCloudAccessToken}
                  onChange={(e) => setWaCloudAccessToken(e.target.value)}
                  placeholder="Enter WhatsApp Cloud API access token"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                WhatsApp Cloud phone number ID
                <input
                  name="waCloudPhoneNumberId"
                  value={waCloudPhoneNumberId}
                  onChange={(e) => setWaCloudPhoneNumberId(e.target.value)}
                  placeholder="Enter WhatsApp Cloud API phone number ID"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm text-muted">
                  Current school initials saved: <span className="font-semibold text-foreground">{savedInitials || "Not set"}</span>
                </p>
                <p className="text-sm text-muted">
                  Current school name saved: <span className="font-semibold text-foreground">{savedSchoolName}</span>
                </p>
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save settings"}
              </Button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-error/20 bg-error/10 p-4 text-sm text-error">
                {error}
              </div>
            ) : null}
          </form>

          <div className="mt-6 rounded-3xl border border-border bg-background p-3 text-sm text-muted">
            <p className="font-semibold text-foreground">Admission number preview</p>
            <p className="mt-2 text-sm">
              {previewPrefix}-{currentYear}-0001
            </p>
            <p className="mt-2">
              Once saved, the admission number prefix will be locked and used automatically
              when adding new students.
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-3">
            <h2 className="text-lg font-semibold text-foreground">School overview</h2>
            <p className="mt-1 text-sm text-muted">
              Core information used across your account and reports.
            </p>
            <dl className="mt-6 space-y-4 text-sm text-muted">
              <div className="flex justify-between gap-4">
                <dt>School</dt>
                <dd className="font-medium text-foreground">{savedSchoolName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Slug</dt>
                <dd className="font-medium text-foreground">{school.slug}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Location</dt>
                <dd className="font-medium text-foreground">{school.city}, {school.country}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Currency</dt>
                <dd className="font-medium text-foreground">{school.currency}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Phases</dt>
                <dd className="font-medium text-foreground">{phases.join(", ")}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-3">
            <div className="flex items-center justify-between">
              <Badge variant="brand">{staff.length}</Badge>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              {staff.map((user) => (
                <div key={user.id} className="rounded-2xl border border-border bg-background px-4 py-3">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-muted">{user.role.replace(/_/g, " ").toLowerCase()}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {showSuccess ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl bg-success/10 p-3 text-success">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Settings updated</h3>
                <p className="mt-2 text-sm text-muted">
                  Your school profile and admission prefix have been saved.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowSuccess(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {showWhatsAppHelp ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-3xl rounded-3xl border border-border bg-surface p-8 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">WhatsApp Cloud API setup</p>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">Get your WhatsApp Cloud API credentials</h3>
              </div>
              <Button type="button" variant="secondary" onClick={() => setShowWhatsAppHelp(false)}>
                Close
              </Button>
            </div>

            <div className="mt-6 space-y-5 text-sm text-muted">
              <p>
                To configure WhatsApp messages for your school, you need a WhatsApp Cloud API access token and a phone number ID from Meta.
                These credentials are entered on this page and can be overridden per school.
              </p>

              <ol className="space-y-4 pl-5 text-sm leading-7 text-foreground list-decimal">
                <li>
                  Go to <span className="font-semibold">https://developers.facebook.com</span> and sign in with the account linked to your WhatsApp Business profile.
                </li>
                <li>
                  Create a new app, then add the <span className="font-semibold">WhatsApp</span> product and choose the <span className="font-semibold">Cloud API</span> option.
                </li>
                <li>
                  In the WhatsApp Cloud API settings, find the <span className="font-semibold">Access Token</span> and the <span className="font-semibold">Phone Number ID</span> for your business phone number.
                </li>
                <li>
                  Copy those values and paste them into the fields below:
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted">
                    <li><span className="font-semibold">WhatsApp Cloud access token</span></li>
                    <li><span className="font-semibold">WhatsApp Cloud phone number ID</span></li>
                  </ul>
                </li>
                <li>
                  Save the settings. The system will use these credentials for this school first,
                  and fall back to the shared environment configuration only if the school values are not set.
                </li>
              </ol>

              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="font-semibold text-foreground">Professional setup tip</p>
                <p className="mt-2 text-sm text-muted">
                  Use a dedicated WhatsApp Business phone number for the school to keep communications separate and reliable.
                  If you need help, the Meta Business Help Center includes step-by-step guidance for setting up the WhatsApp Cloud API.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
