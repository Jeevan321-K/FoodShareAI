"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"
import { useEffect, useState } from "react"
import { Bell, Search, Plus, User, Settings, LogOut, Leaf, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)

  const [unreadCount, setUnreadCount] = useState(0)

  const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"

  useEffect(() => {
    // 1. Sync User Session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error("Session error:", err)
      }
    }

    // 2. Fetch Real-time Notification Count
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await fetch(`${API_URL}/notifications/count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.count)
        }
      } catch (err) {
        console.error("Navbar fetch error:", err)
      }
    }

    fetchUnreadCount()
    // Optional: Refresh count every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [API_URL])

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/landing")
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      
      {/* Logo */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground tracking-tight">FoodShareAI</span>
        </Link>
      </div>

      {/* Dynamic Search Bar */}
      <div className="hidden flex-1 max-w-md mx-8 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search food, NGOs..."
            className="w-full pl-10 bg-secondary/50 border-border focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user?.role === "donor" && (
          <Link href="/add-food">
            <Button size="sm" className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Food</span>
            </Button>
          </Link>
        )}

        {/* Dynamic Notification Badge */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative hover:bg-secondary">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full p-1 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground border-2 border-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </Link>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "Guest User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || "Connect to save progress"}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/profile" className="flex w-full items-center">
                <User className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings" className="flex w-full items-center">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}