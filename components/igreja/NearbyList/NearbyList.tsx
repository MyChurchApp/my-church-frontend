// NearbyList.tsx
import { ChurchItem } from "@/services/churchPublic/churchPublic";
import Link from "next/link";
export default function NearbyList({ items }: { items: ChurchItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-semibold mb-3">Igrejas próximas</h3>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.id} className="flex justify-between items-center">
            <div>
              <div className="font-medium">{i.name}</div>
              <div className="text-sm text-gray-500">{[i.city, i.state].filter(Boolean).join(" • ")}</div>
            </div>
            <Link href={`/igreja/${i.id}`} className="text-blue-600 hover:underline text-sm">Ver</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
