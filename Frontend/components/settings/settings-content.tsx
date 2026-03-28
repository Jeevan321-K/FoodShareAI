"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Mail,
  Smartphone,
  Globe,
  Shield,
  Trash2,
  Download,
  LogOut,
  Loader2,
} from "lucide-react"

// --- Interfaces for TypeScript ---
interface NotificationSettings {
  email: boolean;
  push: boolean;
  foodNearby: boolean;
  expiring: boolean;
  claimed: boolean;
  achievements: boolean;
}

export function SettingsContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState("dark")
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    foodNearby: true,
    expiring: true,
    claimed: true,
    achievements: false,
  })

  const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"

  // 1. Fetch and Apply Settings on Mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/users/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (res.ok) {
          const data = await res.json()
          const savedTheme = data.theme || "dark"
          
          setNotifications(data.notifications || notifications)
          setTheme(savedTheme)
          
          // Apply theme class to HTML element
          if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [API_URL])

  // 2. Optimized Update Handler
  const updateSetting = async (
    key: string, 
    value: string | boolean, 
    category: 'notifications' | 'theme' | 'privacy'
  ) => {
    try {
      const token = localStorage.getItem("token")

      // Logic for Theme switching
      if (category === 'theme' && typeof value === 'string') {
        setTheme(value)
        if (value === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }

      // Logic for Notification toggles
      if (category === 'notifications' && typeof value === 'boolean') {
        setNotifications(prev => ({ ...prev, [key]: value }))
      }

      // Backend sync
      await fetch(`${API_URL}/users/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          [category]: category === 'notifications' 
            ? { ...notifications, [key]: value } 
            : value 
        })
      })
    } catch (err) {
      console.error("Update failed:", err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/landing")
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <section>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and notifications</p>
      </section>

      {/* Appearance Section */}
      <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks on your device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Theme Mode</Label>
              <p className="text-sm text-muted-foreground">Select between Light and Dark mode</p>
            </div>
            <Select value={theme} onValueChange={(val: string) => updateSetting('theme', val, 'theme')}>
              <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" /> Notifications
          </CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <NotificationToggle 
              icon={Mail} 
              label="Email Notifications" 
              checked={notifications.email}
              onCheckedChange={(val: boolean) => updateSetting('email', val, 'notifications')}
            />
            <NotificationToggle 
              icon={Smartphone} 
              label="Push Notifications" 
              checked={notifications.push}
              onCheckedChange={(val: boolean) => updateSetting('push', val, 'notifications')}
            />
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Alert Subscriptions</p>
            <NotificationToggle 
              label="Food Nearby" 
              checked={notifications.foodNearby}
              onCheckedChange={(val: boolean) => updateSetting('foodNearby', val, 'notifications')}
            />
            <NotificationToggle 
              label="Expiring Soon" 
              checked={notifications.expiring}
              onCheckedChange={(val: boolean) => updateSetting('expiring', val, 'notifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="bg-card border-border shadow-sm border-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <Shield className="h-5 w-5" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" /> Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Internal Sub-component ---
function NotificationToggle({ 
  icon: Icon, 
  label, 
  checked, 
  onCheckedChange 
}: { 
  icon?: any, 
  label: string, 
  checked: boolean, 
  onCheckedChange: (val: boolean) => void 
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        <Label className="text-sm font-medium">{label}</Label>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}