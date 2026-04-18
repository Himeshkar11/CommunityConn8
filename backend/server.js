const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const { protect, authorizeRoles } = require("./middleware/authMiddleware");

dotenv.config();
connectDB();

const app = express();

// 🔹 Middleware
app.use(cors());
app.use(express.json());

// 🔹 Routes
app.use("/api/auth", authRoutes);

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// 🔹 Protected route (any logged-in user)
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