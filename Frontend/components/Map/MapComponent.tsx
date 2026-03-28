"use client"

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"

// --- FIX FOR MISSING ICON ---
// This tells Leaflet to use CDN links for the marker images
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to move the map view when coordinates change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 13, { animate: true })
    }
  }, [lat, lng, map])
  return null
}

interface MapProps {
  center: [number, number]
  onMapClick?: (lat: number, lng: number) => void
}

export default function MapComponent({ center, onMapClick }: MapProps) {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* This moves the map view automatically */}
        <RecenterMap lat={center[0]} lng={center[1]} />

        {/* This is the Marker that was invisible before */}
        <Marker position={center} />
      </MapContainer>
    </div>
  )
}