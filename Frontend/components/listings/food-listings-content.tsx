"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Package,
  Clock,
  MapPin,
  Search,
  Grid3X3,
  List,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react"

// --- TYPES (Updated to match your Cloudinary/MongoDB structure) ---
// --- TYPES (Update this block) ---
type Food = {
  _id: string
  title: string
  category: string
  quantity: { value: number; unit: string }
  expiryTime: string
  status: string
  description?: string
  // ✅ FIXED: Now a simple array of strings
  images: string[] 
  pickupLocation?: { 
    address: string;
    coordinates: [number, number];
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "available": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    case "claimed": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "expired": return "bg-destructive/10 text-destructive border-destructive/20"
    default: return "bg-muted text-muted-foreground"
  }
}

function getCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case "raw": return "bg-orange-500/10 text-orange-500"
    case "cooked": return "bg-yellow-500/10 text-yellow-500"
    case "packaged": return "bg-blue-500/10 text-blue-500"
    default: return "bg-muted text-muted-foreground"
  }
}

function isUrgent(expiryTime: string) {
  const hoursLeft = (new Date(expiryTime).getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursLeft > 0 && hoursLeft < 6
}

export function FoodListingsContent() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch(`${API_URL}/food`)
        if (res.ok) {
          const data = await res.json()
          setFoods(data)
        }
      } catch (err) {
        console.error("Failed to fetch listings:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchFoods()
  }, [API_URL])

  const filteredListings = foods.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || listing.category.toLowerCase() === categoryFilter.toLowerCase()
    const matchesStatus = statusFilter === "all" || listing.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Food Listings</h1>
          <p className="text-muted-foreground text-sm">Real-time surplus food availability</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg border border-border">
          <Button 
            variant={viewMode === "grid" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden">
        <CardContent className="p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by food name, location..."
                className="pl-10 bg-background border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px] bg-background">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="raw">Raw</SelectItem>
                  <SelectItem value="cooked">Cooked</SelectItem>
                  <SelectItem value="packaged">Packaged</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {filteredListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
          <Package className="h-12 w-12 text-muted-foreground/20 mb-3" />
          <h3 className="font-semibold text-lg">No food found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}>
          {filteredListings.map((listing) => (
            <Card key={listing._id} className="group overflow-hidden border-border bg-card hover:shadow-xl transition-all duration-300">
              {/* Image Section */}
              <div className="relative aspect-[16/10] bg-secondary overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]} 
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={`${getStatusColor(listing.status)} border backdrop-blur-md`}>
                    {listing.status}
                  </Badge>
                  {isUrgent(listing.expiryTime) && (
                    <Badge className="bg-destructive text-destructive-foreground animate-pulse shadow-lg border-none">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Urgent
                    </Badge>
                  )}
                </div>

                {/* AI NGO Status Badge */}
                {/* AI NGO Status Badge */}
            <div className="absolute bottom-3 left-3">
              {listing.status === "matched" ? (
                <Badge variant="secondary" className="bg-blue-600/80 text-[10px] text-white backdrop-blur-md border-none flex gap-1 items-center px-2 py-0.5">
                  <Sparkles className="h-3 w-3 text-yellow-300" /> 
                  AI Matched to NGO
                </Badge>
              ) : listing.status === "available" ? (
                <Badge variant="secondary" className="bg-emerald-600/80 text-[10px] text-white backdrop-blur-md border-none flex gap-1 items-center px-2 py-0.5">
                  <Package className="h-3 w-3 text-white" /> 
                  Open for Claims
                </Badge>
              ) : null}
            </div>
              </div>

              <CardContent className="p-4">
                <div className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg leading-tight">{listing.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{listing.description || "Fresh surplus food donation."}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className={`${getCategoryColor(listing.category)} border-none`}>
                    {listing.category}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/50 border-none">
                    {listing.quantity.value} {listing.quantity.unit}
                  </Badge>
                </div>

                <div className="space-y-2 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>Expires at {new Date(listing.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate">{listing.pickupLocation?.address || "Location Details hidden"}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4 shadow-lg hover:shadow-emerald-500/20" 
                  disabled={listing.status !== "available"}
                >
                  {listing.status === "available" ? "Claim Food" : "Unavailable"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}