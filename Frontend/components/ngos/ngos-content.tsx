"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Building2,
  MapPin,
  Star,
  Phone,
  Heart,
  Search,
  Users,
  Clock,
  Loader2,
  ShieldCheck
} from "lucide-react"
import dynamic from "next/dynamic"

// Import map dynamically
const Map = dynamic(() => import("../Map/MapComponent"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">Loading Map...</div>
})

type NGO = {
  _id: string
  name: string
  description: string
  phone: string
  email: string
  categories: string[] // Matches 'acceptedCategories' in backend
  verified: boolean
  location: {
    type: string
    coordinates: [number, number] // [lng, lat] per MongoDB
  }
}

export function NGOsContent() {
  const [ngos, setNgos] = useState<NGO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const res = await fetch(`${API_URL}/ngos`)
        if (res.ok) {
          const data = await res.json()
          setNgos(data)
        }
      } catch (err) {
        console.error("Failed to fetch NGOs:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchNGOs()
  }, [API_URL])

  const filteredNGOs = ngos.filter((ngo) =>
    ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ngo.categories?.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Determine map center based on first NGO or default to Haryana coordinates
  const mapCenter: [number, number] = filteredNGOs.length > 0 
    ? [filteredNGOs[0].location.coordinates[1], filteredNGOs[0].location.coordinates[0]]
    : [29.0000, 76.0000]

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">NGOs Nearby</h1>
        <p className="text-muted-foreground text-sm">
          Verified partners ready to collect surplus food in your region.
        </p>
      </div>

      {/* Interactive Map Card */}
      <Card className="border-border overflow-hidden shadow-sm">
        <div className="h-[350px] w-full relative">
          {/* FIX: Removed 'zoom' prop to match your MapComponent signature */}
          <Map center={mapCenter} />
          
          <div className="absolute top-4 right-4 z-[1000]">
            <Badge className="bg-background/90 backdrop-blur text-foreground border-border shadow-md px-3 py-1">
              {filteredNGOs.length} Active Partners
            </Badge>
          </div>
        </div>
      </Card>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or food category (raw, cooked)..."
          className="pl-10 bg-card border-border shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* NGO Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredNGOs.length > 0 ? (
          filteredNGOs.map((ngo) => (
            <Card key={ngo._id} className="group hover:border-primary/40 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 rounded-lg border border-border">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {ngo.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base leading-none">{ngo.name}</h3>
                      {ngo.verified && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {ngo.description || "Active food distribution partner."}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                    {/* Add the ?. and || [] fallback */}
                    {(ngo.categories || []).map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-[10px] py-0 px-2 capitalize">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-5 py-3 border-y border-border/50">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-bold">4.8</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs font-bold">Nearby</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Location</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-500 mb-0.5">
                      <Users className="h-3 w-3" />
                      <span className="text-xs font-bold">Verified</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Fast Response
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs px-4">
                      <Phone className="h-3 w-3 mr-1.5" /> Call
                    </Button>
                    <Button size="sm" className="h-8 text-xs px-4 bg-emerald-600 hover:bg-emerald-700">
                      <Heart className="h-3 w-3 mr-1.5" /> Select
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <Building2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <h3 className="text-lg font-medium">No partners found in this area</h3>
          </div>
        )}
      </div>
    </div>
  )
}