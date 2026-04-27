// routes/tasks.js
// ─────────────────────────────────────────────
// All REST API routes for Tasks
// GET    /tasks          → fetch all tasks
// POST   /tasks          → create new task
// PUT    /tasks/:id      → toggle complete OR edit task
// DELETE /tasks/:id      → delete a task
// ─────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// ─────────────────────────────────────────────
// GET /tasks
// Returns all tasks, newest first
// Supports optional ?search= and ?filter= query params
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { search, filter } = req.query;

    // Build a MongoDB query object
    let query = {};

    // If a search term is provided, match title OR subject (case-insensitive)
    if (search && search.trim() !== "") {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { subject: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // If a filter is provided, narrow down by completion status
    if (filter === "completed") {
      query.completed = true;
    } else if (filter === "pending") {
      query.completed = false;
    }
    // filter === "all" or undefined → no extra filter needed

    // Fetch tasks, sorted by creation date descending (newest first)
    const tasks = await Task.find(query).sort({ createdAt: -1 });

    // Also send summary statistics for the dashboard
    const totalCount = await Task.countDocuments();
    const completedCount = await Task.countDocuments({ completed: true });
    const pendingCount = totalCount - completedCount;

    res.json({
      success: true,
      stats: { total: totalCount, completed: completedCount, pending: pendingCount },
      tasks,
    });
  } catch (error) {
    console.error("GET /tasks error:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching tasks" });
  }
});

// ─────────────────────────────────────────────
// POST /tasks
// Creates a new task
// Body: { title, subject, priority, dueDate, notes }
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, subject, priority, dueDate, notes } = req.body;

    // Manual validation — ensure required fields are present
    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!subject || subject.trim() === "") {
      return res.status(400).json({ success: false, message: "Subject is required" });
    }
    if (!dueDate) {
      return res.status(400).json({ success: false, message: "Due date is required" });
    }

    // Create and save the new task
    const newTask = new Task({ title, subject, priority, dueDate, notes });
    const savedTask = await newTask.save();

    res.status(201).json({ success: true, message: "Task created successfully", task: savedTask });
  } catch (error) {
    // Handle Mongoose validation errors nicely
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("POST /tasks error:", error.message);
    res.status(500).json({ success: false, message: "Server error while creating task" });
  }
});

// ─────────────────────────────────────────────
// PUT /tasks/:id
// Two modes:
//   1. Body contains { toggle: true }  → flip completed status
//   2. Body contains task fields       → edit the task
// ─────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the task first to make sure it exists
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (req.body.toggle === true) {
      // ── Toggle mode ──
      task.completed = !task.completed;
    } else {
      // ── Edit mode ──
      const { title, subject, priority, dueDate, notes } = req.body;

      if (!title || title.trim() === "") {
        return res.status(400).json({ success: false, message: "Title is required" });
      }
      if (!subject || subject.trim() === "") {
        return res.status(400).json({ success: false, message: "Subject is required" });
      }
      if (!dueDate) {
        return res.status(400).json({ success: false, message: "Due date is required" });
      }

      task.title = title.trim();
      task.subject = subject.trim();
      task.priority = priority || "medium";
      task.dueDate = dueDate;
      task.notes = notes || "";
    }

    const updatedTask = await task.save();
    res.json({ success: true, message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    }
    console.error("PUT /tasks/:id error:", error.message);
    res.status(500).json({ success: false, message: "Server error while updating task" });
  }
});

// ─────────────────────────────────────────────
// DELETE /tasks/:id
// Deletes a specific task by its MongoDB _id
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid task ID" });
    }
    console.error("DELETE /tasks/:id error:", error.message);
    res.status(500).json({ success: false, message: "Server error while deleting task" });
  }
});

module.exports = router;
