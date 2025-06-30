// src/components/modals/ChangePlanModal.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAvailablePlans,
  changePlan,
  cancelSubscription,
  type Plan,
} from "@/services/church/plan";
import { Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Interface de Propriedades ---
interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId: number;
  subscriptionId: number; // ID da assinatura para o cancelamento
  onPlanChanged: () => void; // Callback para recarregar os dados na página principal
}

export function ChangePlanModal({
  isOpen,
  onClose,
  currentPlanId,
  subscriptionId,
  onPlanChanged,
}: ChangePlanModalProps) {
  // --- Estados do Componente ---
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changing, setChanging] = useState(false); // Estado para alteração de plano
  const [cancelling, setCancelling] = useState(false); // Estado para cancelamento de plano

  // --- Efeitos ---
  useEffect(() => {
    if (isOpen) {
      const fetchPlans = async () => {
        setLoading(true);
        setError(null);
        try {
          const availablePlans = await getAvailablePlans();
          setPlans(availablePlans);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPlans();
    }
  }, [isOpen]);

  // --- Manipuladores de Eventos ---
  const handleConfirmChange = async () => {
    if (!selectedPlanId) return;

    setChanging(true);
    setError(null);
    try {
      const response = await changePlan(selectedPlanId);
      if (response.success) {
        onPlanChanged();
        onClose();
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setChanging(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    setError(null);
    try {
      await cancelSubscription(subscriptionId);
      onPlanChanged();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  // --- Renderização do Componente ---
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Alterar Plano</DialogTitle>
          <DialogDescription>
            Escolha um novo plano ou cancele sua assinatura. A alteração pode
            gerar uma cobrança imediata.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading && (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-4 sm:grid-cols-2">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={cn("transition-all", {
                    "border-primary ring-2 ring-primary":
                      selectedPlanId === plan.id,
                    "bg-slate-50 dark:bg-slate-800/60 cursor-not-allowed":
                      plan.id === currentPlanId,
                    "cursor-pointer hover:border-slate-400":
                      plan.id !== currentPlanId,
                  })}
                  onClick={() => {
                    if (plan.id !== currentPlanId) {
                      setSelectedPlanId(plan.id);
                    }
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {plan.name}
                      {plan.id === currentPlanId && (
                        <Badge variant="secondary">Plano Atual</Badge>
                      )}
                    </CardTitle>
                    <p className="text-2xl font-bold">
                      R$ {plan.price.toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        /mês
                      </span>
                    </p>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <ul className="space-y-1">
                      <li>• Até {plan.maxMembers} membros</li>
                      <li>• Até {plan.maxEvents} eventos</li>
                      <li>• {plan.maxStorageGB}GB de armazenamento</li>
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <DialogFooter className="sm:justify-between gap-y-4">
          {/* Botão de Cancelar Plano (Ação Destrutiva) */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mr-auto">
                Cancelar Plano
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação é permanente e não pode ser desfeita. Sua assinatura
                  será cancelada imediatamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={cancelling}>
                  Voltar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    "Sim, cancelar assinatura"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Botões de Ação Principal */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={changing || cancelling}
            >
              Fechar
            </Button>
            <Button
              onClick={handleConfirmChange}
              disabled={
                !selectedPlanId ||
                selectedPlanId === currentPlanId ||
                changing ||
                cancelling
              }
            >
              {changing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Confirmar Alteração
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
