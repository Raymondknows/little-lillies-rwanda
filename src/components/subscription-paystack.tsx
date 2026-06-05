"use client";

import React from "react";
import { PaystackPurchaseButton } from "@/components/paystack-purchase-button";

interface SubscriptionPaystackProps {
  amountMinor: number;
  currency: string;
  email: string;
  name: string;
  plan: string;
  schoolName: string;
  slug?: string;
  phone?: string;
}

export default function SubscriptionPaystack({ amountMinor, currency, email, name, plan, schoolName, slug, phone }: SubscriptionPaystackProps) {
  return (
    <div>
      <PaystackPurchaseButton
        amountMinor={amountMinor}
        currency={currency}
        email={email}
        name={name}
        plan={plan}
        schoolName={schoolName}
        slug={slug}
        phone={phone ?? ""}
        isSubscription={true}
      />
    </div>
  );
}
