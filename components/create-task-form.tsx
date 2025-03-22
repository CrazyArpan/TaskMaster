"use client"

import { useState } from "react"
import { createTask } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { SignInButton, useAuth } from "@clerk/nextjs"

export default function CreateTaskForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
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
      const result = await createTask(formData)
      if (result.success) {
        toast({
          title: "Success",
          description: "Task created successfully",
        })
        const form = document.getElementById("create-task-form") as HTMLFormElement
        form.reset()
        setDate(undefined)
        window.location.reload() // Force a full page reload
      } else {
        throw new Error("Failed to create task")
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
        <SignInButton mode="modal">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Sign In
          </button>
        </SignInButton>
      </div>
    )
  }

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
              Due Date (Optional)
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
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

