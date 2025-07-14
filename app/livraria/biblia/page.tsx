"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BibleContainer } from "@/containers/biblia/biblia";

const queryClient = new QueryClient();

export default function DashboardBiblePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <BibleContainer
        config={{
          showBackButton: true,
          enableGemini: false,
        }}
      />
    </QueryClientProvider>
  );
}
