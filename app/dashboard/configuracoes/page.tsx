"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CreditCard,
  Shield,
  Loader2,
  Save,
  ChurchIcon,
  Banknote,
  Upload,
} from "lucide-react";
import { isAuthenticated, getUser } from "@/lib/auth-utils";
import {
  getChurchData,
  updateChurchData,
  updateBankingInfo,
  type Church,
} from "@/services/church.service";
import { ChangePlanModal } from "@/components/configuracoes/ChangePlanModal";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [savingChurch, setSavingChurch] = useState(false);
  const [savingBanking, setSavingBanking] = useState(false);
  const [saveChurchError, setSaveChurchError] = useState<string | null>(null);
  const [saveBankingError, setSaveBankingError] = useState<string | null>(null);

  const [churchData, setChurchData] = useState<Church | null>(null);
  const logoUploadRef = useRef<HTMLInputElement>(null);

  const user = getUser();
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }
    loadData();
  }, [router, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const church = await getChurchData();
      setChurchData(church);
    } catch (error) {
      console.error("Erro ao carregar dados da igreja:", error);
      setLoadError(
        "Não foi possível carregar os dados. Tente recarregar a página."
      );
    } finally {
      setLoading(false);
    }
  };

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const handlePlanSuccessfullyChanged = () => {
    console.log("Plano alterado com sucesso! Recarregando dados...");
    loadData();
  };

  const handleSaveChurchData = async () => {
    if (!churchData) return;
    try {
      setSavingChurch(true);
      setSaveChurchError(null);
      await updateChurchData(churchData);
    } catch (error: any) {
      console.error("Erro ao salvar dados da igreja:", error);
      setSaveChurchError(
        error.message || "Não foi possível salvar. Tente novamente."
      );
    } finally {
      setSavingChurch(false);
    }
  };

  const handleSaveBankingInfo = async () => {
    if (!churchData?.bankingInfo) return;
    try {
      setSavingBanking(true);
      setSaveBankingError(null);
      await updateBankingInfo(churchData.bankingInfo);
    } catch (error: any) {
      console.error("Erro ao salvar dados bancários:", error);
      setSaveBankingError(
        error.message || "Não foi possível salvar. Tente novamente."
      );
    } finally {
      setSavingBanking(false);
    }
  };

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setSaveChurchError("Formato de arquivo inválido. Use PNG ou JPG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveChurchError("A imagem é muito grande. O máximo é 2MB.");
      return;
    }

    try {
      const base64Logo = await fileToBase64(file);
      if (churchData) {
        setChurchData({ ...churchData, logo: base64Logo });
      }
    } catch (error) {
      console.error("Erro ao converter imagem:", error);
      setSaveChurchError("Erro ao processar a imagem.");
    }
  };

  const handleLogoButtonClick = () => {
    logoUploadRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao Carregar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{loadError}</p>
            <Button onClick={loadData}>Tentar Novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-6">
            <Shield className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Negado
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <Tabs defaultValue="igreja" className="space-y-6">
        <TabsList>
          <TabsTrigger value="igreja">
            <ChurchIcon className="h-4 w-4 mr-2" />
            Igreja
          </TabsTrigger>
          <TabsTrigger value="assinatura">
            <CreditCard className="h-4 w-4 mr-2" />
            Assinatura
          </TabsTrigger>
          <TabsTrigger value="bancarios">
            <Banknote className="h-4 w-4 mr-2" />
            Dados Bancários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="igreja">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Igreja</CardTitle>
            </CardHeader>
            <CardContent>
              {churchData && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={churchData.logo || undefined} />
                      <AvatarFallback>
                        <ChurchIcon className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Input
                        type="file"
                        ref={logoUploadRef}
                        onChange={handleLogoChange}
                        className="hidden"
                        accept="image/png, image/jpeg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogoButtonClick}
                        disabled={savingChurch}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Alterar Logo
                      </Button>
                      <p className="text-sm text-muted-foreground mt-1">
                        Recomendado: 400x400px, PNG ou JPG (Máx 2MB)
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="churchName">Nome da Igreja</Label>
                      <Input
                        id="churchName"
                        value={churchData.name}
                        onChange={(e) =>
                          setChurchData({ ...churchData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="churchPhone">Telefone</Label>
                      <Input
                        id="churchPhone"
                        value={churchData.phone}
                        onChange={(e) =>
                          setChurchData({
                            ...churchData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="churchDescription">Descrição</Label>
                    <Textarea
                      id="churchDescription"
                      value={churchData.description}
                      onChange={(e) =>
                        setChurchData({
                          ...churchData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  {churchData.address && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Endereço</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Address fields */}
                        <div>
                          <Label htmlFor="street">Rua</Label>
                          <Input
                            id="street"
                            value={churchData.address.street}
                            onChange={(e) =>
                              setChurchData({
                                ...churchData,
                                address: {
                                  ...churchData.address!,
                                  street: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="neighborhood">Bairro</Label>
                          <Input
                            id="neighborhood"
                            value={churchData.address.neighborhood}
                            onChange={(e) =>
                              setChurchData({
                                ...churchData,
                                address: {
                                  ...churchData.address!,
                                  neighborhood: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            value={churchData.address.city}
                            onChange={(e) =>
                              setChurchData({
                                ...churchData,
                                address: {
                                  ...churchData.address!,
                                  city: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            value={churchData.address.state}
                            onChange={(e) =>
                              setChurchData({
                                ...churchData,
                                address: {
                                  ...churchData.address!,
                                  state: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">CEP</Label>
                          <Input
                            id="zipCode"
                            value={churchData.address.zipCode}
                            onChange={(e) =>
                              setChurchData({
                                ...churchData,
                                address: {
                                  ...churchData.address!,
                                  zipCode: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">País</Label>
                          <Input
                            id="country"
                            value={churchData.address.country}
                            onChange={(e) =>
                              setChurchData({
                                ...churchData,
                                address: {
                                  ...churchData.address!,
                                  country: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t">
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        onClick={handleSaveChurchData}
                        disabled={savingChurch || loading}
                      >
                        {savingChurch ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Salvar Alterações
                            da Igreja
                          </>
                        )}
                      </Button>
                      {saveChurchError && (
                        <p className="text-sm text-red-600">
                          {saveChurchError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assinatura">
          <Card>
            <CardHeader>
              <CardTitle>Plano e Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              {churchData?.subscription ? (
                <div className="space-y-6">
                  {/* Seção de Status e Preço */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        {churchData.subscription.plan.name}
                      </h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        Status:{" "}
                        <Badge
                          variant={
                            churchData.subscription.isActive
                              ? "default"
                              : "destructive"
                          }
                        >
                          {churchData.subscription.isActive
                            ? "Ativa"
                            : "Inativa"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        R$ {churchData.subscription.plan.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">por mês</p>
                    </div>
                  </div>

                  {/* Seção de Datas */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Início da Assinatura</Label>
                      <p className="text-sm font-medium">
                        {new Date(
                          churchData.subscription.startDate
                        ).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <Label>Próxima Cobrança</Label>
                      <p className="text-sm font-medium">
                        {new Date(
                          churchData.subscription.endDate
                        ).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {/* Seção de Recursos */}
                  <div>
                    <Label>Recursos Inclusos no seu Plano</Label>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>
                        • Até {churchData.subscription.plan.maxMembers} membros
                      </li>
                      <li>
                        • Até {churchData.subscription.plan.maxEvents} eventos
                        por mês
                      </li>
                      <li>
                        • {churchData.subscription.plan.maxStorageGB}GB de
                        armazenamento
                      </li>
                    </ul>
                  </div>

                  {/* Seção de Ações */}
                  <div className="flex gap-2 border-t pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsPlanModalOpen(true)}
                    >
                      Alterar Plano
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Nenhuma assinatura ativa encontrada.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {churchData?.subscription && (
          <ChangePlanModal
            isOpen={isPlanModalOpen}
            onClose={() => setIsPlanModalOpen(false)}
            currentPlanId={churchData.subscription.plan.id}
            subscriptionId={churchData.subscription.id}
            onPlanChanged={handlePlanSuccessfullyChanged}
          />
        )}

        <TabsContent value="bancarios">
          <Card>
            <CardHeader>
              <CardTitle>Dados Bancários da Igreja</CardTitle>
            </CardHeader>
            <CardContent>
              {churchData?.bankingInfo ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-6 sm:col-span-3">
                      <Label htmlFor="bankName">Nome do Banco</Label>
                      <Input
                        id="bankName"
                        value={churchData.bankingInfo.bankName}
                        onChange={(e) =>
                          setChurchData({
                            ...churchData,
                            bankingInfo: {
                              ...churchData.bankingInfo!,
                              bankName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Label htmlFor="agency">Agência</Label>
                      <Input
                        id="agency"
                        value={churchData.bankingInfo.agency}
                        onChange={(e) =>
                          setChurchData({
                            ...churchData,
                            bankingInfo: {
                              ...churchData.bankingInfo!,
                              agency: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <Label htmlFor="account">Número da Conta</Label>
                      <Input
                        id="account"
                        value={churchData.bankingInfo.account}
                        onChange={(e) =>
                          setChurchData({
                            ...churchData,
                            bankingInfo: {
                              ...churchData.bankingInfo!,
                              account: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="accountDigit">Dígito</Label>
                      <Input
                        id="accountDigit"
                        value={churchData.bankingInfo.accountDigit}
                        onChange={(e) =>
                          setChurchData({
                            ...churchData,
                            bankingInfo: {
                              ...churchData.bankingInfo!,
                              accountDigit: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <Label htmlFor="accountType">Tipo de Conta</Label>
                      <Input
                        id="accountType"
                        value={churchData.bankingInfo.accountType}
                        onChange={(e) =>
                          setChurchData({
                            ...churchData,
                            bankingInfo: {
                              ...churchData.bankingInfo!,
                              accountType: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="col-span-6">
                      <Label htmlFor="holderName">Nome do Titular</Label>
                      <Input
                        id="holderName"
                        value={churchData.bankingInfo.holderName}
                        onChange={(e) =>
                          setChurchData({
                            ...churchData,
                            bankingInfo: {
                              ...churchData.bankingInfo!,
                              holderName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Label htmlFor="holderDocument">
                        CPF/CNPJ do Titular
                      </Label>
                      <Input
                        id="holderDocument"
                        value={churchData.bankingInfo.holderDocument}
                        onChange={(e) =>
                          setChurchData({
                            ...churchData,
                            bankingInfo: {
                              ...churchData.bankingInfo!,
                              holderDocument: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Label htmlFor="pixKey">Chave PIX</Label>
                      <Input
                        id="pixKey"
                        value={churchData.bankingInfo.pixKey}
                        onChange={(e) =>
                          setChurchData({
                            ...churchData,
                            bankingInfo: {
                              ...churchData.bankingInfo!,
                              pixKey: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        onClick={handleSaveBankingInfo}
                        disabled={savingBanking}
                      >
                        {savingBanking ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Salvar Dados
                            Bancários
                          </>
                        )}
                      </Button>
                      {saveBankingError && (
                        <p className="text-sm text-red-600">
                          {saveBankingError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Nenhuma informação bancária cadastrada.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
