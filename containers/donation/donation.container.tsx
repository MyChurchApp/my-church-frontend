"use client"

import { useDonation } from "./useDonation"
import { DonationComponent } from "@/components/donation/donation.component"

export function DonationContainer() {
  const donationHook = useDonation()

  return <DonationComponent {...donationHook} />
}
