import { getStaffSession } from '@/lib/auth';
import { getCurrentSchool } from '@/lib/school';
import { Button } from '@/components/ui/button';
import PlanBlock from '@/components/plan-block';
import Link from 'next/link';

export default async function SubscribePage() {
  const session = await getStaffSession();
  const school = await getCurrentSchool();

  // Fixed NGN prices for all countries
  const starterPrice = 35000; // 35k NGN
  const growthPrice = 45000; // 45k NGN
  const starterMinorUnits = starterPrice * 100; // 3,500,000 for Paystack
  const growthMinorUnits = growthPrice * 100; // 4,500,000 for Paystack

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 sm:mb-12 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-foreground">Complete Your Subscription</h1>
        <p className="mt-4 text-sm text-muted max-w-2xl">
          Hi {session?.name ?? 'Administrator'}. To start using SchoolBase, please select a plan and complete payment for your school.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Starter Plan */}
        <div className="rounded-xl border border-border bg-surface p-6 flex flex-col">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Starter</h2>
            <p className="text-sm text-muted mt-1">Perfect for small schools</p>
            <div className="mt-4 p-3 bg-background rounded-lg">
              <p className="text-xs text-muted">Price per term</p>
              <p className="text-2xl font-bold text-foreground mt-1">₦{starterPrice.toLocaleString()} / term</p>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Up to 150 pupils</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Student attendance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Fee management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Basic reporting</span>
              </li>
            </ul>
          </div>
          <div className="mt-6">
            <PlanBlock
              title="Subscribe"
              amountMinor={starterMinorUnits}
              currency="NGN"
              planKey="STARTER"
              schoolName={school.name}
              slug={school.slug}
              userEmail={session?.email ?? ""}
              userName={session?.name ?? "Administrator"}
            />
          </div>
        </div>

        {/* Growth Plan */}
        <div className="rounded-xl border-2 border-brand bg-surface p-6 flex flex-col relative">
          <div className="absolute -top-3 left-4 bg-brand text-white px-3 py-1 rounded-full text-xs font-semibold">
            Popular
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Growth</h2>
            <p className="text-sm text-muted mt-1">For growing schools</p>
            <div className="mt-4 p-3 bg-background rounded-lg">
              <p className="text-xs text-muted">Price per term</p>
              <p className="text-2xl font-bold text-foreground mt-1">₦{growthPrice.toLocaleString()} / term</p>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Up to 600 pupils</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Teacher portal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Parent portal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Advanced reporting</span>
              </li>
            </ul>
          </div>
          <div className="mt-6">
            <PlanBlock
              title="Subscribe"
              amountMinor={growthMinorUnits}
              currency="NGN"
              planKey="GROWTH"
              schoolName={school.name}
              slug={school.slug}
              userEmail={session?.email ?? ""}
              userName={session?.name ?? "Administrator"}
            />
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="rounded-xl border border-border bg-surface p-6 flex flex-col">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Enterprise</h2>
            <p className="text-sm text-muted mt-1">For large organizations</p>
            <div className="mt-4 p-3 bg-background rounded-lg">
              <p className="text-xs text-muted">Price per term</p>
              <p className="text-2xl font-bold text-foreground mt-1">Custom pricing</p>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Unlimited pupils</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Custom features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Dedicated support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>Custom integration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-1">✓</span>
                <span>SLA guarantee</span>
              </li>
            </ul>
          </div>
          <div className="mt-6">
            <Link href="mailto:sales@schoolbase.ng?subject=Enterprise Plan Inquiry">
              <Button variant="outline" className="w-full">
                Contact sales
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Already Paid */}
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <p className="text-sm text-muted">
          Already paid? <Link href="mailto:support@schoolbase.live" className="text-brand font-medium hover:underline">
            Contact support to activate your account.
          </Link>
        </p>
      </div>
    </div>
  );
}
