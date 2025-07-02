"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RefreshCw,
  Edit,
  Trash2,
  Heart,
  ImagePlus,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MessageCircle,
  Repeat2,
  Check,
  Share2,
} from "lucide-react";
import {
  formatTimeAgo,
  type FeedItem,
  type PostLikeState,
} from "@/services/feed.service";
import { FileService } from "@/services/fileService/File";

// Imports do Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Estilos do Swiper (garanta que estão importados no seu CSS global)
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Tipagem para as imagens do post
interface FeedPostImage {
  id: number;
  feedPostId: number;
  fileName: string;
  created: string;
}

// Props do componente principal
interface FeedSectionProps {
  feedItems: FeedItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  likeStates: PostLikeState;
  onCreatePost: (content: string, imagesBase64?: string[]) => Promise<number>;
  onUpdatePost: (postId: number, content: string) => Promise<void>;
  onDeletePost: (postId: number) => Promise<void>;
  onLikePost: (postId: number) => Promise<void>;
  onLoadMore: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

function PostImage({ fileName, alt }: { fileName: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    async function fetchImage() {
      if (!fileName) {
        setUrl(null);
        return;
      }
      try {
        if (fileName.startsWith("http")) {
          setUrl(fileName);
        } else {
          const blob = await FileService.downloadFile(fileName);
          if (cancelled) return;
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      } catch {
        if (!cancelled) setUrl(null);
      }
    }
    fetchImage();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileName]);

  if (!url) {
    return (
      <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>
    );
  }
  return <img src={url} alt={alt} className="w-full h-full object-contain" />;
}

function PostImageGallery({
  images,
  alt,
}: {
  images: FeedPostImage[];
  alt: string;
}) {
  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full group mt-3">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: `.next-btn-${images[0]?.id}`,
          prevEl: `.prev-btn-${images[0]?.id}`,
        }}
        pagination={{ clickable: true, dynamicBullets: true }}
        loop={images.length > 1}
        className="rounded-xl border border-gray-200 dark:border-gray-800"
      >
        {images.map((image, index) => (
          <SwiperSlide key={image.id}>
            {/* O contêiner agora tem uma altura máxima para não estourar a tela */}
            <div className="w-full max-h-[65vh] md:max-h-[520px] aspect-square bg-black flex items-center justify-center">
              <PostImage
                fileName={image.fileName}
                alt={`${alt} - Imagem ${index + 1} de ${images.length}`}
              />
            </div>
          </SwiperSlide>
        ))}
        {images.length > 1 && (
          <>
            <Button
              className={`prev-btn-${images[0]?.id} absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/75 h-8 w-8 transition-opacity opacity-0 group-hover:opacity-100`}
              size="icon"
              variant="ghost"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              className={`next-btn-${images[0]?.id} absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/75 h-8 w-8 transition-opacity opacity-0 group-hover:opacity-100`}
              size="icon"
              variant="ghost"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </Swiper>
    </div>
  );
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// ==================================================================
// | COMPONENTE PRINCIPAL DO FEED - FeedSectionMobile               |
// ==================================================================
export function FeedSectionMobile({
  feedItems,
  loading,
  error,
  hasMore,
  likeStates,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  onLikePost,
  onLoadMore,
  onRefresh,
}: FeedSectionProps) {
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImagesBase64, setNewPostImagesBase64] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("Usuário");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.nameid || "");
        setCurrentUserName(payload.name || "Usuário");
      } catch (e) {
        console.error("Failed to parse auth token:", e);
      }
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const base64Promises = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(base64Promises).then((base64s) => {
      setNewPostImagesBase64((prev) => [...prev, ...base64s]);
    });
    e.target.value = "";
  };

  const handleRemoveNewPostImage = (indexToRemove: number) => {
    setNewPostImagesBase64((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() && newPostImagesBase64.length === 0) return;
    try {
      setSubmitting(true);
      setActionError(null);
      await onCreatePost(newPostContent.trim(), newPostImagesBase64);
      setNewPostContent("");
      setNewPostImagesBase64([]);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Erro ao criar o post."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPost = (post: FeedItem) => {
    setEditingPost(post.id);
    setEditContent(post.content);
    setActionError(null);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !editingPost) return;
    try {
      setSubmitting(true);
      setActionError(null);
      await onUpdatePost(editingPost, editContent.trim());
      setEditingPost(null);
      setEditContent("");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Erro ao atualizar o post."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (
      !confirm(
        "Tem certeza que deseja apagar este post? A ação não pode ser desfeita."
      )
    )
      return;
    try {
      setActionError(null);
      await onDeletePost(postId);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Erro ao apagar o post."
      );
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await onLoadMore();
    setLoadingMore(false);
  };

  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);

  const handleSharePost = async (postId: number) => {
    const postUrl = `${window.location.origin}/posts/${postId}`;

    const shareData = {
      title: "Confira este post!",
      text: `Veja o que eu encontrei na comunidade:`,
      url: postUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Compartilhamento cancelado pelo usuário.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        setCopiedPostId(postId);
        setTimeout(() => setCopiedPostId(null), 2000);
      } catch (err) {
        console.error(
          "Falha ao copiar o link para a área de transferência",
          err
        );
        alert("Não foi possível copiar o link.");
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newPostContent]);

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            {error}{" "}
            <Button variant="link" onClick={() => onRefresh()}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-black text-black dark:text-white">
      <header className=" top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold">Feed</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Atualizar Feed"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      <main>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          {actionError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}
          <div className="flex space-x-3">
            <div className="w-full">
              <Textarea
                ref={textareaRef}
                placeholder="O que está acontecendo?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 resize-none p-0 text-lg placeholder:text-gray-500"
                rows={1}
              />
              {newPostImagesBase64.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {newPostImagesBase64.map((img, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 hover:bg-black/80"
                        onClick={() => handleRemoveNewPostImage(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-900">
                <div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    aria-label="Adicionar Imagem"
                  >
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-blue-500"
                    >
                      <ImagePlus className="h-5 w-5" />
                    </label>
                  </Button>
                </div>
                <Button
                  onClick={handleSubmitPost}
                  disabled={
                    (!newPostContent.trim() &&
                      newPostImagesBase64.length === 0) ||
                    submitting
                  }
                  size="sm"
                  className="rounded-full font-bold"
                >
                  {submitting ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {loading && feedItems.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-4 border-b border-gray-200 dark:border-gray-800 animate-pulse"
            >
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : feedItems.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="font-bold text-lg">Nenhuma publicação por aqui</p>
            <p className="text-sm">Seja o primeiro a compartilhar algo!</p>
          </div>
        ) : (
          <div>
            {feedItems.map((post) => (
              <article
                key={post.id}
                className="p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex space-x-3">
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 flex-shrink min-w-0">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-sm text-gray-600 dark:text-gray-300">
                            {post.member.photo ? (
                              <img
                                src={post.member.photo}
                                alt={post.member.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-blue-600">
                                {getInitials(post.member.name)}
                              </span>
                            )}
                          </span>
                        </div>
                        <p className="font-bold text-base text-black dark:text-white truncate">
                          {post.member?.name || "Usuário Anônimo"}
                        </p>
                        <span className="flex-shrink-0">·</span>
                        <time dateTime={post.created} className="flex-shrink-0">
                          {formatTimeAgo(post.created)}
                        </time>
                        {post.updated && (
                          <span className="text-xs italic flex-shrink-0">
                            (editado)
                          </span>
                        )}
                      </div>
                      {post.memberId.toString() === currentUserId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 -mr-2 flex-shrink-0"
                            >
                              <MoreHorizontal className="h-5 w-5 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleEditPost(post)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Apagar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {editingPost === post.id ? (
                      <div className="mt-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[80px] text-base"
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={submitting || !editContent.trim()}
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPost(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      post.content && (
                        <p className="text-base whitespace-pre-wrap my-1 break-words">
                          {post.content}
                        </p>
                      )
                    )}

                    <PostImageGallery
                      images={post.feedPostImages || []}
                      alt={`Post de ${post.member?.name || "usuário"}`}
                    />

                    <div className="flex items-center justify-around mt-4 -ml-2 text-gray-500 dark:text-gray-400">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSharePost(post.id)}
                        className="flex items-center space-x-2 hover:text-green-500 w-24" // w-24 para dar espaço ao texto
                        disabled={copiedPostId === post.id} // Desabilita enquanto mostra o feedback
                      >
                        {copiedPostId === post.id ? (
                          <>
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="text-xs text-green-500">
                              Copiado!
                            </span>
                          </>
                        ) : (
                          <Share2 className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLikePost(post.id)}
                        disabled={likeStates[post.id]?.loading}
                        className={`flex items-center space-x-2 hover:text-red-500 ${
                          likeStates[post.id]?.isLiked ? "text-red-500" : ""
                        }`}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            likeStates[post.id]?.isLiked ? "fill-current" : ""
                          }`}
                        />
                        <span className="text-xs font-mono tabular-nums">
                          {likeStates[post.id]?.likesCount ?? post.likesCount}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {hasMore && (
              <div className="text-center p-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Carregando mais..." : "Carregar mais"}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
