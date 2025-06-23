"use client";

import { DonationComponent } from "@/components/donation/donation.component";
import { useDonation } from "./useDonation";

export function DonationContainer() {
  const donationHook = useDonation();

  return <DonationComponent {...donationHook} />;
}
