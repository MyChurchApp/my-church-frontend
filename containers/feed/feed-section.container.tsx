"use client";

import { useState, useEffect } from "react";
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

      // LikeStates mock - produção precisa melhorar
      const newLikeStates: Record<
        number,
        { isLiked: boolean; likesCount: number; loading: boolean }
      > = {};
      feedData.items.forEach((item) => {
        if (!likeStates[item.id]) {
          newLikeStates[item.id] = {
            isLiked: isPostLikedByUser(item.id),
            likesCount: item.likesCount,
            loading: false,
          };
        }
      });
      if (Object.keys(newLikeStates).length > 0) {
        setLikeStates((prev) => ({ ...prev, ...newLikeStates }));
      }
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

  const handleCreatePost = async (content: string, imagesBase64?: string[]) => {
    const postId = await createFeedPost(content, imagesBase64);
    await loadFeed(1, false);
    return postId;
  };

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

  const handleDeletePost = async (postId: number) => {
    await deleteFeedPost(postId);
    setFeedItems((prev) => prev.filter((item) => item.id !== postId));
  };

  const handleLikePost = async (postId: number) => {
    // Mínimo viável para funcionar, ajuste para sua lógica real se quiser
    setLikeStates((prev) => ({
      ...prev,
      [postId]: {
        isLiked: !prev[postId]?.isLiked,
        likesCount:
          (prev[postId]?.likesCount || 0) + (prev[postId]?.isLiked ? -1 : 1),
        loading: false,
      },
    }));
  };

  const handleLoadMore = async () => {
    if (hasMore && !loading) await loadFeed(currentPage + 1, true);
  };

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
