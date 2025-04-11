"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Habit } from "@/lib/types"
import { useHabits } from "@/contexts/habit-context"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MoreVertical, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface HabitCardProps {
  habit: Habit
  onViewDetails: (habit: Habit) => void
}

export function HabitCard({ habit, onViewDetails }: HabitCardProps) {
  const { toggleCompletion, deleteHabit } = useHabits()
  const [showOptions, setShowOptions] = useState(false)

  // Get the current date and previous 6 days (total 7 days)
  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    return date
  }).reverse() // Reverse to show oldest to newest (left to right)

  const getColorClass = () => {
    switch (habit.color) {
      case "blue":
        return "bg-blue-950 border-blue-800 text-blue-300"
      case "red":
        return "bg-red-950 border-red-800 text-red-300"
      case "green":
        return "bg-green-950 border-green-800 text-green-300"
      case "purple":
        return "bg-purple-950 border-purple-800 text-purple-300"
      case "pink":
        return "bg-pink-950 border-pink-800 text-pink-300"
      case "orange":
        return "bg-orange-950 border-orange-800 text-orange-300"
      case "yellow":
        return "bg-yellow-950 border-yellow-800 text-yellow-300"
      case "teal":
        return "bg-teal-950 border-teal-800 text-teal-300"
      case "indigo":
        return "bg-indigo-950 border-indigo-800 text-indigo-300"
      case "cyan":
        return "bg-cyan-950 border-cyan-800 text-cyan-300"
      default:
        return "bg-gray-950 border-gray-800 text-gray-300"
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
      case "purple":
        return "bg-purple-200 text-purple-800"
      case "pink":
        return "bg-pink-200 text-pink-800"
      case "orange":
        return "bg-orange-200 text-orange-800"
      case "yellow":
        return "bg-yellow-200 text-yellow-800"
      case "teal":
        return "bg-teal-200 text-teal-800"
      case "indigo":
        return "bg-indigo-200 text-indigo-800"
      case "cyan":
        return "bg-cyan-200 text-cyan-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  const handleToggleCompletion = (date: Date) => {
    toggleCompletion(habit.id, formatDate(date))
  }

  const handleViewDetails = () => {
    onViewDetails(habit)
  }

  return (
    <motion.div
      className={`rounded-3xl border ${getColorClass()} p-4 mb-4 max-w-full`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getIconBgClass()}`}>
            {habit.icon === "heart" && <div className="text-2xl">❤️</div>}
            {habit.icon === "pray" && <div className="text-2xl">🙏</div>}
            {habit.icon === "run" && <div className="text-2xl">🏃</div>}
            {habit.icon === "sleep" && <div className="text-2xl">😴</div>}
            {habit.icon === "water" && <div className="text-2xl">💧</div>}
            {habit.icon === "medicine" && <div className="text-2xl">💊</div>}
            {habit.icon === "yoga" && <div className="text-2xl">🧘</div>}
            {habit.icon === "gym" && <div className="text-2xl">🏋️</div>}
            {habit.icon === "bike" && <div className="text-2xl">🚴</div>}
            {habit.icon === "meditate" && <div className="text-2xl">🧠</div>}
            {habit.icon === "journal" && <div className="text-2xl">📓</div>}
            {habit.icon === "gratitude" && <div className="text-2xl">🙌</div>}
            {habit.icon === "work" && <div className="text-2xl">💼</div>}
            {habit.icon === "study" && <div className="text-2xl">📚</div>}
            {habit.icon === "read" && <div className="text-2xl">📖</div>}
            {habit.icon === "code" && <div className="text-2xl">💻</div>}
          </div>
          <h3 className="text-xl font-semibold truncate max-w-[150px] sm:max-w-[200px]">{habit.name}</h3>
        </div>

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

      <div className="flex justify-between overflow-x-auto pb-2 -mx-1 px-1">
        {weekDays.map((date, index) => {
          const dateStr = formatDate(date)
          const isCompleted = habit.completions.includes(dateStr)
          const isToday = formatDate(new Date()) === dateStr

          return (
            <div key={index} className="flex flex-col items-center min-w-[40px]">
              <span className="text-xs mb-2">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]}</span>
              <motion.button
                className={`w-10 h-10 rounded-full border flex items-center justify-center
                  ${
                    isCompleted
                      ? `bg-${habit.color}-500 border-${habit.color}-400`
                      : `border-${habit.color}-700 bg-transparent`
                  }
                  ${isToday ? "border-2" : "border"}
                `}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleToggleCompletion(date)}
              >
                <span className="text-xs">{date.getDate().toString().padStart(2, "0")}</span>
                {isCompleted && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute">
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
