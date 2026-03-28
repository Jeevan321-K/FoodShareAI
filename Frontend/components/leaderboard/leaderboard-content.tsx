"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, TrendingUp, Crown, Star, Loader2 } from "lucide-react"

// --- TYPES (Matching your User Model) ---
interface LeaderboardUser {
  _id: string
  name: string
  contributionScore: number
  avatar?: string
  totalDonations?: number // Assuming you track count
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1: return <Crown className="h-6 w-6 text-yellow-500" />
    case 2: return <Medal className="h-6 w-6 text-gray-400" />
    case 3: return <Award className="h-6 w-6 text-orange-400" />
    default: return null
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1: return "bg-yellow-500/10 border-yellow-500/30 shadow-lg shadow-yellow-500/10"
    case 2: return "bg-gray-400/10 border-gray-400/30"
    case 3: return "bg-orange-400/10 border-orange-400/30"
    default: return "bg-secondary/30 border-border"
  }
}

export function LeaderboardContent() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // 1. Get the current user ID from token (optional)
        const token = localStorage.getItem("token")
        if (token) {
          const userRes = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (userRes.ok) {
            const userData = await userRes.json()
            setCurrentUserId(userData._id)
          }
        }

        // 2. Fetch all users sorted by score
        const res = await fetch(`${API_URL}/users/leaderboard`) // Ensure this route exists
        if (res.ok) {
          const data = await res.json()
          setUsers(data)
        }
      } catch (err) {
        console.error("Leaderboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [API_URL])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Split users into Top 3 and the rest
  const topThree = users.slice(0, 3)
  const remainingUsers = users.slice(3)
  const myRank = users.findIndex(u => u._id === currentUserId) + 1
  const myData = users.find(u => u._id === currentUserId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground">Top contributors making a difference</p>
        </div>
        {myRank > 0 && (
          <Badge variant="outline" className="w-fit gap-2 border-primary/50 bg-primary/5 px-4 py-1">
            <Trophy className="h-4 w-4 text-primary" />
            Your Rank: #{myRank}
          </Badge>
        )}
      </div>

      {/* Top 3 Podium (Reordered for visual center: 2, 1, 3) */}
      <div className="grid gap-4 md:grid-cols-3">
        {[topThree[1], topThree[0], topThree[2]].map((user, index) => {
          if (!user) return null
          const actualRank = users.indexOf(user) + 1
          return (
            <Card
              key={user._id}
              className={`relative overflow-hidden transition-all hover:scale-[1.02] ${getRankStyle(actualRank)} ${actualRank === 1 ? "md:-mt-4 md:mb-4 border-yellow-500/50" : ""}`}
            >
              <CardContent className="p-6 text-center">
                <div className="absolute top-4 left-4">{getRankIcon(actualRank)}</div>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline">#{actualRank}</Badge>
                </div>
                <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-background">
                  <AvatarFallback className="text-xl font-bold bg-primary/10">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold truncate">{user.name}</h3>
                <Badge variant="secondary" className="mb-3">
                  {actualRank === 1 ? "Food Hero" : actualRank === 2 ? "Super Donor" : "Community Star"}
                </Badge>
                <div className="text-3xl font-bold text-primary mb-2">
                  {user.contributionScore.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Points Earned</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* "You" Highlight Row */}
      {myData && myRank > 3 && (
        <Card className="bg-primary/10 border-primary/30 animate-pulse-subtle">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              #{myRank}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{myData.name} <Badge className="ml-2">You</Badge></p>
              <p className="text-xs text-muted-foreground">Keep donating to reach the Top 3!</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">{myData.contributionScore.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Rankings Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-primary" />
            Community Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {remainingUsers.map((user, index) => (
              <div
                key={user._id}
                className={`flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-secondary/50 ${user._id === currentUserId ? "border-primary/40 bg-primary/5" : "border-border bg-secondary/20"}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  {index + 4}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name} {user._id === currentUserId && "(You)"}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="text-lg font-semibold text-primary">
                    {user.contributionScore.toLocaleString()}
                  </p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}