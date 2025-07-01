// src/components/modals/BankingInfoModal.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Loader2 } from "lucide-react";
import { BankingInfo, updateBankingInfo } from "@/services/church.service";

interface BankingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialFormState: BankingInfo = {
  bankName: "",
  agency: "",
  account: "",
  accountDigit: "",
  accountType: "CONTA_CORRENTE",
  holderName: "",
  holderDocument: "",
  pixKey: "",
  pixKeyType: "EVP",
};

export function BankingInfoModal({ isOpen, onClose }: BankingInfoModalProps) {
  const [formData, setFormData] = useState<BankingInfo>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await updateBankingInfo(formData);
      onClose(); // Fecha o modal e dispara o refetch no provider
    } catch (err: any) {
      setError(
        err.message || "Não foi possível salvar os dados. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // O onOpenChange={onClose} permite fechar clicando fora, mas podemos desabilitar se quisermos forçar o preenchimento.
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Dados Bancários Pendentes</DialogTitle>
          <DialogDescription>
            Para continuar, precisamos que você cadastre os dados bancários da
            igreja para recebimento de doações.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Adicione todos os campos do formulário aqui */}
          <div className="col-span-2">
            <Label htmlFor="holderName">Nome do Titular</Label>
            <Input
              id="holderName"
              name="holderName"
              value={formData.holderName}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="holderDocument">CPF/CNPJ do Titular</Label>
            <Input
              id="holderDocument"
              name="holderDocument"
              value={formData.holderDocument}
              onChange={handleChange}
            />
          </div>
          {/* Adicione os outros campos: bankName, agency, account, etc. da mesma forma */}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
