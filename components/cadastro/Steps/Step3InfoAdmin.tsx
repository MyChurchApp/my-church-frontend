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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Send,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getAddressFromCep } from "@/services/cep/cep";
import Link from "next/link";
import { InfoModal } from "../InfoModal/InfoModal";

export function Step3_InfoAdmin({
  formData,
  setFormData,
  nextStep,
  prevStep,
  handleFinalSubmit,
  isPending,
}: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCepLoading, setIsCepLoading] = useState(false);

  // Estados para controlar a visibilidade dos modais
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const isFreePlan = formData.planId === 1;

  useEffect(() => {
    const cep = formData.adminZipCode || "";
    if (cep.replace(/\D/g, "").length === 8) {
      const fetchAdminAddress = async () => {
        setIsCepLoading(true);
        const address = await getAddressFromCep(cep);
        if (address) {
          setFormData((prev: any) => ({
            ...prev,
            adminStreet: address.logradouro,
            adminNeighborhood: address.bairro,
            adminCity: address.localidade,
            adminState: address.uf,
          }));
        }
        setIsCepLoading(false);
      };
      fetchAdminAddress();
    }
  }, [formData.adminZipCode, setFormData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.adminName)
      newErrors.adminName = "Nome completo é obrigatório.";
    if (!formData.adminEmail)
      newErrors.adminEmail = "Email de acesso é obrigatório.";
    if (!formData.adminPhone)
      newErrors.adminPhone = "O telefone é obrigatório.";
    if (!formData.adminPassword)
      newErrors.adminPassword = "A senha é obrigatória.";
    if (formData.adminPassword !== formData.confirmarSenha)
      newErrors.confirmarSenha = "As senhas não coincidem.";
    if (!formData.aceitarTermos)
      newErrors.aceitarTermos = "Você deve aceitar os termos.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isFreePlan) {
      handleFinalSubmit();
    } else {
      nextStep();
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        <form onSubmit={handleNext}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Dados do Administrador
            </CardTitle>
            <CardDescription className="text-base">
              Informações do responsável principal pela conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <fieldset>
              <legend className="text-lg font-semibold mb-4">
                Identificação
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="admin-nome">Nome Completo *</Label>
                  <Input
                    id="admin-nome"
                    value={formData.adminName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, adminName: e.target.value })
                    }
                    className={errors.adminName ? "border-destructive" : ""}
                  />
                  {errors.adminName && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.adminName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="admin-cpf">CPF</Label>
                  <Input
                    id="admin-cpf"
                    value={formData.adminCPF || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, adminCPF: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="admin-cargo">Cargo na Igreja</Label>
                  <Input
                    id="admin-cargo"
                    value={formData.ministry || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, ministry: e.target.value })
                    }
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold mb-4">
                Endereço Pessoal
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <Label htmlFor="admin-cep">CEP</Label>
                  <div className="relative">
                    <Input
                      id="admin-cep"
                      value={formData.adminZipCode || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          adminZipCode: e.target.value,
                        })
                      }
                    />
                    {isCepLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />
                    )}
                  </div>
                </div>
                <div className="md:col-span-3">
                  <Label htmlFor="admin-endereco">Endereço</Label>
                  <Input
                    id="admin-endereco"
                    value={formData.adminStreet || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, adminStreet: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="admin-numero">Número</Label>
                  <Input
                    id="admin-numero"
                    value={formData.adminNumber || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, adminNumber: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-3">
                  <Label htmlFor="admin-bairro">Bairro</Label>
                  <Input
                    id="admin-bairro"
                    value={formData.adminNeighborhood || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        adminNeighborhood: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="admin-cidade">Cidade</Label>
                  <Input
                    id="admin-cidade"
                    value={formData.adminCity || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, adminCity: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="admin-estado">Estado</Label>
                  <Input
                    id="admin-estado"
                    value={formData.adminState || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, adminState: e.target.value })
                    }
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold mb-4">
                Credenciais de Acesso
              </legend>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-email">Email de Acesso *</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={formData.adminEmail || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, adminEmail: e.target.value })
                      }
                      className={errors.adminEmail ? "border-destructive" : ""}
                    />
                    {errors.adminEmail && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.adminEmail}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="admin-phone">Telefone / WhatsApp *</Label>
                    <Input
                      id="admin-phone"
                      value={formData.adminPhone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, adminPhone: e.target.value })
                      }
                      className={errors.adminPhone ? "border-destructive" : ""}
                    />
                    {errors.adminPhone && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.adminPhone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-senha">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="admin-senha"
                        type={showPassword ? "text" : "password"}
                        value={formData.adminPassword || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            adminPassword: e.target.value,
                          })
                        }
                        className={
                          errors.adminPassword ? "border-destructive" : ""
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {errors.adminPassword && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.adminPassword}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="admin-confirmar-senha">
                      Confirmar Senha *
                    </Label>
                    <div className="relative">
                      <Input
                        id="admin-confirmar-senha"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmarSenha || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmarSenha: e.target.value,
                          })
                        }
                        className={
                          errors.confirmarSenha ? "border-destructive" : ""
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {errors.confirmarSenha && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.confirmarSenha}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="flex items-start space-x-3 pt-4">
              <Checkbox
                id="aceitar-termos"
                checked={formData.aceitarTermos}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, aceitarTermos: !!checked })
                }
                className={errors.aceitarTermos ? "border-destructive" : ""}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="aceitar-termos"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Concordo com os{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-base"
                    onClick={() => setIsTermsOpen(true)}
                  >
                    Termos de Serviço
                  </Button>{" "}
                  e a{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-base"
                    onClick={() => setIsPrivacyOpen(true)}
                  >
                    Política de Privacidade
                  </Button>
                  .
                </label>
                {errors.aceitarTermos && (
                  <p className="text-destructive text-sm">
                    {errors.aceitarTermos}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={prevStep}
            >
              <ArrowLeft className="mr-2" /> Anterior
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isPending || !formData.aceitarTermos}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" /> Processando...
                </>
              ) : isFreePlan ? (
                <>
                  Finalizar Cadastro <Send className="ml-2" />
                </>
              ) : (
                <>
                  Próximo <ArrowRight className="ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <InfoModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        title="Termos de Serviço"
      >
        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao se cadastrar e usar a plataforma MyChurch, você concorda em cumprir
          estes Termos de Serviço e todas as leis e regulamentos aplicáveis. Se
          você não concordar com algum destes termos, está proibido de usar ou
          acessar este site.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
          odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla
          quis sem at nibh elementum imperdiet.
        </p>
        <h2>2. Uso da Plataforma</h2>
        <p>
          É concedida permissão para usar temporariamente os materiais na
          plataforma MyChurch para fins pessoais e de gestão de sua organização
          religiosa, não comerciais. Esta é a concessão de uma licença, não uma
          transferência de título.
        </p>
        <p>
          Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue
          semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class
          aptent taciti sociosqu ad litora torquent per conubia nostra, per
          inceptos himenaeos.
        </p>
      </InfoModal>

      <InfoModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        title="Política de Privacidade"
      >
        <h2>1. Coleta de Dados</h2>
        <p>
          A sua privacidade é importante para nós. Coletamos informações que
          você nos fornece diretamente, como nome, e-mail e dados da igreja, com
          o único propósito de fornecer e melhorar nossos serviços.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
          odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla
          quis sem at nibh elementum imperdiet.
        </p>
        <h2>2. Uso das Informações</h2>
        <p>
          As informações que coletamos são usadas exclusivamente para operar,
          manter e fornecer a você os recursos e a funcionalidade da plataforma
          MyChurch, bem como para nos comunicarmos diretamente com você.
        </p>
        <p>
          Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue
          semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class
          aptent taciti sociosqu ad litora torquent per conubia nostra, per
          inceptos himenaeos.
        </p>
      </InfoModal>
    </>
  );
}
