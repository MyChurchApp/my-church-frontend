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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { BankingInfo, updateBankingInfo } from "@/services/church.service";
import { cn } from "@/lib/utils";

interface BankingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BankingInfo;
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

export function BankingInfoModal({
  isOpen,
  onClose,
  initialData,
}: BankingInfoModalProps) {
  const [formData, setFormData] = useState<BankingInfo>(
    initialData || initialFormState
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || initialFormState);
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await updateBankingInfo(formData);
      onClose();
    } catch (err: any) {
      setError(
        err.message || "Não foi possível salvar os dados. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectClassName =
    "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* ✅ Estrutura de Flexbox para controle total da altura */}
      <DialogContent
        className={cn(
          "w-[95vw] max-w-lg rounded-lg",
          "flex flex-col h-full max-h-[90vh] sm:h-auto" // Ocupa a altura disponível no mobile, altura automática no desktop
        )}
      >
        <DialogHeader>
          <DialogTitle>Dados Bancários Pendentes</DialogTitle>
          <DialogDescription>
            Para continuar, preencha os dados bancários da igreja para
            recebimento de doações.
          </DialogDescription>
        </DialogHeader>

        {/* ✅ A área de rolagem agora ocupa o espaço flexível restante */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="sm:col-span-2">
              <Label htmlFor="holderName">Nome do Titular</Label>
              <Input
                id="holderName"
                name="holderName"
                value={formData.holderName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="holderDocument">CPF/CNPJ do Titular</Label>
              <Input
                id="holderDocument"
                name="holderDocument"
                value={formData.holderDocument}
                onChange={handleChange}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="bankName">Banco</Label>
              <Input
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="agency">Agência</Label>
              <Input
                id="agency"
                name="agency"
                value={formData.agency}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="account">Conta</Label>
              <Input
                id="account"
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="accountDigit">Dígito</Label>
              <Input
                id="accountDigit"
                name="accountDigit"
                value={formData.accountDigit}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="accountType">Tipo de Conta</Label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className={selectClassName}
                required
              >
                <option value="CONTA_CORRENTE">Conta Corrente</option>
                <option value="CONTA_POUPANCA">Conta Poupança</option>
                <option value="CONTA_PAGAMENTO">Conta Pagamento</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                name="pixKey"
                value={formData.pixKey}
                onChange={handleChange}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="pixKeyType">Tipo da Chave PIX</Label>
              <select
                id="pixKeyType"
                name="pixKeyType"
                value={formData.pixKeyType}
                onChange={handleChange}
                className={selectClassName}
                required
              >
                <option value="EVP">Aleatória (EVP)</option>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="EMAIL">E-mail</option>
                <option value="TELEFONE">Telefone</option>
              </select>
            </div>
          </div>
        </ScrollArea>

        {error && <p className="text-sm text-red-600 px-1 pt-2">{error}</p>}

        {/* O rodapé fica fixo na parte inferior do modal */}
        <DialogFooter className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
