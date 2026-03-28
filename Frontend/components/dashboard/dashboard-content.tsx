"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Package,
  ListChecks,
  Building2,
  Trophy,
  Plus,
  MapPin,
  Clock,
  ArrowRight,
  Bell,
  TrendingUp,
} from "lucide-react"

// --- TYPES ---
type Food = {
  _id: string
  title: string
  images?: string[]
  category: string
  createdAt: string
  updatedAt: string
  quantity: {
    value: number
    unit: string
  }
  quality: string
  expiryTime: string
  pickupLocation?: {
    address: string
  }
  status: string
  matchedNgo?: {
    name: string
  } | null
}

type NotificationType = {
  id: string
  type: string
  title: string
  message: string
  time: string
  unread: boolean
}

type Contributor = {
  rank: number
  name: string
  score: number
  avatar: string
}

// --- HELPERS ---
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "available": return "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
    case "matched": return "bg-blue-500/20 text-blue-600 border-blue-500/30" // 👈 Add this
    case "pending": return "bg-orange-500/20 text-orange-600 border-orange-500/30" // 👈 Add this
    case "collected": return "bg-purple-500/20 text-purple-600 border-purple-500/30"
    case "expired": return "bg-destructive/20 text-destructive border-destructive/30"
    default: return "bg-muted text-muted-foreground"
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1: return "bg-warning/20 text-warning border-warning/30"
    case 2: return "bg-muted text-muted-foreground border-muted"
    case 3: return "bg-chart-3/20 text-chart-3 border-chart-3/30"
    default: return "bg-card text-muted-foreground border-border"
  }
}

