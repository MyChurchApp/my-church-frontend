"use client"

import { Sidebar } from "@/components/sidebar"
import { DashboardComponent } from "@/components/dashboard/dashboard.component"
import { useDashboard } from "./dashboard.hook"

// Definição do componente
function DashboardContainer() {
  const dashboardProps = useDashboard()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <DashboardComponent {...dashboardProps} />
    </div>
  )
}

// Exportações explícitas
export { DashboardContainer }
export { DashboardContainer as default }
