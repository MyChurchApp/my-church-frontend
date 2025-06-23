"use client";

import { MembrosComponent } from "@/components/MembrosComponent/MembrosComponent";
import { useMembros } from "./Membros.hook";

export default function MembrosContainer() {
  const hookProps = useMembros();
  return <MembrosComponent {...hookProps} />;
}
