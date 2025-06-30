"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, RefreshCw } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { DonationTransferService } from "@/services/donation/donation-transfer";

interface TransferFormProps {
  onTransferComplete?: () => void;
}

export function TransferForm({ onTransferComplete }: TransferFormProps) {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, adicione uma observação para a transferência.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await DonationTransferService.transfer({ notes: notes.trim() });

      toast({
        title: "Transferência realizada",
        description: "A transferência foi efetuada com sucesso.",
      });

      setNotes("");
      onTransferComplete?.();
    } catch (error) {
      console.error("Erro ao efetuar transferência:", error);
      toast({
        title: "Erro na transferência",
        description: "Ops, tente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Efetuar Transferência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Observações *</Label>
            <Textarea
              id="notes"
              placeholder="Digite uma observação para esta transferência..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !notes.trim()}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Efetuar Transferência
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
