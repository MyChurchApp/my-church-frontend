import { ChurchItem } from "@/services/churchPublic/churchPublic";

// MapCard.tsx
export default function MapCard({ church }: { church: ChurchItem }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-semibold mb-2">Localização</h3>
      <div className="h-48 bg-gray-100 rounded-lg grid place-items-center">Mapa aqui</div>
      <div className="text-sm text-gray-600 mt-2">{[church.city, church.state].filter(Boolean).join(" • ") || "—"}</div>
    </div>
  );
}
