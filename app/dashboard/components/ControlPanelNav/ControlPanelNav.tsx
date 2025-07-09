"use client";

import { ListOrdered, BookOpen, Music, HandHeart, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Panel = "cronograma" | "biblia" | "hinos" | "oracoes" | "avisos";

interface ControlPanelNavProps {
  activePanel: Panel;
  setActivePanel: (panel: Panel) => void;
}

const navItems = [
  { id: "cronograma", label: "Cronograma", icon: ListOrdered },
  { id: "biblia", label: "Bíblia", icon: BookOpen },
  { id: "hinos", label: "Hinos", icon: Music },
  { id: "oracoes", label: "Orações", icon: HandHeart },
  { id: "avisos", label: "Avisos", icon: Bell },
];

export default function ControlPanelNav({
  activePanel,
  setActivePanel,
}: ControlPanelNavProps) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePanel === item.id;
        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "ghost"}
            onClick={() => setActivePanel(item.id as Panel)}
            className="w-full justify-start text-base h-12 px-4"
          >
            <Icon
              className={cn(
                "h-5 w-5 mr-3",
                isActive ? "text-blue-500" : "text-gray-500"
              )}
            />
            <span className={cn(isActive && "font-bold")}>{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}
