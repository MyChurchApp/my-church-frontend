// app/dashboard/cultos/[id]/page.tsx
import WorshipDetailClient from "./WorshipDetailClient";

const BASE =
  (process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE_URL)?.replace(/\/+$/, "");

export const dynamicParams = false;

export async function generateStaticParams() {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) return []; // sem env no build? não gera rotas

  try {
    const res = await fetch(`${base}/worship`, { cache: "force-cache" });
    if (!res.ok) return [];
    const items: Array<{ id: string | number }> = await res.json();
    return items.map(w => ({ id: String(w.id) }));
  } catch {
    return []; // falha na API? segue sem rotas
  }
}


export default function Page({ params }: { params: { id: string } }) {
  const worshipId = Number(params.id);
  return <WorshipDetailClient worshipId={worshipId} />;
}
