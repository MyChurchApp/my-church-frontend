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
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createChurchWithAdmin } from "@/services/registration/registration";
import { getAvailablePlans } from "@/services/church/plan";

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
  } = useQuery({
    queryKey: ["planos-disponiveis"],
    queryFn: getAvailablePlans,
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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-[9999]">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para página inicial</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 md:px-6">
        {currentStep === "igreja" && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                Cadastre sua igreja
              </h1>
              <p className="text-muted-foreground mt-2">
                Preencha os dados da sua igreja para começar a usar o MyChurch
              </p>
            </div>
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  1
                </div>
                <div className="mx-2 h-1 w-16 bg-primary"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium">
                  2
                </div>
                <div className="mx-2 h-1 w-16 bg-muted"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium">
                  3
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Informações da Igreja</CardTitle>
                <CardDescription>
                  Preencha os dados básicos da sua igreja ou organização
                  religiosa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIgrejaSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          placeholder="Ex: Batista, Católica, etc."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email da Igreja *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={dadosIgreja.email}
                        onChange={handleIgrejaChange}
                        placeholder="igreja@exemplo.com"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
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
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado *</Label>
                        <Select
                          value={dadosIgreja.estado}
                          onValueChange={(value) =>
                            handleSelectChange("estado", value)
                          }
                        >
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
                            <SelectItem value="MS">
                              Mato Grosso do Sul
                            </SelectItem>
                            <SelectItem value="MG">Minas Gerais</SelectItem>
                            <SelectItem value="PA">Pará</SelectItem>
                            <SelectItem value="PB">Paraíba</SelectItem>
                            <SelectItem value="PR">Paraná</SelectItem>
                            <SelectItem value="PE">Pernambuco</SelectItem>
                            <SelectItem value="PI">Piauí</SelectItem>
                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                            <SelectItem value="RN">
                              Rio Grande do Norte
                            </SelectItem>
                            <SelectItem value="RS">
                              Rio Grande do Sul
                            </SelectItem>
                            <SelectItem value="RO">Rondônia</SelectItem>
                            <SelectItem value="RR">Roraima</SelectItem>
                            <SelectItem value="SC">Santa Catarina</SelectItem>
                            <SelectItem value="SP">São Paulo</SelectItem>
                            <SelectItem value="SE">Sergipe</SelectItem>
                            <SelectItem value="TO">Tocantins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        <Label htmlFor="bairro">Bairro *</Label>
                        <Input
                          id="bairro"
                          name="bairro"
                          value={dadosIgreja.bairro}
                          onChange={handleIgrejaChange}
                          placeholder="Nome do bairro"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2 space-y-2">
                        <Label htmlFor="endereco">Endereço *</Label>
                        <Input
                          id="endereco"
                          name="endereco"
                          value={dadosIgreja.endereco}
                          onChange={handleIgrejaChange}
                          placeholder="Rua, Avenida, etc."
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        name="complemento"
                        value={dadosIgreja.complemento}
                        onChange={handleIgrejaChange}
                        placeholder="Sala, Andar, etc."
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          <div className="text-red-600 text-sm">
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
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">
                      Próximo: Dados do Administrador
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "administrador" && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                Cadastre o administrador
              </h1>
              <p className="text-muted-foreground mt-2">
                Preencha os dados do administrador principal que terá acesso ao
                sistema
              </p>
            </div>
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  ✓
                </div>
                <div className="mx-2 h-1 w-16 bg-primary"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  2
                </div>
                <div className="mx-2 h-1 w-16 bg-muted"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium">
                  3
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Informações do Administrador</CardTitle>
                <CardDescription>
                  Preencha os dados do responsável que administrará o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="admin-nome">Nome Completo *</Label>
                        <Input
                          id="admin-nome"
                          name="nome"
                          value={dadosAdmin.nome}
                          onChange={handleAdminChange}
                          placeholder="Nome completo"
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
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Email *</Label>
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
                        <Label htmlFor="admin-telefone">Telefone *</Label>
                        <Input
                          id="admin-telefone"
                          name="telefone"
                          value={dadosAdmin.telefone}
                          onChange={handleAdminChange}
                          placeholder="(00) 00000-0000"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-cargo">Cargo na Igreja *</Label>
                      <Input
                        id="admin-cargo"
                        name="cargo"
                        value={dadosAdmin.cargo}
                        onChange={handleAdminChange}
                        placeholder="Ex: Pastor, Secretário, Tesoureiro, etc."
                        required
                      />
                    </div>

                    {/* ...demais campos já existentes... */}

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
                    <div className="space-y-2 flex items-center gap-2">
                      <Checkbox
                        id="admin-isBaptized"
                        checked={dadosAdmin.isBaptized}
                        onCheckedChange={(checked) =>
                          setDadosAdmin((prev) => ({
                            ...prev,
                            isBaptized: !!checked, // força boolean
                          }))
                        }
                      />
                      <Label htmlFor="admin-isBaptized">É batizado?</Label>
                    </div>
                    {dadosAdmin.isBaptized && (
                      <div className="space-y-2">
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
                    <div className="space-y-2 flex items-center gap-2">
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

                    <div className="space-y-2">
                      <Label htmlFor="admin-memberSince">Membro desde *</Label>
                      <Input
                        id="admin-memberSince"
                        name="memberSince"
                        type="date"
                        value={dadosAdmin.memberSince}
                        onChange={handleAdminChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-notes">Notas (opcional)</Label>
                      <Input
                        id="admin-notes"
                        name="notes"
                        value={dadosAdmin.notes}
                        onChange={handleAdminChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="admin-senha">Senha *</Label>
                        <div className="relative">
                          <Input
                            id="admin-senha"
                            name="senha"
                            type={showPassword ? "text" : "password"}
                            value={dadosAdmin.senha}
                            onChange={handleAdminChange}
                            placeholder="••••••••"
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
                            placeholder="••••••••"
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
                        <>
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
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                              <Label>Validade (MM)</Label>
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
                              <Label>Validade (AA)</Label>
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
                          <div className="mt-4 font-semibold">
                            Informações do Titular
                          </div>
                          <div className="space-y-2">
                            <Label>Nome *</Label>
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
                            <Label>Número *</Label>
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
                        </>
                      )}
                    </div>
                    <div className="flex items-start space-x-3 pt-4">
                      <Checkbox
                        id="aceitar-termos"
                        checked={dadosAdmin.aceitarTermos}
                        onCheckedChange={handleCheckboxChange}
                        required
                      />
                      <div>
                        <Label htmlFor="aceitar-termos" className="font-medium">
                          Concordo com os termos e condições
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
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
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("igreja")}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={!dadosAdmin.aceitarTermos || isPending}
                    >
                      {isPending ? "Enviando..." : "Finalizar Cadastro"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "confirmacao" && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                Cadastro Realizado com Sucesso!
              </h1>
              <p className="text-muted-foreground mt-2">
                Seu cadastro foi concluído e você receberá um email com as
                instruções para acessar o sistema.
              </p>
            </div>
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  ✓
                </div>
                <div className="mx-2 h-1 w-16 bg-primary"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  ✓
                </div>
                <div className="mx-2 h-1 w-16 bg-primary"></div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                  ✓
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === "pix-pagamento" && pixCheckout && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                Finalize seu cadastro
              </h1>
              <p className="text-muted-foreground mt-2">
                Para ativar sua conta, realize o pagamento do plano via PIX.
              </p>
            </div>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">Pagamento via PIX</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Se futuramente vier pixQrCode: */}
                {pixCheckout.pixQrCode && (
                  <div className="mt-4">
                    <img
                      src={pixCheckout.pixQrCode}
                      alt="QR Code PIX"
                      className="mx-auto w-56 h-56"
                    />
                    <div className="text-xs mt-2 text-gray-600">
                      Escaneie o QR Code para pagar.
                    </div>
                  </div>
                )}
                {pixCheckout.payload && (
                  <div className="mt-6">
                    <Label>Chave PIX Copia e Cola:</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={pixCheckout.payload}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            pixCheckout.payload || ""
                          );
                        }}
                        variant="outline"
                      >
                        Copiar
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground block mt-2">
                      Copie e cole a chave PIX no seu aplicativo bancário.
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/">Voltar para página inicial</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-6 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} MyChurch. Todos os direitos
                reservados.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/suporte"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Suporte
              </Link>
              <Link
                href="/privacidade"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacidade
              </Link>
              <Link
                href="/termos"
                className="text-sm text-muted-foreground hover:text-foreground"
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
