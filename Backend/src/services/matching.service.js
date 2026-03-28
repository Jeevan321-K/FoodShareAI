// No need to import Ngo here if you pass 'ngos' from the route/controller

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function findBestNGO(food, ngos, nlpBoost = 0) {
  console.log("🤖 AI Matcher: Checking", ngos.length, "NGOs for food category:", food.category);
  
  let bestNgo = null;
  let bestScore = -1;

  if (!food?.pickupLocation?.coordinates) return { bestNgo: null, bestScore: 0 };

  const [foodLng, foodLat] = food.pickupLocation.coordinates;
  const foodCat = food.category?.toLowerCase();

  ngos.forEach((ngo) => {
    if (!ngo.location?.coordinates) return;

    // 🟢 FIX: Flexible Category Match
    // Your manual docs use 'category' (string), but code checks 'categories' (array)
    const ngoCategory = ngo.category?.toLowerCase();
    const ngoCategories = Array.isArray(ngo.categories) 
        ? ngo.categories.map(c => c.toLowerCase()) 
        : [ngoCategory];

    // If the food category doesn't match the NGO's specialty, skip it
    if (foodCat && !ngoCategories.includes(foodCat)) {
        console.log(`Skipping ${ngo.name}: Category mismatch (${ngoCategory} vs ${foodCat})`);
        return; 
    }

    const [ngoLng, ngoLat] = ngo.location.coordinates;
    const distance = calculateDistance(foodLat, foodLng, ngoLat, ngoLng);
    
    // Scoring
    const distanceScore = 1 / (distance + 1);
    const foodQty = food.quantity?.value || 0;
    const capacityScore = (ngo.capacity >= foodQty) ? 1 : 0.5;
    const urgencyFactor = nlpBoost / 50;

    const score = (0.4 * distanceScore) + (0.3 * capacityScore) + (0.3 * urgencyFactor);

    if (score > bestScore) {
      bestScore = score;
      bestNgo = ngo;
    }
  });

  return { bestNgo, bestScore: Math.max(bestScore, 0) };
}