"use server"

import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"
import connectDB from "@/lib/db"
import Task from "@/models/Task"
import type { ITask } from "@/models/Task"

export async function getTasks(filter: any = {}) {
  try {
    console.log("Starting getTasks function")
    await connectDB()
    console.log("Database connected")
    
    const user = await currentUser()
    console.log("Current user:", user?.id)

    if (!user) {
      console.log("No user found, returning empty array")
      return []
    }

    // Ensure userId is always included in the query
    const query = { userId: user.id, ...filter }
    console.log("Fetching tasks with query:", query)

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    console.log("Raw tasks from database:", tasks)
    
    // Convert to plain objects to ensure serialization
    const serializedTasks = JSON.parse(JSON.stringify(tasks))
    console.log("Serialized tasks:", serializedTasks)
    
    return serializedTasks
  } catch (error) {
    console.error("Error in getTasks:", error)
    return []
  }
}

export async function createTask(formData: FormData) {
  try {
    console.log("Starting createTask function")
    await connectDB()
    console.log("Database connected")
    
    const user = await currentUser()
    console.log("Current user:", user?.id)

    if (!user) {
      console.log("No user found, throwing unauthorized error")
      throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const priority = (formData.get("priority") as string) || "medium"
    const dueDateStr = formData.get("dueDate") as string

    console.log("Form data received:", { title, description, priority, dueDateStr })

    if (!title?.trim() || !description?.trim()) {
      console.log("Missing required fields")
      throw new Error("Title and description are required")
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      userId: user.id,
      completed: false,
      ...(dueDateStr && { dueDate: new Date(dueDateStr) }),
    }

    console.log("Creating task with data:", taskData)
    const task = await Task.create(taskData)
    console.log("Task created successfully:", task)

    revalidatePath("/")
    const serializedTask = JSON.parse(JSON.stringify(task))
    console.log("Serialized task:", serializedTask)
    
    return { success: true, task: serializedTask }
  } catch (error) {
    console.error("Error in createTask:", error)
    throw error
  }
}

export async function updateTask(taskId: string, formData: FormData) {
  try {
    await connectDB()
    const user = await currentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const completed = formData.get("completed") === "true"
    const priority = formData.get("priority") as string
    const dueDateStr = formData.get("dueDate") as string

    if (!title?.trim() || !description?.trim()) {
      throw new Error("Title and description are required")
    }

    const updateData = {
      title: title.trim(),
      description: description.trim(),
      completed,
      priority,
      ...(dueDateStr ? { dueDate: new Date(dueDateStr) } : { dueDate: null }),
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId: user.id },
      updateData,
      { new: true }
    )

    if (!task) {
      throw new Error("Task not found")
    }

    revalidatePath("/")
    return { success: true, task: JSON.parse(JSON.stringify(task)) }
  } catch (error) {
    console.error("Error updating task:", error)
    throw error
  }
}

export async function deleteTask(taskId: string) {
  try {
    await connectDB()
    const user = await currentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const task = await Task.findOneAndDelete({ _id: taskId, userId: user.id })

    if (!task) {
      throw new Error("Task not found")
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}

export async function toggleTaskStatus(taskId: string, completed: boolean) {
  try {
    await connectDB()
    const user = await currentUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId: user.id },
      { completed },
      { new: true }
    )

    if (!task) {
      throw new Error("Task not found")
    }

    revalidatePath("/")
    return { success: true, task: JSON.parse(JSON.stringify(task)) }
  } catch (error) {
    console.error("Error toggling task status:", error)
    throw error
  }
}

export async function searchTasks(query: string) {
  try {
    console.log("Starting searchTasks function with query:", query)
    await connectDB()
    console.log("Database connected")
    
    const user = await currentUser()
    console.log("Current user:", user?.id)

    if (!user) {
      console.log("No user found, returning empty array")
      return []
    }

    console.log("Searching tasks for user:", user.id)
    const tasks = await Task.find({
      userId: user.id,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    console.log("Raw search results:", tasks)
    
    // Convert to plain objects to ensure serialization
    const serializedTasks = JSON.parse(JSON.stringify(tasks))
    console.log("Serialized search results:", serializedTasks)
    
    return serializedTasks
  } catch (error) {
    console.error("Error in searchTasks:", error)
    return []
  }
}

