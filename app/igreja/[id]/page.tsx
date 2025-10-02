"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  type ChurchItem,
  getChurchPublicById,
  searchChurches,
} from "@/services/churchPublic/churchPublic";

export default function ChurchPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [church, setChurch] = useState<ChurchItem | null>(null);
  const [nearby, setNearby] = useState<ChurchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      const item = await getChurchPublicById(id).catch(() => null);
      if (!ignore) setChurch(item);

      // Próximas (por lat/lng se tiver; senão por cidade)
      if (item?.latitude && item?.longitude) {
        const near = await searchChurches({
          userLatitude: item.latitude,
          userLongitude: item.longitude,
          radiusKm: 25,
          page: 1,
          pageSize: 6,
        }).catch(() => null);
        if (!ignore)
          setNearby((near?.items ?? []).filter((x) => x.id !== id));
      } else if (item?.city) {
        const near = await searchChurches({
          city: item.city,
          state: item.state ?? undefined,
          page: 1,
          pageSize: 6,
        }).catch(() => null);
        if (!ignore)
          setNearby((near?.items ?? []).filter((x) => x.id !== id));
      }
      if (!ignore) setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <div className="container mx-auto px-6 py-10">Carregando…</div>;
  if (!church) return <div className="container mx-auto px-6 py-10">Igreja não encontrada.</div>;

  return (
    <div className="pb-12">
      {/* HERO */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6 py-8 flex items-center gap-5">
          <div className="h-16 w-16 rounded-xl overflow-hidden bg-white/10 grid place-items-center flex-shrink-0">
            {church.logo ? (
              <Image
                src={church.logo}
                alt={church.name}
                width={64}
                height={64}
                className="object-cover h-full w-full"
              />
            ) : (
              <span className="text-2xl">⛪</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold truncate">
              {church.name}
            </h1>
            <p className="text-blue-100">
              {[church.city, church.state].filter(Boolean).join(" • ") || "—"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-white/15">
                Culto hoje: {church.hasServiceToday ? "Sim" : "Não"}
              </span>
              {church.nextServiceStartTime && (
                <span className="px-3 py-1 rounded-full bg-white/15">
                  Próximo:{" "}
                  {new Date(church.nextServiceStartTime).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold mb-2">Visão geral</h2>
            <p className="text-gray-700">
              {church.description || "Descrição não informada."}
            </p>
          </div>
        </div>

        {/* Sidebar: igrejas próximas */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold mb-3">Igrejas próximas</h3>
            {nearby.length === 0 && (
              <div className="text-gray-600 text-sm">Nenhuma encontrada.</div>
            )}
            <ul className="space-y-3">
              {nearby.map((i) => (
                <li key={i.id} className="flex justify-between items-center">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{i.name}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {[i.city, i.state].filter(Boolean).join(" • ")}
                    </div>
                  </div>
                  <a
                    href={`/igreja/${i.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
