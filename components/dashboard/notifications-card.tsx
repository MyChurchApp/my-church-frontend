"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NotificationsCardProps {
  notifications: any[]
  hasMoreNotifications: boolean
  loadMoreNotifications: () => void
  getNotificationIcon: (type: string) => string
  getNotificationBadge: (type: string) => string
}

export function NotificationsCard({
  notifications,
  hasMoreNotifications,
  loadMoreNotifications,
  getNotificationIcon,
  getNotificationBadge,
}: NotificationsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Notificações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Nenhuma notificação</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 p-2 rounded-md ${notification.read ? "" : "bg-blue-50"}`}
            >
              <div className="mt-0.5 text-lg">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(notification.date).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                    {getNotificationBadge(notification.type)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {hasMoreNotifications && (
          <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700" onClick={loadMoreNotifications}>
            Ver mais notificações
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
