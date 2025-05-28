import LoggedMenu from "@/components/logged-menu"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com menu */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Igreja App</h1>
            </div>

            {/* Menu do usuário */}
            <LoggedMenu />
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Sistema da Igreja</h2>
          <p className="text-gray-600">
            Use o menu no canto superior direito para navegar pelas diferentes seções do sistema.
          </p>
        </div>
      </main>
    </div>
  )
}
