"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCard, Users, Shield, Loader2, Save } from "lucide-react";
import { isAuthenticated, getUserRole } from "@/lib/auth-utils";
import {
  getChurchData,
  updateChurchData,
  type Church,
} from "@/services/church.service";

import { ChurchIcon } from "lucide-react";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [churchData, setChurchData] = useState<Church | null>(null);

  const userRole = getUserRole();
  const isAdmin = userRole === "Admin";

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
      setError(null);

      const [church] = await Promise.all([getChurchData()]);

      setChurchData(church);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChurchData = async () => {
    if (!churchData) return;

    try {
      setSaving(true);
      setError(null);

      await updateChurchData(churchData);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      setError(
        "Não foi possível atualizar no momento. Tente novamente mais tarde."
      );
    } finally {
      setSaving(false);
    }
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
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

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
            <Users className="h-4 w-4 mr-2" />
            Dados Bancários
          </TabsTrigger>
        </TabsList>

        {/* Aba Igreja */}
        <TabsContent value="igreja">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Igreja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {churchData && (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={churchData.logo || undefined} />
                      <AvatarFallback>
                        <ChurchIcon className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        Alterar Logo
                      </Button>
                      <p className="text-sm text-muted-foreground mt-1">
                        Recomendado: 400x400px, PNG ou JPG
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
                          setChurchData({
                            ...churchData,
                            name: e.target.value,
                          })
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
                        <div>
                          <Label htmlFor="street">Rua</Label>
                          <Input
                            id="street"
                            value={churchData.address.street}
                            onChange={(e) =>
                              setChurchData({
                                ...churchData,
                                address: {
                                  ...churchData.address,
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
                                  ...churchData.address,
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
                                  ...churchData.address,
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
                                  ...churchData.address,
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
                                  ...churchData.address,
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
                                  ...churchData.address,
                                  country: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <div className="flex flex-col items-end gap-2">
                      <Button onClick={handleSaveChurchData} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Alterações
                          </>
                        )}
                      </Button>

                      {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Assinatura */}
        <TabsContent value="assinatura">
          <Card>
            <CardHeader>
              <CardTitle>Plano e Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              {churchData?.subscription && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        {churchData.subscription.plan.name}
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        Status:{" "}
                        <Badge variant="outline">
                          {churchData.subscription.isActive
                            ? "Ativa"
                            : "Inativa"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        R$ {churchData.subscription.plan.price}
                      </p>
                      <p className="text-sm text-muted-foreground">por mês</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Início da Assinatura</Label>
                      <p className="text-sm">
                        {new Date(
                          churchData.subscription.startDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label>Fim da Assinatura</Label>
                      <p className="text-sm">
                        {new Date(
                          churchData.subscription.endDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Recursos Inclusos</Label>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>
                        • Até {churchData.subscription.plan.maxMembers} membros
                      </li>
                      <li>
                        • Até {churchData.subscription.plan.maxEvents} eventos
                      </li>
                      <li>
                        • {churchData.subscription.plan.maxStorageGB}GB de
                        armazenamento
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">Alterar Plano</Button>
                    <Button variant="outline">Gerenciar Pagamento</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Usuários */}
        <TabsContent value="bancarios">
          <Card>
            <CardHeader>
              <CardTitle>Dados Bancários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Notificações */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
