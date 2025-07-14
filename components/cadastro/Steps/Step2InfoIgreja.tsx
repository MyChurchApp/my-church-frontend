"use client";

import { useState, useEffect } from "react";
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
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { getAddressFromCep } from "@/services/cep/cep";

export function Step2_InfoIgreja({
  formData,
  setFormData,
  nextStep,
  prevStep,
}: any) {
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const cep = formData.zipCode || "";
    if (cep.replace(/\D/g, "").length === 8) {
      const fetchAddress = async () => {
        setIsCepLoading(true);
        const address = await getAddressFromCep(cep);
        if (address) {
          setFormData((prev: any) => ({
            ...prev,
            street: address.logradouro,
            neighborhood: address.bairro,
            city: address.localidade,
            state: address.uf,
          }));
        }
        setIsCepLoading(false);
      };
      fetchAddress();
    }
  }, [formData.zipCode, setFormData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.zipCode) newErrors.zipCode = "O CEP é obrigatório.";
    if (!formData.street) newErrors.street = "O endereço é obrigatório.";
    if (!formData.number) newErrors.number = "O número é obrigatório.";
    if (!formData.neighborhood)
      newErrors.neighborhood = "O bairro é obrigatório.";
    if (!formData.city) newErrors.city = "A cidade é obrigatória.";
    if (!formData.state) newErrors.state = "O estado é obrigatório.";
    // Validação dos novos campos obrigatórios
    if (!formData.description)
      newErrors.description = "A denominação é obrigatória.";
    if (!formData.document) newErrors.document = "O CNPJ é obrigatório.";
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
          <CardTitle className="text-3xl font-bold">
            Detalhes da Igreja
          </CardTitle>
          <CardDescription className="text-base">
            Agora, preencha as informações de localização e documentação.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <fieldset>
            <legend className="text-lg font-semibold mb-4">Endereço</legend>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="cep">CEP *</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    value={formData.zipCode || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    className={errors.zipCode ? "border-destructive" : ""}
                  />
                  {isCepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                </div>
                {errors.zipCode && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.zipCode}
                  </p>
                )}
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="endereco">Endereço *</Label>
                <Input
                  id="endereco"
                  value={formData.street || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  className={errors.street ? "border-destructive" : ""}
                />
                {errors.street && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.street}
                  </p>
                )}
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  value={formData.number || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  className={errors.number ? "border-destructive" : ""}
                />
                {errors.number && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.number}
                  </p>
                )}
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  value={formData.neighborhood || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, neighborhood: e.target.value })
                  }
                  className={errors.neighborhood ? "border-destructive" : ""}
                />
                {errors.neighborhood && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.neighborhood}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={formData.city || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className={errors.city ? "border-destructive" : ""}
                />
                {errors.city && (
                  <p className="text-sm text-destructive mt-1">{errors.city}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  value={formData.state || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className={errors.state ? "border-destructive" : ""}
                />
                {errors.state && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.state}
                  </p>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-lg font-semibold mb-4">
              Informações Adicionais
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="denominacao">Descrição *</Label>
                <Input
                  id="denominacao"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.document || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, document: e.target.value })
                  }
                  className={errors.document ? "border-destructive" : ""}
                />
                {errors.document && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.document}
                  </p>
                )}
              </div>
            </div>
          </fieldset>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-6 flex justify-between">
          <Button type="button" variant="outline" size="lg" onClick={prevStep}>
            <ArrowLeft className="mr-2" /> Anterior
          </Button>
          <Button type="submit" size="lg">
            Próximo <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
