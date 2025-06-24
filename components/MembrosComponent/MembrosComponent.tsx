"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import EditMemberModal from "./EditMemberModal";
import { MembrosPageProps } from "@/containers/Membros/Membro.types";
import { FileService } from "@/services/fileService/File";
import CreatMembroModal from "./CreatMembroModal";

// Avatar otimizado
interface MemberAvatarProps {
  photoFileName: string | null;
  initials: string;
  memberName: string;
}

function MemberAvatar({
  photoFileName,
  initials,
  memberName,
}: MemberAvatarProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastFileName = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function fetchPhoto() {
      if (!photoFileName || photoFileName === "foto-padrao.jpg") {
        setPhotoUrl(null);
        setIsLoading(false);
        lastFileName.current = photoFileName;
        return;
      }

      if (photoFileName === lastFileName.current) return; // não refaz se não mudou

      setIsLoading(true);
      try {
        const blob = await FileService.downloadFile(photoFileName);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPhotoUrl(objectUrl);
        lastFileName.current = photoFileName;
      } catch {
        setPhotoUrl(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchPhoto();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // Só atualiza se o nome mudar
  }, [photoFileName]);

  return (
    <Avatar className="h-12 w-12 shrink-0">
      {photoUrl ? (
        <AvatarImage src={photoUrl} alt={`Foto de ${memberName}`} />
      ) : photoFileName === "foto-padrao.jpg" ? (
        <AvatarImage src="/default-avatar.png" alt="Avatar padrão" />
      ) : null}
      <AvatarFallback className="bg-slate-200 text-slate-600">
        {isLoading && photoFileName ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          initials
        )}
      </AvatarFallback>
    </Avatar>
  );
}

export function MembrosComponent({
  members, // agora é members, não filteredMembers
  searchType,
  setSearchType,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  loading,
  error,
  isAdmin,
  handleEditMember,
  showEditModal,
  setShowEditModal,
  editingMember,
  handleMemberUpdated,
  handlePageChange,
  currentPage,
  totalPages,
  getInitials,
  formatDocument,
  isLoadingCounts,
  loadMembers,
  memberCounts,
}: MembrosPageProps) {
  const [pendingSearchTerm, setPendingSearchTerm] = useState(searchTerm);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <h3 className="text-lg font-medium text-slate-700">
            Carregando membros...
          </h3>
          <p className="text-sm text-slate-500">
            Por favor, aguarde um momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="bg-slate-50/50 min-h-screen p-4 sm:p-6 lg:p-8"
      aria-labelledby="page-title"
    >
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1
              id="page-title"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
            >
              Membros
            </h1>
            <p className="mt-1 text-slate-500">
              Gerencie os membros da sua organização.
            </p>
          </div>
          {isAdmin && (
            <div className="shrink-0 w-full sm:w-auto">
              <CreatMembroModal onMemberCreated={loadMembers} />
            </div>
          )}
        </header>

        {/* Estatísticas */}
        <section
          aria-labelledby="stats-title"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          <h2 id="stats-title" className="sr-only">
            Estatísticas
          </h2>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total de Membros
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-slate-900">
                    {isLoadingCounts ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      memberCounts?.total ?? "0"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Membros Ativos
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-slate-900">
                    {isLoadingCounts ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      memberCounts?.totalActive ?? "0"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Membros Inativos
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-slate-900">
                    {isLoadingCounts ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      memberCounts?.totalInactive ?? "0"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Filtros */}
        <div className="flex gap-2">
          <select
            value={searchType}
            onChange={(e) =>
              setSearchType(e.target.value as "Name" | "Email" | "Document")
            }
            className="border p-2 rounded-md"
          >
            <option value="Name">Nome</option>
            <option value="Email">Email</option>
            <option value="Document">CPF</option>
          </select>
          <Input
            value={pendingSearchTerm}
            onChange={(e) => setPendingSearchTerm(e.target.value)}
            placeholder={`Buscar por ${
              searchType === "Name"
                ? "nome"
                : searchType === "Email"
                ? "email"
                : "CPF"
            }`}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => setSearchTerm(pendingSearchTerm)}
            className="ml-2"
          >
            Pesquisar
          </Button>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-100 border-l-4 border-red-500 text-red-800 rounded-r-lg p-4 text-center"
          >
            <p className="font-medium">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMembers}
              className="mt-3 bg-white hover:bg-slate-50"
            >
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Lista de membros */}
        <section aria-live="polite">
          {members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {members.map((member: any) => (
                <Card
                  key={member.id}
                  className="group flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:border-slate-300"
                >
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <MemberAvatar
                          photoFileName={member.photo || "foto-padrao.jpg"}
                          initials={getInitials(member.name)}
                          memberName={member.name}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 truncate">
                            {member.name}
                          </h3>
                          <p className="text-sm text-slate-500 truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={member.isActive ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {member.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <dl className="flex-1 space-y-2 text-sm border-t border-slate-200 pt-3">
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">CPF:</dt>
                        <dd className="font-medium text-slate-700">
                          {formatDocument(member.document)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Telefone:</dt>
                        <dd className="font-medium text-slate-700">
                          {member.phone || "Não informado"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Batizado:</dt>
                        <dd className="font-medium text-slate-700">
                          {member.isBaptized ? "Sim" : "Não"}
                        </dd>
                      </div>
                    </dl>
                    {isAdmin && (
                      <div className="border-t border-slate-200 pt-3 mt-4 flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Excluir ${member.name}`}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-14 w-14 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {searchTerm
                    ? "Nenhum membro encontrado"
                    : "Nenhum membro cadastrado"}
                </h3>
                <p className="text-slate-500 mb-6 max-w-sm">
                  {searchTerm
                    ? "Tente refinar sua busca. Verifique se o nome, email ou CPF estão corretos."
                    : "Para começar, adicione um novo membro à sua lista."}
                </p>
                {isAdmin && !searchTerm && (
                  <CreatMembroModal onMemberCreated={loadMembers} />
                )}
              </CardContent>
            </Card>
          )}
        </section>

        {totalPages > 1 && (
          <footer className="flex items-center justify-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
              aria-label="Ir para a página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <span className="text-sm font-medium text-slate-600">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
              aria-label="Ir para a próxima página"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </footer>
        )}

        {showEditModal && editingMember && (
          <EditMemberModal
            member={editingMember}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onMemberUpdated={handleMemberUpdated}
          />
        )}
      </div>
    </main>
  );
}
