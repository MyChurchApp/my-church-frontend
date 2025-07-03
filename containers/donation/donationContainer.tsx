"use client";

import { DonationComponent } from "@/components/donation";
import { useDonation } from "./useDonation";
type props = {
  worshipId?: number | null;
};

export default function DonationContainer({ worshipId }: props) {
  const donationHook = useDonation({ worshipId });

  return <DonationComponent {...donationHook} />;
}
