import { MenuItem } from "./sidernar.types";
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Package,
  Heart,
  Book,
  BookHeart,
} from "lucide-react";

export const rawMenu: MenuItem[] = [
  {
    id: "home",
    icon: Home,
    label: "Início",
    href: "/dashboard",
    accessLevel: "member",
  },
  {
    id: "members",
    icon: Users,
    label: "Membros",
    href: "/dashboard/membros",
    accessLevel: "admin",
    subItems: [
      { label: "Membros", href: "/dashboard/membros", accessLevel: "admin" },
      {
        label: "Pendentes para aprovação",
        href: "/dashboard/membros/pendentes",
        accessLevel: "admin",
      },
    ],
  },
  {
    id: "events",
    icon: Calendar,
    label: "Eventos",
    href: "/dashboard/eventos",
    accessLevel: "member",
  },
  {
    id: "service",
    icon: Book,
    label: "Culto",
    href: "/dashboard/culto",
    accessLevel: "member",
    subItems: [
      {
        label: "Acompanhar",
        href: "/dashboard/acompanhar",
        accessLevel: "member",
      },
      {
        label: "Gestão",
        href: "/dashboard/cultos",
        accessLevel: "admin",
      },
    ],
  },
  {
    id: "donations",
    icon: Heart,
    label: "Doações",
    href: "/dashboard/doacoes",
    accessLevel: "member",
    subItems: [
      { label: "Ofertar", href: "/dashboard/doacoes", accessLevel: "member" },
      {
        label: "Histórico",
        href: "/dashboard/doacoes/historico",
        accessLevel: "admin",
      },
    ],
  },
  {
    id: "bible",
    icon: BookHeart,
    label: "Bíblia",
    href: "/biblia",
    accessLevel: "member",
  },
  {
    id: "finance",
    icon: DollarSign,
    label: "Financeiro",
    href: "/dashboard/financeiro",
    accessLevel: "admin",
    subItems: [
      {
        label: "Financeiro",
        href: "/dashboard/financeiro",
        accessLevel: "admin",
      },
      {
        label: "Retirada do Saldo",
        href: "/dashboard/financeiro/ofertas-realizadas",
        accessLevel: "admin",
      },
    ],
  },
  {
    id: "assets",
    icon: Package,
    label: "Ativos",
    href: "/dashboard/ativos",
    accessLevel: "admin",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Configurações",
    href: "/dashboard/configuracoes",
    accessLevel: "admin",
  },
];
