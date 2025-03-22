import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/mongodb"
import Task from "@/models/Task"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await connectToDatabase()
    
    const tasks = await Task.find({ userId })
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const priority = formData.get("priority") as "low" | "medium" | "high"
    const dueDate = formData.get("dueDate") as string | null

    if (!title || !description || !priority) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    await connectToDatabase()

    const task = await Task.create({
      userId,
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      completed: false,
      createdAt: new Date(),
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 