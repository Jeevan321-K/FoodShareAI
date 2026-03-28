// 1. Move helper function to the top or outside to ensure it's available

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function matchBestNgo(food, ngos) {
    if (!food || !ngos || ngos.length === 0) return { bestNgo: null, bestScore: 0 };

    let bestNgo = null;
    let bestScore = -1;

    // 🟢 FIX: Access coordinates from the Array [lng, lat] 
    // MongoDB stores GeoJSON as [longitude, latitude]
    const foodLng = food.pickupLocation.coordinates[0];
    const foodLat = food.pickupLocation.coordinates[1];

    ngos.forEach((ngo) => {
        if (!ngo.location || !ngo.location.coordinates) {
            console.log("❌ Skipping NGO due to missing location:", ngo.name);
            return;
        }

        const [ngoLng, ngoLat] = ngo.location.coordinates;

        const distance = calculateDistance(
            foodLat,
            foodLng,
            ngoLat,
            ngoLng
        );

        // 🟢 PREVENT NaN: If distance fails, default to a large number
        const safeDistance = isNaN(distance) ? 999 : distance;

        let score = 0;
        const distanceScore = 1 / (safeDistance + 1);

        // Ensure food.quantity.value exists
        const foodQty = food.quantity?.value || 0;
        const capacityScore = ngo.capacity >= foodQty ? 1 : 0.5;

        const hoursLeft = (new Date(food.expiryTime) - Date.now()) / (1000 * 60 * 60);

        let urgencyScore = 0;
        if (hoursLeft < 2) urgencyScore = 1;
        else if (hoursLeft < 6) urgencyScore = 0.7;
        else urgencyScore = 0.3;

        score = (0.5 * urgencyScore) + (0.3 * capacityScore) + (0.2 * distanceScore);

        if (score > bestScore) {
            bestScore = score;
            bestNgo = ngo;
        }
    });

    return { bestNgo, bestScore };
}