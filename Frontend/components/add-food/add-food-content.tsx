"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import "leaflet/dist/leaflet.css"
import { Label } from "@/components/ui/label"
import { UtensilsCrossed, MapPin, Clock, Camera, X, Loader2 } from "lucide-react"

// ✅ Dynamic import with a loading state to prevent hydration mismatch
const Map = dynamic(() => import("../Map/MapComponent"), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
})

interface User {
  id: string;
  name: string;
  email: string;
}

interface FormDataType {
  title: string; 
  category: string;
  quantity: string; 
  unit: string;
  description: string;
  location: string;
  expiryDate: string;
  expiryTime: string;
  lat: number;
  lng: number;
}

export function AddFoodContent() {
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    title: "", 
    category: "",
    quantity: "",
    unit: "kg",
    description: "",
    location: "",
    expiryDate: "",
    expiryTime: "",
    lat: 17.3850,
    lng: 78.4867,
  })

  const filePreviews = useMemo(() => files.map(file => URL.createObjectURL(file)), [files]);
  
  useEffect(() => {
    return () => filePreviews.forEach(url => URL.revokeObjectURL(url));
  }, [filePreviews]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleGeocode = async (address: string) => {
    if (!address) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data?.[0]) {
        const { lat, lon } = data[0];
        setFormData(prev => ({ ...prev, lat: Number(lat), lng: Number(lon) }));
      }
    } catch (error) { console.error("Geocoding failed:", error); }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      setLoading(false);
      return;
    }

    try {
      const expiry = new Date(`${formData.expiryDate}T${formData.expiryTime}`);
      const form = new FormData();
      form.append("title", formData.title);
      form.append("category", formData.category);
      form.append("description", formData.description);
      form.append("quantityValue", formData.quantity); 
      form.append("quantityUnit", formData.unit);     
      form.append("address", formData.location);
      form.append("lat", formData.lat.toString()); 
      form.append("lng", formData.lng.toString()); 
      form.append("expiryTime", expiry.toISOString());
      files.forEach((file) => form.append("images", file));

      // 🟢 POINTING TO BACKEND PORT 4000
      const res = await fetch(`http://localhost:4000/api/food/add`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server crashed or returned non-JSON response. Check backend terminal.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to list food.");

      alert("Food listed successfully!");
      window.location.href = "/dashboard"; 
    } catch (err) {
      alert(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Food Listing</h1>
          <p className="text-muted-foreground">Share surplus food with those in need</p>
        </div>
        <Badge variant="outline" className="mb-1 text-primary border-primary/20">
          AI-Matching Enabled
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              Food Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Food Name</Label>
              <Input
                id="name"
                required
                placeholder="e.g. Fresh Vegetable Biryani"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw">Raw / Fresh</SelectItem>
                    <SelectItem value="cooked">Cooked</SelectItem>
                    <SelectItem value="packaged">Packaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <div className="flex gap-2">
                  <Input type="number" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                  <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="liters">liters</SelectItem>
                      <SelectItem value="pieces">pieces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Details about spice level, expiry, or urgency..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Images ({files.length}/4)</Label>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                {filePreviews.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== index))} className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 shadow-lg">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {files.length < 4 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)].slice(0, 4))} />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Enter pickup address" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              <Button type="button" variant="outline" onClick={() => handleGeocode(formData.location)}>Find</Button>
            </div>
            <div className="h-64 rounded-lg overflow-hidden border">
              {/* ✅ Added KEY to force clean remount if coordinates change, preventing "container reused" error */}
              <Map 
                key={`${formData.lat}-${formData.lng}`} 
                center={[formData.lat, formData.lng]} 
                onMapClick={handleMapClick} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Expiry</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" required value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Expiry Time</Label>
              <Input type="time" required value={formData.expiryTime} onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing AI Match...</> : "List Food & Notify NGOs"}
        </Button>
      </form>
    </div>
  )
}