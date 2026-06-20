"use client";

import { useState } from "react";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { ErrorModal } from "@/components/ui/error-modal";
import countriesData from "../../../config/countries.json";
import { requestSignupOtpAction } from "@/app/signup/actions";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [formData, setFormData] = useState({
    schoolName: "",
    slug: "",
    tagline: "",
    address: "",
    phone: "",
    country: countriesData.default,
    adminName: "",
    adminEmail: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append("schoolName", formData.schoolName);
      formDataObj.append("slug", formData.slug);
      formDataObj.append("tagline", formData.tagline);
      formDataObj.append("address", formData.address);
      formDataObj.append("phone", formData.phone);
      formDataObj.append("country", formData.country);
      formDataObj.append("adminName", formData.adminName);
      formDataObj.append("adminEmail", formData.adminEmail);
      formDataObj.append("password", formData.password);

      await requestSignupOtpAction(formDataObj);
    } catch (err) {
      // Don't show error for redirect - let Next.js handle the navigation
      if (err instanceof Error && (err.message === 'NEXT_REDIRECT' || (err as any).digest?.includes('NEXT_REDIRECT'))) {
        return; // Let the redirect happen silently
      }

      const errorMessage = err instanceof Error ? err.message : String(err);
      setError({
        message: errorMessage,
        details: errorMessage.includes("Email already registered")
          ? "This email address has already been used to create a school account. Please use a different email or contact support."
          : errorMessage.includes("Invalid email")
          ? "Please enter a valid email address."
          : errorMessage,
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-4xl rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <AppLogo href="/" size="lg" />
        </div>
        <h1 className="text-center text-xl font-bold">Create a new school</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Register a school account and get a starter admin user for the first campus. We will email a one-time verification code to the admin address before the account is created.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm font-medium">
              School name
              <input
                name="schoolName"
                type="text"
                required
                placeholder="Greenfield School"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                disabled={isLoading}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm disabled:bg-background disabled:text-muted"
              />
            </label>
            <label className="block text-sm font-medium">
              School slug
              <input
                name="slug"
                type="text"
                required
                placeholder="greenfield"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                disabled={isLoading}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm disabled:bg-background disabled:text-muted"
              />
            </label>

            <label className="block text-sm font-medium">
              Tagline
              <input
                name="tagline"
                type="text"
                placeholder="Excellence in education"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                disabled={isLoading}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm disabled:bg-background disabled:text-muted"
              />
            </label>
            <label className="block text-sm font-medium">
              Country
              <select
                name="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                disabled={isLoading}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm disabled:bg-background disabled:text-muted"
              >
                {Object.entries(countriesData.countries).map(([code, cfg]) => (
                  <option key={code} value={code}>
                    {cfg.name} ({code})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium lg:col-span-2">
              Address
              <input
                name="address"
                type="text"
                placeholder="123 School Road, Lagos"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={isLoading}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm disabled:bg-background disabled:text-muted"
              />
            </label>

            <label className="block text-sm font-medium">
              Phone
              <input
                name="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isLoading}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm disabled:bg-background disabled:text-muted"
              />
            </label>
            <label className="block text-sm font-medium">
              Admin name
              <input
                name="adminName"
                type="text"
                required
                placeholder="Aisha Bello"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                disabled={isLoading}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm disabled:bg-background disabled:text-muted"
              />
            </label>
            <label className="block text-sm font-medium">
              Admin email
              <input
                name="adminEmail"
                type="email"
                required
                placeholder="admin@example.com"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                disabled={isLoading}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm disabled:bg-background disabled:text-muted"
              />
            </label>

            <label className="block text-sm font-medium">
              Password
              <div className="relative mt-1">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Choose a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-border px-3 py-2.5 pr-10 text-sm disabled:bg-background disabled:text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
            {isLoading ? "Creating school..." : "Create my school"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          After signup, sign in as staff at the normal login page.
        </p>
      </div>

      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Signup Error"
        message={error?.message || ""}
        details={error?.details}
        type="error"
      />
    </div>
  );
}
