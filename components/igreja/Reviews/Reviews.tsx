// app/igreja/[id]/components/Reviews.tsx
"use client";
import { getChurchReviews, ReviewItem, ReviewsResponse } from "@/services/churchPublic/reviewsPublic";
import { useEffect, useState } from "react";


function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-1" aria-label={`Nota ${value.toFixed(1)} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
             className={`h-5 w-5 ${i < full ? "fill-amber-400" : "fill-gray-200"}`}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.047 3.222a1 1 0 00.95.69h3.388c.967 0 1.371 1.24.588 1.81l-2.742 1.99a1 1 0 00-.364 1.118l1.047 3.222c.3.922-.755 1.688-1.54 1.118l-2.742-1.99a1 1 0 00-1.176 0l-2.742 1.99c-.785.57-1.84-.196-1.54-1.118l1.047-3.222a1 1 0 00-.364-1.118L2.976 8.65c-.783-.57-.379-1.81.588-1.81h3.388a1 1 0 00.95-.69l1.047-3.222z"/>
        </svg>
      ))}
    </div>
  );
}

export default function Reviews({ churchId }: { churchId: number }) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getChurchReviews(churchId, page, pageSize)
      .then((res) => !ignore && setData(res))
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [churchId, page]);

  if (!data) return <div className="bg-white rounded-2xl shadow p-6">Carregando avaliações…</div>;

  const { averageScore, totalReviews, reviews } = data;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Avaliações</h2>
        <div className="flex items-center gap-3">
          <Stars value={averageScore} />
          <span className="text-sm text-gray-600">{averageScore.toFixed(1)} • {totalReviews} avaliações</span>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-600">Carregando…</div>}

      {reviews.items.length === 0 && !loading && (
        <div className="text-gray-600">Ainda não há avaliações.</div>
      )}

      <ul className="divide-y">
        {reviews.items.map((r: ReviewItem) => (
          <li key={r.id} className="py-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.userName || "Anônimo"}</div>
              <Stars value={r.score ?? 0} />
            </div>
            {r.title && <div className="text-sm font-semibold mt-1">{r.title}</div>}
            {r.comment && <p className="text-gray-700 mt-1">{r.comment}</p>}
            {r.created && (
              <div className="text-xs text-gray-500 mt-1">
                {new Date(r.created).toLocaleDateString()}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* paginação simples */}
      {reviews.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            {reviews.pageNumber} / {reviews.totalPages}
          </span>
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            disabled={page >= reviews.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
