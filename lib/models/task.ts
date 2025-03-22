export interface Task {
  _id: string
  title: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate?: string
  createdAt: string
  updatedAt: string
  userId: string
} 