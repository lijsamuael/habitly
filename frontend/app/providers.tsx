"use client"

import type { ReactNode } from "react"
import { HabitProvider } from "@/contexts/habit-context"

export function Providers({ children }: { children: ReactNode }) {
  return <HabitProvider>{children}</HabitProvider>
}
