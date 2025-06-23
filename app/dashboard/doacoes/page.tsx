import { DonationContainer } from "@/containers/donation";
import { Suspense } from "react";

export default function DoacoesPage() {
  return (
    <Suspense>
      <DonationContainer />;
    </Suspense>
  );
}
