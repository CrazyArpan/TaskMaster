"use client"

import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { useAuth } from "@clerk/nextjs"
import { Task } from "@/lib/models/task"
import TaskCard from "@/components/task-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Search, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "./ui/skeleton"

export interface TaskListHandle {
  fetchTasks: () => void
}

const TaskList = forwardRef<TaskListHandle>((_, ref) => {
  const { isSignedIn } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [priority, setPriority] = useState<"all" | "low" | "medium" | "high">("all")
  const [mounted, setMounted] = useState(false)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/tasks")
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    fetchTasks
  }))

  useEffect(() => {
    setMounted(true)
    if (isSignedIn) {
      fetchTasks()
    } else {
      setTasks([])
    }
  }, [isSignedIn])

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      )
    )
  }

  const handleTaskDelete = (taskId: string) => {
    setTasks(currentTasks => currentTasks.filter(task => task._id !== taskId))
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filter === "all" ||
      (filter === "pending" && !task.completed) ||
      (filter === "completed" && task.completed)
    
    const matchesPriority = priority === "all" || task.priority === priority
    
    return matchesSearch && matchesFilter && matchesPriority
  })

  if (!mounted) {
    return null
  }

  if (!isSignedIn) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please sign in to view your tasks</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter("all")}>
              All Tasks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("pending")}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("completed")}>
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Priority
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setPriority("all")}>
              All Priorities
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriority("low")}>
              Low
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriority("medium")}>
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriority("high")}>
              High
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchQuery || filter !== "all" || priority !== "all"
              ? "No tasks match your search criteria"
              : "No tasks yet. Create one to get started!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="sync">
            {filteredTasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TaskCard
                  task={task}
                  onDelete={() => handleTaskDelete(task._id)}
                  onUpdate={handleTaskUpdate}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
})

TaskList.displayName = "TaskList"

export default TaskList

