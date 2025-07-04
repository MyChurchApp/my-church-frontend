"use client";

import React, { useState, useRef, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingMembers,
  approveMember,
  declineMember,
  type Member,
} from "@/services/member/pendingMembers/PendingMembers";

import { getChurchData } from "@/services/church.service";
import {
  Check,
  Share2,
  Copy,
  X,
  Mail,
  Phone,
  Home,
  FileText,
  Loader2,
  CheckCheck,
  XCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import CompartilharModal from "../components/CompartilharModal/CompartilharModal";

//=============================
// COMPONENTES FILHOS
//=============================

type ButtonVariant = "primary" | "secondary" | "danger" | "danger-secondary";
interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}
const ActionButton = ({
  onClick,
  disabled,
  children,
  variant = "primary",
  className = "",
}: ActionButtonProps) => {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    "danger-secondary":
      "bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 py-2 px-4 font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

interface MemberCardProps {
  member: Member;
  onSelect: (id: number) => void;
  isSelected: boolean;
  onApprove: () => void;
  onDecline: () => void;
  isProcessing: boolean;
}
const MemberCard = ({
  member,
  onSelect,
  isSelected,
  onApprove,
  onDecline,
  isProcessing,
}: MemberCardProps) => (
  <div
    className={`relative bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${
      isSelected
        ? "border-blue-500 ring-2 ring-blue-200"
        : "border-gray-200 hover:shadow-md"
    } ${isProcessing ? "opacity-60" : ""}`}
  >
    {isProcessing && (
      <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    )}
    <div className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={isSelected}
            onChange={() => onSelect(member.id)}
            aria-label={`Selecionar ${member.name}`}
            disabled={isProcessing}
          />
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {member.name}
          </h3>
        </div>
      </div>
      <div className="space-y-3 text-sm text-gray-500 pl-9">
        <p className="flex items-center gap-2">
          <Mail size={14} />
          {member.email}
        </p>
        <p className="flex items-center gap-2">
          <Phone size={14} />
          {member.phone}
        </p>
        <p className="flex items-center gap-2">
          <FileText size={14} />
          {member.document?.[0]?.number || "CPF não informado"}
        </p>
        <p className="flex items-center gap-2">
          <Home size={14} />
          {member.address.street}, {member.address.neighborhood}
        </p>
      </div>
    </div>
    <div className="flex bg-gray-50/70 p-3 border-t border-gray-100">
      <ActionButton
        onClick={onApprove}
        disabled={isProcessing}
        variant="secondary"
        className="w-1/2"
      >
        <Check size={16} /> Aprovar
      </ActionButton>
      <div className="w-3"></div>
      <ActionButton
        onClick={onDecline}
        disabled={isProcessing}
        variant="danger-secondary"
        className="w-1/2"
      >
        <X size={16} /> Recusar
      </ActionButton>
    </div>
  </div>
);

//=============================
// COMPONENTE PRINCIPAL
//=============================
export default function MembrosPendentesPage() {
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [presentation, setPresentation] = useState(false);

  // Tipagem explícita no retorno do getPendingMembers se necessário
  const { data, isLoading, error } = useQuery<{ items: Member[] }>({
    queryKey: ["pending-members"],
    queryFn: getPendingMembers,
  });

  const members = data?.items ?? [];

  const mutation = useMutation<
    void,
    Error,
    { action: "approve" | "decline"; ids: number[] }
  >({
    mutationFn: async ({ action, ids }) => {
      const fn = action === "approve" ? approveMember : declineMember;
      await Promise.all(ids.map((id) => fn(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-members"] });
      setSelectedMembers([]);
    },
    onError: (err) => {
      console.error("Mutation error:", err);
      alert("Uma ou mais ações falharam. Por favor, tente novamente.");
    },
  });

  const handleSelectMember = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    if (members.length && selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((m) => m.id));
    }
  };
  const handleBulkAction = (action: "approve" | "decline") => {
    if (selectedMembers.length === 0) return;
    mutation.mutate({ action, ids: selectedMembers });
  };

  // Fullscreen: ativa/desativa se F11 ou botão
  useEffect(() => {
    if (!presentation) return;

    function handleF11(e: KeyboardEvent) {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    }
    document.addEventListener("keydown", handleF11);

    return () => document.removeEventListener("keydown", handleF11);
    // eslint-disable-next-line
  }, [presentation]);

  // Tenta colocar o modal/página em fullscreen
  function toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // ESTADOS DE CARREGAMENTO/ERRO/VAZIO
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <h2 className="mt-4 text-xl font-medium text-gray-600">
          Buscando aprovações...
        </h2>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 p-4">
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-6 py-3 rounded-full bg-blue-600 text-white font-bold shadow-xl hover:bg-blue-700 transition"
        >
          CONVITE
        </button>
        <CompartilharModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
        <AlertTriangle className="w-16 h-16" />
        <h2 className="mt-4 text-2xl font-bold">Falha ao Carregar</h2>
        <p className="mt-2 text-center max-w-md">
          Não foi possível buscar os membros pendentes. Verifique sua conexão ou
          tente novamente mais tarde.
        </p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 text-center p-4 mt-36">
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-6 py-3 rounded-full bg-blue-600 text-white font-bold shadow-xl hover:bg-blue-700 transition"
        >
          CONVITE
        </button>
        <CompartilharModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
        <Sparkles className="w-20 h-20 text-green-500" />
        <h2 className="mt-6 text-3xl font-bold text-gray-800">
          Tudo em ordem!
        </h2>
        <p className="mt-2 text-lg text-gray-500">
          Você não tem nenhuma aprovação pendente no momento.
        </p>
      </div>
    );
  }

  // RENDERIZAÇÃO PRINCIPAL
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans">
      <header className="mb-6">
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-6 py-3 rounded-full bg-blue-600 text-white font-bold shadow-xl hover:bg-blue-700 transition"
        >
          CONVITE
        </button>
        <CompartilharModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
        <h1 className="text-3xl font-bold text-gray-900">
          Aprovações Pendentes
        </h1>
        <p className="mt-1 text-gray-600">
          Você tem {members.length}{" "}
          {members.length === 1
            ? "cadastro para analisar"
            : "cadastros para analisar"}
          .
        </p>
      </header>
      <div className="sticky top-[-32px] z-20 bg-gray-100/80 backdrop-blur-sm py-2 mb-6">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center w-full sm:w-auto">
              <input
                type="checkbox"
                id="select-all"
                className="h-5 w-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                checked={
                  members.length > 0 &&
                  selectedMembers.length === members.length
                }
                onChange={handleSelectAll}
                disabled={mutation.isPending}
              />
              <label
                htmlFor="select-all"
                className="ml-3 font-medium text-gray-700"
              >
                {selectedMembers.length > 0
                  ? `${selectedMembers.length} selecionado(s)`
                  : "Selecionar Todos"}
              </label>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <ActionButton
                onClick={() => handleBulkAction("approve")}
                disabled={selectedMembers.length === 0 || mutation.isPending}
                variant="primary"
                className="flex-1"
              >
                <CheckCheck size={18} /> Aprovar
              </ActionButton>
              <ActionButton
                onClick={() => handleBulkAction("decline")}
                disabled={selectedMembers.length === 0 || mutation.isPending}
                variant="danger"
                className="flex-1"
              >
                <XCircle size={18} /> Recusar
              </ActionButton>
            </div>
          </div>
          {mutation.isPending && (
            <div className="flex items-center gap-2 mt-3 text-blue-600 text-sm">
              <Loader2 className="animate-spin" size={16} />
              Processando {mutation.variables?.ids?.length ?? 0} membro(s)...
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isSelected={selectedMembers.includes(member.id)}
            onSelect={handleSelectMember}
            onApprove={() =>
              mutation.mutate({ action: "approve", ids: [member.id] })
            }
            onDecline={() =>
              mutation.mutate({ action: "decline", ids: [member.id] })
            }
            isProcessing={
              mutation.isPending &&
              !!mutation.variables?.ids?.includes(member.id)
            }
          />
        ))}
      </div>
    </div>
  );
}
