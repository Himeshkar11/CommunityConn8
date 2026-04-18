const express = require("express");
const router = express.Router();

// 🔹 Controllers
const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  matchAndAssign,
} = require("../controllers/issueController");

// 🔹 Middleware
const { protect, authorizeRoles } = require("../middleware/authMiddleware");


// 🟢 CREATE ISSUE (admin only)
router.post("/", protect, authorizeRoles("admin"), createIssue);

// 🟢 GET ALL ISSUES (logged-in users)
router.get("/", protect, getIssues);

// 🟢 GET SINGLE ISSUE
router.get("/:id", protect, getIssueById);

// 🟢 UPDATE ISSUE (admin only)
router.patch("/:id", protect, authorizeRoles("admin"), updateIssue);

// 🟢 DELETE ISSUE (admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteIssue);

// 🤖 MATCH + ASSIGN (admin only)
router.post(
  "/match/:id",
  protect,
  authorizeRoles("admin"),
  matchAndAssign
);

module.exports = router;