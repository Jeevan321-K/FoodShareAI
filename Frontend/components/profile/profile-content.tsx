"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Building2,
  MapPin,
  Phone,
  Trophy,
  Package,
  Calendar,
  Camera,
  Save,
  Award,
  TrendingUp,
  Loader2,
} from "lucide-react"

export function ProfileContent() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    location: "",
    bio: "",
    contributionScore: 0,
    totalDonations: 0,
    foodSaved: "0 kg",
    rank: 0,
    createdAt: "",
  })

  const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"

  // 1. Fetch User Profile on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          // Merge fetched data with defaults
          setUserData((prev) => ({
            ...prev,
            ...data,
            // Fallbacks for stats if not in DB yet
            rank: data.rank || "N/A",
            foodSaved: data.foodSaved || "0 kg",
            totalDonations: data.totalDonations || 0
          }))
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [API_URL])

  // 2. Handle Profile Update
  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          department: userData.department,
          location: userData.location,
          bio: userData.bio,
        }),
      })

      if (res.ok) {
        const updatedUser = await res.json()
        setUserData(updatedUser)
        // Also update localStorage so Navbar reflects change
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setIsEditing(false)
      }
    } catch (err) {
      console.error("Update failed:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !isEditing) {
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
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isEditing ? (
            <><Save className="h-4 w-4 mr-2" /> Save Changes</>
          ) : (
            "Edit Profile"
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Card: Summary & Stats */}
        <Card className="lg:col-span-1 bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {userData.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <h2 className="text-xl font-semibold text-card-foreground">{userData.name}</h2>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
              
              <Badge className="mt-2 bg-primary/20 text-primary border-none">
                <Trophy className="h-3 w-3 mr-1" /> Rank #{userData.rank}
              </Badge>

              <div className="w-full mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userData.totalDonations}</p>
                    <p className="text-xs text-muted-foreground uppercase">Donations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userData.foodSaved}</p>
                    <p className="text-xs text-muted-foreground uppercase">Saved</p>
                  </div>
                </div>
              </div>

              <div className="w-full mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Card: Edit Form */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10 bg-secondary/50 border-border"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email (Read-only)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-10 bg-muted/50 border-border" value={userData.email} disabled />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10 bg-secondary/50 border-border"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Department / Organization</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10 bg-secondary/50 border-border"
                    value={userData.department}
                    onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10 bg-secondary/50 border-border"
                  value={userData.location}
                  onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                className="bg-secondary/50 border-border min-h-[100px]"
                value={userData.bio}
                onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Overview Stats */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" /> Your Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatBox icon={Package} label="Total Donations" value={userData.totalDonations} color="text-primary" />
            <StatBox icon={Award} label="Food Saved" value={userData.foodSaved} color="text-green-500" />
            <StatBox icon={Building2} label="Contribution Score" value={userData.contributionScore} color="text-blue-500" />
            <StatBox icon={Trophy} label="Global Rank" value={`#${userData.rank}`} color="text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatBox({ icon: Icon, label, value, color }: any) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-4 text-center">
      <Icon className={`h-8 w-8 ${color} mx-auto mb-2`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  )
}