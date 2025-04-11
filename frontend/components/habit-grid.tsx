"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Habit } from "@/lib/types"
import { useHabits } from "@/contexts/habit-context"
import { formatDate } from "@/lib/utils"
import { Check, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface HabitGridProps {
  habit: Habit
  onViewDetails: (habit: Habit) => void
}

export function HabitGrid({ habit, onViewDetails }: HabitGridProps) {
  const { toggleCompletion, deleteHabit } = useHabits()
  const [showOptions, setShowOptions] = useState(false)

  // Generate grid of dates for the last 30 days
  const today = new Date()
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - 29 + i)
    return date
  })

  const getColorClass = () => {
    switch (habit.color) {
      case "blue":
        return "border-blue-800 text-blue-300"
      case "red":
        return "border-red-800 text-red-300"
      case "green":
        return "border-green-800 text-green-300"
      default:
        return "border-gray-800 text-gray-300"
    }
  }

  const getIconBgClass = () => {
    switch (habit.color) {
      case "blue":
        return "bg-blue-200 text-blue-800"
      case "red":
        return "bg-red-200 text-red-800"
      case "green":
        return "bg-green-200 text-green-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  const getCompletionColor = () => {
    switch (habit.color) {
      case "blue":
        return "bg-blue-400"
      case "red":
        return "bg-red-400"
      case "green":
        return "bg-green-400"
      default:
        return "bg-gray-400"
    }
  }

  const handleToggleCompletion = () => {
    toggleCompletion(habit.id, formatDate(new Date()))
  }

  const handleViewDetails = () => {
    onViewDetails(habit)
  }

  return (
    <motion.div
      className={`rounded-3xl border ${getColorClass()} p-4 mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getIconBgClass()}`}>
            {habit.icon === "heart" && <div className="text-2xl">❤️</div>}
            {habit.icon === "pray" && <div className="text-2xl">🙏</div>}
            {habit.icon === "run" && <div className="text-2xl">🏃</div>}
          </div>
          <h3 className="text-xl font-semibold">{habit.name}</h3>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            className={`w-12 h-12 rounded-full flex items-center justify-center
              ${habit.completions.includes(formatDate(new Date())) ? getCompletionColor() : "bg-gray-800"}`}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleCompletion}
          >
            {habit.completions.includes(formatDate(new Date())) && <Check className="w-6 h-6 text-white" />}
          </motion.button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
              <DropdownMenuItem onClick={handleViewDetails} className="text-white">
                Habit Details & Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteHabit(habit.id)} className="text-red-400">
                Delete habit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {dates.map((date, index) => {
          const dateStr = formatDate(date)
          const isCompleted = habit.completions.includes(dateStr)

          return (
            <motion.div
              key={index}
              className={`w-full aspect-square rounded-md ${isCompleted ? getCompletionColor() : "bg-gray-800 bg-opacity-30"}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleCompletion(habit.id, dateStr)}
            />
          )
        })}
      </div>
    </motion.div>
  )
}
