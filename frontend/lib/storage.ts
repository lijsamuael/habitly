import type { Habit } from "./types"
import { generateRandomId } from "./utils"

const HABITS_KEY = "habitly_habits"
const VIEW_MODE_KEY = "habitly_view_mode"

export function getHabits(): Habit[] {
  if (typeof window === "undefined") return []

  const habits = localStorage.getItem(HABITS_KEY)
  return habits ? JSON.parse(habits) : []
}

export function saveHabits(habits: Habit[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
}

export function addHabit(habit: Omit<Habit, "id" | "createdAt" | "completions">): Habit {
  const habits = getHabits()
  const newHabit: Habit = {
    ...habit,
    id: generateRandomId(),
    completions: [],
    createdAt: new Date().toISOString(),
  }

  saveHabits([...habits, newHabit])
  return newHabit
}

export function updateHabit(habit: Habit): void {
  const habits = getHabits()
  const index = habits.findIndex((h) => h.id === habit.id)

  if (index !== -1) {
    habits[index] = habit
    saveHabits(habits)
  }
}

export function deleteHabit(id: string): void {
  const habits = getHabits()
  saveHabits(habits.filter((habit) => habit.id !== id))
}

export function toggleHabitCompletion(id: string, date: string): void {
  const habits = getHabits()
  const habit = habits.find((h) => h.id === id)

  if (habit) {
    const completionIndex = habit.completions.indexOf(date)

    if (completionIndex === -1) {
      habit.completions.push(date)
    } else {
      habit.completions.splice(completionIndex, 1)
    }

    updateHabit(habit)
  }
}

export function getViewMode(): "week" | "grid" {
  if (typeof window === "undefined") return "week"

  const mode = localStorage.getItem(VIEW_MODE_KEY)
  return (mode as "week" | "grid") || "week"
}

export function setViewMode(mode: "week" | "grid"): void {
  if (typeof window === "undefined") return
  localStorage.setItem(VIEW_MODE_KEY, mode)
}
