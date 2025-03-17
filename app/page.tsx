import TaskList from "@/components/task-list"
import CreateTaskForm from "@/components/create-task-form"
import TaskFilters from "@/components/task-filters"
import { Suspense } from "react"
import TaskListSkeleton from "@/components/task-list-skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Database } from "lucide-react"
import { SignInButton } from "@clerk/nextjs"

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Await the searchParams to ensure we are accessing the resolved values
  const resolvedSearchParams = await searchParams;

  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : "";
  const priority = typeof resolvedSearchParams.priority === "string" ? resolvedSearchParams.priority : "";
  const status = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : "";

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Task Manager</h1>

        {/* Show this only during build/development */}
        {process.env.NODE_ENV !== "production" && !process.env.MONGODB_URI && (
          <Alert className="mb-6">
            <Database className="h-4 w-4" />
            <AlertTitle>Database Connection</AlertTitle>
            <AlertDescription>
              No MongoDB URI detected. Please add a MONGODB_URI environment variable to connect to your database.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome to Task Manager</h2>
        </div>

        <CreateTaskForm />
        <TaskFilters />
        <Suspense key={`${search}-${priority}-${status}`} fallback={<TaskListSkeleton />}>
          <TaskList search={search} priority={priority} status={status} />
        </Suspense>
      </div>
    </main>
  )
}

