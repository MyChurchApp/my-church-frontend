"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  AlertCircle,
  Calendar,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";
import { getUser, type User } from "@/lib/fake-api";
import {
  getWorshipServices,
  updateWorshipService,
  type WorshipService,
} from "@/services/worship.service";

export default function GestaoPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [worshipServices, setWorshipServices] = useState<WorshipService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      router.push("/login");
      return;
    }

    if (userData.accessLevel !== "admin") {
      router.push("/dashboard");
      return;
    }

    setUser(userData);
    loadWorshipServices();
  }, [router]);

  const loadWorshipServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const services = await getWorshipServices();
      setWorshipServices(services);
    } catch (err) {
      console.error("Erro ao carregar cultos:", err);
      setError(
        "Não foi possível carregar os cultos. Verifique sua conexão e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateService = async (
    serviceId: number,
    status: "started" | "finished"
  ) => {
    try {
      setUpdating(serviceId);
      await updateWorshipService(serviceId, { status });
      await loadWorshipServices();
    } catch (err) {
      console.error("Erro ao atualizar culto:", err);
      setError("Erro ao atualizar o status do culto.");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "not_started":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Não iniciado
          </Badge>
        );
      case "started":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Em andamento
          </Badge>
        );
      case "finished":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Finalizado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const notStartedServices = worshipServices.filter(
    (service) => service.status === "not_started"
  );
  const ongoingServices = worshipServices.filter(
    (service) => service.status === "started"
  );
  const finishedServices = worshipServices.filter(
    (service) => service.status === "finished"
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Culto</h1>
          <p className="text-gray-600">Gerencie os cultos da igreja</p>
        </div>
        <Button
          onClick={loadWorshipServices}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="not_started" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="not_started">
            Não iniciados ({notStartedServices.length})
          </TabsTrigger>
          <TabsTrigger value="ongoing">
            Em andamento ({ongoingServices.length})
          </TabsTrigger>
          <TabsTrigger value="finished">
            Finalizados ({finishedServices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="not_started">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notStartedServices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Não há cultos aguardando início.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {notStartedServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      {getStatusBadge(service.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {formatDate(service.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {formatTime(service.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {service.expectedAttendance || 0} pessoas esperadas
                        </span>
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-gray-600 mb-4">
                        {service.description}
                      </p>
                    )}
                    <Button
                      onClick={() => handleUpdateService(service.id, "started")}
                      disabled={updating === service.id}
                      className="w-full md:w-auto"
                    >
                      {updating === service.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Iniciando...
                        </>
                      ) : (
                        "Iniciar Culto"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ongoing">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : ongoingServices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Não há cultos em andamento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {ongoingServices.map((service) => (
                <Card key={service.id} className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      {getStatusBadge(service.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {formatDate(service.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {formatTime(service.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {service.actualAttendance || 0} pessoas presentes
                        </span>
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-gray-600 mb-4">
                        {service.description}
                      </p>
                    )}
                    <Button
                      onClick={() =>
                        handleUpdateService(service.id, "finished")
                      }
                      disabled={updating === service.id}
                      variant="outline"
                      className="w-full md:w-auto"
                    >
                      {updating === service.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Finalizando...
                        </>
                      ) : (
                        "Finalizar Culto"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="finished">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : finishedServices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Não há cultos finalizados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {finishedServices.map((service) => (
                <Card key={service.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      {getStatusBadge(service.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {formatDate(service.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {formatTime(service.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {service.actualAttendance || 0} pessoas presentes
                        </span>
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-gray-600 mt-4">
                        {service.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
