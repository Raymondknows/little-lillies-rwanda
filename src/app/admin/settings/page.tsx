"use client";

import { useEffect, useState, useRef } from "react";
import { getBackendUrl } from "@/lib/backend-url";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload, Check } from "lucide-react";

interface SchoolConfig {
  name: string;
  initials: string;
  country: string;
  currency: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  logoUrl: string;
  primaryColor: string;
  principalName: string;
  principalComment: string;
  principalSignatureUrl: string;
  stampUrl: string;
  manualPaymentAccountName: string;
  manualPaymentAccountNumber: string;
  manualPaymentBankName: string;
  hasPaystackPublic: boolean;
  hasPaystackSecret: boolean;
  hasWaCloudAccessToken: boolean;
  hasWaCloudPhoneNumberId: boolean;
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const fileInputRefs = {
    logo: useRef<HTMLInputElement>(null),
    signature: useRef<HTMLInputElement>(null),
    stamp: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/settings`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();
      setConfig(data.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    if (!config) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/settings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setSuccess("Settings saved successfully");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(fileType: "logo" | "signature" | "stamp") {
    const fileInput = fileInputRefs[fileType];
    if (!fileInput?.current?.files?.[0]) return;

    const file = fileInput.current.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fileType);

    setUploading((prev) => ({ ...prev, [fileType]: true }));
    setError(null);
    setSuccess(null);

    try {
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
      
      // Update config with new URL
      setConfig((prev) => {
        if (!prev) return prev;
        if (fileType === "logo") return { ...prev, logoUrl: data.url };
        if (fileType === "signature") return { ...prev, principalSignatureUrl: data.url };
        if (fileType === "stamp") return { ...prev, stampUrl: data.url };
        return prev;
      });

      setSuccess(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      console.error(`Error uploading ${fileType}:`, err);
    } finally {
      setUploading((prev) => ({ ...prev, [fileType]: false }));
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">School Settings</h1>
          <p className="mt-1 text-gray-600">Configure school information and branding</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6">
        <div className="text-red-600">Failed to load settings</div>
      </div>
    );
  }

  const FileUploadField = ({
    label,
    type,
    currentUrl,
  }: {
    label: string;
    type: "logo" | "signature" | "stamp";
    currentUrl: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      <div className="flex items-center gap-4">
        {currentUrl && (
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50 max-w-[200px]">
            <img
              src={currentUrl}
              alt={label}
              className="h-24 w-24 object-contain"
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRefs[type]}
            type="file"
            accept="image/*"
            onChange={() => handleFileUpload(type)}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRefs[type]?.current?.click()}
            disabled={uploading[type]}
            variant="outline"
            className="w-full gap-2"
          >
            {uploading[type] ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {label}
              </>
            )}
          </Button>
          {currentUrl && (
            <p className="text-xs text-gray-500">{type.charAt(0).toUpperCase() + type.slice(1)} uploaded</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">School Settings</h1>
        <p className="mt-1 text-gray-600">Configure school information and branding</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p className="text-emerald-800">{success}</p>
        </div>
      )}

      {/* Tabs for settings sections */}
      <div className="space-y-8">
        {/* General Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">General Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                School Name
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) =>
                  setConfig({ ...config, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Initials
              </label>
              <input
                type="text"
                maxLength={12}
                value={config.initials}
                onChange={(e) =>
                  setConfig({ ...config, initials: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Address
              </label>
              <input
                type="text"
                value={config.address}
                onChange={(e) =>
                  setConfig({ ...config, address: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                City
              </label>
              <input
                type="text"
                value={config.city}
                onChange={(e) =>
                  setConfig({ ...config, city: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={config.phone}
                onChange={(e) =>
                  setConfig({ ...config, phone: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) =>
                  setConfig({ ...config, email: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Country
              </label>
              <input
                type="text"
                value={config.country}
                onChange={(e) =>
                  setConfig({ ...config, country: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Currency
              </label>
              <input
                type="text"
                value={config.currency}
                onChange={(e) =>
                  setConfig({ ...config, currency: e.target.value })
                }
                maxLength={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Principal Name
              </label>
              <input
                type="text"
                value={config.principalName}
                onChange={(e) =>
                  setConfig({ ...config, principalName: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Principal Comment
              </label>
              <textarea
                value={config.principalComment}
                onChange={(e) =>
                  setConfig({ ...config, principalComment: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) =>
                    setConfig({ ...config, primaryColor: e.target.value })
                  }
                  className="h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) =>
                    setConfig({ ...config, primaryColor: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save General Settings"}
          </Button>
        </div>

        {/* Branding Assets */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Branding Assets</h2>

          <FileUploadField
            label="School Logo"
            type="logo"
            currentUrl={config.logoUrl}
          />

          <FileUploadField
            label="Principal Signature"
            type="signature"
            currentUrl={config.principalSignatureUrl}
          />

          <FileUploadField
            label="School Stamp"
            type="stamp"
            currentUrl={config.stampUrl}
          />
        </div>

        {/* Payment Settings */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Payment Settings</h2>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Manual Payment Account</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={config.manualPaymentAccountName}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      manualPaymentAccountName: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={config.manualPaymentAccountNumber}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      manualPaymentAccountNumber: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={config.manualPaymentBankName}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      manualPaymentBankName: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Paystack Integration</p>
                <p className="text-xs text-gray-600">
                  {config.hasPaystackPublic && config.hasPaystackSecret
                    ? "✓ Configured"
                    : "Not configured"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">WhatsApp Cloud Integration</p>
                <p className="text-xs text-gray-600">
                  {config.hasWaCloudAccessToken && config.hasWaCloudPhoneNumberId
                    ? "✓ Configured"
                    : "Not configured"}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Payment Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
