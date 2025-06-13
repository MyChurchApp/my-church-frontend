import type React from "react"
import DashboardHeaderContainer from "@/app/dashboard/containers/header/dashboard-header.container"
import SidebarContentContainer from "@/app/dashboard/containers/sidebar/sidebar-content.container"

export default function CultoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <SidebarContentContainer />
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <DashboardHeaderContainer />
        <main>
          <div className="p-4 md:p-6 2xl:p-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
