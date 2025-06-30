"use client";

import { DonationComponent } from "@/components/donation";
import { useDonation } from "./useDonation";

export default function DonationContainer() {
  const donationHook = useDonation();

  return <DonationComponent {...donationHook} />;
}
