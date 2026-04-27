// models/Task.js
// ─────────────────────────────────────────────
// Mongoose schema & model for a Study Task
// ─────────────────────────────────────────────

const mongoose = require("mongoose");

// Define the shape of a task document in MongoDB
const taskSchema = new mongoose.Schema(
  {
    // Task title — required, trimmed of whitespace
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
    },

    // Subject / course name
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },

    // Priority level — one of three choices
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be low, medium, or high",
      },
      default: "medium",
    },

    // Due date for the task
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    // Whether the task has been completed
    completed: {
      type: Boolean,
      default: false,
    },

    // Optional notes / description
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the model so routes can use it
module.exports = mongoose.model("Task", taskSchema);
