import { ChurchItem } from "@/services/churchPublic/churchPublic";

// Overview.tsx
export default function Overview({ church }: { church: ChurchItem }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-3">Visão geral</h2>
      <p className="text-gray-700">{church.description || "Descrição não informada."}</p>
    </div>
  );
}
