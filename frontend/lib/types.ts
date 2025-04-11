export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  completions: string[] // Array of dates in ISO format
  createdAt: string
}

export interface HabitCompletion {
  date: string
  completed: boolean
}

export interface Streak {
  current: number
  longest: number
  longestDate?: string
}

export type ViewMode = "week" | "grid"
