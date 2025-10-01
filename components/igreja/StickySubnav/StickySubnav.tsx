// StickySubnav.tsx
"use client";
export default function StickySubnav({ sections }: { sections: string[] }) {
  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
      <div className="container mx-auto px-6 overflow-x-auto">
        <nav className="flex gap-4 py-3 text-sm">
          {sections.map((id) => (
            <a key={id} href={`#${id}`} className="px-3 py-1 rounded-full hover:bg-gray-100">
              {id === "visao" ? "Visão geral" :
               id === "cultos" ? "Cultos" :
               id === "fotos" ? "Fotos" :
               id === "mapa" ? "Mapa" : "Igrejas próximas"}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
