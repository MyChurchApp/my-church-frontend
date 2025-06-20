"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getChurchData, type Church } from "@/services/church.service";
import { Building2, Users, Calendar, Phone, MapPin } from "lucide-react";

export default function IgrejaPage() {
  const [churchData, setChurchData] = useState<Church | null>(null);
  const [planLimits, setPlanLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChurchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const fullData = await getChurchData();

      setChurchData(fullData);
    } catch (err) {
      console.error("Erro ao carregar dados da igreja:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChurchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">
              Erro ao carregar dados
            </CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadChurchData} variant="outline">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!churchData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Nenhum dado encontrado</CardTitle>
            <CardDescription>
              Não foi possível carregar as informações da igreja.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{churchData.name}</h1>
        <p className="text-muted-foreground">
          Informações e configurações da sua igreja
        </p>
      </div>

      {/* Cards principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Informações básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Nome</p>
              <p className="text-sm text-muted-foreground">{churchData.name}</p>
            </div>

            {churchData.phone && (
              <div>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Telefone
                </p>
                <p className="text-sm text-muted-foreground">
                  {churchData.phone}
                </p>
              </div>
            )}

            {churchData.address && (
              <div>
                <p className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </p>
              </div>
            )}

            {churchData.description && (
              <div>
                <p className="text-sm font-medium">Descrição</p>
                <p className="text-sm text-muted-foreground">
                  {churchData.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plano e assinatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {planLimits?.hasActivePlan ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {planLimits.planName}
                  </span>
                  <Badge variant="default">Ativo</Badge>
                </div>

                <div>
                  <p className="text-sm font-medium">Preço</p>
                  <p className="text-lg font-bold">
                    R$ {planLimits.planPrice?.toFixed(2) || "0,00"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Membros</span>
                    <span>
                      {planLimits.currentMembers}/{planLimits.membersLimit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Eventos</span>
                    <span>0/{planLimits.eventsLimit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Armazenamento</span>
                    <span>0/{planLimits.storageLimit}GB</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Badge variant="destructive">Sem plano ativo</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Contrate um plano para acessar todos os recursos
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Debug info */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Debug - Dados da API</CardTitle>
        </CardHeader>
        <CardContent>
          <details className="text-xs">
            <summary className="cursor-pointer font-medium mb-2">
              Ver dados completos da igreja
            </summary>
            <pre className="bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(churchData, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
