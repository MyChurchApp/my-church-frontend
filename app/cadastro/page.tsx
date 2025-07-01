"use client";

import type React from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  CheckIcon,
  ArrowRight,
  Loader2,
  PartyPopperIcon,
  CopyIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createChurchWithAdmin } from "@/services/registration/registration";
import { getAvailablePlans, Plan } from "@/services/church/plan";

export default function CadastroPage() {
  const searchParams = useSearchParams();
  const planoParam = searchParams.get("plano");
  type Step = "igreja" | "administrador" | "confirmacao" | "pix-pagamento";
  const [currentStep, setCurrentStep] = useState<Step>("igreja");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planoId, setPlanoId] = useState<number | null>(null);
  const [billingType, setBillingType] = useState<"CREDIT_CARD" | "PIX" | "">(
    ""
  );
  const [pixCheckout, setPixCheckout] = useState<{
    churchId: number;
    checkoutUrl: string;
    pixQrCode: string | null;
    payload: string | null;
  } | null>(null);

  const [creditCard, setCreditCard] = useState({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
  });
  const [creditCardHolderInfo, setCreditCardHolderInfo] = useState({
    name: "",
    email: "",
    cpfCnpj: "",
    postalCode: "",
    addressNumber: "",
    phone: "",
  });

  const {
    data: planos,
    isLoading: loadingPlanos,
    error: planosError,
  } = useQuery<Plan[]>({
    queryKey: ["planos-disponiveis"],
    queryFn: getAvailablePlans,
    retry: false,
    staleTime: Infinity,
  });

  // Dados da igreja
  const [dadosIgreja, setDadosIgreja] = useState({
    nome: "",
    denominacao: "",
    cnpj: "",
    telefone: "",
    email: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    tamanho: "",
    plano: planoParam || "",
  });

  // Dados do administrador
  const [dadosAdmin, setDadosAdmin] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    cargo: "",
    senha: "",
    confirmarSenha: "",
    aceitarTermos: false,
    birthDate: "",
    birthCity: "",
    birthState: "",
    isBaptized: false,
    baptizedDate: "",
    isTither: false,
    memberSince: "",
    notes: "",
  });

  // Mutation compatível com o novo payload
  const { mutate: cadastrar, isPending } = useMutation({
    mutationFn: async () => {
      setError(null);

      const payload = {
        name: dadosIgreja.nome,
        description: dadosIgreja.denominacao || "Sem denominação",
        phone: dadosIgreja.telefone,
        planId: planoId,
        billingType: billingType, // "CREDIT_CARD" ou "PIX"
        logo: "", // Ajuste se tiver upload
        address: {
          street: dadosIgreja.endereco,
          city: dadosIgreja.cidade,
          state: dadosIgreja.estado,
          zipCode: dadosIgreja.cep,
          country: "Brasil",
          neighborhood: dadosIgreja.bairro,
          number: dadosIgreja.numero,
        },
        adminName: dadosAdmin.nome,
        adminEmail: dadosAdmin.email,
        adminPhone: dadosAdmin.telefone,
        adminPassword: dadosAdmin.senha,
        adminDocuments: [
          {
            type: 1, // CPF
            number: dadosAdmin.cpf,
          },
        ],
        adminPhoto: "",
        document: dadosIgreja.cnpj,
        adminBirthDate: dadosAdmin.birthDate, // SEMPRE obrigatório
        adminBirthCity: dadosAdmin.birthCity,
        adminBirthState: dadosAdmin.birthState,
        adminIsBaptized: dadosAdmin.isBaptized, // boolean
        adminBaptizedDate: dadosAdmin.isBaptized
          ? dadosAdmin.baptizedDate
          : undefined,
        adminIsTither: dadosAdmin.isTither, // boolean
        memberSince: dadosAdmin.memberSince, // SEMPRE obrigatório
        notes: dadosAdmin.notes,
        ministry: dadosAdmin.cargo,
        maritalStatus: 0,
        creditCard:
          billingType === "CREDIT_CARD"
            ? {
                holderName: creditCard.holderName,
                number: creditCard.number,
                expiryMonth: creditCard.expiryMonth,
                expiryYear: creditCard.expiryYear,
                ccv: creditCard.ccv,
              }
            : undefined,
        creditCardHolderInfo:
          billingType === "CREDIT_CARD"
            ? {
                name: creditCardHolderInfo.name,
                email: creditCardHolderInfo.email,
                cpfCnpj: creditCardHolderInfo.cpfCnpj,
                postalCode: creditCardHolderInfo.postalCode,
                addressNumber: creditCardHolderInfo.addressNumber,
                phone: creditCardHolderInfo.phone,
              }
            : undefined,
        creditCardInfoId: 0,
        adminAddress: {
          street: dadosIgreja.endereco,
          city: dadosIgreja.cidade,
          state: dadosIgreja.estado,
          zipCode: dadosIgreja.cep,
          country: "Brasil",
          neighborhood: dadosIgreja.bairro,
          number: dadosIgreja.numero,
        },
      };

      return createChurchWithAdmin(payload);
    },
    onSuccess: (data) => {
      if (billingType === "PIX" && data?.checkoutUrl) {
        setPixCheckout(data); // salva resposta da API
        setCurrentStep("pix-pagamento");
      } else {
        setCurrentStep("confirmacao");
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Erro ao cadastrar. Tente novamente.");
    },
  });

  const handleIgrejaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDadosIgreja((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDadosAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setDadosAdmin((prev) => ({ ...prev, aceitarTermos: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setDadosIgreja((prev) => ({ ...prev, [name]: value }));
  };

  const handleIgrejaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("administrador");
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dadosAdmin.senha !== dadosAdmin.confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }
    cadastrar();
  };

  interface EstadoSelectProps {
    value: string;
    onChange: (value: string) => void;
  }

  function EstadoSelect({ value, onChange }: EstadoSelectProps) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="estado">
          <SelectValue placeholder="Selecione o estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AC">Acre</SelectItem>
          <SelectItem value="AL">Alagoas</SelectItem>
          <SelectItem value="AP">Amapá</SelectItem>
          <SelectItem value="AM">Amazonas</SelectItem>
          <SelectItem value="BA">Bahia</SelectItem>
          <SelectItem value="CE">Ceará</SelectItem>
          <SelectItem value="DF">Distrito Federal</SelectItem>
          <SelectItem value="ES">Espírito Santo</SelectItem>
          <SelectItem value="GO">Goiás</SelectItem>
          <SelectItem value="MA">Maranhão</SelectItem>
          <SelectItem value="MT">Mato Grosso</SelectItem>
          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
          <SelectItem value="MG">Minas Gerais</SelectItem>
          <SelectItem value="PA">Pará</SelectItem>
          <SelectItem value="PB">Paraíba</SelectItem>
          <SelectItem value="PR">Paraná</SelectItem>
          <SelectItem value="PE">Pernambuco</SelectItem>
          <SelectItem value="PI">Piauí</SelectItem>
          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
          <SelectItem value="RN">Rio Grande do Norte</SelectItem>
          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
          <SelectItem value="RO">Rondônia</SelectItem>
          <SelectItem value="RR">Roraima</SelectItem>
          <SelectItem value="SC">Santa Catarina</SelectItem>
          <SelectItem value="SP">São Paulo</SelectItem>
          <SelectItem value="SE">Sergipe</SelectItem>
          <SelectItem value="TO">Tocantins</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* ===== HEADER ===== */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
          <Logo size="md" />
          {currentStep !== "confirmacao" && currentStep !== "pix-pagamento" && (
            <Link
              href="/"
              className="text-base text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
          )}
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto animate-in fade-in-50 duration-500">
          {/* ===== PASSO 1: IGREJA ===== */}
          {currentStep === "igreja" && (
            <div>
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  Cadastre sua Igreja
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
                  Comece preenchendo as informações da sua organização.
                </p>
              </div>

              {/* Stepper */}
              <div className="flex justify-center items-center mb-12">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                      1
                    </div>
                    <p className="text-sm mt-2 font-bold text-primary">
                      Igreja
                    </p>
                  </div>
                  <div className="w-16 sm:w-24 h-1 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold text-xl">
                      2
                    </div>
                    <p className="text-sm mt-2 font-medium text-gray-500 dark:text-gray-400">
                      Admin
                    </p>
                  </div>
                </div>
              </div>

              <Card className="shadow-xl dark:shadow-2xl dark:shadow-black/25">
                <form onSubmit={handleIgrejaSubmit}>
                  <CardContent className="p-6 sm:p-8 lg:p-10">
                    {/* --- Seção Informações Básicas --- */}
                    <fieldset className="mb-10">
                      <legend className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 w-full border-b pb-3 border-gray-200 dark:border-gray-700">
                        Informações Básicas
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        <div className="space-y-3 md:col-span-2">
                          <Label htmlFor="nome" className="text-base">
                            Nome da Igreja *
                          </Label>
                          <Input
                            id="nome"
                            name="nome"
                            value={dadosIgreja.nome}
                            onChange={handleIgrejaChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="denominacao" className="text-base">
                            Denominação
                          </Label>
                          <Input
                            id="denominacao"
                            name="denominacao"
                            value={dadosIgreja.denominacao}
                            onChange={handleIgrejaChange}
                            placeholder="Ex: Batista, Presbiteriana"
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="cnpj" className="text-base">
                            CNPJ ou CPF do responsável
                          </Label>
                          <Input
                            id="cnpj"
                            name="cnpj"
                            value={dadosIgreja.cnpj}
                            onChange={handleIgrejaChange}
                            placeholder="Apenas números"
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="telefone" className="text-base">
                            Telefone *
                          </Label>
                          <Input
                            id="telefone"
                            name="telefone"
                            value={dadosIgreja.telefone}
                            onChange={handleIgrejaChange}
                            placeholder="(00) 00000-0000"
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-base">
                            Email da Igreja *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={dadosIgreja.email}
                            onChange={handleIgrejaChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                      </div>
                    </fieldset>

                    {/* --- Seção Endereço --- */}
                    <fieldset className="mb-10">
                      <legend className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 w-full border-b pb-3 border-gray-200 dark:border-gray-700">
                        Endereço
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-8">
                        <div className="space-y-3 md:col-span-1">
                          <Label htmlFor="cep" className="text-base">
                            CEP *
                          </Label>
                          <Input
                            id="cep"
                            name="cep"
                            value={dadosIgreja.cep}
                            onChange={handleIgrejaChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3 md:col-span-3">
                          <Label htmlFor="endereco" className="text-base">
                            Endereço *
                          </Label>
                          <Input
                            id="endereco"
                            name="endereco"
                            value={dadosIgreja.endereco}
                            onChange={handleIgrejaChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3 md:col-span-1">
                          <Label htmlFor="numero" className="text-base">
                            Número *
                          </Label>
                          <Input
                            id="numero"
                            name="numero"
                            value={dadosIgreja.numero}
                            onChange={handleIgrejaChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3 md:col-span-3">
                          <Label htmlFor="bairro" className="text-base">
                            Bairro *
                          </Label>
                          <Input
                            id="bairro"
                            name="bairro"
                            value={dadosIgreja.bairro}
                            onChange={handleIgrejaChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                          <Label htmlFor="cidade" className="text-base">
                            Cidade *
                          </Label>
                          <Input
                            id="cidade"
                            name="cidade"
                            value={dadosIgreja.cidade}
                            onChange={handleIgrejaChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                          <Label htmlFor="estado" className="text-base">
                            Estado *
                          </Label>
                          <EstadoSelect
                            value={dadosIgreja.estado}
                            onChange={(value) =>
                              handleSelectChange("estado", value)
                            }
                          />
                        </div>
                        <div className="space-y-3 md:col-span-4">
                          <Label htmlFor="complemento" className="text-base">
                            Complemento
                          </Label>
                          <Input
                            id="complemento"
                            name="complemento"
                            value={dadosIgreja.complemento}
                            onChange={handleIgrejaChange}
                            placeholder="Ponto de referência, etc."
                            className="h-12 text-base"
                          />
                        </div>
                      </div>
                    </fieldset>

                    {/* --- Seção Plano e Tamanho --- */}
                    <fieldset>
                      <legend className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 w-full border-b pb-3 border-gray-200 dark:border-gray-700">
                        Plano e Tamanho
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        <div className="space-y-3">
                          <Label htmlFor="tamanho" className="text-base">
                            Tamanho da Igreja *
                          </Label>
                          <Select
                            value={dadosIgreja.tamanho}
                            onValueChange={(value) =>
                              handleSelectChange("tamanho", value)
                            }
                          >
                            <SelectTrigger
                              id="tamanho"
                              className="h-12 text-base"
                            >
                              <SelectValue placeholder="Selecione o tamanho" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pequena">
                                Pequena (até 100 membros)
                              </SelectItem>
                              <SelectItem value="media">
                                Média (101 a 500 membros)
                              </SelectItem>
                              <SelectItem value="grande">
                                Grande (501 a 1000 membros)
                              </SelectItem>
                              <SelectItem value="mega">
                                Mega (mais de 1000 membros)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="plano" className="text-base">
                            Plano Escolhido *
                          </Label>
                          {loadingPlanos ? (
                            <div>Carregando...</div>
                          ) : planosError ? (
                            <div className="text-destructive">
                              Erro ao buscar planos
                            </div>
                          ) : (
                            <Select
                              value={planoId ? String(planoId) : ""}
                              onValueChange={(value) =>
                                setPlanoId(Number(value))
                              }
                              required
                            >
                              <SelectTrigger
                                id="plano"
                                className="h-12 text-base"
                              >
                                <SelectValue placeholder="Selecione o plano" />
                              </SelectTrigger>
                              <SelectContent>
                                {planos?.map((plano) => (
                                  <SelectItem
                                    key={plano.id}
                                    value={String(plano.id)}
                                  >
                                    {" "}
                                    {plano.name}{" "}
                                    {plano.price > 0 &&
                                      `- R$ ${plano.price.toFixed(2)}`}{" "}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </fieldset>
                  </CardContent>
                  <CardFooter className="p-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto sm:ml-auto text-lg h-14 px-10"
                    >
                      Próximo <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          )}

          {/* ===== PASSO 2: ADMINISTRADOR ===== */}
          {currentStep === "administrador" && (
            <div>
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  Dados do Administrador
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
                  Agora, os dados do responsável que irá gerenciar o sistema.
                </p>
              </div>

              {/* Stepper */}
              <div className="flex justify-center items-center mb-12">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white">
                      <CheckIcon className="h-8 w-8" />
                    </div>
                    <p className="text-sm mt-2 font-medium text-gray-600 dark:text-gray-400">
                      Igreja
                    </p>
                  </div>
                  <div className="w-16 sm:w-24 h-1 bg-primary"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                      2
                    </div>
                    <p className="text-sm mt-2 font-bold text-primary">Admin</p>
                  </div>
                </div>
              </div>

              <Card className="shadow-xl dark:shadow-2xl dark:shadow-black/25">
                <form onSubmit={handleAdminSubmit}>
                  <CardContent className="p-6 sm:p-8 lg:p-10 space-y-10">
                    {/* --- Seção Dados Pessoais --- */}
                    <fieldset>
                      <legend className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 w-full border-b pb-3 border-gray-200 dark:border-gray-700">
                        Dados Pessoais
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        <div className="space-y-3 md:col-span-2">
                          <Label htmlFor="admin-nome" className="text-base">
                            Nome Completo *
                          </Label>
                          <Input
                            id="admin-nome"
                            name="nome"
                            value={dadosAdmin.nome}
                            onChange={handleAdminChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="admin-cpf" className="text-base">
                            CPF *
                          </Label>
                          <Input
                            id="admin-cpf"
                            name="cpf"
                            value={dadosAdmin.cpf}
                            onChange={handleAdminChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label
                            htmlFor="admin-birthDate"
                            className="text-base"
                          >
                            Data de nascimento *
                          </Label>
                          <Input
                            id="admin-birthDate"
                            name="birthDate"
                            type="date"
                            value={dadosAdmin.birthDate}
                            onChange={handleAdminChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="admin-email" className="text-base">
                            Email de Acesso *
                          </Label>
                          <Input
                            id="admin-email"
                            name="email"
                            type="email"
                            value={dadosAdmin.email}
                            onChange={handleAdminChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="admin-telefone" className="text-base">
                            Telefone / WhatsApp *
                          </Label>
                          <Input
                            id="admin-telefone"
                            name="telefone"
                            value={dadosAdmin.telefone}
                            onChange={handleAdminChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                      </div>
                    </fieldset>

                    {/* --- Seção Informações de Membro --- */}
                    <fieldset>
                      <legend className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 w-full border-b pb-3 border-gray-200 dark:border-gray-700">
                        Informações de Membro
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        <div className="space-y-3">
                          <Label htmlFor="admin-cargo" className="text-base">
                            Cargo na Igreja *
                          </Label>
                          <Input
                            id="admin-cargo"
                            name="cargo"
                            value={dadosAdmin.cargo}
                            onChange={handleAdminChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label
                            htmlFor="admin-memberSince"
                            className="text-base"
                          >
                            Membro desde *
                          </Label>
                          <Input
                            id="admin-memberSince"
                            name="memberSince"
                            type="date"
                            value={dadosAdmin.memberSince}
                            onChange={handleAdminChange}
                            required
                            className="h-12 text-base"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4 md:col-span-2">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="admin-isBaptized"
                              checked={dadosAdmin.isBaptized}
                              onCheckedChange={(checked) =>
                                setDadosAdmin((prev) => ({
                                  ...prev,
                                  isBaptized: !!checked,
                                }))
                              }
                              className="w-6 h-6"
                            />
                            <Label
                              htmlFor="admin-isBaptized"
                              className="text-base font-medium"
                            >
                              É batizado?
                            </Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="admin-isTither"
                              checked={dadosAdmin.isTither}
                              onCheckedChange={(checked) =>
                                setDadosAdmin((prev) => ({
                                  ...prev,
                                  isTither: !!checked,
                                }))
                              }
                              className="w-6 h-6"
                            />
                            <Label
                              htmlFor="admin-isTither"
                              className="text-base font-medium"
                            >
                              É dizimista?
                            </Label>
                          </div>
                        </div>
                        {dadosAdmin.isBaptized && (
                          <div className="space-y-3 animate-in fade-in-50">
                            <Label
                              htmlFor="admin-baptizedDate"
                              className="text-base"
                            >
                              Data do batismo *
                            </Label>
                            <Input
                              id="admin-baptizedDate"
                              name="baptizedDate"
                              type="date"
                              value={dadosAdmin.baptizedDate}
                              onChange={handleAdminChange}
                              required
                              className="h-12 text-base"
                            />
                          </div>
                        )}
                      </div>
                    </fieldset>

                    {/* --- Seção Credenciais de Acesso --- */}
                    <fieldset>
                      <legend className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 w-full border-b pb-3 border-gray-200 dark:border-gray-700">
                        Crie sua Senha
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        <div className="space-y-3">
                          <Label htmlFor="admin-senha" className="text-base">
                            Senha *
                          </Label>
                          <div className="relative">
                            <Input
                              id="admin-senha"
                              name="senha"
                              type={showPassword ? "text" : "password"}
                              value={dadosAdmin.senha}
                              onChange={handleAdminChange}
                              required
                              className="h-12 text-base pr-12"
                            />
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                              {showPassword ? (
                                <EyeOff className="h-6 w-6" />
                              ) : (
                                <Eye className="h-6 w-6" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label
                            htmlFor="admin-confirmar-senha"
                            className="text-base"
                          >
                            Confirmar Senha *
                          </Label>
                          <div className="relative">
                            <Input
                              id="admin-confirmar-senha"
                              name="confirmarSenha"
                              type={showConfirmPassword ? "text" : "password"}
                              value={dadosAdmin.confirmarSenha}
                              onChange={handleAdminChange}
                              required
                              className="h-12 text-base pr-12"
                            />
                            <button
                              type="button"
                              onClick={toggleConfirmPasswordVisibility}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-6 w-6" />
                              ) : (
                                <Eye className="h-6 w-6" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </fieldset>

                    {/* --- Seção Pagamento --- */}
                    <fieldset>
                      <legend className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 w-full border-b pb-3 border-gray-200 dark:border-gray-700">
                        Pagamento
                      </legend>
                      <div className="space-y-3">
                        <Label htmlFor="billingType" className="text-base">
                          Forma de pagamento *
                        </Label>
                        <Select
                          value={billingType}
                          onValueChange={(value) =>
                            setBillingType(value as "CREDIT_CARD" | "PIX")
                          }
                          required
                        >
                          <SelectTrigger
                            id="billingType"
                            className="h-12 text-base"
                          >
                            <SelectValue placeholder="Selecione a forma de pagamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CREDIT_CARD">
                              Cartão de Crédito
                            </SelectItem>
                            <SelectItem value="PIX">PIX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {billingType === "CREDIT_CARD" && (
                        <div className="mt-8 space-y-10 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl animate-in fade-in-50">
                          <div>
                            <h3 className="text-lg font-semibold mb-6">
                              Dados do Cartão
                            </h3>
                            <div className="grid grid-cols-1 gap-y-8">
                              {/* Campos do Cartão aqui... */}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-6">
                              Informações do Titular
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                              {/* Campos do titular aqui... */}
                            </div>
                          </div>
                        </div>
                      )}
                    </fieldset>

                    {/* --- Termos e Condições --- */}
                    <div className="flex items-start space-x-4 pt-6">
                      <Checkbox
                        id="aceitar-termos"
                        checked={dadosAdmin.aceitarTermos}
                        onCheckedChange={handleCheckboxChange}
                        required
                        className="w-6 h-6 mt-1"
                      />
                      <div className="grid gap-2 leading-none">
                        <Label
                          htmlFor="aceitar-termos"
                          className="text-base font-medium"
                        >
                          Concordo com os termos e condições
                        </Label>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                          Ao criar uma conta, você concorda com nossos{" "}
                          <Link
                            href="/termos"
                            className="text-primary hover:underline"
                          >
                            Termos de Serviço
                          </Link>{" "}
                          e{" "}
                          <Link
                            href="/privacidade"
                            className="text-primary hover:underline"
                          >
                            Política de Privacidade
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                    {error && (
                      <div className="text-destructive text-center text-base font-medium">
                        {error}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-6 flex-col sm:flex-row sm:justify-between gap-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("igreja")}
                      className="w-full sm:w-auto h-14 text-lg"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" /> Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={!dadosAdmin.aceitarTermos || isPending}
                      size="lg"
                      className="w-full sm:w-auto h-14 text-lg px-8"
                    >
                      {isPending ? (
                        <>
                          {" "}
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                          Processando...{" "}
                        </>
                      ) : (
                        "Finalizar Cadastro"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          )}

          {/* ===== PASSO 3: CONFIRMAÇÃO ===== */}
          {currentStep === "confirmacao" && (
            <div className="max-w-2xl mx-auto w-full text-center py-20">
              <div className="flex justify-center items-center mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/50 rounded-full mb-8">
                <PartyPopperIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                Cadastro Realizado!
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 mt-5 max-w-xl mx-auto">
                Seu cadastro foi concluído com sucesso e seu pagamento está
                sendo processado.
              </p>
              <div className="mt-12">
                <Button asChild size="lg" className="h-14 text-lg px-12">
                  <Link href="/login">Ir para o Login</Link>
                </Button>
              </div>
            </div>
          )}

          {/* ===== PASSO 4: PAGAMENTO PIX ===== */}
          {currentStep === "pix-pagamento" && pixCheckout && (
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  Falta Pouco!
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
                  Para ativar sua conta, realize o pagamento via PIX.
                </p>
              </div>
              <Card className="shadow-xl dark:shadow-2xl dark:shadow-black/25 text-center">
                <CardHeader className="p-8">
                  <CardTitle className="text-3xl">Pagamento via PIX</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Escaneie o QR Code ou use o "Copia e Cola"
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-8">
                  {pixCheckout.pixQrCode && (
                    <div className="flex flex-col items-center p-4 bg-white rounded-xl">
                      <img
                        src={pixCheckout.pixQrCode}
                        alt="QR Code PIX"
                        className="w-64 h-64 rounded-md"
                      />
                    </div>
                  )}
                  {pixCheckout.payload && (
                    <div>
                      <Label className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Chave PIX (Copia e Cola)
                      </Label>
                      <div className="relative mt-3">
                        <Input
                          value={pixCheckout.payload}
                          readOnly
                          className="h-12 text-sm bg-gray-100 dark:bg-gray-800 pr-14"
                        />
                        <Button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              pixCheckout.payload || ""
                            )
                          }
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                        >
                          <span className="sr-only">Copiar</span>
                          <CopyIcon className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex-col gap-6 p-8 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                  <Button asChild size="lg" className="w-full h-14 text-lg">
                    <Link href="/login">Já paguei, ir para o Login</Link>
                  </Button>
                  <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    Após a confirmação do pagamento, seu acesso será liberado.
                  </p>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto py-8 px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center md:text-left">
              <Logo size="sm" />
              <p className="text-base text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} MyChurch. Todos os direitos
                reservados.
              </p>
            </div>
            <div className="flex gap-6">
              <Link
                href="/suporte"
                className="text-base text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Suporte
              </Link>
              <Link
                href="/privacidade"
                className="text-base text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Privacidade
              </Link>
              <Link
                href="/termos"
                className="text-base text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Termos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
