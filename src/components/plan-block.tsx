"use client";

import React from 'react';
import SubscriptionPaystack from './subscription-paystack';

interface PlanBlockProps {
  title: string;
  subtitle?: string;
  amountMinor: number;
  currency: string;
  planKey: string;
  schoolName: string;
  slug: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
}

export default function PlanBlock({ title, subtitle, amountMinor, currency, planKey, schoolName, slug, userEmail, userName, userPhone }: PlanBlockProps) {
  return (
    <div className="mb-4">
      <div className="font-medium">{title}</div>
      {subtitle ? <div className="mt-2 text-sm text-muted">{subtitle}</div> : null}
      <div className="mt-3">
        <SubscriptionPaystack amountMinor={amountMinor} currency={currency} email={userEmail} name={userName} plan={planKey} schoolName={schoolName} slug={slug} phone={userPhone} />
      </div>
    </div>
  );
}
