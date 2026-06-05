import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import countriesData from "../../../config/countries.json";
import { requestSignupOtpAction } from "@/app/signup/actions";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <AppLogo href="/" size="lg" />
        </div>
        <h1 className="text-center text-xl font-bold">Create a new school</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Register a school account and get a starter admin user for the first campus. We will email a one-time verification code to the admin address before the account is created.
        </p>

        <form action={requestSignupOtpAction} className="mt-8 space-y-4">
          <label className="block text-sm font-medium">
            School name
            <input
              name="schoolName"
              type="text"
              required
              placeholder="Greenfield School"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            School slug
            <input
              name="slug"
              type="text"
              required
              placeholder="greenfield"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
            />
          </label>

          <label className="block text-sm font-medium">
            Country
            <select
              name="country"
              defaultValue={countriesData.default}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
            >
              {Object.entries(countriesData.countries).map(([code, cfg]) => (
                <option key={code} value={code}>
                  {cfg.name} ({code})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Admin name
            <input
              name="adminName"
              type="text"
              required
              placeholder="Aisha Bello"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Admin email
            <input
              name="adminEmail"
              type="email"
              required
              placeholder="admin@example.com"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Choose a secure password"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm"
            />
          </label>
          <Button type="submit" className="w-full">
            Create my school
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          After signup, sign in as staff at the normal login page.
        </p>
      </div>
    </div>
  );
}
