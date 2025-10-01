import { ChurchItem } from "@/services/churchPublic/churchPublic";

// Services.tsx
export default function Services({ church }: { church: ChurchItem }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-3">Cultos</h2>
      <p className="text-gray-700">Em breve: agenda detalhada de cultos e ministérios.</p>
    </div>
  );
}
