"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Package,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Heart,
  Trophy,
  Settings,
  Check,
  Trash2,
  Loader2,
} from "lucide-react"

// --- MAPPER FOR DYNAMIC ICONS ---
const getNotificationConfig = (type: string) => {
  switch (type.toLowerCase()) {
    case "claimed":
      return { icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" }
    case "expiring":
      return { icon: Clock, color: "text-warning", bgColor: "bg-warning/10" }
    case "nearby":
      return { icon: MapPin, color: "text-info", bgColor: "bg-info/10" }
    case "achievement":
      return { icon: Trophy, color: "text-warning", bgColor: "bg-warning/10" }
    case "ngo":
      return { icon: Heart, color: "text-chart-4", bgColor: "bg-chart-4/10" }
    case "expired":
      return { icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10" }
    case "system":
      return { icon: Settings, color: "text-muted-foreground", bgColor: "bg-muted" }
    default:
      return { icon: Bell, color: "text-primary", bgColor: "bg-primary/10" }
  }
}

type Notification = {
  _id: string
  type: string
  title: string
  message: string
  createdAt: string
  unread: boolean
}

export function NotificationsContent() {
  const [notificationList, setNotificationList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotificationList(data)
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notificationList.filter((n) => n.unread).length

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotificationList(prev => prev.map(n => ({ ...n, unread: false })))
    } catch (err) { console.error(err) }
  }

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotificationList(prev => prev.map(n => n._id === id ? { ...n, unread: false } : n))
    } catch (err) { console.error(err) }
  }

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotificationList(prev => prev.filter(n => n._id !== id))
    } catch (err) { console.error(err) }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your activities</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && <Badge className="bg-primary/20 text-primary">{unreadCount} unread</Badge>}
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" /> Mark all as read
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" /> All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificationList.map((notification) => {
              const { icon: Icon, color, bgColor } = getNotificationConfig(notification.type)
              return (
                <div
                  key={notification._id}
                  className={`group relative flex items-start gap-4 rounded-lg border p-4 transition-all ${
                    notification.unread ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border hover:bg-secondary/50"
                  }`}
                >
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgColor}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-card-foreground">{notification.title}</p>
                      {notification.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {notification.unread && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsRead(notification._id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteNotification(notification._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {notificationList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 opacity-20 mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-sm">You&apos;re all caught up!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}