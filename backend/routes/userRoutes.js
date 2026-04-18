const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/userController");
const { updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);

module.exports = router;