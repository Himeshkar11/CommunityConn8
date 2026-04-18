const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// 🔹 Routes
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const userRoutes = require("./routes/userRoutes");

// 🔹 Middleware imports
const { protect, authorizeRoles } = require("./middleware/authMiddleware");

dotenv.config();
connectDB();

const app = express(); // ✅ MUST come before app.use

// 🔹 Middleware
app.use(cors());
app.use(express.json());

// 🔹 Routes (AFTER app is created)
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/users", userRoutes); // ✅ FIXED POSITION

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// 🔹 Protected route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

// 🔹 Admin-only route
app.post(
  "/api/admin-only",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      message: "Welcome Admin 🔥",
      user: req.user,
    });
  }
);

// 🔹 Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});