"use client";

import DonationContainer from "@/containers/donation/donationContainer";
import { Suspense } from "react";

export default function DoacoesPage() {
  return (
    <Suspense>
      <DonationContainer />;
    </Suspense>
  );
}
