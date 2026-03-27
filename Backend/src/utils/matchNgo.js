// ✅ distance function
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371

  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// ✅ matching function
export function matchBestNgo(food, ngos) {
  let bestNgo = null
  let bestScore = -1

  const WEIGHTS = {
    expiry: 0.5,
    quantity: 0.3,
    distance: 0.2,
  }

  const now = new Date()
  const hoursLeft =
    (new Date(food.expiryTime) - now) / (1000 * 60 * 60)

  const expiryScore = 1 / (hoursLeft + 1)

  const quantityValue = Number(food.quantity?.value || 0)
  const quantityScore = Math.min(quantityValue / 100, 1)

  ngos.forEach((ngo) => {
    const ngoLat = ngo.location.coordinates[1]
    const ngoLng = ngo.location.coordinates[0]

    const distance = calculateDistance(
      food.pickupLocation.lat,
      food.pickupLocation.lng,
      ngoLat,
      ngoLng
    )

    const distanceScore = 1 / (distance + 1)

    const finalScore =
      WEIGHTS.expiry * expiryScore +
      WEIGHTS.quantity * quantityScore +
      WEIGHTS.distance * distanceScore

    if (finalScore > bestScore) {
      bestScore = finalScore
      bestNgo = ngo
    }
  })

  return { bestNgo, bestScore }
}