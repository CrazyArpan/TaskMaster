"use client"

import { useEffect, useState } from "react"
import { getTasks } from "@/lib/actions"
import TaskItem from "./task-item"
import type { ITask } from "@/models/Task"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SignInButton, useAuth } from "@clerk/nextjs"

interface TaskListProps {
  search?: string
  priority?: string
  status?: string
}

export default function TaskList({ search, priority, status }: TaskListProps) {
  const [tasks, setTasks] = useState<ITask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isSignedIn } = useAuth()

  useEffect(() => {
    async function fetchTasks() {
      if (!isSignedIn) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const fetchedTasks = await getTasks()
        setTasks(fetchedTasks)
        setError(null)
      } catch (err) {
        console.error("Error fetching tasks:", err)
        setError("Failed to load tasks")
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [isSignedIn])

  if (!isSignedIn) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card">
        <p className="text-muted-foreground mb-4">Please sign in to view and manage your tasks</p>
        <SignInButton mode="modal">
          <button className="text-sm text-primary hover:underline">
            Sign in to view your tasks
          </button>
        </SignInButton>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card">
        <p className="text-muted-foreground">No tasks found. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Your Tasks
        <span className="text-sm font-normal text-muted-foreground ml-2">
          ({tasks.length} {tasks.length === 1 ? "task" : "tasks"})
        </span>
      </h2>
      {tasks.map((task) => (
        <TaskItem key={task._id} task={task} />
      ))}
    </div>
  )
}

