import mongoose, { Schema, Document } from "mongoose"

export interface ITask extends Document {
  title: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate?: Date
  userId: string
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [60, "Title cannot be more than 60 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
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
    dueDate: {
      type: Date,
      required: false,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes
TaskSchema.index({ userId: 1, createdAt: -1 })
TaskSchema.index({ userId: 1, completed: 1 })
TaskSchema.index({ userId: 1, priority: 1 })

const Task = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema)

export default Task

