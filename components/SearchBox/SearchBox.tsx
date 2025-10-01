"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { useDebounce } from "@/hooks/useDebounce";
import { ChurchItem, searchChurches } from "@/services/churchPublic/churchPublic";


export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ChurchItem[]>([]);
  const [initialResults, setInitialResults] = useState<ChurchItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebounce(query, 400);

  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    let ignore = false;
    setLoading(true);
    searchChurches({ page: 1, pageSize: 8 })
      .then((res) => {
        if (!ignore) {
          setInitialResults(res.items);
          setResults(res.items);
        }
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, []);


  useEffect(() => {
    if (!open) return;

    if (!debounced.trim()) {
      setResults(initialResults);
      return;
    }

    let ignore = false;
    setLoading(true);
    searchChurches({ search: debounced, page: 1, pageSize: 8 })
      .then((res) => !ignore && setResults(res.items))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [debounced, open, initialResults]);


  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative max-w-3xl mx-auto" ref={boxRef}>
      {/* Input */}
        <div className="flex items-center bg-white rounded-full shadow-lg ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-emerald-500">
          <span className="pl-4 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </span>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Lugares para ir, o que fazer, hotéis..."
            className="flex-1 py-3 px-3 text-gray-700 focus:outline-none bg-transparent"
          />

          {!open && (
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-full mr-1 transition"
            >
              Buscar
            </button>
          )}
        </div>

      {/* Dropdown */}
      {open && (
  <div className="absolute left-0 right-0 top-full mt-3 bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden z-[9999]">
          <div className="max-h-[360px] overflow-auto">
            {loading && <div className="p-4 text-sm text-gray-600">Buscando…</div>}
            {error && <div className="p-4 text-sm text-red-600">{error}</div>}

            {!loading && !error && results.map((ch) => (
              <button
                key={ch.id}
                onClick={() => (window.location.href = `/igreja/${ch.id}`)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
              >
                <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  {ch.logo ? (
                    <Image src={ch.logo} alt={ch.name} width={40} height={40} className="object-cover h-full w-full" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-gray-400">⛪</div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 line-clamp-1">{ch.name}</div>
                  <div className="text-sm text-gray-500">{[ch.city, ch.state].filter(Boolean).join(" • ") || "—"}</div>
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
