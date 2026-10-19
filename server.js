const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// MongoDB task schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "Cloud Task Manager server is running!"
  });
});

// Get all tasks from MongoDB
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Fetch tasks error:", error);
    res.status(500).json({ error: "Could not fetch tasks" });
  }
});

// Add task to MongoDB
app.post("/api/tasks", async (req, res) => {
  try {
    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({
        error: "Task title is required"
      });
    }

    const task = await Task.create({ title });
    res.status(201).json(task);
  } catch (error) {
    console.error("Add task error:", error);
    res.status(500).json({ error: "Could not add task" });
  }
});

// Update task completion status
app.patch("/api/tasks/:id", async (req, res) => {
  try {
    if (typeof req.body.completed !== "boolean") {
      return res.status(400).json({
        error: "Completed must be true or false"
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(400).json({ error: "Could not update task" });
  }
});

// Delete task from MongoDB
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(400).json({ error: "Could not delete task" });
  }
});

// Connect to MongoDB first, then start the server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
}

startServer();
