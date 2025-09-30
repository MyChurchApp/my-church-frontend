// app/dashboard/cultos/[id]/layout.tsx
export async function generateStaticParams() {
  // Não pré-geramos nada para export estático
  return [];
}

export default function WorshipIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
