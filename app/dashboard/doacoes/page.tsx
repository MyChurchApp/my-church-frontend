import { DonationContainer } from "@/containers/Donation";
import { Suspense } from "react";

export default function DoacoesPage() {
  return (
    <Suspense>
      <DonationContainer />;
    </Suspense>
  );
}
