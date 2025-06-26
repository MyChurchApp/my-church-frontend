"use client";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  Send,
  Edit,
  Trash2,
  User,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  ImagePlus,
} from "lucide-react";
import {
  formatTimeAgo,
  type FeedItem,
  type PostLikeState,
} from "@/services/feed.service";
import { FileService } from "@/services/fileService/File";

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

// Componente para renderizar uma única imagem
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
      <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
    );
  }
  return <img src={url} alt={alt} className="w-full h-full object-cover" />;
}

// Componente para a galeria de imagens de um post
function PostImageGallery({
  images,
  alt,
}: {
  images: FeedPostImage[];
  alt: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!images || images.length === 0) return null;
  const goToPrevious = () =>
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goToNext = () =>
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const currentImage = images[currentIndex];

  return (
    <div className="relative w-full group mt-3">
      <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-100">
        <PostImage
          fileName={currentImage.fileName}
          alt={`${alt} - Imagem ${currentIndex + 1} de ${images.length}`}
        />
      </div>
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1.5">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === index ? "bg-white scale-125" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Componente principal do Feed
export function FeedSection({
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
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [newPostImagesBase64, setNewPostImagesBase64] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const getCurrentUserId = (): string => {
    if (typeof window === "undefined") return "";
    const token = localStorage.getItem("authToken");
    if (!token) return "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.nameid || payload.sub || payload.id || "";
    } catch {
      return "";
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewPostImages((prev) => [...prev, ...files]);
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((newBase64s) => {
      setNewPostImagesBase64((prev) => [...prev, ...newBase64s]);
    });
    e.target.value = "";
  };

  const handleRemoveNewPostImage = (indexToRemove: number) => {
    setNewPostImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setNewPostImagesBase64((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() && newPostImages.length === 0) return;
    try {
      setSubmitting(true);
      setActionError(null);
      await onCreatePost(newPostContent.trim(), newPostImagesBase64);
      setNewPostContent("");
      setNewPostImages([]);
      setNewPostImagesBase64([]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erro ao criar post");
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
        err instanceof Error ? err.message : "Erro ao editar post"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Tem certeza que deseja deletar este post?")) return;
    try {
      setActionError(null);
      await onDeletePost(postId);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Erro ao deletar post"
      );
    }
  };

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  };
  const currentUserId = getCurrentUserId();
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  function MemberAvatar({
    photoFileName,
    initials,
    memberName,
  }: {
    photoFileName: string | null;
    initials: string;
    memberName: string;
  }) {
    // Lógica do avatar...
  }
  if (error) {
    return (
      <Card>
        <CardHeader>...</CardHeader>
        <CardContent>...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Feed da Comunidade
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actionError && (
          <Alert variant="destructive">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2 border-b pb-4">
          <Textarea
            placeholder="Compartilhe algo com a comunidade..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-[80px]"
          />
          {newPostImagesBase64.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {newPostImagesBase64.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img
                    src={img}
                    alt={`preview ${idx + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-5 w-5 rounded-full"
                    onClick={() => handleRemoveNewPostImage(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center pt-2">
            <div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <Button asChild variant="outline">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex items-center"
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Adicionar Imagem
                </label>
              </Button>
            </div>
            <Button
              onClick={handleSubmitPost}
              disabled={
                (!newPostContent.trim() && newPostImages.length === 0) ||
                submitting
              }
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>

        {loading && feedItems.length === 0 ? (
          <div> {/* Skeleton... */} </div>
        ) : feedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum post encontrado.</p>
            <p className="text-sm">Seja o primeiro a compartilhar algo!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedItems.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-700">
                      {getInitials(post.member?.name || "U")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {post.member?.name || "Usuário"}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(post.created)}
                    </span>
                  </div>
                </div>
                {editingPost === post.id ? (
                  <div> {/* Edit form... */} </div>
                ) : (
                  post.content && (
                    <div className="text-sm pt-2">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      {post.updated && (
                        <p className="text-xs text-gray-400 mt-2">
                          Editado {formatTimeAgo(post.updated)}
                        </p>
                      )}
                    </div>
                  )
                )}

                <PostImageGallery
                  images={post.feedPostImages || []}
                  alt={`Post de ${post.member?.name || "usuário"}`}
                />

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLikePost(post.id)}
                    disabled={likeStates[post.id]?.loading}
                    className={`flex items-center space-x-1 ${
                      likeStates[post.id]?.isLiked
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        likeStates[post.id]?.isLiked ? "fill-current" : ""
                      }`}
                    />
                    <span className="text-xs">
                      {likeStates[post.id]?.likesCount ?? post.likesCount}
                    </span>
                  </Button>
                  {post.memberId.toString() === currentUserId && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Carregando..." : "Carregar mais"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
