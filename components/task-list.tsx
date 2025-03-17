import { getTasks, searchTasks } from "@/lib/actions"
import TaskItem from "./task-item"
import type { ITask } from "@/models/Task"
import { AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SignInButton } from "@clerk/nextjs"

interface TaskListProps {
  search?: string
  priority?: string
  status?: string
}

export default async function TaskList({ search, priority, status }: TaskListProps) {
  try {
    let tasks: ITask[] = []
    const filter: any = {}

    if (priority && priority !== "all") {
      filter.priority = priority
    }

    if (status && status !== "all") {
      filter.completed = status === "completed"
    }

    if (search) {
      tasks = await searchTasks(search)

      if ((priority && priority !== "all") || (status && status !== "all")) {
        tasks = tasks.filter((task) => {
          let match = true

          if (priority && priority !== "all" && task.priority !== priority) {
            match = false
          }

          if (status && status !== "all") {
            const isCompleted = status === "completed"
            if (task.completed !== isCompleted) {
              match = false
            }
          }

          return match
        })
      }
    } else {
      tasks = await getTasks(filter)
    }

    if (!tasks || tasks.length === 0) {
      return (
        <div className="text-center p-8 border rounded-lg bg-card">
          <p className="text-muted-foreground">
            {search || (priority && priority !== "all") || (status && status !== "all")
              ? "No tasks found matching your filters. Try adjusting your search criteria."
              : "No tasks found. Create one to get started!"}
          </p>
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
        {tasks.map((task: ITask) => (
          <TaskItem key={task._id} task={task} />
        ))}
      </div>
    )
  } catch (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Could not load tasks. Please check your database connection.</AlertDescription>
      </Alert>
    )
  }
}

