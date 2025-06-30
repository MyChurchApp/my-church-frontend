import { DonationContainer } from "@/containers/Donation/donation";
import { Suspense } from "react";

export default function DoacoesPage() {
  return (
    <Suspense>
      <DonationContainer />;
    </Suspense>
  );
}
