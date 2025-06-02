// Repositório de feed
import type { FeedPost, CreateFeedPostRequest, UpdateFeedPostRequest } from "../types/feed.types"
import { feedService } from "../services/feed.service"

export interface FeedRepository {
  findAll(): Promise<FeedPost[]>
  findById(id: string): Promise<FeedPost>
  create(post: CreateFeedPostRequest): Promise<FeedPost>
  update(post: UpdateFeedPostRequest): Promise<FeedPost>
  delete(id: string): Promise<void>
}

export class ApiFeedRepository implements FeedRepository {
  async findAll(): Promise<FeedPost[]> {
    return feedService.getAll()
  }

  async findById(id: string): Promise<FeedPost> {
    return feedService.getById(id)
  }

  async create(post: CreateFeedPostRequest): Promise<FeedPost> {
    return feedService.create(post)
  }

  async update(post: UpdateFeedPostRequest): Promise<FeedPost> {
    return feedService.update(post)
  }

  async delete(id: string): Promise<void> {
    return feedService.delete(id)
  }
}

export const feedRepository = new ApiFeedRepository()
