"use client"

import { useState } from "react"
import type { ITask } from "@/models/Task"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { deleteTask, toggleTaskStatus } from "@/lib/actions"
import { Pencil, Trash2, Calendar, Flag } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import EditTaskDialog from "./edit-task-dialog"
import { format } from "date-fns"

interface TaskItemProps {
  task: ITask
}

export default function TaskItem({ task }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  async function handleToggleStatus() {
    try {
      await toggleTaskStatus(task._id!, !task.completed)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteTask(task._id!)
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  const isPastDue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed

  return (
    <>
      <div
        className={`p-4 border rounded-lg bg-card ${task.completed ? "opacity-70" : ""} transition-all duration-200 hover:shadow-md`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <Checkbox
              id={`task-${task._id}`}
              checked={task.completed}
              onCheckedChange={handleToggleStatus}
              className="mt-1"
            />
            <div className="flex-1">
              <label
                htmlFor={`task-${task._id}`}
                className={`font-medium block ${task.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {task.title}
              </label>
              <p className={`text-sm mt-1 ${task.completed ? "text-muted-foreground" : ""}`}>{task.description}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                {task.priority && (
                  <Badge variant="outline" className={priorityColors[task.priority as keyof typeof priorityColors]}>
                    <Flag className="h-3 w-3 mr-1" />
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                )}

                {task.dueDate && (
                  <Badge
                    variant="outline"
                    className={isPastDue ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" : ""}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(task.dueDate), "MMM d, yyyy")}
                    {isPastDue && " (Overdue)"}
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-2">Created: {format(new Date(task.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)} aria-label="Edit task">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsDeleteDialogOpen(true)} aria-label="Delete task">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditTaskDialog task={task} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </>
  )
}

