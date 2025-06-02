"use client"

import type React from "react"
import { DashboardHeader } from "./dashboard-header"
import { CreatePostCard } from "./create-post-card"
import { FeedItems } from "./feed-items"
import { RotatingBanner } from "./rotating-banner"
import { NotificationsCard } from "./notifications-card"
import { BirthdaysCard } from "./birthdays-card"
import { PromoBanner } from "./promo-banner"
import { ProfileModal } from "./profile-modal"
import { NewPostModal } from "./new-post-modal"
import { EditPostModal } from "./edit-post-modal"
import { DeletePostDialog } from "./delete-post-dialog"

interface DashboardComponentProps {
  user: any
  isLoading: boolean
  notifications: any[]
  hasMoreNotifications: boolean
  feedItems: any[]
  isLoadingFeed: boolean
  birthdays: any[]
  banners: any[]
  promoBanners: any[]
  currentBannerIndex: number
  currentPromoIndex: number
  isProfileModalOpen: boolean
  isNewPostModalOpen: boolean
  newPostContent: string
  isCreatingPost: boolean
  editingUser: any
  userPhoto: string
  isEditModalOpen: boolean
  editingPost: any
  editPostContent: string
  isSavingEdit: boolean
  isDeleteDialogOpen: boolean
  postToDelete: any
  isDeletingPost: boolean

  // Setters
  setNewPostContent: (content: string) => void
  setEditingUser: (user: any) => void
  setEditPostContent: (content: string) => void

  // Funções
  nextBanner: () => void
  prevBanner: () => void
  nextPromo: () => void
  prevPromo: () => void
  loadMoreNotifications: () => void
  openProfileModal: () => void
  saveProfile: () => void
  handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleCreatePost: () => void
  handleEditPost: (item: any) => void
  handleSaveEdit: () => void
  handleDeletePost: (item: any) => void
  confirmDeletePost: () => void
  canUserEditOrDeletePost: (item: any) => boolean
  getInitials: (name: string | undefined | null) => string
  getNotificationIcon: (type: string) => string
  getNotificationBadge: (type: string) => string
  setIsProfileModalOpen: (open: boolean) => void
  setIsNewPostModalOpen: (open: boolean) => void
  setIsEditModalOpen: (open: boolean) => void
  setIsDeleteDialogOpen: (open: boolean) => void
}

export function DashboardComponent({
  user,
  isLoading,
  notifications,
  hasMoreNotifications,
  feedItems,
  isLoadingFeed,
  birthdays,
  banners,
  promoBanners,
  currentBannerIndex,
  currentPromoIndex,
  isProfileModalOpen,
  isNewPostModalOpen,
  newPostContent,
  isCreatingPost,
  editingUser,
  userPhoto,
  isEditModalOpen,
  editingPost,
  editPostContent,
  isSavingEdit,
  isDeleteDialogOpen,
  postToDelete,
  isDeletingPost,
  setNewPostContent,
  setEditingUser,
  setEditPostContent,
  nextBanner,
  prevBanner,
  nextPromo,
  prevPromo,
  loadMoreNotifications,
  openProfileModal,
  saveProfile,
  handlePhotoUpload,
  handleCreatePost,
  handleEditPost,
  handleSaveEdit,
  handleDeletePost,
  confirmDeletePost,
  canUserEditOrDeletePost,
  getInitials,
  getNotificationIcon,
  getNotificationBadge,
  setIsProfileModalOpen,
  setIsNewPostModalOpen,
  setIsEditModalOpen,
  setIsDeleteDialogOpen,
}: DashboardComponentProps) {
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <DashboardHeader user={user} openProfileModal={openProfileModal} getInitials={getInitials} />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Feed Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Create Post Card */}
              <CreatePostCard user={user} getInitials={getInitials} setIsNewPostModalOpen={setIsNewPostModalOpen} />

              {/* Feed Items */}
              <FeedItems
                isLoadingFeed={isLoadingFeed}
                feedItems={feedItems}
                getInitials={getInitials}
                canUserEditOrDeletePost={canUserEditOrDeletePost}
                handleEditPost={handleEditPost}
                handleDeletePost={handleDeletePost}
                setIsNewPostModalOpen={setIsNewPostModalOpen}
              />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Banner Rotativo */}
              <RotatingBanner
                banners={banners}
                currentBannerIndex={currentBannerIndex}
                nextBanner={nextBanner}
                prevBanner={prevBanner}
              />

              {/* Notificações */}
              <NotificationsCard
                notifications={notifications}
                hasMoreNotifications={hasMoreNotifications}
                loadMoreNotifications={loadMoreNotifications}
                getNotificationIcon={getNotificationIcon}
                getNotificationBadge={getNotificationBadge}
              />

              {/* Aniversariantes */}
              <BirthdaysCard birthdays={birthdays} getInitials={getInitials} />

              {/* Banner Promocional */}
              <PromoBanner
                promoBanners={promoBanners}
                currentPromoIndex={currentPromoIndex}
                nextPromo={nextPromo}
                prevPromo={prevPromo}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        setIsOpen={setIsProfileModalOpen}
        user={user}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        userPhoto={userPhoto}
        getInitials={getInitials}
        handlePhotoUpload={handlePhotoUpload}
        saveProfile={saveProfile}
      />

      <NewPostModal
        isOpen={isNewPostModalOpen}
        setIsOpen={setIsNewPostModalOpen}
        user={user}
        newPostContent={newPostContent}
        setNewPostContent={setNewPostContent}
        isCreatingPost={isCreatingPost}
        handleCreatePost={handleCreatePost}
        getInitials={getInitials}
      />

      <EditPostModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        editPostContent={editPostContent}
        setEditPostContent={setEditPostContent}
        isSavingEdit={isSavingEdit}
        handleSaveEdit={handleSaveEdit}
      />

      <DeletePostDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        isDeletingPost={isDeletingPost}
        confirmDeletePost={confirmDeletePost}
      />
    </div>
  )
}
