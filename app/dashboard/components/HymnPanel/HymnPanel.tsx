"use client";

import { HymnManager } from "@/components/hymn/HymnManager";
import { Card } from "@/components/ui/card";

export default function HymnPanel({ worshipId }: { worshipId: number }) {
  return (
    <Card className="border-0 shadow-none bg-transparent overflow-hidden">
      <HymnManager worshipId={worshipId} />
    </Card>
  );
}
