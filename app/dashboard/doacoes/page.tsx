"use client";

import { DonationContainer } from "../../../containers/Donation/Donation";
import { Suspense } from "react";

export default function DoacoesPage() {
  return (
    <Suspense>
      <DonationContainer />;
    </Suspense>
  );
}
