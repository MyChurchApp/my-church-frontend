// app/cultos/layout.tsx

export default function CultosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Esta "moldura" será aplicada a todas as páginas dentro de /cultos
  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen">
      {/* O 'children' aqui será o conteúdo das suas páginas */}
      {children}
    </div>
  );
}
