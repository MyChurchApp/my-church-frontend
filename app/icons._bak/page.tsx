import GenerateIcons from "@/components/ui/generate-icons";

export default function IconsPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Ícones do MyChurch PWA
      </h1>
      <GenerateIcons />
    </div>
  );
}
