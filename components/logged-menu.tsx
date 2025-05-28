"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Calendar, Users, BookOpen, Heart, Settings, LogOut, UserIcon } from "lucide-react"

interface UserType {
  name: string
  email: string
  avatar?: string
  role: string
}

interface LoggedMenuProps {
  user: UserType
}

const menuItems = [
  { icon: Home, label: "Início", href: "/" },
  { icon: Calendar, label: "Eventos", href: "/eventos" },
  { icon: Users, label: "Membros", href: "/membros" },
  { icon: BookOpen, label: "Estudos", href: "/estudos" },
  { icon: Heart, label: "Ministérios", href: "/ministerios" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
]

export default function LoggedMenu({
  user = {
    name: "João Silva",
    email: "joao@igreja.com",
    avatar: "/placeholder.svg?height=40&width=40&query=pastor",
    role: "Pastor",
  },
}: LoggedMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const UserProfile = ({ showEmail = true, className = "" }) => (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
        <AvatarFallback>
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium text-sm">{user.name}</span>
        {showEmail && <span className="text-xs text-muted-foreground">{user.role}</span>}
      </div>
    </div>
  )

  const MenuItems = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="space-y-1">
      {menuItems.map((item) => (
        <Button key={item.label} variant="ghost" className="w-full justify-start gap-3 h-12" onClick={onItemClick}>
          <item.icon className="h-5 w-5" />
          {item.label}
        </Button>
      ))}
    </div>
  )

  return (
    <>
      {/* Menu Desktop */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-2">
              <UserProfile showEmail={false} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-4" align="end">
            {/* Perfil do usuário no topo */}
            <div className="mb-4">
              <UserProfile />
            </div>

            <DropdownMenuSeparator />

            {/* Menu de navegação */}
            <div className="py-2">
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.label} className="gap-3 h-10 cursor-pointer">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator />

            {/* Opções do perfil */}
            <DropdownMenuItem className="gap-3 h-10 cursor-pointer">
              <UserIcon className="h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>

            <DropdownMenuItem className="gap-3 h-10 cursor-pointer text-red-600">
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Menu Mobile */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-6 pb-4 border-b">
              <SheetTitle className="text-left">
                <UserProfile />
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col h-full">
              {/* Menu de navegação */}
              <div className="flex-1 p-4">
                <MenuItems onItemClick={() => setIsOpen(false)} />
              </div>

              {/* Opções do perfil na parte inferior */}
              <div className="border-t p-4 space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-3 h-12" onClick={() => setIsOpen(false)}>
                  <UserIcon className="h-5 w-5" />
                  Meu Perfil
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setIsOpen(false)}
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
