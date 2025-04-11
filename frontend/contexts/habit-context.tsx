"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Habit, ViewMode } from "@/lib/types"
import { getHabits, saveHabits, getViewMode, setViewMode } from "@/lib/storage"

interface HabitContextType {
  habits: Habit[]
  viewMode: ViewMode
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "completions">) => void
  updateHabit: (habit: Habit) => void
  deleteHabit: (id: string) => void
  toggleCompletion: (id: string, date: string) => void
  toggleViewMode: () => void
  isHabitCompletedOn: (id: string, date: string) => boolean
}

const HabitContext = createContext<HabitContextType | undefined>(undefined)

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [viewMode, setViewModeState] = useState<ViewMode>("week")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize from localStorage
    setHabits(getHabits())
    setViewModeState(getViewMode())
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    // Save to localStorage when habits change, but only after initialization
    if (isInitialized) {
      saveHabits(habits)
    }
  }, [habits, isInitialized])

  const addHabit = (habit: Omit<Habit, "id" | "createdAt" | "completions">) => {
    const newHabit: Habit = {
      ...habit,
      id: Math.random().toString(36).substring(2, 15),
      completions: [],
      createdAt: new Date().toISOString(),
    }

    setHabits((prev) => [...prev, newHabit])
  }

  const updateHabit = (updatedHabit: Habit) => {
    setHabits((prev) => prev.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)))
  }

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id))
  }

  const toggleCompletion = (id: string, date: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id) {
          const completionIndex = habit.completions.indexOf(date)
          let newCompletions

          if (completionIndex === -1) {
            newCompletions = [...habit.completions, date]
          } else {
            newCompletions = [...habit.completions]
            newCompletions.splice(completionIndex, 1)
          }

          return {
            ...habit,
            completions: newCompletions,
          }
        }
        return habit
      }),
    )
  }

  const toggleViewMode = () => {
    const newMode = viewMode === "week" ? "grid" : "week"
    setViewModeState(newMode)
    setViewMode(newMode)
  }

  const isHabitCompletedOn = (id: string, date: string) => {
    const habit = habits.find((h) => h.id === id)
    return habit ? habit.completions.includes(date) : false
  }

  return (
    <HabitContext.Provider
      value={{
        habits,
        viewMode,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleCompletion,
        toggleViewMode,
        isHabitCompletedOn,
      }}
    >
      {children}
    </HabitContext.Provider>
  )
}

export function useHabits() {
  const context = useContext(HabitContext)
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitProvider")
  }
  return context
}
