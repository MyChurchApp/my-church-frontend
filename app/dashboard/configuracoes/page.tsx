import { UserChurchInfo } from "@/components/user-church-info"

export default function ConfiguracoesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configurações</h1>

      <div className="space-y-6">
        {/* Outras seções existentes */}

        <UserChurchInfo />
      </div>
    </div>
  )
}
