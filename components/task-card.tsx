"use client"

import { useState } from "react"
import { Task } from "@/lib/models/task"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { format } from "date-fns"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Pencil, Trash2, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import DatePicker from "react-datepicker"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onDelete?: () => void
  onUpdate?: (updatedTask: Task) => void
}

export default function TaskCard({ task, onDelete, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editedTask, setEditedTask] = useState(task)
  const [dueDate, setDueDate] = useState<Date | null>(
    task.dueDate ? new Date(task.dueDate) : null
  )
  const [isCompleted, setIsCompleted] = useState(task.completed)
  const { toast } = useToast()

  const handleToggleComplete = async () => {
    try {
      const newCompletedState = !isCompleted
      setIsCompleted(newCompletedState) // Optimistic update
      
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: newCompletedState }),
      })

      if (!response.ok) {
        setIsCompleted(isCompleted) // Revert on error
        throw new Error("Failed to update task")
      }

      const updatedTask = await response.json()
      if (onUpdate) {
        onUpdate(updatedTask)
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editedTask,
          dueDate: dueDate?.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const updatedTask = await response.json()
      setIsEditing(false)
      
      if (onUpdate) {
        onUpdate(updatedTask)
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      setIsDeleting(false)
      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white border-none"
      case "medium":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none"
      case "low":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-none"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-none"
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <motion.div
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggleComplete}
              className="transition-all duration-200"
            />
          </motion.div>
          <CardTitle className={cn(
            "text-sm font-medium transition-all duration-300",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </CardTitle>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Badge 
              className={`${getPriorityColor(task.priority)} shadow-sm transition-all duration-200 group-hover:shadow-md`}
              variant="outline"
            >
              {task.priority}
            </Badge>
          </motion.div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <MoreVertical className="h-4 w-4" />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </motion.div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsDeleting(true)}
                className="text-destructive"
              >
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </motion.div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className={cn(
          "text-sm text-muted-foreground mb-2 transition-all duration-300",
          isCompleted && "line-through"
        )}>
          {task.description}
        </p>
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Created {format(new Date(task.createdAt), "MMM d, yyyy")}
          </p>
          {task.dueDate && (
            <p className="text-xs text-muted-foreground">
              Due {format(new Date(task.dueDate), "MMM d, yyyy")}
            </p>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title">Title</label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="priority">Priority</label>
              <Select
                value={editedTask.priority}
                onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as "low" | "medium" | "high" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="dueDate">Due Date</label>
              <DatePicker
                selected={dueDate}
                onChange={(date) => setDueDate(date)}
                dateFormat="MMMM d, yyyy"
                minDate={new Date()}
                placeholderText="Select due date"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                wrapperClassName="w-full"
                isClearable
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 