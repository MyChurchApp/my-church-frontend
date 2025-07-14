"use client";

import { useQuery } from "@tanstack/react-query";
import { getAvailablePlans, Plan } from "@/services/church/plan";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";

export function Step1_PlanoContato({ formData, setFormData, nextStep }: any) {
  const { data: planos, isLoading } = useQuery<Plan[]>({
    queryKey: ["planos-disponiveis"],
    queryFn: getAvailablePlans,
    staleTime: Infinity,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.planId) newErrors.planId = "Por favor, selecione um plano.";
    if (!formData.name) newErrors.name = "O nome da igreja é obrigatório.";
    if (!formData.email) newErrors.email = "O email principal é obrigatório.";
    if (!formData.phone)
      newErrors.phone = "O telefone principal é obrigatório.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      nextStep();
    }
  };

  return (
    <Card className="shadow-lg">
      <form onSubmit={handleNext}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Comece por aqui</CardTitle>
          <CardDescription className="text-base">
            Escolha um plano e nos diga as informações principais da sua igreja.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div>
            <Label className="text-lg font-semibold">
              1. Selecione seu Plano *
            </Label>
            {errors.planId && (
              <p className="text-sm text-destructive mt-1">{errors.planId}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {isLoading && <Loader2 className="animate-spin" />}
              {planos?.map((plano) => (
                <div
                  key={plano.id}
                  onClick={() => setFormData({ ...formData, planId: plano.id })}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                    formData.planId === plano.id
                      ? "border-primary shadow-md"
                      : "border-border hover:border-gray-400"
                  }`}
                >
                  {formData.planId === plano.id && (
                    <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-primary" />
                  )}
                  <h3 className="font-bold text-lg">{plano.name}</h3>
                  <p className="text-2xl font-extrabold">
                    R$ {plano.price.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /mês
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Até {plano.maxMembers} membros
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Label className="text-lg font-semibold">
              2. Informações de Contato *
            </Label>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Igreja</Label>
                <Input
                  id="nome"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email Principal</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="h-11"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="telefone">Telefone Principal (WhatsApp)</Label>
                <Input
                  id="telefone"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="h-11"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-6">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto sm:ml-auto"
          >
            Próximo <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
