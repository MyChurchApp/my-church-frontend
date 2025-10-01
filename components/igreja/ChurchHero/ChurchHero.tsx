import { ChurchItem } from "@/services/churchPublic/churchPublic";

export type ChurchDetail = ChurchItem & {
  address?: string | null;
  phone?: string | null;
  photos?: string[]; // urls
};

export default function ChurchHero({ church }: { church: ChurchItem }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">{church.name}</h1>
        <p className="mt-1 text-blue-100">{[church.city, church.state].filter(Boolean).join(" • ") || "—"}</p>
        <div className="mt-3 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-sm">
            Culto hoje: {church.hasServiceToday ? "Sim" : "Não"}
          </span>
          {church.nextServiceStartTime && (
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-sm">
              Próximo: {new Date(church.nextServiceStartTime).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
