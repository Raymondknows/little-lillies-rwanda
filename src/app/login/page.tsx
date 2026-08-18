import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { LoginForm } from "@/components/auth/login-form";
import { SchoolLogoImage } from "@/components/auth/school-logo-image";
import { LoginInfoCarousel } from "@/components/auth/login-info-carousel";
import { getStaffSession, getPlatformAdminSession } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; signup?: string; reset?: string }>;
}) {
  // Check both staff and platform admin sessions
  const staffSession = await getStaffSession();
  const platformSession = await getPlatformAdminSession();

  // Redirect if already logged in
  if (staffSession) redirect("/admin");
  if (platformSession) redirect("/schoolbase-admin");

  const { next, signup, reset } = await searchParams;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome Back
          </h1>

          <p className="mt-3 text-base text-muted">
            Sign in to your school management dashboard
          </p>

          {reset === "success" ? (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-700" />
                <div>
                  <p className="font-semibold">Password reset successful</p>
                  <p className="mt-1 text-sm text-green-900/90">
                    Your password has been updated. Sign in with your new password.
                  </p>
                </div>
              </div>
            </div>
          ) : signup === "success" ? (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-700" />
                <div>
                  <p className="font-semibold">Welcome to SchoolBase!</p>
                  <p className="mt-1 text-sm text-green-900/90">
                    Your school has been registered successfully. Sign in with your admin credentials to continue.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Form automatically routes based on user role */}
          <div className="mt-8">
            <LoginForm redirectTo="/admin" />
          </div>

          <div className="mt-6 space-y-3 text-center text-sm">
            <p>
              <a href="/parent/login" className="text-brand font-medium hover:underline">
                Sign in as Parent →
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - School Info */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:items-center lg:bg-gradient-to-b lg:from-purple-600 lg:to-blue-700 lg:px-16 lg:py-12 lg:relative lg:overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-md">
          {/* School Logo */}
          <div className="flex justify-center">
            <SchoolLogoImage
              src="/schools/little-lillies/logo.png"
              alt="Little Lillies School"
              className="h-32 w-auto object-contain"
              schoolName="Little Lillies School"
            />
          </div>

          {/* School Name */}
          <div>
            <h2 className="text-4xl font-bold text-white">
              Little Lillies School
            </h2>
            <p className="mt-3 text-lg text-purple-100">
              Excellence in Education
            </p>
          </div>

          {/* Contact Info */}
          <LoginInfoCarousel tone="purple" />

          {/* Features */}
          <div className="pt-20">
            <p className="text-sm text-purple-100">
              Powered by SchoolBase — Complete school management solution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}