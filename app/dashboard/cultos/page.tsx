import WorshipList from "../components/WorshipList/WorshipList";

export default function GestaoCultoPage() {
  return (
    <main className="bg-gray-50 dark:bg-black min-h-screen">
      <div className="container mx-auto max-w-2xl py-8">
        <header className="px-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Gestão de Cultos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Selecione um culto para gerenciar ou acompanhar.
          </p>
        </header>
        <WorshipList />
      </div>
    </main>
  );
}
