// Photos.tsx
import Image from "next/image";
export default function Photos({ urls }: { urls: string[] }) {
  if (!urls?.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-3">Fotos</h2>
        <p className="text-gray-600">Esta igreja ainda não possui fotos.</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-3">Fotos</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {urls.map((u) => (
          <div key={u} className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image src={u} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
