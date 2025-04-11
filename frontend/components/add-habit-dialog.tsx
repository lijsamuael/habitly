"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useHabits } from "@/contexts/habit-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, ChevronRight, ChevronLeft } from "lucide-react"

interface AddHabitDialogProps {
  isOpen: boolean
  onClose: () => void
}

// Expanded categories with more options
const habitCategories = [
  {
    name: "Health",
    habits: [
      { id: "heart", emoji: "❤️", label: "Health" },
      { id: "sleep", emoji: "😴", label: "Sleep" },
      { id: "water", emoji: "💧", label: "Water" },
      { id: "medicine", emoji: "💊", label: "Medicine" },
    ],
  },
  {
    name: "Fitness",
    habits: [
      { id: "run", emoji: "🏃", label: "Exercise" },
      { id: "yoga", emoji: "🧘", label: "Yoga" },
      { id: "gym", emoji: "🏋️", label: "Gym" },
      { id: "bike", emoji: "🚴", label: "Cycling" },
    ],
  },
  {
    name: "Mindfulness",
    habits: [
      { id: "pray", emoji: "🙏", label: "Pray" },
      { id: "meditate", emoji: "🧠", label: "Meditate" },
      { id: "journal", emoji: "📓", label: "Journal" },
      { id: "gratitude", emoji: "🙌", label: "Gratitude" },
    ],
  },
  {
    name: "Productivity",
    habits: [
      { id: "work", emoji: "💼", label: "Work" },
      { id: "study", emoji: "📚", label: "Study" },
      { id: "read", emoji: "📖", label: "Read" },
      { id: "code", emoji: "💻", label: "Code" },
    ],
  },
]

// Expanded color palette with more options in a grid
const habitColors = [
  { id: "blue", class: "bg-blue-500" },
  { id: "indigo", class: "bg-indigo-500" },
  { id: "purple", class: "bg-purple-500" },
  { id: "pink", class: "bg-pink-500" },
  { id: "red", class: "bg-red-500" },
  { id: "orange", class: "bg-orange-500" },
  { id: "yellow", class: "bg-yellow-500" },
  { id: "green", class: "bg-green-500" },
  { id: "teal", class: "bg-teal-500" },
  { id: "cyan", class: "bg-cyan-500" },
  { id: "gray", class: "bg-gray-500" },
  { id: "slate", class: "bg-slate-500" },
]

export function AddHabitDialog({ isOpen, onClose }: AddHabitDialogProps) {
  const { addHabit } = useHabits()
  const [name, setName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState(habitCategories[0].habits[0].id)
  const [selectedColor, setSelectedColor] = useState(habitColors[0].id)
  const [activeCategory, setActiveCategory] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (name.trim()) {
      addHabit({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      })

      // Reset form
      setName("")
      setSelectedIcon(habitCategories[0].habits[0].id)
      setSelectedColor(habitColors[0].id)

      onClose()
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  const handleCategoryChange = (index: number) => {
    setActiveCategory(index)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed bottom-0 z-50 w-full rounded-t-xl bg-gray-900 p-6 sm:max-w-md sm:rounded-xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Habit</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                  id="habit-name"
                  placeholder="e.g., Wake up at 5 AM"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-gray-800/80 backdrop-blur-sm"
                    onClick={scrollLeft}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div
                    className="flex space-x-2 overflow-x-auto scrollbar-hide py-2 px-6"
                    ref={scrollContainerRef}
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {habitCategories.map((category, index) => (
                      <Button
                        key={category.name}
                        type="button"
                        variant={activeCategory === index ? "default" : "outline"}
                        className={`whitespace-nowrap rounded-full ${
                          activeCategory === index ? "bg-gray-700" : "bg-gray-800 border-gray-700"
                        }`}
                        onClick={() => handleCategoryChange(index)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-gray-800/80 backdrop-blur-sm"
                    onClick={scrollRight}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-4 gap-2">
                  {habitCategories[activeCategory].habits.map((icon) => (
                    <motion.button
                      key={icon.id}
                      type="button"
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                        selectedIcon === icon.id ? "bg-gray-700 ring-2 ring-white/20" : "bg-gray-800"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedIcon(icon.id)}
                    >
                      <span className="text-3xl mb-1">{icon.emoji}</span>
                      <span className="text-xs">{icon.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {habitColors.map((color) => (
                    <motion.button
                      key={color.id}
                      type="button"
                      className={`aspect-square rounded-lg ${color.class} ${
                        selectedColor === color.id ? "ring-2 ring-white" : ""
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(color.id)}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Create Habit
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
