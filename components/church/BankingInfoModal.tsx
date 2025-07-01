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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dados Bancários Pendentes</DialogTitle>
          <DialogDescription>
            Para continuar, preencha os dados bancários da igreja para
            recebimento de doações.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <Label htmlFor="holderName">Nome do Titular</Label>
            <Input
              id="holderName"
              name="holderName"
              value={formData.holderName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="holderDocument">CPF/CNPJ do Titular</Label>
            <Input
              id="holderDocument"
              name="holderDocument"
              value={formData.holderDocument}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-2">
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
              className="w-full border rounded h-10 bg-background"
              required
            >
              <option value="CONTA_CORRENTE">Conta Corrente</option>
              <option value="CONTA_POUPANCA">Conta Poupança</option>
              <option value="CONTA_PAGAMENTO">Conta Pagamento</option>
              {/* Adicione outros tipos se necessário */}
            </select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="pixKey">Chave PIX</Label>
            <Input
              id="pixKey"
              name="pixKey"
              value={formData.pixKey}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="pixKeyType">Tipo da Chave PIX</Label>
            <select
              id="pixKeyType"
              name="pixKeyType"
              value={formData.pixKeyType}
              onChange={handleChange}
              className="w-full border rounded h-10 bg-background"
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
