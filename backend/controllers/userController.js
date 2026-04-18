const User = require("../models/User");

// 🟢 GET CURRENT USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 UPDATE VOLUNTEER PROFILE (SAFE VERSION)
exports.updateProfile = async (req, res) => {
  try {
    // Only allow specific fields
    const { skills, location, availability } = req.body;

    const updatedData = {};

    if (skills) updatedData.skills = skills;
    if (location) updatedData.location = location;
    if (availability !== undefined)
      updatedData.availability = availability;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updatedData,
      { returnDocument: "after" }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};