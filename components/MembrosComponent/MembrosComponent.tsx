"use client";
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
import ValidatedMemberModal from "@/components/validated-member-modal";

import EditMemberModal from "./EditMemberModal";
import { MembrosPageProps } from "@/containers/Membros/Membro.types";

export function MembrosComponent({
  filteredMembers,
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
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-500">Carregando membros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membros</h1>
          <p className="text-gray-600">Gerencie os membros da sua igreja</p>
        </div>
        {isAdmin && <ValidatedMemberModal onMemberCreated={loadMembers} />}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Membros</p>
                <p className="text-xl font-semibold">
                  {isLoadingCounts ? "..." : memberCounts?.total ?? "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Membros Ativos</p>
                <p className="text-xl font-semibold">
                  {isLoadingCounts ? "..." : memberCounts?.totalActive ?? "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Membros Inativos</p>
                <p className="text-xl font-semibold">
                  {isLoadingCounts
                    ? "..."
                    : memberCounts?.totalInactive ?? "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadMembers}
            className="mt-2"
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Members Grid */}
      {filteredMembers.length === 0 && !error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "Nenhum membro encontrado"
                : "Nenhum membro cadastrado"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Tente ajustar os termos de busca"
                : "Comece adicionando o primeiro membro da sua igreja"}
            </p>
            {isAdmin && !searchTerm && (
              <ValidatedMemberModal onMemberCreated={loadMembers} />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member: any) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.photo || undefined} />
                      <AvatarFallback>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  <Badge variant={member.isActive ? "default" : "secondary"}>
                    {member.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>CPF:</span>
                    <span>{formatDocument(member.document)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Telefone:</span>
                    <span>{member.phone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Batizado:</span>
                    <span>{member.isBaptized ? "Sim" : "Não"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dizimista:</span>
                    <span>{member.isTither ? "Sim" : "Não"}</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditMember(member)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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
  );
}
