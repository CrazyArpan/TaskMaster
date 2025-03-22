import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  userId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
})

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema)

export default Task

