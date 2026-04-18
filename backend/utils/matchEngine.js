const User = require("../models/User");

// 📏 distance formula
const calculateDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return Infinity;

  const dx = loc1.lat - loc2.lat;
  const dy = loc1.lng - loc2.lng;
  return Math.sqrt(dx * dx + dy * dy);
};

// ⚡ urgency bonus
const urgencyBonus = {
  high: 10,
  medium: 5,
  low: 0,
};

exports.matchVolunteers = async (issue) => {
  try {
    // 1️⃣ filter volunteers (SAFE + no password)
    const volunteers = await User.find({
      role: "volunteer",
      availability: true,
      skills: issue.type,
    }).select("-password");

    // 2️⃣ score them
    const scored = volunteers.map((v) => {
      const distance = calculateDistance(issue.location, v.location);

      const score =
        distance - (urgencyBonus[issue.urgency] || 0);

      return {
        volunteer: v,
        score,
      };
    });

    // 3️⃣ sort (lowest score = best)
    scored.sort((a, b) => a.score - b.score);

    // 4️⃣ return top 3
    return scored.slice(0, 3);
  } catch (error) {
    console.error("Matching error:", error);
    return [];
  }
};