"use client";

import { useState, useEffect, useRef } from "react";
import { FeedSection } from "../../components/feed/feed-section";
import {
  getFeed,
  createFeedPost,
  updateFeedPost,
  deleteFeedPost,
  toggleLikeFeedPost,
  isPostLikedByUser,
  type FeedItem,
  type FeedResponse,
} from "@/services/feed.service";
import { CloudCog } from "lucide-react";
import { FileService } from "@/services/fileService/File";

export default function FeedSectionContainer() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [likeStates, setLikeStates] = useState<
    Record<number, { isLiked: boolean; likesCount: number; loading: boolean }>
  >({});

  const loadFeed = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);

      const feedData: FeedResponse = await getFeed(page, 10);

      if (append) {
        setFeedItems((prev) => [...prev, ...feedData.items]);
      } else {
        setFeedItems(feedData.items || []);
      }

      setCurrentPage(feedData.pageNumber);
      setTotalPages(feedData.totalPages);
      setHasMore(feedData.pageNumber < feedData.totalPages);

      // Inicializar estados de like para novos posts usando localStorage
      const newLikeStates: Record<
        number,
        { isLiked: boolean; likesCount: number; loading: boolean }
      > = {};
      feedData.items.forEach((item) => {
        if (!likeStates[item.id]) {
          newLikeStates[item.id] = {
            isLiked: isPostLikedByUser(item.id), // Verificar no localStorage
            likesCount: item.likesCount,
            loading: false,
          };
        }
      });

      if (Object.keys(newLikeStates).length > 0) {
        setLikeStates((prev) => ({ ...prev, ...newLikeStates }));
      }
    } catch (error) {
      console.error("Erro ao carregar feed:", error);
      setError("Erro ao carregar feed. Tente novamente.");
      if (!append) {
        setFeedItems([]);
      }
    } finally {
      if (!append) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleCreatePost = async (content: string) => {
    try {
      const postId = await createFeedPost(content);

      // Recarregar o feed para mostrar o novo post
      await loadFeed(1, false);

      return postId;
    } catch (error) {
      console.error("Erro ao criar post:", error);
      throw error;
    }
  };

  const handleUpdatePost = async (postId: number, content: string) => {
    try {
      await updateFeedPost(postId, content);

      // Atualizar o post na lista local
      setFeedItems((prev) =>
        prev.map((item) =>
          item.id === postId
            ? { ...item, content, updated: new Date().toISOString() }
            : item
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar post:", error);
      throw error;
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deleteFeedPost(postId);

      // Remover o post da lista local
      setFeedItems((prev) => prev.filter((item) => item.id !== postId));
    } catch (error) {
      console.error("Erro ao deletar post:", error);
      throw error;
    }
  };

  const handleLikePost = async (postId: number) => {
    const currentState = likeStates[postId];
    const isCurrentlyLiked = currentState?.isLiked || false;

    // Atualizar estado otimisticamente
    setLikeStates((prev) => ({
      ...prev,
      [postId]: {
        isLiked: !isCurrentlyLiked,
        likesCount:
          (currentState?.likesCount || 0) + (isCurrentlyLiked ? -1 : 1),
        loading: true,
      },
    }));

    try {
      // Usar a função inteligente de toggle que detecta automaticamente o estado
      const result = await toggleLikeFeedPost(postId);

      // Atualizar o estado final com base no resultado da API
      setLikeStates((prev) => ({
        ...prev,
        [postId]: {
          isLiked: result.isLiked,
          likesCount:
            (currentState?.likesCount || 0) + (result.isLiked ? 1 : -1),
          loading: false,
        },
      }));

      // Recarregar feed para obter dados atualizados da API
      await loadFeed(1, false);
    } catch (error) {
      // Reverter estado em caso de erro
      setLikeStates((prev) => ({
        ...prev,
        [postId]: {
          isLiked: isCurrentlyLiked,
          likesCount: currentState?.likesCount || 0,
          loading: false,
        },
      }));

      console.error("Erro ao curtir/descurtir post:", error);
      throw error;
    }
  };

  const handleLoadMore = async () => {
    if (hasMore && !loading) {
      await loadFeed(currentPage + 1, true);
    }
  };

  const handleRefresh = async () => {
    setCurrentPage(1);
    setFeedItems([]);
    await loadFeed(1, false);
  };

  console.log(feedItems);
  return (
    <FeedSection
      feedItems={feedItems}
      loading={loading}
      error={error}
      hasMore={hasMore}
      likeStates={likeStates}
      onCreatePost={handleCreatePost}
      onUpdatePost={handleUpdatePost}
      onDeletePost={handleDeletePost}
      onLikePost={handleLikePost}
      onLoadMore={handleLoadMore}
      onRefresh={handleRefresh}
    />
  );
}
