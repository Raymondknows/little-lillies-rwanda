import { LoginInfoCarousel } from '@/components/auth/login-info-carousel';
import { redirect } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { ParentLoginForm } from "@/components/auth/parent-login-form";
import { SchoolLogoImage } from "@/components/auth/school-logo-image";
import { getParentSession } from "@/lib/auth";

export default async function ParentLoginPage() {
  const session = await getParentSession();
  if (session) redirect("/parent");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-background to-teal-50">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-3xl font-bold text-foreground">
            Parent Portal
          </h1>

          <p className="mt-3 text-base text-muted">
            Monitor your child&apos;s academic progress and school activities
          </p>

          <p className="mt-6 text-sm text-muted">
            Use the phone number and child&apos;s admission number from the school.
          </p>

          <div className="mt-8">
            <ParentLoginForm />
          </div>

          <div className="mt-6 text-center text-sm">
            <p>
              <a href="/login" className="text-brand font-medium hover:underline">
                Sign in as Staff →
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - School Info */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:items-center lg:bg-gradient-to-b lg:from-emerald-600 lg:to-teal-700 lg:px-16 lg:py-12 lg:relative lg:overflow-hidden">
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
            <p className="mt-3 text-lg text-emerald-100">
              Stay Connected with Your Child
            </p>
          </div>

          {/* Contact Info */}
          <LoginInfoCarousel tone="emerald" />

          {/* Features */}
          <div className="pt-20">
            <p className="text-sm text-emerald-100">
              Powered by SchoolBase — Keep your family informed and engaged
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
