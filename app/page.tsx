"use client"

import { useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CreateTaskForm from "@/components/create-task-form"
import TaskList, { TaskListHandle } from "@/components/task-list"

export default function Home() {
  const taskListRef = useRef<TaskListHandle>(null)
  const { isSignedIn } = useAuth()

  const handleTaskCreated = () => {
    taskListRef.current?.fetchTasks()
  }

  return (
    <main className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center">Task Master</h1>
      <div className="max-w-3xl mx-auto">
        {!isSignedIn && (
          <Alert variant="default" className="mb-8">
            <AlertDescription>
              Please sign in to start managing your tasks.
            </AlertDescription>
          </Alert>
        )}
        <CreateTaskForm onTaskCreated={handleTaskCreated} />
        <div className="mt-8">
          <TaskList ref={taskListRef} />
        </div>
      </div>
    </main>
  )
}

