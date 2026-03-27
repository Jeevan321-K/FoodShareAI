import NGO from "../models/Ngo.js"
import { calculateDistance } from "../utils/matchNgo.js"

// weights
const WEIGHTS = {
  expiry: 0.5,
  quantity: 0.3,
  distance: 0.2
}

// expiry score
const getExpiryScore = (expiryTime) => {
  const now = new Date()
  const hoursLeft = (new Date(expiryTime) - now) / (1000 * 60 * 60)
  return 1 / (hoursLeft + 1)
}

// quantity score
const getQuantityScore = (quantity) => {
  return Math.min(quantity / 100, 1)
}

// final score
const calculatePriorityScore = ({ expiryTime, quantity, distance }) => {
  const expiryScore = getExpiryScore(expiryTime)
  const quantityScore = getQuantityScore(quantity)
  const distanceScore = 1 / (distance + 1)

  return (
    WEIGHTS.expiry * expiryScore +
    WEIGHTS.quantity * quantityScore +
    WEIGHTS.distance * distanceScore
  )
}

// 🔥 MAIN FUNCTION
export const findBestNGO = async (food) => {
  const ngos = await NGO.find()

  let bestNgo = null
  let bestScore = -1

  for (let ngo of ngos) {
    const distance = calculateDistance(
      food.pickupLocation.lat,
      food.pickupLocation.lng,
      ngo.location.coordinates[1], // lat
      ngo.location.coordinates[0]  // lng
    )

    const score = calculatePriorityScore({
      expiryTime: food.expiryTime,
      quantity: food.quantity.value,
      distance
    })

    if (score > bestScore) {
      bestScore = score
      bestNgo = ngo
    }
  }

  return { bestNgo, bestScore }
}