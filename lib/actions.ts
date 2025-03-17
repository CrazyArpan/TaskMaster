"use server"

import connectDB from "@/lib/db"
import Task from "@/models/Task"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"

export async function getTasks(filter = {}) {
  try {
    const conn = await connectDB()

    // If connection failed, return empty array
    if (!conn) {
      console.warn("Database connection failed. Returning empty tasks array.")
      return []
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 })
    return JSON.parse(JSON.stringify(tasks))
  } catch (error) {
    console.error("Error fetching tasks:", error)
    // Return empty array instead of throwing error to prevent build failures
    return []
  }
}

export async function createTask(formData: FormData) {
  const user = await currentUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = (formData.get("priority") as string) || "medium"
  const dueDateStr = formData.get("dueDate") as string

  if (!title || !description) {
    throw new Error("Title and description are required")
  }

  const taskData: any = {
    title,
    description,
    priority,
    userId: user.id
  }

  if (dueDateStr) {
    taskData.dueDate = new Date(dueDateStr)
  }

  try {
    const conn = await connectDB()
    if (!conn) {
      throw new Error("Database connection failed")
    }

    await Task.create(taskData)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error creating task:", error)
    throw new Error("Failed to create task")
  }
}

export async function updateTask(taskId: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const completed = formData.get("completed") === "true"
  const priority = formData.get("priority") as string
  const dueDateStr = formData.get("dueDate") as string

  if (!title || !description) {
    throw new Error("Title and description are required")
  }

  const updateData: any = {
    title,
    description,
    completed,
    priority,
  }

  if (dueDateStr) {
    updateData.dueDate = new Date(dueDateStr)
  } else {
    // If dueDate is empty, set it to null
    updateData.dueDate = null
  }

  try {
    const conn = await connectDB()
    if (!conn) {
      throw new Error("Database connection failed")
    }

    await Task.findByIdAndUpdate(taskId, updateData)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error updating task:", error)
    throw new Error("Failed to update task")
  }
}

export async function deleteTask(taskId: string) {
  try {
    const conn = await connectDB()
    if (!conn) {
      throw new Error("Database connection failed")
    }

    await Task.findByIdAndDelete(taskId)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting task:", error)
    throw new Error("Failed to delete task")
  }
}

export async function toggleTaskStatus(taskId: string, completed: boolean) {
  try {
    const conn = await connectDB()
    if (!conn) {
      throw new Error("Database connection failed")
    }

    await Task.findByIdAndUpdate(taskId, { completed })
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error toggling task status:", error)
    throw new Error("Failed to toggle task status")
  }
}

export async function searchTasks(query: string) {
  try {
    const conn = await connectDB()
    if (!conn) {
      console.warn("Database connection failed. Returning empty search results.")
      return []
    }

    const tasks = await Task.find({
      $or: [{ title: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }],
    }).sort({ createdAt: -1 })
    return JSON.parse(JSON.stringify(tasks))
  } catch (error) {
    console.error("Error searching tasks:", error)
    return []
  }
}

