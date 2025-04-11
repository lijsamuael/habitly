"use client"

import { useState, useEffect } from "react"
import { useHabits } from "@/contexts/habit-context"
import { calculateStreak } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Flame, Award, Calendar, TrendingUp, BarChart } from "lucide-react"
import { InstallApp } from "./install-app"

export function Profile() {
  const { habits } = useHabits()
  const [totalCompletions, setTotalCompletions] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [completionsByMonth, setCompletionsByMonth] = useState<{ [key: string]: number }>({})
  const [topHabit, setTopHabit] = useState<string | null>(null)

  useEffect(() => {
    // Calculate total completions
    const total = habits.reduce((sum, habit) => sum + habit.completions.length, 0)
    setTotalCompletions(total)

    // Calculate longest streak across all habits
    let maxStreak = 0
    let maxCurrentStreak = 0
    habits.forEach((habit) => {
      const streak = calculateStreak(habit)
      if (streak.longest > maxStreak) {
        maxStreak = streak.longest
      }
      if (streak.current > maxCurrentStreak) {
        maxCurrentStreak = streak.current
      }
    })
    setLongestStreak(maxStreak)
    setCurrentStreak(maxCurrentStreak)

    // Calculate completions by month
    const monthlyData: { [key: string]: number } = {}
    habits.forEach((habit) => {
      habit.completions.forEach((date) => {
        const month = date.substring(0, 7) // YYYY-MM format
        monthlyData[month] = (monthlyData[month] || 0) + 1
      })
    })
    setCompletionsByMonth(monthlyData)

    // Find top habit
    if (habits.length > 0) {
      const habitWithMostCompletions = habits.reduce((prev, current) =>
        prev.completions.length > current.completions.length ? prev : current,
      )
      setTopHabit(habitWithMostCompletions.name)
    } else {
      setTopHabit(null)
    }
  }, [habits])

  // Get months for chart
  const months = Object.keys(completionsByMonth).sort()
  const monthlyValues = months.map((month) => completionsByMonth[month])

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile & Statistics</h1>
        <p className="text-gray-400">Track your overall habit progress</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-700/20 border-purple-800/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-purple-500/20 p-3 mb-2">
              <Calendar className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-300">{totalCompletions}</div>
            <p className="text-purple-400 text-sm">Total Completions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/40 to-orange-700/20 border-orange-800/50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-full bg-orange-500/20 p-3 mb-2">
              <Flame className="h-6 w-6 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-orange-300">{longestStreak}</div>
            <p className="text-orange-400 text-sm">Longest Streak</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 bg-gray-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Current Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{habits.length}</div>
              <p className="text-sm text-gray-400">Active Habits</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{currentStreak}</div>
              <p className="text-sm text-gray-400">Current Streak</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">
                {habits.filter((h) => h.completions.includes(format(new Date(), "yyyy-MM-dd"))).length}
              </div>
              <p className="text-sm text-gray-400">Today's Habits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-gray-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Monthly Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-40 flex items-end justify-between">
            {monthlyValues.length > 0 ? (
              monthlyValues.map((value, index) => (
                <div key={index} className="flex flex-col items-center w-full">
                  <div
                    className="w-full max-w-[30px] bg-purple-500 rounded-t-sm"
                    style={{ height: `${Math.min((value / Math.max(...monthlyValues)) * 100, 100)}%` }}
                  ></div>
                  <div className="text-xs mt-1 text-gray-400">
                    {months[index] ? format(new Date(months[index]), "MMM") : ""}
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center text-gray-400 py-10">No activity data yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <InstallApp />
      </div>

      <Card className="bg-gray-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topHabit && (
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-500/20 p-2 mr-3">
                  <Award className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <div className="font-medium">Top Habit</div>
                  <p className="text-sm text-gray-400">{topHabit}</p>
                </div>
              </div>
            )}

            {longestStreak >= 7 && (
              <div className="flex items-center">
                <div className="rounded-full bg-green-500/20 p-2 mr-3">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="font-medium">Week Warrior</div>
                  <p className="text-sm text-gray-400">Maintained a streak for 7+ days</p>
                </div>
              </div>
            )}

            {habits.length >= 3 && (
              <div className="flex items-center">
                <div className="rounded-full bg-blue-500/20 p-2 mr-3">
                  <BarChart className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium">Habit Builder</div>
                  <p className="text-sm text-gray-400">Created 3+ habits</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
