"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import type { Habit } from "@/lib/types"
import { calculateStreak, getCompletionsCount } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Flame } from "lucide-react"

interface HabitDetailsProps {
  habit: Habit
  onBack: () => void
}

export function HabitDetails({ habit, onBack }: HabitDetailsProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const streak = calculateStreak(habit)
  const counts = getCompletionsCount(habit)

  const getColorClass = () => {
    switch (habit.color) {
      case "blue":
        return "text-blue-500"
      case "red":
        return "text-red-500"
      case "green":
        return "text-green-500"
      default:
        return "text-gray-500"
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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentMonth(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentMonth(newDate)
  }

  // Generate calendar for current month
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const calendarDays = []
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const dateStr = date.toISOString().split("T")[0]
    calendarDays.push({
      date,
      dateStr,
      isCompleted: habit.completions.includes(dateStr),
    })
  }

  // Generate yearly heatmap
  const today = new Date()
  const yearStart = new Date(today.getFullYear(), 0, 1)
  const yearDays = []

  for (let d = new Date(yearStart); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0]
    yearDays.push({
      date: new Date(d),
      dateStr,
      isCompleted: habit.completions.includes(dateStr),
    })
  }

  return (
    <motion.div className="p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getIconBgClass()} mr-3`}>
          {habit.icon === "heart" && <div className="text-2xl">❤️</div>}
          {habit.icon === "pray" && <div className="text-2xl">🙏</div>}
          {habit.icon === "run" && <div className="text-2xl">🏃</div>}
        </div>
        <h2 className="text-2xl font-bold">{habit.name}</h2>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{format(currentMonth, "MMMM, yyyy")}</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth} className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth} className="rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}

            {calendarDays.map((day, i) => (
              <div key={i} className="aspect-square p-1">
                {day ? (
                  <motion.div
                    className={`w-full h-full rounded-full flex items-center justify-center
                      ${day.isCompleted ? `bg-${habit.color}-500` : "bg-gray-800"}`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className={`text-sm ${day.isCompleted ? "text-white" : "text-gray-300"}`}>
                      {day.date.getDate()}
                    </span>
                  </motion.div>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Streak</h3>
            <div className="flex justify-between">
              <motion.div
                className="bg-green-900 bg-opacity-20 rounded-xl p-4 flex-1 mr-2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h4 className="text-green-400 text-4xl font-bold">{streak.current}</h4>
                <p className="text-green-400">days</p>
                <p className="text-green-500 mt-2">Current Month Streak</p>
              </motion.div>

              <motion.div
                className="bg-amber-900 bg-opacity-20 rounded-xl p-4 flex-1 ml-2 relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
                <h4 className="text-amber-400 text-4xl font-bold">{streak.longest}</h4>
                <p className="text-amber-400">days</p>
                <p className="text-amber-500 mt-2">Longest Streak</p>
                {streak.longestDate && (
                  <div className="text-xs text-amber-600 mt-1">{format(new Date(streak.longestDate), "MMM yyyy")}</div>
                )}
              </motion.div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">365 day Heatmap</h3>
            <div className="bg-gray-900 bg-opacity-30 rounded-xl p-4">
              <div className="text-center text-amber-500 mb-2">Yearly Heatmap</div>
              <div className="grid grid-cols-12 gap-1">
                {Array.from({ length: 365 }).map((_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - 365 + i)
                  const dateStr = date.toISOString().split("T")[0]
                  const isCompleted = habit.completions.includes(dateStr)

                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm ${
                        isCompleted ? `bg-${habit.color}-500` : "bg-gray-800 bg-opacity-30"
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Yearly Insights</h3>
            <div className="flex justify-between">
              <motion.div
                className="flex flex-col items-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#444"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#ff4081"
                      strokeWidth="2"
                      strokeDasharray={`${counts.year}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-pink-500">{counts.year}</span>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <p className="text-gray-400">times</p>
                  <p className="font-semibold">This Year</p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col items-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#444"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#2196f3"
                      strokeWidth="2"
                      strokeDasharray={`${counts.month * 10}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-500">{counts.month}</span>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <p className="text-gray-400">times</p>
                  <p className="font-semibold">This Month</p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col items-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#444"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#4caf50"
                      strokeWidth="2"
                      strokeDasharray={`${counts.week * 14}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-500">{counts.week}</span>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <p className="text-gray-400">times</p>
                  <p className="font-semibold">This Week</p>
                </div>
              </motion.div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Streak Insights</h3>
            <div className="flex justify-center mb-6">
              <motion.div
                className="relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-16 h-48 bg-white rounded-full overflow-hidden relative">
                  <div
                    className="absolute bottom-0 w-full bg-red-500"
                    style={{ height: `${Math.min((streak.current / 10) * 100, 100)}%` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Flame className="h-8 w-8 text-yellow-300" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  {streak.current}
                </div>
                <div className="absolute top-1/4 right-0 transform translate-x-1/2 -translate-y-1/2 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {Math.max(streak.longest - streak.current, 0)}
                </div>
              </motion.div>
            </div>

            <motion.div
              className="bg-white bg-opacity-10 rounded-xl p-4 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="text-red-500 text-2xl font-bold">{streak.current} Day Streak</h4>
              {streak.current > 0 && (
                <p className="text-gray-300 mt-2">
                  {format(new Date(Date.now() - (streak.current - 1) * 86400000), "dd MMM yyyy")} -{" "}
                  {format(new Date(), "dd MMM yyyy")}
                </p>
              )}
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
