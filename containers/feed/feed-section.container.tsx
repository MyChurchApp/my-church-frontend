"use client";

import { useState, useEffect } from "react";
import {
  getFeed,
  createFeedPost,
  updateFeedPost,
  deleteFeedPost,
  toggleLikeFeedPost,
  type FeedItem,
  type FeedResponse,
} from "@/services/feed.service";
import { FeedSectionMobile } from "@/app/dashboard/components/feed/FeedSectionMobile";

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

  // Carrega o feed
  const loadFeed = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const feedData: FeedResponse = await getFeed(page, 10);

      if (append) setFeedItems((prev) => [...prev, ...feedData.items]);
      else setFeedItems(feedData.items || []);

      setCurrentPage(feedData.pageNumber);
      setTotalPages(feedData.totalPages);
      setHasMore(feedData.pageNumber < feedData.totalPages);

      // Prepara estados de like (carrega do backend)
      const newLikeStates: Record<
        number,
        { isLiked: boolean; likesCount: number; loading: boolean }
      > = {};
      feedData.items.forEach((item) => {
        newLikeStates[item.id] = {
          isLiked: !!item.likedForMember,
          likesCount: item.likesCount,
          loading: false,
        };
      });
      setLikeStates((prev) => ({ ...prev, ...newLikeStates }));
    } catch (error) {
      setError("Erro ao carregar feed. Tente novamente.");
      if (!append) setFeedItems([]);
    } finally {
      if (!append) setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
    // eslint-disable-next-line
  }, []);

  // Cria post
  const handleCreatePost = async (content: string, imagesBase64?: string[]) => {
    const postId = await createFeedPost(content, imagesBase64);
    await loadFeed(1, false);
    return postId;
  };

  // Atualiza post
  const handleUpdatePost = async (postId: number, content: string) => {
    await updateFeedPost(postId, content);
    setFeedItems((prev) =>
      prev.map((item) =>
        item.id === postId
          ? { ...item, content, updated: new Date().toISOString() }
          : item
      )
    );
  };

  // Deleta post
  const handleDeletePost = async (postId: number) => {
    await deleteFeedPost(postId);
    setFeedItems((prev) => prev.filter((item) => item.id !== postId));
  };

  // Toggle Like/Unlike
  const handleLikePost = async (postId: number) => {
    const currentState = likeStates[postId] || {
      isLiked: false,
      likesCount: 0,
    };
    setLikeStates((prev) => ({
      ...prev,
      [postId]: {
        ...currentState,
        loading: true,
      },
    }));

    try {
      await toggleLikeFeedPost(postId, currentState.isLiked);
      setLikeStates((prev) => ({
        ...prev,
        [postId]: {
          isLiked: !currentState.isLiked,
          likesCount: currentState.likesCount + (currentState.isLiked ? -1 : 1),
          loading: false,
        },
      }));

      setFeedItems((prev) =>
        prev.map((item) =>
          item.id === postId
            ? {
                ...item,
                likesCount: item.likesCount + (currentState.isLiked ? -1 : 1),
                // Se quiser, pode adicionar o campo likedForMember aqui também:
                likedForMember: !currentState.isLiked,
              }
            : item
        )
      );
    } catch {
      setLikeStates((prev) => ({
        ...prev,
        [postId]: {
          ...currentState,
          loading: false,
        },
      }));
    }
  };

  // Carregar mais
  const handleLoadMore = async () => {
    if (hasMore && !loading) await loadFeed(currentPage + 1, true);
  };

  // Refresh
  const handleRefresh = async () => {
    setCurrentPage(1);
    setFeedItems([]);
    await loadFeed(1, false);
  };

  return (
    <FeedSectionMobile
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
