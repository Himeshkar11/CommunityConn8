const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "in-progress", "completed"],
      default: "assigned",
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);