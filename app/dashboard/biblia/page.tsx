"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BibleContainer } from "@/containers/biblia/biblia";

const queryClient = new QueryClient();

export default function BiblePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <BibleContainer
        config={{
          showBackButton: false,
          enableGemini: true,
        }}
      />
    </QueryClientProvider>
  );
}
