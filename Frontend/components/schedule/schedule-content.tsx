"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  MapPin,
  Package,
  Building2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react"

// --- TYPES ---
interface ScheduledEvent {
  _id: string
  title: string // mapped from food name
  ngoName: string
  date: string
  timeSlot: string
  address: string
  status: "pending" | "claimed" | "completed" | "cancelled"
  type: "pickup" | "delivery"
}

export function ScheduleContent() {
  const [events, setEvents] = useState<ScheduledEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api"

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      // Fetching food items that are 'claimed' as these represent scheduled pickups
      const res = await fetch(`${API_URL}/food/my-schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setEvents(data)
        setError(false)
      } else {
        setError(true)
      }
    } catch (err) {
      console.error("Schedule fetch error:", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "claimed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-none">Scheduled</Badge>
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-none">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground">Manage your pickup and delivery timelines</p>
        </div>
        <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" /> Schedule New
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Simple Calendar Placeholder (Static for UI structure) */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">March 2026</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="text-[10px] font-bold text-muted-foreground uppercase">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div 
                  key={day} 
                  className={`aspect-square flex items-center justify-center text-sm rounded-md transition-colors ${day === 28 ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary cursor-pointer'}`}
                >
                  {day}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Scheduled Events List */}
        <Card className="lg:col-span-2 bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Active Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Syncing your calendar...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Failed to load schedules</p>
                <Button variant="link" onClick={fetchSchedules}>Try again</Button>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-medium">No active pickups</h3>
                <p className="text-sm text-muted-foreground">Items you claim will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="flex flex-col md:flex-row items-start md:items-center gap-4 rounded-xl border border-border bg-secondary/20 p-4 hover:border-primary/40 transition-all"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {event.ngoName || "NGO Participant"}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground/80">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(event.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {event.timeSlot || "Flexible"}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {event.address}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none h-9 text-xs">Details</Button>
                      <Button variant="ghost" size="sm" className="flex-1 md:flex-none h-9 text-xs text-destructive hover:bg-destructive/10">Cancel</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}