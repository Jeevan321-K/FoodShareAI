export function calculateFoodQuality(food) {
  const now = new Date();
  const expiry = new Date(food.expiryTime);
  
  // Use the provided expiry time as the primary safety metric
  const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60);
  
  // Normalize category to lowercase to avoid "Cooked" vs "cooked" bugs
  const category = food.category?.toLowerCase() || "other";

  // 1. Hard Safety Check: If it's already past expiry, it's UNSAFE regardless of category
  if (hoursUntilExpiry <= 0) return "UNSAFE";

  let quality = "FRESH";

  switch (category) {
    case "cooked":
      // Cooked food is highly perishable
      if (hoursUntilExpiry > 6) quality = "FRESH";
      else if (hoursUntilExpiry > 2) quality = "MEDIUM";
      else quality = "UNSAFE";
      break;

    case "packaged":
      // Packaged food lasts longer but needs a buffer for distribution
      if (hoursUntilExpiry > 48) quality = "FRESH";
      else if (hoursUntilExpiry > 12) quality = "MEDIUM";
      else quality = "UNSAFE";
      break;

    case "raw":
      // Raw fruits/veg logic
      if (hoursUntilExpiry > 72) quality = "FRESH";
      else if (hoursUntilExpiry > 24) quality = "MEDIUM";
      else quality = "UNSAFE";
      break;

    default:
      // Fallback for unknown categories
      if (hoursUntilExpiry > 12) quality = "FRESH";
      else quality = "UNSAFE";
  }

  return quality;
}