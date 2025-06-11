"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  donationsService,
  type DonationsFilters,
  type PaidDonationsResponse,
} from "@/services/donations.service";
import { DonationsFiltersComponent } from "@/components/donations/donations-filters";
import { DonationsTable } from "@/components/donations/donations-table";
import { DonationsPagination } from "@/components/donations/donations-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  ArrowLeft,
  Heart,
} from "lucide-react";

export default function DonationsHistoryPage() {
  const router = useRouter();
  const [donationsData, setDonationsData] =
    useState<PaidDonationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DonationsFilters>({
    page: 1,
    pageSize: 10,
  });

  const loadDonations = async (newFilters: DonationsFilters = filters) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await donationsService.getPaidDonations(newFilters);
      setDonationsData(data);
      setFilters(newFilters);
    } catch (err) {
      console.error("❌ Erro ao carregar ofertas:", err);
      setError("Ops, tente mais tarde");
      setDonationsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleFiltersChange = (newFilters: DonationsFilters) => {
    loadDonations(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    loadDonations(newFilters);
  };

  const handleRetry = () => {
    loadDonations();
  };

  const handleGoToDonations = () => {
    router.push("/dashboard/doacoes");
  };

  const handleGoBack = () => {
    router.back();
  };

  // Calcular estatísticas usando os campos corretos da API
  const totalValue =
    donationsData?.items.reduce((sum, donation) => sum + donation.amount, 0) ||
    0;
  const averageValue = donationsData?.items.length
    ? totalValue / donationsData.items.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                Histórico de Ofertas
              </h1>
              <p className="text-gray-600 mt-2">
                Visualize todas as suas ofertas pagas e confirmadas
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRetry}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Botões de Navegação */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <Button
            onClick={handleGoToDonations}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Heart className="h-4 w-4" />
            Fazer Oferta
          </Button>
        </div>

        {/* Erro */}
        {error && (
          <div className="flex items-center justify-center min-h-[400px]">
            <Alert className="max-w-md" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Conteúdo principal - só mostra se não houver erro */}
        {!error && (
          <>
            {/* Estatísticas */}
            {donationsData && !isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total de Ofertas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {donationsData.totalCount}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Valor Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {donationsService.formatCurrency(totalValue)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Valor Médio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {donationsService.formatCurrency(averageValue)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Página Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {donationsData.pageNumber} / {donationsData.totalPages}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filtros */}
            <div className="mb-6">
              <DonationsFiltersComponent
                onFiltersChange={handleFiltersChange}
                isLoading={isLoading}
              />
            </div>

            {/* Tabela */}
            <div className="mb-6">
              <DonationsTable
                donations={donationsData?.items || []}
                isLoading={isLoading}
              />
            </div>

            {/* Paginação */}
            {donationsData && donationsData.totalPages > 1 && (
              <DonationsPagination
                currentPage={donationsData.pageNumber}
                totalPages={donationsData.totalPages}
                totalCount={donationsData.totalCount}
                pageSize={donationsData.pageSize}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
