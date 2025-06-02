"use client"

import { Sidebar } from "@/components/sidebar"
import { DashboardComponent } from "@/components/dashboard/dashboard.component"
import { useDashboard } from "./dashboard.hook"

// Definindo o componente
const DashboardContainer = () => {
  const dashboardProps = useDashboard()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <DashboardComponent {...dashboardProps} />
    </div>
  )
}

// Exportação nomeada
export { DashboardContainer }

// Exportação padrão explícita
export default DashboardContainer
