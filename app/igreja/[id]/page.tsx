// app/igreja/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  searchChurches, // já existe
} from "@/services/churchPublic/churchPublic";
import type { ChurchItem } from "@/services/churchPublic/churchPublic";
import ChurchHero from "@/components/igreja/ChurchHero/ChurchHero";
import StickySubnav from "@/components/igreja/StickySubnav/StickySubnav";
import Overview from "@/components/igreja/Overview/Overview";
import Services from "@/components/igreja/Services/Services";
import Photos from "@/components/igreja/Photos/Photos";
import MapCard from "@/components/igreja/MapCard/MapCard";
import NearbyList from "@/components/igreja/NearbyList/NearbyList";

export default function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [data, setData] = useState<ChurchItem | null>(null);
  const [nearby, setNearby] = useState<ChurchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    // 1) Tenta achar pelo search (fallback de “detalhe”)
    async function load() {
      setLoading(true);
      // Busca por id no índice (se houver detalhe dedicado, troque por getChurchById)
      const byId = await searchChurches({ page: 1, pageSize: 1, search: String(id) }).catch(() => null);
      const item = byId?.items?.find((i) => i.id === id) ?? byId?.items?.[0] ?? null;
      if (!ignore) setData(item ?? null);

      // 2) Próximas (raio 25km) se tiver lat/lng; senão, por cidade
      if (item?.latitude && item?.longitude) {
        const near = await searchChurches({
          userLatitude: item.latitude!,
          userLongitude: item.longitude!,
          radiusKm: 25,
          page: 1,
          pageSize: 8,
        }).catch(() => null);
        if (!ignore) setNearby((near?.items ?? []).filter((x) => x.id !== id));
      } else if (item?.city) {
        const near = await searchChurches({ city: item.city, state: item.state ?? undefined, page: 1, pageSize: 8 }).catch(() => null);
        if (!ignore) setNearby((near?.items ?? []).filter((x) => x.id !== id));
      }
      if (!ignore) setLoading(false);
    }
    load();

    return () => { ignore = true; };
  }, [id]);

  if (loading) return <div className="container mx-auto px-6 py-10">Carregando…</div>;
  if (!data) return <div className="container mx-auto px-6 py-10">Igreja não encontrada.</div>;

  return (
    <div>
      <ChurchHero church={data} />
      <StickySubnav sections={["visao", "cultos", "fotos", "mapa", "proximas"]} />

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 py-8">
        <div className="lg:col-span-2 space-y-8">
          <section id="visao"><Overview church={data} /></section>
          <section id="cultos"><Services church={data} /></section>
          <section id="fotos"><Photos urls={[]} /></section>
        </div>

        <aside className="space-y-6">
          <section id="mapa"><MapCard church={data} /></section>
          <section id="proximas"><NearbyList items={nearby} /></section>
        </aside>
      </div>
    </div>
  );
}
