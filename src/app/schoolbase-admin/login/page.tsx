'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getBackendUrl } from '@/lib/backend-url';
import { SchoolLogoImage } from '@/components/auth/school-logo-image';
import { LoginInfoCarousel } from '@/components/auth/login-info-carousel';

export default function PlatformAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);

    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/platform-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setPending(false);
        return;
      }

      setNotice('Login successful. Redirecting...');

      // Wait a moment to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use full page redirect to ensure cookie is sent
      window.location.href = '/schoolbase-admin';
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-background to-violet-50">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-3xl font-bold text-foreground">
            Platform Admin
          </h1>

          <p className="mt-3 text-base text-muted">
            Manage SchoolBase platform and schools
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {notice && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
                {notice}
              </div>
            )}

            <label className="block text-sm font-medium text-foreground">
              Email
              <input
                type="email"
                required
                placeholder="admin@schoolbase.live"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Password
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 pr-10 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted transition hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>

            <div className="text-right text-sm">
              <a href="/forgot-password" className="text-brand hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-brand text-white px-4 py-2.5 font-medium hover:bg-brand/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted">
              Not a platform admin?{' '}
              <a href="/login" className="text-brand hover:underline">
                Go to school login
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - School Info */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:items-center lg:bg-gradient-to-b lg:from-indigo-600 lg:to-violet-700 lg:px-16 lg:py-12 lg:relative lg:overflow-hidden">
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
            <p className="mt-3 text-lg text-indigo-100">
              Platform Administration
            </p>
          </div>

          {/* Contact Info */}
          <LoginInfoCarousel tone="indigo" />

          {/* Features */}
          <div className="pt-4">
            <p className="text-sm text-indigo-100">
              Powered by SchoolBase — Enterprise school management solution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
