"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CreditCard, Send } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function Step4_Pagamento({
  formData,
  setFormData,
  prevStep,
  handleFinalSubmit,
  isPending,
}: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.billingType) {
      alert("Por favor, selecione uma forma de pagamento.");
      return;
    }
    handleFinalSubmit();
  };

  return (
    <Card className="shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Forma de Pagamento
          </CardTitle>
          <CardDescription className="text-base">
            Selecione como deseja realizar o pagamento da sua assinatura.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <RadioGroup
            value={formData.billingType}
            onValueChange={(value) =>
              setFormData({ ...formData, billingType: value })
            }
            className="space-y-4"
          >
            <Label
              htmlFor="pix"
              className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer ${
                formData.billingType === "PIX" ? "border-primary" : ""
              }`}
            >
              <RadioGroupItem value="PIX" id="pix" />
              <div className="font-bold text-lg">PIX</div>
            </Label>
            <Label
              htmlFor="credit_card"
              className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer ${
                formData.billingType === "CREDIT_CARD" ? "border-primary" : ""
              }`}
            >
              <RadioGroupItem value="CREDIT_CARD" id="credit_card" />
              <div className="font-bold text-lg">Cartão de Crédito</div>
            </Label>
          </RadioGroup>
          {/* Você pode adicionar os campos de cartão de crédito aqui condicionalmente */}
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-6 flex justify-between">
          <Button type="button" variant="outline" size="lg" onClick={prevStep}>
            <ArrowLeft className="mr-2" /> Anterior
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isPending || !formData.billingType}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Processando...
              </>
            ) : (
              <>
                Finalizar Cadastro <Send className="ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
