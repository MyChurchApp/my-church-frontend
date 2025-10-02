"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";
import {
  type ChurchItem,
  searchChurches,
} from "@/services/churchPublic/churchPublic";

const RADIUS_KM_DEFAULT = 30;

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ChurchItem[]>([]);
  const [initialResults, setInitialResults] = useState<ChurchItem[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebounce(query, 400);

  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1ª carga: tenta geolocalização; se negar ou falhar, usa pública
  const loadInitialOnce = async () => {
    if (initialLoaded) return;
    setLoading(true);
    setError(null);

    const runDefault = async () => {
      const res = await searchChurches({ page: 1, pageSize: 8 });
      setInitialResults(res.items);
      setResults(res.items);
      setInitialLoaded(true);
    };

    const runGeo = async (lat: number, lng: number) => {
      try {
        const res = await searchChurches({
          userLatitude: lat,
          userLongitude: lng,
          radiusKm: RADIUS_KM_DEFAULT,
          page: 1,
          pageSize: 8,
        });
        setInitialResults(res.items);
        setResults(res.items);
        setInitialLoaded(true);
      } catch {
        // sem radius
        const res2 = await searchChurches({
          userLatitude: lat,
          userLongitude: lng,
          page: 1,
          pageSize: 8,
        });
        setInitialResults(res2.items);
        setResults(res2.items);
        setInitialLoaded(true);
      }
    };

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await runGeo(pos.coords.latitude, pos.coords.longitude);
          } catch {
            await runDefault();
          } finally {
            setLoading(false);
          }
        },
        async () => {
          await runDefault();
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      await runDefault();
      setLoading(false);
    }
  };

  // Busca ao digitar (quando aberto); se vazio → volta pros iniciais
  useEffect(() => {
    if (!open) return;
    if (!debounced.trim()) {
      setResults(initialResults);
      return;
    }
    let ignore = false;
    setLoading(true);
    setError(null);
    searchChurches({ search: debounced, page: 1, pageSize: 8 })
      .then((res) => !ignore && setResults(res.items))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [debounced, open, initialResults]);

  // Fechar ao clicar fora
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const openAndLoad = () => {
    setOpen(true);
    inputRef.current?.focus();
    void loadInitialOnce();
  };

  return (
    <div className="relative max-w-3xl mx-auto" ref={boxRef}>
      {/* Input */}
      <div className="flex items-center bg-white rounded-full shadow-lg ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-emerald-500">
        <span className="pl-4 text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
        </span>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={openAndLoad}
          placeholder="Digite aqui o nome da igreja..."
          className="flex-1 py-3 px-3 text-gray-700 focus:outline-none bg-transparent"
        />

        {!open && (
          <>
            {/* Mobile: ícone */}
            <button
              type="button"
              onClick={openAndLoad}
              aria-label="Buscar"
              title="Buscar"
              className="md:hidden h-11 w-11 mr-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white grid place-items-center transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
            </button>
            {/* Tablet+ : “Buscar” */}
            <button
              type="button"
              onClick={openAndLoad}
              className="hidden md:inline-flex bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-full mr-1 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Buscar
            </button>
          </>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-3 bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden z-[9999]">
          <div className="max-h-[360px] overflow-auto">
            {loading && (
              <div className="p-4 text-sm text-gray-600">Buscando…</div>
            )}
            {error && <div className="p-4 text-sm text-red-600">{error}</div>}

            {!loading &&
              !error &&
              results.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => (window.location.href = `/igreja/${ch.id}`)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                >
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    {ch.logo ? (
                      <Image
                        src={ch.logo}
                        alt={ch.name}
                        width={40}
                        height={40}
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-gray-400">
                        ⛪
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 line-clamp-1">
                      {ch.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {[ch.city, ch.state].filter(Boolean).join(" • ") || "—"}
                    </div>
                  </div>
                </button>
              ))}

            {!loading && !error && results.length === 0 && (
              <div className="p-4 text-sm text-gray-600">Nenhum resultado.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
