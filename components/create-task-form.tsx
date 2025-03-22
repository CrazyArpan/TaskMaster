"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "@/styles/datepicker.css"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { SignInButton, useAuth } from "@clerk/nextjs"
import { Task } from "@/lib/models/task"

interface CreateTaskFormProps {
  onTaskCreated?: (task: Task) => void
}

export default function CreateTaskForm({ onTaskCreated }: CreateTaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date | null>(null)
  const { toast } = useToast()
  const { isSignedIn } = useAuth()

  async function handleSubmit(formData: FormData) {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create tasks",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      const newTask = await response.json()
      
      toast({
        title: "Success",
        description: "Task created successfully",
      })

      const form = document.getElementById("create-task-form") as HTMLFormElement
      form.reset()
      setDate(null)

      if (onTaskCreated) {
        onTaskCreated(newTask)
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isSignedIn) {
    return (
      <div className="mb-8 p-4 bg-card rounded-lg shadow-sm border text-center">
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
        <p className="text-muted-foreground mb-4">Please sign in to create tasks</p>
      </div>
    )
  }

  const CustomInput = ({ value, onClick }: { value?: string; onClick?: () => void }) => (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal",
        !date && "text-muted-foreground"
      )}
      onClick={onClick}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value || "Select due date"}
    </Button>
  )

  return (
    <div className="mb-8 p-4 bg-card rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
      <form id="create-task-form" action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <Input id="title" name="title" placeholder="Task title" required maxLength={60} />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="Task description"
            required
            maxLength={1000}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
              Priority
            </label>
            <Select name="priority" defaultValue="medium">
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
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
              Due Date
            </label>
            <DatePicker
              selected={date}
              onChange={(newDate: Date | null) => setDate(newDate)}
              customInput={<CustomInput />}
              dateFormat="MMMM d, yyyy"
              minDate={new Date()}
              placeholderText="Select due date"
              showPopperArrow={false}
              calendarClassName="shadow-lg border rounded-lg"
              wrapperClassName="w-full"
              popperClassName="z-50"
              popperPlacement="bottom-start"
              shouldCloseOnSelect
              isClearable
              showTimeSelect={false}
              fixedHeight
            />
            {date && (
              <Input 
                type="hidden" 
                name="dueDate" 
                value={date.toISOString()} 
              />
            )}
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </form>
    </div>
  )
}

