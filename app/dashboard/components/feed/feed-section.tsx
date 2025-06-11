"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Heart, Plus, Send, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ApiFeedItem, ApiFeedResponse } from "@/lib/api";
import type { Notification } from "@/lib/fake-api";
import type { ReactNode } from "react";

interface FeedSectionProps {
  isLoadingFeed: boolean;
  feedError: string | null;
  feedItems: ApiFeedItem[];
  feedResponse: ApiFeedResponse | null;
  notifications: Notification[];
  visibleNotifications: number;
  showRealFeed: boolean;
  showFakeNotifications: boolean;
  isAuthenticated: boolean;
  isNewPostModalOpen: boolean;
  newPostContent: string;
  isCreatingPost: boolean;
  isEditModalOpen: boolean;
  editPostContent: string;
  isSavingEdit: boolean;
  isDeleteDialogOpen: boolean;
  isDeletingPost: boolean;
  userId?: string;
  onLoadFeed: () => void;
  onLoadMoreNotifications: () => void;
  onOpenNewPostModal: () => void;
  onCloseNewPostModal: () => void;
  onNewPostContentChange: (content: string) => void;
  onCreatePost: () => void;
  onEditPost: (item: ApiFeedItem) => void;
  onCloseEditModal: () => void;
  onEditPostContentChange: (content: string) => void;
  onSaveEdit: () => void;
  onDeletePost: (item: ApiFeedItem) => void;
  onCloseDeleteDialog: () => void;
  onConfirmDeletePost: () => void;
  canUserEditOrDeletePost: (item: ApiFeedItem) => boolean;
  formatApiTimeAgo: (date: string) => string;
  formatTimeAgo: (date: Date) => string;
  getInitials: (name: string | undefined | null) => string;
  getNotificationIcon: (type: string) => ReactNode;
  getNotificationBadge: (type: string) => string;
}

export function FeedSection({
  isLoadingFeed,
  feedError,
  feedItems,
  feedResponse,
  notifications,
  visibleNotifications,
  showRealFeed,
  showFakeNotifications,
  isAuthenticated,
  isNewPostModalOpen,
  newPostContent,
  isCreatingPost,
  isEditModalOpen,
  editPostContent,
  isSavingEdit,
  isDeleteDialogOpen,
  isDeletingPost,
  onLoadFeed,
  onLoadMoreNotifications,
  onOpenNewPostModal,
  onCloseNewPostModal,
  onNewPostContentChange,
  onCreatePost,
  onEditPost,
  onCloseEditModal,
  onEditPostContentChange,
  onSaveEdit,
  onDeletePost,
  onCloseDeleteDialog,
  onConfirmDeletePost,
  canUserEditOrDeletePost,
  formatApiTimeAgo,
  formatTimeAgo,
  getInitials,
  getNotificationIcon,
  getNotificationBadge,
}: FeedSectionProps) {
  const displayedNotifications = notifications.slice(0, visibleNotifications);
  const hasMoreNotifications = visibleNotifications < notifications.length;

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">
          {showRealFeed
            ? "Feed da Igreja"
            : showFakeNotifications
            ? "Mural da Igreja"
            : "Feed da Igreja"}
        </h2>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/doacoes">
            <Button
              size="sm"
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <Heart className="h-4 w-4 mr-2" />
              Doar
            </Button>
          </Link>
          {isAuthenticated && (
            <>
              <Button
                size="sm"
                style={{ backgroundColor: "#89f0e6", color: "#000" }}
                className="hover:opacity-90"
                onClick={onOpenNewPostModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Publicação
              </Button>

              <Dialog
                open={isNewPostModalOpen}
                onOpenChange={onCloseNewPostModal}
              >
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Publicação</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="content">Conteúdo</Label>
                      <Textarea
                        id="content"
                        placeholder="O que você gostaria de compartilhar?"
                        value={newPostContent}
                        onChange={(e) => onNewPostContentChange(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={onCreatePost}
                        disabled={!newPostContent.trim() || isCreatingPost}
                        className="flex-1"
                      >
                        {isCreatingPost ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Publicando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Publicar
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onCloseNewPostModal}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Loading do Feed */}
      {isLoadingFeed && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando feed...</p>
        </div>
      )}

      {/* Erro do Feed */}
      {feedError && !isLoadingFeed && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 mb-2">
              <Users className="h-12 w-12 mx-auto mb-3" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Erro ao carregar feed
            </h3>
            <p className="text-red-600 text-sm mb-4">{feedError}</p>
            <Button
              onClick={onLoadFeed}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      {/* Conteúdo do Feed */}
      {!isLoadingFeed && !feedError && (
        <div className="space-y-4 md:space-y-6">
          {showRealFeed
            ? // Feed real da API
              feedItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10">
                        <AvatarImage
                          src={
                            item.member.photo ||
                            "/placeholder.svg?height=40&width=40&query=church+member"
                          }
                        />
                        <AvatarFallback className="text-xs md:text-sm">
                          {getInitials(item.member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm md:text-base">
                            {item.member.name || "Usuário"}
                          </p>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                            Publicação
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs md:text-sm text-gray-600">
                            {formatApiTimeAgo(item.created)}
                          </p>
                          {canUserEditOrDeletePost(item) && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEditPost(item)}
                                className="hover:bg-gray-100 rounded-full h-8 w-8"
                                title="Editar publicação"
                              >
                                <Pencil className="h-4 w-4 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeletePost(item)}
                                className="hover:bg-red-50 rounded-full h-8 w-8"
                                title="Deletar publicação"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-gray-700 text-sm md:text-base whitespace-pre-wrap">
                      {item.content}
                    </p>

                    {item.likesCount > 0 && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-gray-600">
                          {item.likesCount} curtidas
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            : showFakeNotifications
            ? // Feed fake (notificações)
              displayedNotifications.map((notification) => (
                <Card key={notification.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback className="text-xs md:text-sm">
                          {getInitials(notification.author)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm md:text-base">
                            {notification.author || "Usuário"}
                          </p>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {getNotificationBadge(notification.type)}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 mb-3">
                      {getNotificationIcon(notification.type)}
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                        {notification.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 mb-4 text-sm md:text-base">
                      {notification.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            : // Mensagem quando não há posts
              isAuthenticated && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    Nenhuma publicação ainda
                  </p>
                  <p className="text-gray-400 text-sm">
                    Seja o primeiro a compartilhar algo!
                  </p>
                </div>
              )}

          {/* Botão Ver Mais - apenas para feed fake */}
          {showFakeNotifications && hasMoreNotifications && (
            <div className="text-center py-6">
              <Button
                onClick={onLoadMoreNotifications}
                variant="outline"
                className="px-8 py-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              >
                Ver mais posts ({notifications.length - visibleNotifications}{" "}
                restantes)
              </Button>
            </div>
          )}

          {/* Informações de paginação - apenas para feed real */}
          {showRealFeed && feedResponse && (
            <div className="text-center py-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Mostrando {feedResponse.items.length} de{" "}
                {feedResponse.totalCount} publicações
              </p>
              {feedResponse.totalPages > 1 && (
                <p className="text-xs text-gray-400 mt-1">
                  Página {feedResponse.pageNumber} de {feedResponse.totalPages}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={onCloseEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Publicação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                placeholder="Edite sua publicação"
                value={editPostContent}
                onChange={(e) => onEditPostContentChange(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={onSaveEdit}
                disabled={!editPostContent.trim() || isSavingEdit}
                className="flex-1"
              >
                {isSavingEdit ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onCloseEditModal}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta publicação? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingPost}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDeletePost}
              disabled={isDeletingPost}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingPost ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
