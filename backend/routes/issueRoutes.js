const express = require("express");
const router = express.Router();

const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} = require("../controllers/issueController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// 🟢 CREATE ISSUE (admin only)
router.post("/", protect, authorizeRoles("admin"), createIssue);

// 🟢 GET ALL ISSUES (any logged-in user)
router.get("/", protect, getIssues);

// 🟢 GET SINGLE ISSUE
router.get("/:id", protect, getIssueById);

// 🟢 UPDATE ISSUE (admin only)
router.patch("/:id", protect, authorizeRoles("admin"), updateIssue);

// 🟢 DELETE ISSUE (admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteIssue);

module.exports = router;
