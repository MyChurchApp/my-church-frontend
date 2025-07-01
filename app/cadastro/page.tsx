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
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo size="md" />
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Voltar para a página inicial
            </span>
          </Link>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full animate-in fade-in-50 duration-500">
          {/* ===== PASSO 1: IGREJA ===== */}
          {currentStep === "igreja" && (
            <div className="max-w-4xl mx-auto w-full">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  Cadastre sua igreja
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                  Comece preenchendo as informações da sua organização para usar
                  o MyChurch.
                </p>
              </div>

              {/* Stepper */}
              <div className="flex justify-center items-center mb-10">
                <div className="flex items-center">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                      1
                    </div>
                    <p className="text-xs mt-2 font-semibold text-primary">
                      Igreja
                    </p>
                  </div>
                  <div className="w-12 sm:w-16 h-1 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold text-lg">
                      2
                    </div>
                    <p className="text-xs mt-2 font-medium text-gray-500 dark:text-gray-400">
                      Administrador
                    </p>
                  </div>
                  <div className="w-12 sm:w-16 h-1 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold text-lg">
                      3
                    </div>
                    <p className="text-xs mt-2 font-medium text-gray-500 dark:text-gray-400">
                      Confirmação
                    </p>
                  </div>
                </div>
              </div>

              <Card className="shadow-lg dark:shadow-2xl dark:shadow-black/20">
                <form onSubmit={handleIgrejaSubmit}>
                  <CardContent className="p-6 sm:p-8">
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                      <legend className="text-lg font-semibold mb-4 col-span-1 md:col-span-2">
                        Informações Básicas
                      </legend>
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome da Igreja *</Label>
                        <Input
                          id="nome"
                          name="nome"
                          value={dadosIgreja.nome}
                          onChange={handleIgrejaChange}
                          placeholder="Nome completo da igreja"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="denominacao">Denominação</Label>
                        <Input
                          id="denominacao"
                          name="denominacao"
                          value={dadosIgreja.denominacao}
                          onChange={handleIgrejaChange}
                          placeholder="Ex: Batista, Presbiteriana"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ ou CPF do responsável</Label>
                        <Input
                          id="cnpj"
                          name="cnpj"
                          value={dadosIgreja.cnpj}
                          onChange={handleIgrejaChange}
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone *</Label>
                        <Input
                          id="telefone"
                          name="telefone"
                          value={dadosIgreja.telefone}
                          onChange={handleIgrejaChange}
                          placeholder="(00) 00000-0000"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email">Email da Igreja *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={dadosIgreja.email}
                          onChange={handleIgrejaChange}
                          placeholder="contato@suaigreja.com"
                          required
                        />
                      </div>
                    </fieldset>

                    <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>

                    <fieldset className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                      <legend className="text-lg font-semibold mb-4 col-span-1 md:col-span-2 lg:col-span-4">
                        Endereço
                      </legend>
                      <div className="space-y-2 lg:col-span-1">
                        <Label htmlFor="cep">CEP *</Label>
                        <Input
                          id="cep"
                          name="cep"
                          value={dadosIgreja.cep}
                          onChange={handleIgrejaChange}
                          placeholder="00000-000"
                          required
                        />
                      </div>
                      <div className="space-y-2 lg:col-span-3">
                        <Label htmlFor="endereco">Endereço *</Label>
                        <Input
                          id="endereco"
                          name="endereco"
                          value={dadosIgreja.endereco}
                          onChange={handleIgrejaChange}
                          placeholder="Av. Brasil, Rua Principal"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número *</Label>
                        <Input
                          id="numero"
                          name="numero"
                          value={dadosIgreja.numero}
                          onChange={handleIgrejaChange}
                          placeholder="Nº"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro *</Label>
                        <Input
                          id="bairro"
                          name="bairro"
                          value={dadosIgreja.bairro}
                          onChange={handleIgrejaChange}
                          placeholder="Centro"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade *</Label>
                        <Input
                          id="cidade"
                          name="cidade"
                          value={dadosIgreja.cidade}
                          onChange={handleIgrejaChange}
                          placeholder="Nome da cidade"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado *</Label>
                        <EstadoSelect
                          value={dadosIgreja.estado}
                          onChange={(value) =>
                            handleSelectChange("estado", value)
                          }
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2 lg:col-span-4">
                        <Label htmlFor="complemento">Complemento</Label>
                        <Input
                          id="complemento"
                          name="complemento"
                          value={dadosIgreja.complemento}
                          onChange={handleIgrejaChange}
                          placeholder="Sala, Andar, Ponto de referência"
                        />
                      </div>
                    </fieldset>

                    <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>

                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                      <legend className="text-lg font-semibold mb-4 col-span-1 md:col-span-2">
                        Plano e Tamanho
                      </legend>
                      <div className="space-y-2">
                        <Label htmlFor="tamanho">Tamanho da Igreja *</Label>
                        <Select
                          value={dadosIgreja.tamanho}
                          onValueChange={(value) =>
                            handleSelectChange("tamanho", value)
                          }
                        >
                          <SelectTrigger id="tamanho">
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
                      <div className="space-y-2">
                        <Label htmlFor="plano">Plano Escolhido *</Label>
                        {loadingPlanos ? (
                          <div>Carregando planos...</div>
                        ) : planosError ? (
                          <div className="text-destructive text-sm">
                            Erro ao buscar planos
                          </div>
                        ) : (
                          <Select
                            value={planoId ? String(planoId) : ""}
                            onValueChange={(value) => setPlanoId(Number(value))}
                            required
                          >
                            <SelectTrigger id="plano">
                              <SelectValue placeholder="Selecione o plano" />
                            </SelectTrigger>
                            <SelectContent>
                              {planos?.map((plano) => (
                                <SelectItem
                                  key={plano.id}
                                  value={String(plano.id)}
                                >
                                  {plano.name}{" "}
                                  {plano.price > 0 &&
                                    `- R$ ${plano.price.toFixed(2)}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </fieldset>
                  </CardContent>
                  <CardFooter className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50">
                    <div className="flex justify-end w-full">
                      <Button type="submit" size="lg">
                        Próximo: Dados do Administrador{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </div>
          )}

          {/* ===== PASSO 2: ADMINISTRADOR ===== */}
          {currentStep === "administrador" && (
            <div className="max-w-4xl mx-auto w-full">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  Dados do Administrador
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                  Agora, preencha os dados do responsável que irá gerenciar o
                  sistema.
                </p>
              </div>

              {/* Stepper */}
              <div className="flex justify-center items-center mb-10">
                <div className="flex items-center">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white font-bold text-lg">
                      <CheckIcon className="h-6 w-6" />
                    </div>
                    <p className="text-xs mt-2 font-medium text-gray-500 dark:text-gray-400">
                      Igreja
                    </p>
                  </div>
                  <div className="w-12 sm:w-16 h-1 bg-primary mx-2"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                      2
                    </div>
                    <p className="text-xs mt-2 font-semibold text-primary">
                      Administrador
                    </p>
                  </div>
                  <div className="w-12 sm:w-16 h-1 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold text-lg">
                      3
                    </div>
                    <p className="text-xs mt-2 font-medium text-gray-500 dark:text-gray-400">
                      Confirmação
                    </p>
                  </div>
                </div>
              </div>

              <Card className="shadow-lg dark:shadow-2xl dark:shadow-black/20">
                <form onSubmit={handleAdminSubmit}>
                  <CardContent className="p-6 sm:p-8 space-y-8">
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                      <legend className="text-lg font-semibold mb-4 col-span-1 md:col-span-2">
                        Dados Pessoais
                      </legend>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="admin-nome">Nome Completo *</Label>
                        <Input
                          id="admin-nome"
                          name="nome"
                          value={dadosAdmin.nome}
                          onChange={handleAdminChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-cpf">CPF *</Label>
                        <Input
                          id="admin-cpf"
                          name="cpf"
                          value={dadosAdmin.cpf}
                          onChange={handleAdminChange}
                          placeholder="000.000.000-00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-birthDate">
                          Data de nascimento *
                        </Label>
                        <Input
                          id="admin-birthDate"
                          name="birthDate"
                          type="date"
                          value={dadosAdmin.birthDate}
                          onChange={handleAdminChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-birthCity">
                          Cidade de nascimento *
                        </Label>
                        <Input
                          id="admin-birthCity"
                          name="birthCity"
                          value={dadosAdmin.birthCity}
                          onChange={handleAdminChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-birthState">
                          Estado de nascimento *
                        </Label>
                        <Input
                          id="admin-birthState"
                          name="birthState"
                          value={dadosAdmin.birthState}
                          onChange={handleAdminChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Email de Acesso *</Label>
                        <Input
                          id="admin-email"
                          name="email"
                          type="email"
                          value={dadosAdmin.email}
                          onChange={handleAdminChange}
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-telefone">
                          Telefone / WhatsApp *
                        </Label>
                        <Input
                          id="admin-telefone"
                          name="telefone"
                          value={dadosAdmin.telefone}
                          onChange={handleAdminChange}
                          placeholder="(00) 00000-0000"
                          required
                        />
                      </div>
                    </fieldset>

                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                      <legend className="text-lg font-semibold mb-4 col-span-1 md:col-span-2">
                        Informações de Membro
                      </legend>
                      <div className="space-y-2">
                        <Label htmlFor="admin-cargo">Cargo na Igreja *</Label>
                        <Input
                          id="admin-cargo"
                          name="cargo"
                          value={dadosAdmin.cargo}
                          onChange={handleAdminChange}
                          placeholder="Ex: Pastor, Secretário(a)"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-memberSince">
                          Membro desde *
                        </Label>
                        <Input
                          id="admin-memberSince"
                          name="memberSince"
                          type="date"
                          value={dadosAdmin.memberSince}
                          onChange={handleAdminChange}
                          required
                        />
                      </div>
                      <div className="flex items-center gap-4 pt-6 md:col-span-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="admin-isBaptized"
                            checked={dadosAdmin.isBaptized}
                            onCheckedChange={(checked) =>
                              setDadosAdmin((prev) => ({
                                ...prev,
                                isBaptized: !!checked,
                              }))
                            }
                          />
                          <Label htmlFor="admin-isBaptized">É batizado?</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="admin-isTither"
                            checked={dadosAdmin.isTither}
                            onCheckedChange={(checked) =>
                              setDadosAdmin((prev) => ({
                                ...prev,
                                isTither: !!checked,
                              }))
                            }
                          />
                          <Label htmlFor="admin-isTither">É dizimista?</Label>
                        </div>
                      </div>
                      {dadosAdmin.isBaptized && (
                        <div className="space-y-2 animate-in fade-in-50">
                          <Label htmlFor="admin-baptizedDate">
                            Data do batismo *
                          </Label>
                          <Input
                            id="admin-baptizedDate"
                            name="baptizedDate"
                            type="date"
                            value={dadosAdmin.baptizedDate}
                            onChange={handleAdminChange}
                            required
                          />
                        </div>
                      )}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="admin-notes">Notas (opcional)</Label>
                        <Input
                          id="admin-notes"
                          name="notes"
                          value={dadosAdmin.notes}
                          onChange={handleAdminChange}
                        />
                      </div>
                    </fieldset>

                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                      <legend className="text-lg font-semibold mb-4 col-span-1 md:col-span-2">
                        Credenciais de Acesso
                      </legend>
                      <div className="space-y-2">
                        <Label htmlFor="admin-senha">Crie uma Senha *</Label>
                        <div className="relative">
                          <Input
                            id="admin-senha"
                            name="senha"
                            type={showPassword ? "text" : "password"}
                            value={dadosAdmin.senha}
                            onChange={handleAdminChange}
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-confirmar-senha">
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
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </fieldset>

                    <fieldset className="space-y-8">
                      <legend className="text-lg font-semibold mb-4">
                        Pagamento
                      </legend>
                      <div className="space-y-2">
                        <Label htmlFor="billingType">
                          Forma de pagamento *
                        </Label>
                        <Select
                          value={billingType}
                          onValueChange={(value) =>
                            setBillingType(value as "CREDIT_CARD" | "PIX")
                          }
                          required
                        >
                          <SelectTrigger id="billingType">
                            <SelectValue placeholder="Selecione o pagamento" />
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
                        <div className="space-y-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg animate-in fade-in-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                            <h3 className="text-md font-semibold md:col-span-2">
                              Dados do Cartão
                            </h3>
                            <div className="space-y-2">
                              <Label>Nome no Cartão *</Label>
                              <Input
                                value={creditCard.holderName}
                                onChange={(e) =>
                                  setCreditCard((prev) => ({
                                    ...prev,
                                    holderName: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Número do Cartão *</Label>
                              <Input
                                value={creditCard.number}
                                onChange={(e) =>
                                  setCreditCard((prev) => ({
                                    ...prev,
                                    number: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Mês (MM)</Label>
                                <Input
                                  value={creditCard.expiryMonth}
                                  onChange={(e) =>
                                    setCreditCard((prev) => ({
                                      ...prev,
                                      expiryMonth: e.target.value,
                                    }))
                                  }
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Ano (AA)</Label>
                                <Input
                                  value={creditCard.expiryYear}
                                  onChange={(e) =>
                                    setCreditCard((prev) => ({
                                      ...prev,
                                      expiryYear: e.target.value,
                                    }))
                                  }
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>CCV</Label>
                                <Input
                                  value={creditCard.ccv}
                                  onChange={(e) =>
                                    setCreditCard((prev) => ({
                                      ...prev,
                                      ccv: e.target.value,
                                    }))
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                            <h3 className="text-md font-semibold md:col-span-2">
                              Informações do Titular do Cartão
                            </h3>
                            <div className="space-y-2">
                              <Label>Nome Completo *</Label>
                              <Input
                                value={creditCardHolderInfo.name}
                                onChange={(e) =>
                                  setCreditCardHolderInfo((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Email *</Label>
                              <Input
                                value={creditCardHolderInfo.email}
                                onChange={(e) =>
                                  setCreditCardHolderInfo((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>CPF/CNPJ *</Label>
                              <Input
                                value={creditCardHolderInfo.cpfCnpj}
                                onChange={(e) =>
                                  setCreditCardHolderInfo((prev) => ({
                                    ...prev,
                                    cpfCnpj: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Telefone *</Label>
                              <Input
                                value={creditCardHolderInfo.phone}
                                onChange={(e) =>
                                  setCreditCardHolderInfo((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>CEP *</Label>
                              <Input
                                value={creditCardHolderInfo.postalCode}
                                onChange={(e) =>
                                  setCreditCardHolderInfo((prev) => ({
                                    ...prev,
                                    postalCode: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Número do Endereço *</Label>
                              <Input
                                value={creditCardHolderInfo.addressNumber}
                                onChange={(e) =>
                                  setCreditCardHolderInfo((prev) => ({
                                    ...prev,
                                    addressNumber: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </fieldset>

                    <div className="flex items-start space-x-3 pt-4">
                      <Checkbox
                        id="aceitar-termos"
                        checked={dadosAdmin.aceitarTermos}
                        onCheckedChange={handleCheckboxChange}
                        required
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="aceitar-termos" className="font-medium">
                          Concordo com os termos e condições
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                      <div className="text-destructive text-sm font-medium">
                        {error}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50">
                    <div className="flex justify-between w-full">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep("igreja")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                      </Button>
                      <Button
                        type="submit"
                        disabled={!dadosAdmin.aceitarTermos || isPending}
                        size="lg"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Enviando...
                          </>
                        ) : (
                          "Finalizar Cadastro"
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </div>
          )}

          {/* ===== PASSO 3: CONFIRMAÇÃO ===== */}
          {currentStep === "confirmacao" && (
            <div className="max-w-2xl mx-auto w-full text-center">
              <div className="flex justify-center items-center mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full mb-6">
                <PartyPopperIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                Cadastro Realizado!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-xl mx-auto">
                Seu cadastro foi concluído com sucesso. Seu pagamento esta sendo
                analisado
              </p>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/login">Ir para o Login</Link>
                </Button>
              </div>
            </div>
          )}

          {/* ===== PASSO 4: PAGAMENTO PIX ===== */}
          {currentStep === "pix-pagamento" && pixCheckout && (
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  Falta pouco!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Para ativar sua conta, realize o pagamento do plano via PIX.
                </p>
              </div>
              <Card className="shadow-lg dark:shadow-2xl dark:shadow-black/20 text-center">
                <CardHeader>
                  <CardTitle className="text-2xl">Pagamento via PIX</CardTitle>
                  <CardDescription>
                    Escaneie o QR Code ou use o Copia e Cola
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {pixCheckout.pixQrCode && (
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg">
                      <img
                        src={pixCheckout.pixQrCode}
                        alt="QR Code PIX"
                        className="w-56 h-56"
                      />
                    </div>
                  )}
                  {pixCheckout.payload && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Chave PIX Copia e Cola
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={pixCheckout.payload}
                          readOnly
                          className="text-xs tracking-tighter"
                        />
                        <Button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              pixCheckout.payload || ""
                            )
                          }
                          variant="outline"
                          size="icon"
                        >
                          <span className="sr-only">Copiar</span>
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-8">
                        <Button asChild size="lg">
                          <Link href="/login">Ir para o Login</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex-col gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50">
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Após o pagamento, seu plano será ativada automaticamente.
                  </p>
                  <Button asChild size="lg">
                    <Link href="/login">Ir para o Login</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto py-6 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-center md:text-left">
              <Logo size="sm" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} MyChurch. Todos os direitos
                reservados.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/suporte"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Suporte
              </Link>
              <Link
                href="/privacidade"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Privacidade
              </Link>
              <Link
                href="/termos"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
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
