import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/mongodb"
import Task from "@/models/Task"
import { NextRequest } from "next/server"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { taskId } = params

    await connectToDatabase()
    
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { $set: body },
      { new: true }
    ).lean()

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error updating task:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { taskId } = params

    await connectToDatabase()
    
    const task = await Task.findOneAndDelete({ _id: taskId, userId })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting task:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 