// Replace the old urgency logic with this "Score-Aware" version
const getAiPriorityLabel = (food: Food) => {
  // If the backend already matched an NGO, it was a high-priority success
  if (food.status === "matched") return { label: "AI MATCHED", color: "bg-blue-500/20 text-blue-500" };
  
  // Use the expiry clock as a fallback
  const hoursLeft = (new Date(food.expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft < 3) return { label: "AI PRIORITY: CRITICAL", color: "bg-red-500/20 text-red-500" };
  if (hoursLeft < 8) return { label: "AI PRIORITY: HIGH", color: "bg-orange-500/20 text-orange-500" };
  
  return { label: "AI PRIORITY: STABLE", color: "bg-green-500/20 text-green-500" };
};

// Inside your .map():

function getUrgencyColor(level: string) {
  switch (level) {
    case "HIGH": return "bg-red-500/20 text-red-500"
    case "MEDIUM": return "bg-yellow-500/20 text-yellow-500"
    default: return "bg-green-500/20 text-green-500"
  }
}

export function DashboardContent() {
  const [foods, setFoods] = useState<Food[]>([])
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [ngoCount, setNgoCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [userScore, setUserScore] = useState(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Food
        const foodRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/food`)
        const foodData: Food[] = await foodRes.json()
        setFoods(foodData)

        // 2. Fetch NGO Count
        const ngoRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/ngos`)
        const ngoData = await ngoRes.json()
        setNgoCount(ngoData.length || 0)

        // 3. Dynamic Notifications based on data
        const liveNotifications: NotificationType[] = foodData.slice(0, 3).map((food, index) => ({
          id: food._id,
          type: index === 0 ? "nearby" : "expiring",
          title: index === 0 ? "New Food Alert!" : "AI Expiry Warning",
          message: index === 0 
            ? `New listing: ${food.quantity?.value || ''}${food.quantity?.unit} of ${food.title} nearby!` 
            : `Listing "${food.title}" requires urgent pickup.`,
          time: "Just now",
          unread: index === 0
        }))
        setNotifications(liveNotifications)

        const token = localStorage.getItem("token");
        if (token) {
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUserScore(userData.contributionScore || 0);
          }
        }

        const totalKg = foods
        .filter(f => f.status === "collected" || f.status === "matched")
        .reduce((acc, f) => acc + Number(f.quantity?.value || 0), 0)
        
        // 4. Fetch Contributors (Dynamic fallback for demo)
          const leaderboardRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/leaderboard`)
          const leaderboardData = await leaderboardRes.json()
          setContributors(leaderboardData.slice(0, 3).map((user: { name: string, contributionScore: number }, index: number) => ({
            rank: index + 1,
            name: user.name,
            score: user.contributionScore,
            avatar: user.name.charAt(0)
          })))

          // 5. Inside useEffect/fetchDashboardData:
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          })
          const userData = await userRes.json()
          setUserScore(userData.contributionScore || 0)

      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 15000)
    return () => clearInterval(interval)
  }, [])

  // --- STATS CALCULATION (Keep these after hooks, before return) ---
  const activeListings = foods.filter(f => f.status === "available").length
  const totalKg = foods.reduce((acc, f) => acc + Number(f.quantity?.value || 0), 0)
  const expiringSoon = foods.filter(f => {
    const hours = (new Date(f.expiryTime).getTime() - Date.now()) / (1000 * 60 * 60)
    return hours > 0 && hours < 6
  }).length

  const dynamicStats = [
    {
      title: "Total Food Donated",
      value: `${totalKg} kg`,
      change: "Live updates",
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Listings",
      value: activeListings,
      change: `${expiringSoon} expiring soon`,
      icon: ListChecks,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Nearby NGOs",
      value: ngoCount.toString(),
      change: "Registered in network",
      icon: Building2,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
  title: "Contribution Score",
  value: userScore.toLocaleString(), // Use the state variable here
  change: "Real-time impact",
  icon: Trophy,
  color: "text-yellow-500",
  bgColor: "bg-yellow-500/10",
},
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your impact overview.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/add-food"><Button className="gap-2"><Plus className="h-4 w-4" /> Add Food</Button></Link>
          <Link href="/ngos"><Button variant="outline" className="gap-2"><MapPin className="h-4 w-4" /> Find NGOs</Button></Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" />{stat.change}</p>
                </div>
                <div className={`rounded-lg p-3 ${stat.bgColor}`}><stat.icon className={`h-6 w-6 ${stat.color}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Recent Food Listings</CardTitle>
            <Link href="/listings"><Button variant="ghost" size="sm" className="gap-1">View all <ArrowRight className="h-4 w-4" /></Button></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p>Loading...</p>
              ) : foods.length === 0 ? (
                <p className="text-muted-foreground">No food listings yet 🚀</p>
              ) : (
                foods.map((listing) => {
  const priority = getAiPriorityLabel(listing);
  const isCooked = listing.category?.toLowerCase() === "cooked"
  
  // AI Prediction: High risk if cooked food is older than 4 hours
  const createdAtTime = listing.createdAt ? new Date(listing.createdAt).getTime() : Date.now()
  const hoursSinceCreation = (Date.now() - createdAtTime) / (1000 * 60 * 60)
  const dangerZone = isCooked && hoursSinceCreation > 4

  return (
  <div key={listing._id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50">
    <div className="flex items-center gap-4">
      {/* Icon Section */}
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
        <Package className="h-6 w-6 text-primary" />
      </div>
      
      <div className="flex flex-col gap-1">
        {/* Title & Spoilage Warning */}
        <div className="flex items-center gap-2">
          <p className="font-semibold text-card-foreground">{listing.title}</p>
          {dangerZone && (
            <Badge variant="destructive" className="animate-pulse text-[10px] h-5">
              AI WARNING: Spoilage Risk
            </Badge>
          )}
        </div>

        {/* NGO Matching Row */}
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">
            {listing.matchedNgo?.name ? (
              <span className="text-emerald-500 font-bold">
                Matched: {listing.matchedNgo.name}
              </span>
            ) : listing.status === "available" ? (
              <span className="text-muted-foreground italic flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                Open for Claims
              </span>
            ) : (
              <span className="text-orange-500 italic flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-pulse" />
                AI Searching...
              </span>
            )}
          </span>
        </div>

        {/* Metadata Row (Qty, Time, Location) */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-bold">
            {listing.quantity.value} {listing.quantity.unit}
          </span>
          <span className="flex items-center gap-1 bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded">
            <Clock className="h-3 w-3" />
            {new Date(listing.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="flex items-center gap-1 truncate max-w-[120px]">
            <MapPin className="h-3 w-3" /> 
            {listing.pickupLocation?.address || "Location set"}
          </span>
        </div>
      </div>
    </div>

    {/* Right Side: Status Badge & AI Priority */}
    <div className="flex flex-col items-end gap-2">
      <Badge className={`${getStatusColor(listing.status)} border-none capitalize text-[10px] px-2 py-0`}>
        {listing.status}
      </Badge>
      
      {/* The Dynamic AI Priority Badge */}
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border shadow-sm tracking-tighter ${priority.color}`}>
        {priority.label}
      </span>
    </div>
  </div>
)
})
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contributors.map((contributor) => (
                <div key={contributor.rank} className="flex items-center gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${getRankStyle(contributor.rank)}`}>
                    {contributor.rank}
                  </div>
                  <Avatar className="h-8 w-8">
                    {/* If the image fails, it will show the fallback initial */}
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contributor.name}`} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {contributor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{contributor.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">{contributor.score.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Section */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2"><Bell className="h-5 w-5" /> Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`flex items-start gap-4 rounded-lg border border-border p-4 transition-colors ${notification.unread ? "bg-primary/5 border-primary/20" : "bg-card"}`}>
                <div className={`mt-0.5 h-2 w-2 rounded-full ${notification.unread ? "bg-primary" : "bg-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{notification.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}