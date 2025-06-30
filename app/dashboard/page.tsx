"use client";

import { useEffect, useState } from "react";
import { DashboardMobile } from "./DashboardMobile";
import { DashboardDesktop } from "./DashboardDesktop";

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

export default function DashboardPage() {
  const isMobile = useIsMobile();

  return isMobile ? <DashboardMobile /> : <DashboardDesktop />;
}
