"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BellIcon } from "lucide-react"

interface DashboardHeaderProps {
  user: any
  openProfileModal: () => void
  getInitials: (name: string | undefined | null) => string
}

export function DashboardHeader({ user, openProfileModal, getInitials }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <div className="flex items-center space-x-2 cursor-pointer" onClick={openProfileModal}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.member?.photo || ""} alt={user.member?.name || "Usuário"} />
            <AvatarFallback>{getInitials(user.member?.name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:inline-block">{user.member?.name}</span>
        </div>
      </div>
    </header>
  )
}
