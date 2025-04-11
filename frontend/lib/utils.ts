import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Habit, Streak } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getWeekDays(date: Date = new Date()): Date[] {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday

  const monday = new Date(date.setDate(diff))
  const days = []

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday)
    nextDay.setDate(monday.getDate() + i)
    days.push(nextDay)
  }

  return days
}

export function calculateStreak(habit: Habit): Streak {
  if (!habit.completions.length) {
    return { current: 0, longest: 0 }
  }

  // Sort completions by date
  const sortedCompletions = [...habit.completions].sort()

  // Calculate current streak
  let currentStreak = 0
  const today = formatDate(new Date())
  const yesterday = formatDate(new Date(Date.now() - 86400000))

  // Check if completed today
  if (sortedCompletions.includes(today)) {
    currentStreak = 1

    // Count backwards from yesterday
    let checkDate = yesterday
    const dateToCheck = new Date(checkDate)

    while (sortedCompletions.includes(checkDate)) {
      currentStreak++
      dateToCheck.setDate(dateToCheck.getDate() - 1)
      checkDate = formatDate(dateToCheck)
    }
  } else if (sortedCompletions.includes(yesterday)) {
    // If completed yesterday but not today, check streak from yesterday
    currentStreak = 1

    let checkDate = formatDate(new Date(new Date(yesterday).getTime() - 86400000))
    const dateToCheck = new Date(checkDate)

    while (sortedCompletions.includes(checkDate)) {
      currentStreak++
      dateToCheck.setDate(dateToCheck.getDate() - 1)
      checkDate = formatDate(dateToCheck)
    }
  }

  // Calculate longest streak
  let longest = 0
  let tempStreak = 1
  let longestDate

  for (let i = 1; i < sortedCompletions.length; i++) {
    const curr = new Date(sortedCompletions[i])
    const prev = new Date(sortedCompletions[i - 1])

    const diffTime = Math.abs(curr.getTime() - prev.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      tempStreak++
    } else {
      if (tempStreak > longest) {
        longest = tempStreak
        longestDate = sortedCompletions[i - 1]
      }
      tempStreak = 1
    }
  }

  if (tempStreak > longest) {
    longest = tempStreak
    longestDate = sortedCompletions[sortedCompletions.length - 1]
  }

  return {
    current: currentStreak,
    longest: longest,
    longestDate,
  }
}

export function getCompletionsCount(habit: Habit): { year: number; month: number; week: number } {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get start of week (Monday)
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff)

  const yearCompletions = habit.completions.filter((date) => new Date(date) >= startOfYear)
  const monthCompletions = habit.completions.filter((date) => new Date(date) >= startOfMonth)
  const weekCompletions = habit.completions.filter((date) => new Date(date) >= startOfWeek)

  return {
    year: yearCompletions.length,
    month: monthCompletions.length,
    week: weekCompletions.length,
  }
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15)
}
